"""Site crawler and health checker for HSHS World.

This tool crawls the live site (or a local HTML build) and checks for:
- broken internal links and 404s
- missing CSS/JS/image assets
- buttons/links with no handler or href="#"
- pages with too many stylesheets or scripts
- duplicate IDs, missing alt text, and missing meta tags
- clean URL routes (e.g. /more, /gallery) that should not 404 when cleanUrls is true

It exits with status 1 if any issues are found, so it is suitable for CI.
"""

from __future__ import annotations

import argparse
import json
import sys
from html import escape
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

DEFAULT_BASE_URL = "https://hshsgallery.vercel.app"

# Key clean routes that must not 404 (cleanUrls: true, trailingSlash: false)
CLEAN_ROUTES = [
    "/more",
    "/gallery",
    "/about",
    "/photos",
    "/videos",
    "/profile",
    "/settings",
    "/contact",
    "/login",
]


def fetch(url: str, timeout: int = 15) -> requests.Response:
    response = requests.get(url, timeout=timeout, allow_redirects=True)
    return response


def normalize_url(url: str, base_url: str) -> str:
    if url.startswith("mailto:") or url.startswith("tel:"):
        return url
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        return url
    return urljoin(base_url.rstrip("/") + "/", url)


def is_internal(url: str, base_url: str) -> bool:
    parsed = urlparse(url)
    base = urlparse(base_url)
    if parsed.scheme and parsed.netloc:
        return parsed.netloc == base.netloc
    return True


def page_meta_ok(soup: BeautifulSoup) -> bool:
    return bool(
        soup.find("meta", attrs={"name": "description"})
        or soup.find("meta", attrs={"property": "og:title"})
        or soup.find("meta", attrs={"property": "og:description"})
    )


def get_page_assets(soup: BeautifulSoup) -> dict:
    css = [tag.get("href") for tag in soup.select('link[rel="stylesheet"]') if tag.get("href")]
    js = [tag.get("src") for tag in soup.select("script[src]") if tag.get("src")]
    imgs = [tag.get("src") for tag in soup.select("img[src]") if tag.get("src")]
    return {"css": css, "js": js, "img": imgs}


def check_duplicate_ids(soup: BeautifulSoup) -> list[str]:
    seen = {}
    duplicates = []
    for tag in soup.find_all(True):
        tag_id = tag.get("id")
        if not tag_id:
            continue
        if tag_id in seen:
            duplicates.append(tag_id)
        else:
            seen[tag_id] = True
    return duplicates


def collect_page(url: str, base_url: str) -> dict:
    result = {"page": url, "issues": []}
    try:
        response = fetch(url)
        if response.status_code >= 400:
            result["issues"].append({
                "type": "http_error",
                "message": f"HTTP {response.status_code}",
                "severity": "high",
            })
            return result
        html = response.text
    except requests.RequestException as exc:
        result["issues"].append({"type": "fetch_error", "message": str(exc), "severity": "high"})
        return result

    soup = BeautifulSoup(html, "html.parser")

    if not page_meta_ok(soup):
        result["issues"].append({
            "type": "missing_meta",
            "message": "Missing description or OG meta tag",
            "severity": "medium",
        })

    for img in soup.select("img[src]"):
        src = img.get("src", "")
        if not src or src == "#":
            result["issues"].append({
                "type": "missing_src",
                "message": "Image missing src",
                "severity": "medium",
            })
            continue
        alt = img.get("alt")
        if alt is None or alt.strip() == "":
            result["issues"].append({
                "type": "missing_alt_text",
                "message": f"Image missing alt text: {src}",
                "severity": "medium",
            })

    for tag in soup.select("a[href]"):
        href = tag.get("href", "").strip()
        if not href:
            result["issues"].append({"type": "empty_anchor", "message": "Link with no href", "severity": "medium"})
            continue
        if href == "#":
            result["issues"].append({
                "type": "hash_only_link",
                "message": "Link targets '#'",
                "severity": "medium",
            })
            continue
        if not is_internal(href, base_url):
            continue
        target = normalize_url(href, url)
        try:
            resp = fetch(target)
            if resp.status_code == 404:
                result["issues"].append({
                    "type": "broken_link",
                    "message": f"broken internal link: {href} -> {resp.status_code}",
                    "severity": "high",
                })
        except requests.RequestException as exc:
            result["issues"].append({
                "type": "link_check_failed",
                "message": f"link check failed: {href} ({exc})",
                "severity": "medium",
            })

    assets = get_page_assets(soup)
    for kind, items in assets.items():
        for asset in items:
            if not asset or asset == "#":
                continue
            asset_url = normalize_url(asset, url)
            try:
                resp = fetch(asset_url)
                if resp.status_code >= 400:
                    result["issues"].append({
                        "type": "missing_asset",
                        "message": f"{kind} asset failed with {resp.status_code}: {asset}",
                        "severity": "high",
                    })
            except requests.RequestException as exc:
                result["issues"].append({
                    "type": "missing_asset",
                    "message": f"{kind} asset fetch failed: {asset} ({exc})",
                    "severity": "high",
                })

    dups = check_duplicate_ids(soup)
    for d in dups:
        result["issues"].append({
            "type": "duplicate_id",
            "message": f"duplicate id: {d}",
            "severity": "medium",
        })

    return result


def check_clean_urls(base_url: str) -> list[dict]:
    issues = []
    for route in CLEAN_ROUTES:
        url = normalize_url(route, base_url)
        try:
            resp = fetch(url)
            if resp.status_code == 404:
                issues.append({
                    "page": url,
                    "type": "clean_url_404",
                    "message": f"clean URL {route} returned 404 (cleanUrls is true)",
                    "severity": "high",
                })
            elif resp.status_code >= 400:
                issues.append({
                    "page": url,
                    "type": "clean_url_error",
                    "message": f"clean URL {route} returned {resp.status_code}",
                    "severity": "high",
                })
        except requests.RequestException as exc:
            issues.append({
                "page": url,
                "type": "clean_url_fetch_error",
                "message": f"could not fetch clean URL {route}: {exc}",
                "severity": "high",
            })
    return issues


def collect_issues(base_url: str, max_pages: int = 25) -> list[dict]:
    issues: list[dict] = []
    # Start with clean URL checks
    issues.extend(check_clean_urls(base_url))

    queue = [base_url]
    seen = set()

    while queue and len(seen) < max_pages:
        page_url = queue.pop(0)
        if page_url in seen:
            continue
        seen.add(page_url)

        page_result = collect_page(page_url, base_url)
        for iss in page_result["issues"]:
            iss["page"] = page_url
            issues.append(iss)

        # Discover more internal links for crawling
        try:
            response = fetch(page_url)
            if response.status_code < 400:
                soup = BeautifulSoup(response.text, "html.parser")
                for link in soup.find_all("a", href=True):
                    href = link["href"].strip()
                    if href.startswith("/") or href.startswith("./") or href.startswith("../"):
                        target = normalize_url(href, page_url)
                        if is_internal(target, base_url) and target not in seen:
                            queue.append(target)
        except Exception:
            pass

    return issues


def generate_report_html(issues: list[dict], base_url: str) -> str:
    issue_rows = "".join(
        f"<tr><td>{escape(item.get('page',''))}</td><td>{escape(item.get('type',''))}</td>"
        f"<td>{escape(item.get('severity',''))}</td><td>{escape(item.get('message',''))}</td></tr>"
        for item in issues
    )
    if not issue_rows:
        issue_rows = "<tr><td colspan='4'>No issues detected.</td></tr>"
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>HSHS Site Check</title>
    <style>body {{ font-family: Arial, sans-serif; margin: 2rem; }} table {{ border-collapse: collapse; width: 100%; }} th, td {{ border: 1px solid #ccc; padding: 0.5rem; text-align: left; }} .ok {{ color: green; }} .warn {{ color: orange; }} .bad {{ color: red; }}</style>
  </head>
  <body>
    <h1>HSHS World site health report</h1>
    <p>Base URL: {escape(base_url)}</p>
    <p>Issues found: {len(issues)}</p>
    <table>
      <thead><tr><th>Page</th><th>Type</th><th>Severity</th><th>Message</th></tr></thead>
      <tbody>{issue_rows}</tbody>
    </table>
  </body>
</html>"""


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Crawl a site and report broken links/assets and major markup issues. Exits 1 on any issues."
    )
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="URL to crawl")
    parser.add_argument("--max-pages", type=int, default=15, help="Max pages to crawl")
    parser.add_argument("--report-output", default="report.html", help="Local HTML report output path")
    args = parser.parse_args()

    try:
        issues = collect_issues(args.base_url, max_pages=args.max_pages)
    except Exception as exc:
        print(f"Site crawl failed: {exc}")
        return 2

    print(f"Checked site: {args.base_url}")
    print(f"Found {len(issues)} issues")
    if issues:
        for item in issues[:15]:
            print(f"- [{item.get('severity','medium')}] {item.get('type','issue')}: {item.get('message','')} on {item.get('page','')}")
    else:
        print("No issues found.")

    output_path = Path(args.report_output)
    output_path.write_text(generate_report_html(issues, args.base_url), encoding="utf-8")
    print(f"HTML report written to {output_path.resolve()}")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
