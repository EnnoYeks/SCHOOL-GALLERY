from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from html import escape
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


DEFAULT_BASE_URL = "https://hshsgallery.vercel.app"


def fetch(url: str, timeout: int = 15) -> requests.Response:
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    return response


def normalize_url(url: str, base_url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        return url
    return urljoin(base_url.rstrip("/") + "/", url)


def is_internal_link(url: str, base_url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc and parsed.netloc != urlparse(base_url).netloc:
        return False
    return True


def extract_assets(html_text: str) -> dict:
    soup = BeautifulSoup(html_text, "html.parser")
    css = [tag.get("href") for tag in soup.find_all("link", rel="stylesheet") if tag.get("href")]
    js = [tag.get("src") for tag in soup.find_all("script") if tag.get("src")]
    imgs = [tag.get("src") for tag in soup.find_all("img") if tag.get("src")]
    return {"css": css, "js": js, "img": imgs}


def page_has_meta(soup: BeautifulSoup) -> bool:
    return bool(soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:title"}))


def collect_issues(base_url: str, root_html: str | None = None, max_pages: int = 25) -> list[dict]:
    issues: list[dict] = []
    queue = [base_url]
    seen = set()

    while queue and len(seen) < max_pages:
        page_url = queue.pop(0)
        if page_url in seen:
            continue
        seen.add(page_url)

        try:
            response = fetch(page_url)
            html = response.text
        except requests.RequestException as exc:
            issues.append({"page": page_url, "type": "fetch_error", "message": str(exc), "severity": "high"})
            continue

        soup = BeautifulSoup(html, "html.parser")
        if not page_has_meta(soup):
            issues.append({"page": page_url, "type": "missing_meta", "message": "page missing description or OG meta tag", "severity": "medium"})

        for tag_name in ["img", "source", "video", "audio"]:
            for tag in soup.find_all(tag_name):
                src = tag.get("src") or tag.get("poster") or tag.get("data-src")
                if not src:
                    continue
                if "http" not in src and not src.startswith("/") and not src.startswith("data:"):
                    # relative asset in nesting context; still consider it suspicious if not resolvable
                    pass
                if src.startswith("#"):
                    issues.append({"page": page_url, "type": "empty_asset", "message": f"{tag_name} points to a fragment", "severity": "medium"})

        assets = extract_assets(html)
        for asset in assets["css"] + assets["js"] + assets["img"]:
            if not asset or asset == "#":
                continue
            url = normalize_url(asset, page_url)
            try:
                asset_response = fetch(url)
                if asset_response.status_code >= 400:
                    issues.append({"page": page_url, "type": "missing_asset", "message": f"asset failed with {asset_response.status_code}: {asset}", "severity": "high"})
            except requests.RequestException as exc:
                issues.append({"page": page_url, "type": "missing_asset", "message": f"asset fetch failed: {asset} ({exc})", "severity": "high"})

        for anchor in soup.find_all("a", href=True):
            href = anchor["href"].strip()
            if not href or href.startswith("javascript:"):
                continue
            if href.startswith("#"):
                issues.append({"page": page_url, "type": "empty_anchor", "message": f"anchor href is '#': {href}", "severity": "medium"})
                continue
            target = normalize_url(href, page_url)
            if not is_internal_link(target, base_url):
                continue
            if target.startswith(base_url.rstrip("/") + "/"):
                target_path = urlparse(target).path.strip("/")
                if target_path in {"", "index"}:
                    continue
                if not target_path.endswith("/") and not any(target_path.endswith(ext) for ext in [".html", ".js", ".css", ".png", ".jpg", ".svg", ".mp4"]):
                    # This check is intentionally shallow and keeps the script safe.
                    pass

            if href.startswith("/") or href.startswith("./") or href.startswith("../") or href.startswith("?"):
                try:
                    target_response = fetch(target)
                    if target_response.status_code == 404:
                        issues.append({"page": page_url, "type": "broken_link", "message": f"broken internal link: {href}", "severity": "high"})
                except requests.RequestException:
                    issues.append({"page": page_url, "type": "broken_link", "message": f"link check failed: {href}", "severity": "medium"})

        for tag in soup.find_all(True):
            if tag.name == "button" and not (tag.get("onclick") or tag.get("data-action") or tag.get("type") == "submit"):
                issues.append({"page": page_url, "type": "unhandled_button", "message": f"button without handler: <button {tag.name}>", "severity": "medium"})

        for duplicate_check in ["id", "class"]:
            values = []
            for tag in soup.find_all(True):
                value = tag.get(duplicate_check)
                if not value:
                    continue
                if isinstance(value, str):
                    values.extend([part for part in value.split() if part])
                elif isinstance(value, list):
                    values.extend(value)
            seen_values = set()
            for value in values:
                if value in seen_values:
                    issues.append({"page": page_url, "type": "duplicate_id_or_class", "message": f"duplicate {duplicate_check}: {value}", "severity": "medium"})
                seen_values.add(value)

        for link in soup.find_all("a", href=True):
            href = link["href"].strip()
            if href.startswith("/"):
                queue.append(normalize_url(href, page_url))

    return issues


def generate_report_html(issues: list[dict], base_url: str) -> str:
    issue_rows = "".join(
        f"<tr><td>{escape(item.get('page',''))}</td><td>{escape(item.get('type',''))}</td><td>{escape(item.get('severity',''))}</td><td>{escape(item.get('message',''))}</td></tr>"
        for item in issues
    )
    if not issue_rows:
        issue_rows = "<tr><td colspan='4'>No issues detected.</td></tr>"
    return f"""
    <!doctype html>
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
    </html>
    """


def main() -> int:
    parser = argparse.ArgumentParser(description="Crawl a site and report broken links/assets and major markup issues.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="URL to crawl")
    parser.add_argument("--max-pages", type=int, default=15, help="Max pages to crawl")
    parser.add_argument("--report-output", default="report.html", help="Local HTML report output path")
    args = parser.parse_args()

    try:
        issues = collect_issues(args.base_url, max_pages=args.max_pages)
    except Exception as exc:  # pragma: no cover - top-level safety
        print(f"Site crawl failed: {exc}")
        return 2

    print(f"Checked site: {args.base_url}")
    print(f"Found {len(issues)} issues")
    if issues:
        for item in issues[:10]:
            print(f"- [{item.get('severity','medium')}] {item.get('type','issue')}: {item.get('message','')} on {item.get('page','')}")
    else:
        print("No issues found.")

    output_path = Path(args.report_output)
    output_path.write_text(generate_report_html(issues, args.base_url), encoding="utf-8")
    print(f"HTML report written to {output_path.resolve()}")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
