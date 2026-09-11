"""
minio_service.py
==================
Thin wrapper around MinIO (S3-compatible) object storage for audio/video
media files — documentaries, lectures, interviews, oral history
recordings. Uses boto3's S3 client since MinIO speaks the S3 API.
"""

from __future__ import annotations

import os

import boto3
from botocore.client import Config

MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "heritage_admin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "change_me_in_env")
MEDIA_BUCKET = os.environ.get("MEDIA_BUCKET", "heritage-media")

PRESIGNED_URL_EXPIRY_SECONDS = 3600


def _client():
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def ensure_bucket_exists():
    s3 = _client()
    existing = {b["Name"] for b in s3.list_buckets().get("Buckets", [])}
    if MEDIA_BUCKET not in existing:
        s3.create_bucket(Bucket=MEDIA_BUCKET)


def upload_media_file(local_path: str, object_key: str, content_type: str) -> str:
    """Upload a local audio/video file to the media bucket. Returns the object key."""
    ensure_bucket_exists()
    s3 = _client()
    s3.upload_file(local_path, MEDIA_BUCKET, object_key, ExtraArgs={"ContentType": content_type})
    return object_key


def upload_media_fileobj(fileobj, object_key: str, content_type: str) -> str:
    """Upload from an in-memory file-like object (e.g. an UploadFile.file)."""
    ensure_bucket_exists()
    s3 = _client()
    s3.upload_fileobj(fileobj, MEDIA_BUCKET, object_key, ExtraArgs={"ContentType": content_type})
    return object_key


def get_presigned_url(object_key: str, expires_in: int = PRESIGNED_URL_EXPIRY_SECONDS) -> str:
    """Generate a temporary, directly-playable URL for a stored media file."""
    s3 = _client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": MEDIA_BUCKET, "Key": object_key},
        ExpiresIn=expires_in,
    )
