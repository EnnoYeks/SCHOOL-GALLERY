"""Create a weekly admin report from Supabase data.

Queries real tables when credentials are present. Clearly shows when data is missing instead of faking it.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from supabase import create_client
except Exception:  # pragma: no cover
    create_client = None  # type: ignore


def fetch_summary() -> dict:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or create_client is None:
        return {
            "status": "missing-credentials",
            "message": "Supabase URL or service role key not configured. No live data available.",
            "total_posts": None,
            "top_posts": [],
            "new_uploads": None,
            "storage_used_mb": None,
        }

    client = create_client(url, key)
    summary = {"status": "live"}
    try:
        posts = client.table("posts").select("id,title,created_at").order("created_at", desc=True).limit(50).execute()
        rows = posts.data or []
        summary["total_posts"] = len(rows)
        summary["top_posts"] = [row.get("title") or "Untitled" for row in rows[:5]]
        summary["new_uploads"] = len(rows)
    except Exception as exc:
        summary["posts_error"] = str(exc)
        summary["total_posts"] = None

    try:
        photos = client.table("photos").select("id").execute()
        summary["photo_count"] = len(photos.data or [])
    except Exception as exc:
        summary["photos_error"] = str(exc)

    # Storage estimate is approximate; real usage would come from R2 metrics
    summary["storage_used_mb"] = None
    summary["note"] = "Storage figure requires R2 metrics API; not available in this tool."

    return summary


def render_html(summary: dict) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    status = summary.get("status", "unknown")
    total = summary.get("total_posts")
    total_display = total if total is not None else "data missing"
    uploads = summary.get("new_uploads")
    uploads_display = uploads if uploads is not None else "data missing"
    storage = summary.get("storage_used_mb")
    storage_display = f"{storage} MB" if storage is not None else "not available"

    posts_html = "".join(f"<li>{html.escape(str(item))}</li>" for item in summary.get("top_posts", []))
    if not posts_html:
        posts_html = "<li>No post data available.</li>"

    return f"""<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>HSHS Weekly Staff Report</title></head>
  <body>
    <h1>HSHS World — Weekly Report</h1>
    <p>Generated: {now}</p>
    <p>Status: {html.escape(status)}</p>
    <ul>
      <li><strong>Total posts:</strong> {total_display}</li>
      <li><strong>New uploads:</strong> {uploads_display}</li>
      <li><strong>Storage used:</strong> {storage_display}</li>
    </ul>
    <h2>Recent posts</h2>
    <ol>{posts_html}</ol>
    <p><em>{html.escape(summary.get('note', ''))}</em></p>
  </body>
</html>"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a weekly admin report from Supabase data.")
    parser.add_argument("--output", default="./reports/weekly-report.html", help="Output HTML report path")
    args = parser.parse_args()

    summary = fetch_summary()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_html(summary), encoding="utf-8")
    print(json.dumps(summary, indent=2, default=str))
    print(f"Report written to {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
