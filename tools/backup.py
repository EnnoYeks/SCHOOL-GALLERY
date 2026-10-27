from __future__ import annotations

import argparse
import base64
import io
import json
import os
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

try:
    import boto3
except Exception:  # pragma: no cover
    boto3 = None


DEFAULT_OUTPUT = Path("artifacts/media")


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def ensure_directories(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    (root / "images" / "thumb").mkdir(parents=True, exist_ok=True)
    (root / "images" / "medium").mkdir(parents=True, exist_ok=True)
    (root / "images" / "large").mkdir(parents=True, exist_ok=True)
    (root / "videos").mkdir(parents=True, exist_ok=True)


def strip_exif_gps(source: Path, destination: Path) -> None:
    with Image.open(source) as img:
        image = ImageOps.exif_transpose(img)
        exif = image.getexif()
        exif.pop(34853, None)
        image.save(destination, format="WEBP", exif=exif.tobytes() if exif else None)


def make_placeholder(source: Path, output_path: Path) -> str:
    with Image.open(source) as img:
        img = img.convert("RGB")
        img = img.resize((32, 32), Image.Resampling.LANCZOS)
        img = img.filter(ImageFilter.GaussianBlur(1.2))
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP")
        payload = base64.b64encode(buffer.getvalue()).decode("ascii")
    output_path.write_bytes(buffer.getvalue())
    return payload


def resize_image(source: Path, target: Path, size: tuple[int, int]) -> None:
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(target, "WEBP", quality=80)


def create_video_poster(source: Path, target: Path) -> None:
    if not ffmpeg_available():
        raise RuntimeError("ffmpeg not installed. Install ffmpeg and add it to PATH.")
    command = ["ffmpeg", "-y", "-i", str(source), "-frames:v", "1", str(target)]
    import subprocess
    subprocess.run(command, check=True)


def upload_to_r2(file_path: Path, key: str, dry_run: bool = True) -> dict | None:
    if dry_run:
        return {"key": key, "dry_run": True, "file": str(file_path)}
    endpoint = os.getenv("R2_ENDPOINT_URL")
    bucket = os.getenv("R2_BUCKET_NAME")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret = os.getenv("R2_SECRET_ACCESS_KEY")
    if not all([endpoint, bucket, access_key, secret]) or boto3 is None:
        print("R2 settings missing; skipping upload in this environment.")
        return None
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret,
        region_name="auto",
    )
    client.upload_file(str(file_path), bucket, key)
    return {"key": key, "dry_run": False}


def process_directory(input_dir: Path, output_root: Path, dry_run: bool = True) -> list[dict]:
    ensure_directories(output_root)
    metadata = []
    for file_path in sorted(input_dir.iterdir()):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            thumb = output_root / "images" / "thumb" / f"{file_path.stem}.webp"
            medium = output_root / "images" / "medium" / f"{file_path.stem}.webp"
            large = output_root / "images" / "large" / f"{file_path.stem}.webp"
            placeholder = output_root / "images" / "thumb" / f"{file_path.stem}-placeholder.webp"

            strip_exif_gps(file_path, thumb)
            resize_image(thumb, medium, (800, 800))
            resize_image(thumb, large, (1400, 1400))
            blur_payload = make_placeholder(thumb, placeholder)

            metadata.append({
                "source": str(file_path),
                "thumb": str(thumb),
                "medium": str(medium),
                "large": str(large),
                "placeholder": str(placeholder),
                "placeholder_base64": blur_payload,
                "status": "processed",
            })
            upload_to_r2(thumb, f"photos/{file_path.name}", dry_run=dry_run)
            upload_to_r2(medium, f"photos/medium/{file_path.name}", dry_run=dry_run)
            upload_to_r2(large, f"photos/large/{file_path.name}", dry_run=dry_run)
            upload_to_r2(placeholder, f"photos/placeholders/{file_path.name}", dry_run=dry_run)
        elif file_path.suffix.lower() in {".mp4", ".mov", ".webm"}:
            poster = output_root / "videos" / f"{file_path.stem}-poster.webp"
            if ffmpeg_available():
                create_video_poster(file_path, poster)
            metadata.append({
                "source": str(file_path),
                "poster": str(poster),
                "status": "processed",
            })
            upload_to_r2(poster, f"videos/posters/{file_path.name}.webp", dry_run=dry_run)
    return metadata


def main() -> int:
    parser = argparse.ArgumentParser(description="Process school media locally: resize images, strip EXIF GPS, create placeholders, and prepare video posters.")
    parser.add_argument("--input-dir", default="./uploads", help="Directory with media files")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT), help="Where to save processed assets")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Safe default: no upload to cloud storage")
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_root = Path(args.output_dir)

    if not input_dir.exists():
        print(f"Input directory not found: {input_dir}")
        return 1

    result = process_directory(input_dir, output_root, dry_run=args.dry_run)
    print(json.dumps({"processed": len(result), "dry_run": args.dry_run, "files": result[:5]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
