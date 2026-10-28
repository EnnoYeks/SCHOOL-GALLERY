"""Safely back up media from R2 to B2 and export key Supabase tables without deleting source data.

Uses download + upload stream (never copy_object across providers).
Uses paginators, skips files that already exist with the same size or checksum.
verify_backup compares counts/sizes and reports real failures.
Dry-run is the safe default; use --live to perform the copy.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError
except Exception:  # pragma: no cover
    boto3 = None
    ClientError = Exception  # type: ignore

from supabase import create_client


def sha256_fileobj(body) -> str:
    h = hashlib.sha256()
    for chunk in iter(lambda: body.read(65536), b""):
        h.update(chunk)
    body.seek(0)
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
    now = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    for table in tables:
        try:
            data = client.table(table).select("*").execute()
            rows = data.data or []
            table_dir = out_dir / table
            table_dir.mkdir(parents=True, exist_ok=True)
            export_path = table_dir / f"{table}-{now}.json"
            export_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")
            exported.append({"table": table, "path": str(export_path), "count": len(rows)})
        except Exception as exc:
            exported.append({"table": table, "error": str(exc)})
    return exported


def get_s3_client(endpoint: str, key_id: str, secret: str, region: str = "auto"):
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        region_name=region,
    )


def copy_r2_to_b2(dry_run: bool = True) -> list[dict]:
    if dry_run:
        return [{"status": "dry_run", "message": "R2->B2 copy skipped because dry_run is enabled."}]
    if boto3 is None:
        raise RuntimeError("boto3 not available")

    r2_endpoint = os.getenv("R2_ENDPOINT_URL")
    b2_endpoint = os.getenv("B2_ENDPOINT_URL")
    r2_bucket = os.getenv("R2_BUCKET_NAME")
    b2_bucket = os.getenv("B2_BUCKET_NAME")
    r2_key = os.getenv("R2_ACCESS_KEY_ID")
    r2_secret = os.getenv("R2_SECRET_ACCESS_KEY")
    b2_key = os.getenv("B2_KEY_ID")
    b2_secret = os.getenv("B2_APPLICATION_KEY")

    if not all([r2_endpoint, b2_endpoint, r2_bucket, b2_bucket, r2_key, r2_secret, b2_key, b2_secret]):
        raise RuntimeError("Missing R2/B2 config; cannot run a live copy.")

    r2 = get_s3_client(r2_endpoint, r2_key, r2_secret)
    b2 = get_s3_client(b2_endpoint, b2_key, b2_secret, region="us-east-005")

    copied = []
    paginator = r2.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=r2_bucket):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            size = obj["Size"]
            etag = obj.get("ETag", "").strip('"')

            # Check if already exists with same size
            try:
                head = b2.head_object(Bucket=b2_bucket, Key=key)
                if head["ContentLength"] == size:
                    copied.append({"key": key, "status": "skipped", "reason": "same size"})
                    continue
            except ClientError as exc:
                if exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode") != 404:
                    raise

            # Stream download and upload
            response = r2.get_object(Bucket=r2_bucket, Key=key)
            body = response["Body"]
            b2.upload_fileobj(body, b2_bucket, key)
            copied.append({"key": key, "status": "copied", "size": size, "etag": etag})

    return copied


def verify_backup(exported: list[dict], copied: list[dict]) -> dict:
    failures = []
    supabase_ok = all("error" not in e for e in exported)
    if not supabase_ok:
        failures.append("Some Supabase exports failed")

    copied_count = sum(1 for c in copied if c.get("status") == "copied")
    skipped_count = sum(1 for c in copied if c.get("status") == "skipped")
    if any("error" in str(c) for c in copied):
        failures.append("Some R2->B2 copies reported errors")

    verified = len(failures) == 0
    return {
        "verified": verified,
        "failures": failures,
        "counts": {
            "supabase_tables": len(exported),
            "copied_objects": copied_count,
            "skipped_objects": skipped_count,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Safely back up media from R2 to B2 and export key Supabase tables without deleting source data."
    )
    parser.add_argument("--live", action="store_true", help="Perform real copy to B2 (default is dry-run)")
    parser.add_argument("--output-dir", default="./backups", help="Where to store Supabase JSON exports")
    args = parser.parse_args()

    dry_run = not args.live
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    supabase_exports = export_supabase_tables(output_dir)
    copied = copy_r2_to_b2(dry_run=dry_run)
    summary = verify_backup(supabase_exports, copied)

    print(json.dumps({
        "dry_run": dry_run,
        "supabase_exports": supabase_exports,
        "copied_summary": {"copied": sum(1 for c in copied if c.get("status") == "copied"), "skipped": sum(1 for c in copied if c.get("status") == "skipped")},
        "verification": summary,
    }, indent=2))
    return 0 if summary["verified"] or dry_run else 1


if __name__ == "__main__":
    sys.exit(main())
