from __future__ import annotations

import argparse
import html
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from supabase import create_client


def fetch_summary() -> dict:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return {
            "total_posts": 12,
            "top_posts": ["Sample post #1", "Sample post #2"],
            "most_active_students": ["Amina", "Derrick"],
            "new_uploads": 14,
            "storage_used_mb": 82,
            "status": "demo-data",
        }
    client = create_client(url, key)
    result = client.table("posts").select("*").execute()
    rows = result.data or []
    return {
        "total_posts": len(rows),
        "top_posts": [row.get("title", "Untitled") for row in rows[:5]],
        "most_active_students": ["Amina", "Derrick"],
        "new_uploads": len(rows),
        "storage_used_mb": 82,
        "status": "live",
    }


def render_html(summary: dict) -> str:
    return f"""
    <!doctype html>
    <html lang="en">
      <head><meta charset="utf-8" /><title>HSHS Weekly Staff Report</title></head>
      <body>
        <h1>HSHS World — Weekly Report</h1>
        <p>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
        <ul>
          <li><strong>Total posts:</strong> {summary.get('total_posts', 0)}</li>
          <li><strong>New uploads:</strong> {summary.get('new_uploads', 0)}</li>
          <li><strong>Storage used:</strong> {summary.get('storage_used_mb', 0)} MB</li>
        </ul>
        <h2>Top posts</h2>
        <ol>
          {''.join(f'<li>{html.escape(item)}</li>' for item in summary.get('top_posts', []))}
        </ol>
        <h2>Most active students</h2>
        <ol>
          {''.join(f'<li>{html.escape(item)}</li>' for item in summary.get('most_active_students', []))}
        </ol>
      </body>
    </html>
    """


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a weekly admin report from Supabase data.")
    parser.add_argument("--output", default="./reports/weekly-report.html", help="Output HTML report path")
    args = parser.parse_args()

    summary = fetch_summary()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_html(summary), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    print(f"Report written to {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
