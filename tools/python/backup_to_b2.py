"""Copy missing or size-changed R2 objects to a private Backblaze B2 bucket."""
import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()


def client(endpoint, key_id, secret):
    return boto3.client("s3", endpoint_url=endpoint, aws_access_key_id=key_id,
                        aws_secret_access_key=secret, region_name="auto")


r2 = client(os.environ["R2_ENDPOINT"], os.environ["R2_KEY_ID"], os.environ["R2_SECRET"])
b2 = client(os.environ["B2_ENDPOINT"], os.environ["B2_KEY_ID"], os.environ["B2_APP_KEY"])
source, target = os.environ["R2_BUCKET"], os.environ["B2_BUCKET"]


def target_size(key):
    try:
        return b2.head_object(Bucket=target, Key=key)["ContentLength"]
    except ClientError as exc:
        if exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404:
            return None
        raise


def main():
    copied = 0
    for page in r2.get_paginator("list_objects_v2").paginate(Bucket=source):
        for obj in page.get("Contents", []):
            if target_size(obj["Key"]) == obj["Size"]:
                continue
            body = r2.get_object(Bucket=source, Key=obj["Key"])["Body"]
            b2.upload_fileobj(body, target, obj["Key"])
            copied += 1
    print("Copied", copied, "objects. No destination objects were deleted.")


if __name__ == "__main__":
    main()
