"""Process school media locally: resize images, strip EXIF GPS, create placeholders, and prepare video posters.

Thumbs are genuinely small (~320px). Medium and large are generated from the original, not the thumb.
Supports resumable uploads (skips already uploaded), progress bar, low-data mode, and outputs a manifest JSON.
Dry-run is the safe default; use --live to upload.
"""

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

try:
    from tqdm import tqdm
except Exception:  # pragma: no cover
    tqdm = lambda x, **k: x  # type: ignore


DEFAULT_OUTPUT = Path("artifacts/media")


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def ensure_directories(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    (root / "images" / "thumb").mkdir(parents=True, exist_ok=True)
    (root / "images" / "medium").mkdir(parents=True, exist_ok=True)
    (root / "images" / "large").mkdir(parents=True, exist_ok=True)
    (root / "videos").mkdir(parents=True, exist_ok=True)


def strip_exif_gps(source: Path, destination: Path, quality: int = 80) -> None:
    with Image.open(source) as img:
        image = ImageOps.exif_transpose(img)
        exif = image.getexif()
        exif.pop(34853, None)  # GPSInfo
        save_kwargs = {"format": "WEBP", "quality": quality}
        exif_bytes = exif.tobytes() if exif and len(exif) else None
        if exif_bytes:
            save_kwargs["exif"] = exif_bytes
        image.save(destination, **save_kwargs)


def make_placeholder(source: Path, output_path: Path) -> str:
    with Image.open(source) as img:
        img = img.convert("RGB")
        img = img.resize((32, 32), Image.Resampling.LANCZOS)
        img = img.filter(ImageFilter.GaussianBlur(1.2))
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=40)
        payload = base64.b64encode(buffer.getvalue()).decode("ascii")
    output_path.write_bytes(buffer.getvalue())
    return payload


def resize_image(source: Path, target: Path, max_size: tuple[int, int], quality: int = 80) -> None:
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(target, "WEBP", quality=quality)


def create_video_poster(source: Path, target: Path) -> None:
    if not ffmpeg_available():
        raise RuntimeError("ffmpeg not installed. Install ffmpeg and add it to PATH.")
    command = ["ffmpeg", "-y", "-i", str(source), "-frames:v", "1", "-q:v", "5", str(target)]
    import subprocess
    subprocess.run(command, check=True, capture_output=True)


def already_uploaded(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except Exception:
        return False


def upload_to_r2(file_path: Path, key: str, dry_run: bool = True, client=None, bucket: str | None = None) -> dict | None:
    if dry_run:
        return {"key": key, "dry_run": True, "file": str(file_path)}
    if client is None or bucket is None:
        endpoint = os.getenv("R2_ENDPOINT_URL")
        bucket = os.getenv("R2_BUCKET_NAME")
        access_key = os.getenv("R2_ACCESS_KEY_ID")
        secret = os.getenv("R2_SECRET_ACCESS_KEY")
        if not all([endpoint, bucket, access_key, secret]) or boto3 is None:
            print("R2 settings missing; skipping upload.")
            return None
        client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret,
            region_name="auto",
        )
    if already_uploaded(client, bucket, key):
        return {"key": key, "skipped": True, "reason": "already exists"}
    client.upload_file(str(file_path), bucket, key)
    return {"key": key, "dry_run": False}


def process_directory(
    input_dir: Path,
    output_root: Path,
    dry_run: bool = True,
    low_data: bool = False,
) -> list[dict]:
    ensure_directories(output_root)
    metadata = []
    files = [p for p in sorted(input_dir.iterdir()) if p.is_file()]
    iterator = tqdm(files, desc="Processing media") if not low_data else files

    r2_client = None
    r2_bucket = None
    if not dry_run and boto3 is not None:
        endpoint = os.getenv("R2_ENDPOINT_URL")
        r2_bucket = os.getenv("R2_BUCKET_NAME")
        access_key = os.getenv("R2_ACCESS_KEY_ID")
        secret = os.getenv("R2_SECRET_ACCESS_KEY")
        if all([endpoint, r2_bucket, access_key, secret]):
            r2_client = boto3.client(
                "s3",
                endpoint_url=endpoint,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret,
                region_name="auto",
            )

    quality = 70 if low_data else 80

    for file_path in iterator:
        if file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            stem = file_path.stem
            thumb = output_root / "images" / "thumb" / f"{stem}.webp"
            medium = output_root / "images" / "medium" / f"{stem}.webp"
            large = output_root / "images" / "large" / f"{stem}.webp"
            placeholder = output_root / "images" / "thumb" / f"{stem}-placeholder.webp"

            # Generate from original
            resize_image(file_path, thumb, (320, 320), quality=quality)
            resize_image(file_path, medium, (800, 800), quality=quality)
            resize_image(file_path, large, (1400, 1400), quality=quality)
            blur_payload = make_placeholder(file_path, placeholder)
            # Ensure GPS is stripped on the thumb (and others if desired)
            strip_exif_gps(thumb, thumb, quality=quality)

            meta = {
                "source": str(file_path),
                "thumb": str(thumb),
                "medium": str(medium),
                "large": str(large),
                "placeholder": str(placeholder),
                "placeholder_base64": blur_payload,
                "status": "processed",
            }
            metadata.append(meta)

            for path, key in [
                (thumb, f"photos/thumb/{file_path.name}"),
                (medium, f"photos/medium/{file_path.name}"),
                (large, f"photos/large/{file_path.name}"),
                (placeholder, f"photos/placeholders/{file_path.name}"),
            ]:
                upload_to_r2(path, key, dry_run=dry_run, client=r2_client, bucket=r2_bucket)

        elif file_path.suffix.lower() in {".mp4", ".mov", ".webm"}:
            poster = output_root / "videos" / f"{file_path.stem}-poster.webp"
            if ffmpeg_available():
                try:
                    create_video_poster(file_path, poster)
                except Exception as exc:
                    print(f"Poster failed for {file_path}: {exc}")
            metadata.append({
                "source": str(file_path),
                "poster": str(poster) if poster.exists() else None,
                "status": "processed",
            })
            if poster.exists():
                upload_to_r2(poster, f"videos/posters/{file_path.name}.webp", dry_run=dry_run, client=r2_client, bucket=r2_bucket)

    # Write manifest
    manifest_path = output_root / "manifest.json"
    manifest_path.write_text(json.dumps({"files": metadata, "count": len(metadata)}, indent=2), encoding="utf-8")
    return metadata


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Process school media locally: resize images, strip EXIF GPS, create placeholders, and prepare video posters."
    )
    parser.add_argument("--input-dir", default="./uploads", help="Directory with media files")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT), help="Where to save processed assets")
    parser.add_argument("--live", action="store_true", help="Perform real uploads to R2 (default is dry-run)")
    parser.add_argument("--low-data", action="store_true", help="Lower quality and skip progress bar for slow connections")
    args = parser.parse_args()

    dry_run = not args.live
    input_dir = Path(args.input_dir)
    output_root = Path(args.output_dir)

    if not input_dir.exists():
        print(f"Input directory not found: {input_dir}")
        return 1

    result = process_directory(input_dir, output_root, dry_run=dry_run, low_data=args.low_data)
    print(json.dumps({"processed": len(result), "dry_run": dry_run, "manifest": str(output_root / "manifest.json")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
