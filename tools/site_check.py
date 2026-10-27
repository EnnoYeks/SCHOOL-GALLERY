"""Site crawler and health checker for HSHS World.

This tool crawls the live site (or a local HTML build) and checks for:
- broken internal links and 404s
- missing CSS/JS/image assets
- buttons/links with no handler or href="#"
- pages with too many stylesheets or scripts
- duplicate IDs, missing alt text, and missing meta tags

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


def fetch(url: str, timeout: int = 15) -> requests.Response:
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
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


def get_page_assets(soup: BeautifulSoup):
    css = [tag.get("href") for tag in soup.select('link[rel="stylesheet"]') if tag.get("href")]
    js = [tag.get("src") for tag in soup.select("script[src]") if tag.get("src")]
    imgs = [tag.get("src") for tag in soup.select("img[src]") if tag.get("src")]
    return {"css": css, "js": js, "img": imgs}


def check_duplicate_ids(soup: BeautifulSoup):
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


def collect_page(url: str, base_url: str):
    result = {"page": url, "issues": []}
    try:
        response = fetch(url)
    except requests.RequestException as exc:
        result["issues"].append({"type": "fetch_error", "message": str(exc), "severity": "high"})
        return result

    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    if not page_meta_ok(soup):
        result["issues"].append({"type": "missing_meta", "message": "Missing description or OG meta tag", "severity": "medium"})

    for img in soup.select("img[src]"):
        src = img.get("src", "")
        if not src or src == "#":
            result["issues"].append({"type": "missing_alt_or_src", "message": "Image missing src or alt text", "severity": "medium"})
            continue
        alt = img.get("alt")
        if alt is None or alt.strip() == "":
            result["issues"].append({"type": "missing_alt_text", "message": f"Image missing alt text: {src}", "severity": "medium"})

    for tag in soup.select("a[href]"):
        href = tag.get("href", "").strip()
        if not href:
            result["issues"].append({"type": "empty_anchor", "message": "Link with no href", "severity": "medium"})
            continue
        if href == "#":
            result["issues"].append({"type": "hash_only_link", "message": "Link targets '#'