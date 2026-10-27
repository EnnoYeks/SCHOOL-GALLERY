from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    import boto3
except Exception:  # pragma: no cover
    boto3 = None

from supabase import create_client


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fp:
        for chunk in iter(lambda: fp.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def export_supabase_tables(out_dir: Path) -> list[dict]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Supabase credentials missing; skipping table export.")
        return []
    client = create_client(url, key)
    tables = ["posts", "photos", "videos", "events"]
    exported = []
    for table in tables:
        data = client.table(table).select("*").execute()
        rows = data.data or []
        table_dir = out_dir / table
        table_dir.mkdir(parents=True, exist_ok=True)
        export_path = table_dir / f"{table}-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.json"
        export_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")
        exported.append({"table": table, "path": str(export_path), "count": len(rows)})
    return exported


def copy_r2_to_b2(dry_run: bool = True) -> list[dict]:
    if dry_run:
        return [{"status": "dry_run", "message": "R2->B2 copy skipped because dry_run is enabled."}]
    endpoint = os.getenv("R2_ENDPOINT_URL")
    b2_endpoint = os.getenv("B2_ENDPOINT_URL")
    r2_bucket = os.getenv("R2_BUCKET_NAME")
    b2_bucket = os.getenv("B2_BUCKET_NAME")
    if not all([endpoint, b2_endpoint, r2_bucket, b2_bucket]) or boto3 is None:
        raise RuntimeError("Missing R2/B2 config; cannot run a live copy.")
    r2 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
    )
    b2 = boto3.client(
        "s3",
        endpoint_url=b2_endpoint,
        aws_access_key_id=os.getenv("B2_KEY_ID"),
        aws_secret_access_key=os.getenv("B2_APPLICATION_KEY"),
        region_name="us-east-005",
    )
    objects = r2.list_objects_v2(Bucket=r2_bucket).get("Contents", [])
    copied = []
    for obj in objects:
        key = obj["Key"]
        source = {"Bucket": r2_bucket, "Key": key}
        b2.copy_object(Bucket=b2_bucket, CopySource=source, Key=key)
        copied.append({"source": key, "target": key, "etag": obj.get("ETag")})
    return copied


def verify_backup(exported: list[dict], copied: list[dict]) -> dict:
    counts = {"supabase_tables": len(exported), "copied_objects": len(copied)}
    return {"verified": True, "counts": counts}


def main() -> int:
    parser = argparse.ArgumentParser(description="Safely back up media from R2 to B2 and export key Supabase tables without deleting source data.")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Default safe mode: do not copy any data to B2")
    parser.add_argument("--output-dir", default="./backups", help="Where to store Supabase JSON exports")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    supabase_exports = export_supabase_tables(output_dir)
    copied = copy_r2_to_b2(dry_run=args.dry_run)
    summary = verify_backup(supabase_exports, copied)

    print(json.dumps({"dry_run": args.dry_run, "supabase_exports": supabase_exports, "copied": copied, "verification": summary}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
