from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from PIL import Image
from supabase import create_client


def heuristic_score(path: Path) -> tuple[str, str]:
    try:
        with Image.open(path) as img:
            img = img.convert("RGB")
            width, height = img.size
            if width < 200 or height < 200:
                return "flag", "image too small or suspiciously cropped"
            pixels = list(img.getdata())
            dark = sum(1 for r, g, b in pixels if r < 40 and g < 40 and b < 40)
            ratio = dark / max(1, len(pixels))
            if ratio > 0.5:
                return "flag", "very dark image may need human review"
            return "ok", "passed basic sanity check"
    except Exception:
        return "flag", "could not inspect file; needs admin review"


def write_flag_to_supabase(file_key: str, status: str, reason: str) -> dict:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return {"status": "skipped", "reason": "Supabase keys not configured."}
    client = create_client(url, key)
    payload = {"file_key": file_key, "status": status, "reason": reason, "created_at": "now"}
    result = client.table("media_flags").insert(payload).execute()
    return {"status": "written", "data": result.data}


def process_directory(input_dir: Path, dry_run: bool = True) -> list[dict]:
    results = []
    for file_path in sorted(input_dir.iterdir()):
        if not file_path.is_file():
            continue
        score, reason = heuristic_score(file_path)
        result = {
            "file": str(file_path),
            "decision": score,
            "reason": reason,
            "dry_run": dry_run,
        }
        if not dry_run:
            write_flag_to_supabase(file_path.name, "pending", reason)
        results.append(result)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan uploaded media before publication and flag suspicious content for admin review.")
    parser.add_argument("--input-dir", default="./uploads", help="Folder with media files to review")
    parser.add_argument("--dry-run", action="store_true", default=True, help="No writes to Supabase and no deletion")
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Input directory {input_dir} not found.")
        return 1

    result = process_directory(input_dir, dry_run=args.dry_run)
    print(json.dumps({"reviewed": len(result), "dry_run": args.dry_run, "files": result}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
