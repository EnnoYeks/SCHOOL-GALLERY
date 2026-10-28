"""Basic media screening for suspicious content.

Downscales images before analysis. Checks for tiny, dark, blurry, oversized, wrong type, and simple duplicates.
Clearly labeled as basic screening that needs human review. Never deletes files.
Writes created_at as real UTC timestamp. Dry-run is the safe default.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat

try:
    from supabase import create_client
except Exception:  # pragma: no cover
    create_client = None  # type: ignore


def is_blurry(img: Image.Image, threshold: float = 100.0) -> bool:
    gray = img.convert("L")
    # Simple Laplacian variance approximation via edge filter
    edges = gray.filter(ImageFilter.FIND_EDGES)
    stat = ImageStat.Stat(edges)
    variance = stat.var[0] if stat.var else 0
    return variance < threshold


def simple_phash(img: Image.Image) -> str:
    """Very lightweight average hash for duplicate detection."""
    small = img.resize((8, 8), Image.Resampling.LANCZOS).convert("L")
    pixels = list(small.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if p > avg else "0" for p in pixels)
    return bits


def heuristic_score(path: Path) -> tuple[str, str]:
    try:
        with Image.open(path) as img:
            img = img.convert("RGB")
            # Downscale first for analysis
            analysis_img = img.resize((128, 128), Image.Resampling.LANCZOS)
            width, height = img.size
            if width < 200 or height < 200:
                return "flag", "image too small or suspiciously cropped"
            if width > 8000 or height > 8000:
                return "flag", "image oversized; may need review"
            # Dark check on downscaled
            pixels = list(analysis_img.getdata())
            dark = sum(1 for r, g, b in pixels if r < 40 and g < 40 and b < 40)
            ratio = dark / max(1, len(pixels))
            if ratio > 0.6:
                return "flag", "very dark image may need human review"
            if is_blurry(analysis_img):
                return "flag", "image appears blurry"
            return "ok", "passed basic sanity check"
    except Exception as exc:
        return "flag", f"could not inspect file ({exc}); needs admin review"


def write_flag_to_supabase(file_key: str, status: str, reason: str) -> dict:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or create_client is None:
        return {"status": "skipped", "reason": "Supabase keys not configured."}
    client = create_client(url, key)
    payload = {
        "file_key": file_key,
        "status": status,
        "reason": reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "screening_note": "basic automated screening; human review required",
    }
    try:
        result = client.table("media_flags").insert(payload).execute()
        return {"status": "written", "data": result.data}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


def process_directory(input_dir: Path, dry_run: bool = True) -> list[dict]:
    results = []
    seen_hashes: dict[str, str] = {}
    for file_path in sorted(input_dir.iterdir()):
        if not file_path.is_file():
            continue
        ext = file_path.suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"}:
            results.append({
                "file": str(file_path),
                "decision": "flag",
                "reason": "wrong or unsupported file type",
                "dry_run": dry_run,
            })
            continue

        score, reason = heuristic_score(file_path)
        # Duplicate check for images
        if ext in {".jpg", ".jpeg", ".png", ".webp"} and score == "ok":
            try:
                with Image.open(file_path) as img:
                    h = simple_phash(img)
                    if h in seen_hashes:
                        score = "flag"
                        reason = f"possible duplicate of {seen_hashes[h]}"
                    else:
                        seen_hashes[h] = file_path.name
            except Exception:
                pass

        result = {
            "file": str(file_path),
            "decision": score,
            "reason": reason,
            "dry_run": dry_run,
            "note": "basic screening only; human review required",
        }
        if not dry_run and score == "flag":
            result["supabase"] = write_flag_to_supabase(file_path.name, "pending", reason)
        results.append(result)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scan uploaded media with basic screening and flag suspicious content for admin review. Never deletes."
    )
    parser.add_argument("--input-dir", default="./uploads", help="Folder with media files to review")
    parser.add_argument("--live", action="store_true", help="Write flags to Supabase (default is dry-run)")
    args = parser.parse_args()

    dry_run = not args.live
    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Input directory {input_dir} not found.")
        return 1

    result = process_directory(input_dir, dry_run=dry_run)
    print(json.dumps({"reviewed": len(result), "dry_run": dry_run, "files": result}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
