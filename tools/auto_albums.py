"""Group photo files into date-based album suggestions.

Uses EXIF DateTimeOriginal when available, otherwise file mtime.
Dry-run is the safe default; use --live to write suggestions to Supabase.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from PIL.ExifTags import TAGS

try:
    from supabase import create_client
except Exception:  # pragma: no cover
    create_client = None  # type: ignore


def parse_exif_date(path: Path) -> datetime | None:
    try:
        with Image.open(path) as img:
            exif = img.getexif()
            for tag, value in exif.items():
                if TAGS.get(tag) == "DateTimeOriginal":
                    return datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
    except Exception:
        return None
    return None


def build_album_suggestions(input_dir: Path) -> list[dict]:
    groups: dict[str, list[str]] = {}
    for path in sorted(input_dir.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        dt = parse_exif_date(path) or datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
        key = dt.strftime("%Y-%m-%d")
        groups.setdefault(key, []).append(str(path))
    suggestions = []
    for date_key, files in sorted(groups.items()):
        title = f"Memories {date_key}"
        suggestions.append({"date": date_key, "title": title, "files": files, "count": len(files)})
    return suggestions


def save_to_supabase(suggestions: list[dict]) -> dict:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or create_client is None:
        return {"status": "skipped", "reason": "Supabase keys missing"}
    client = create_client(url, key)
    payload = [
        {
            "title": item["title"],
            "date": item["date"],
            "files": item["files"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        for item in suggestions
    ]
    try:
        result = client.table("albums").insert(payload).execute()
        return {"status": "written", "count": len(result.data or [])}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Group photo files into date-based album suggestions and write them to Supabase when configured."
    )
    parser.add_argument("--input-dir", default="./uploads", help="Media directory to inspect")
    parser.add_argument("--live", action="store_true", help="Write suggestions to Supabase (default is dry-run)")
    args = parser.parse_args()

    dry_run = not args.live
    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Input directory {input_dir} not found.")
        return 1

    suggestions = build_album_suggestions(input_dir)
    if dry_run:
        print(json.dumps({"dry_run": True, "albums": suggestions}, indent=2))
    else:
        print(json.dumps({"dry_run": False, "supabase": save_to_supabase(suggestions)}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
