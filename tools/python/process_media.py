"""Create privacy-safe image variants and video posters/previews for HSHS World.
Requires R2-compatible credentials, Supabase service key, Pillow, boto3 and ffmpeg.
Run locally or in GitHub Actions; never ship the service key to the browser.
"""
import base64
import io
import json
import os
import subprocess
import tempfile
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from PIL import Image, ImageOps
from supabase import create_client

load_dotenv()
WIDTHS = (320, 640, 960, 1440)
CACHE_CONTROL = "public, max-age=31536000, immutable"
IMAGE_EXTS = {"jpg", "jpeg", "png", "webp"}
VIDEO_EXTS = {"mp4", "mov", "webm", "m4v"}

s3 = boto3.client(
    "s3", endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET"], region_name="auto",
)
bucket = os.environ["R2_BUCKET"]
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def put(key, body, content_type):
    s3.put_object(Bucket=bucket, Key=key, Body=body, ContentType=content_type,
                  CacheControl=CACHE_CONTROL)


def webp(image, quality=80):
    out = io.BytesIO()
    image.save(out, "WEBP", quality=quality, method=6, exif=b"")
    return out.getvalue()


def process_image(source, base):
    with Image.open(source) as opened:
        oriented = ImageOps.exif_transpose(opened).convert("RGB")
        clean = Image.new("RGB", oriented.size)
        clean.paste(oriented)
    width, height = clean.size
    for target in WIDTHS:
        if target > width:
            continue
        resized = clean if target == width else clean.resize(
            (target, max(1, round(height * target / width))), Image.Resampling.LANCZOS)
        put(f"{base}-{target}.webp", webp(resized), "image/webp")
    tiny = clean.resize((24, max(1, round(height * 24 / width))), Image.Resampling.LANCZOS)
    blur = "data:image/webp;base64," + base64.b64encode(webp(tiny, 40)).decode("ascii")
    red, green, blue = clean.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
    return {
        "width": width, "height": height, "blur_data": blur,
        "dominant_color": f"#{red:02x}{green:02x}{blue:02x}",
        "processed_key": base,
    }


def process_video(source, base, temp_dir):
    info = json.loads(run("ffprobe", "-v", "error", "-print_format", "json",
                          "-show_format", "-show_streams", str(source)))
    stream = next(s for s in info["streams"] if s.get("codec_type") == "video")
    duration = float(info["format"].get("duration", 0))
    poster = temp_dir / "poster.jpg"
    preview = temp_dir / "preview.mp4"
    run("ffmpeg", "-y", "-ss", str(min(1.0, duration / 2)), "-i", str(source),
        "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "3", str(poster))
    run("ffmpeg", "-y", "-i", str(source), "-t", "3", "-an",
        "-vf", "scale=480:-2", "-c:v", "libx264", "-crf", "28",
        "-preset", "veryfast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(preview))
    poster_key, preview_key = base + "-poster.jpg", base + "-preview.mp4"
    put(poster_key, poster.read_bytes(), "image/jpeg")
    put(preview_key, preview.read_bytes(), "video/mp4")
    return {"duration": duration, "width": int(stream["width"]), "height": int(stream["height"]),
            "poster_key": poster_key, "preview_key": preview_key}


def already_done(key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as exc:
        if exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404:
            return False
        raise


def main():
    paginator = s3.get_paginator("list_objects_v2")
    for prefix, table in (("photos/", "photos"), ("videos/", "videos")):
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for item in page.get("Contents", []):
                key = item["Key"]
                ext = key.rsplit(".", 1)[-1].lower()
                if ext not in IMAGE_EXTS | VIDEO_EXTS or key.startswith("processed/"):
                    continue
                stem = key.rsplit(".", 1)[0]
                base = "processed/" + stem
                marker = base + ".done.json"
                if already_done(marker):
                    continue
                with tempfile.TemporaryDirectory() as directory:
                    temp = Path(directory)
                    source = temp / ("source." + ext)
                    s3.download_file(bucket, key, str(source))
                    if ext in IMAGE_EXTS:
                        meta = process_image(source, base)
                    else:
                        meta = process_video(source, base, temp)
                # Update only an existing matching row; don't insert unknown metadata.
                result = sb.table(table).update(meta).eq("media_key", key).execute()
                put(marker, json.dumps(meta).encode("utf-8"), "application/json")
                print("processed", key, "matched rows:", len(result.data or []))


if __name__ == "__main__":
    main()
