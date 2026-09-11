"""
Audio/video media library — documentaries, lectures, interviews, oral
history recordings.

    GET  /api/media               — list all media items (with playable
                                     URL if a file has been uploaded)
    POST /api/media/upload        — upload a new audio/video file,
                                     creating the archive_item + asset
"""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from services import minio_service
from services.db_service import (
    create_media_archive_item,
    list_media_items,
    register_media_asset,
)

router = APIRouter(prefix="/api/media", tags=["media"])

ALLOWED_MEDIA_MIME_TYPES = {
    "audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4",
    "video/mp4", "video/webm", "video/quicktime",
}


class MediaItem(BaseModel):
    id: str
    title: str
    description: str | None = None
    item_type: str
    author_or_speaker: str | None = None
    year_created: int | None = None
    media_url: str | None = None
    mime_type: str | None = None
    duration_seconds: float | None = None
    has_media: bool


@router.get("", response_model=list[MediaItem])
def get_media_library():
    items = list_media_items()
    results = []
    for item in items:
        media_url = None
        if item.get("storage_key"):
            media_url = minio_service.get_presigned_url(item["storage_key"])
        results.append(MediaItem(
            id=str(item["id"]),
            title=item["title"],
            description=item.get("description"),
            item_type=item["item_type"],
            author_or_speaker=item.get("author_or_speaker"),
            year_created=item.get("year_created"),
            media_url=media_url,
            mime_type=item.get("mime_type"),
            duration_seconds=item.get("duration_seconds"),
            has_media=media_url is not None,
        ))
    return results


@router.post("/upload", response_model=MediaItem)
async def upload_media(
    title: str = Form(...),
    description: str = Form(""),
    item_type: Literal["audio_recording", "video"] = Form(...),
    author_or_speaker: str | None = Form(None),
    year_created: int | None = Form(None),
    duration_seconds: float | None = Form(None),
    file: UploadFile = File(...),
):
    if file.content_type not in ALLOWED_MEDIA_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported media type '{file.content_type}'. Allowed: {sorted(ALLOWED_MEDIA_MIME_TYPES)}",
        )

    archive_item_id = create_media_archive_item(
        title=title,
        description=description,
        item_type=item_type,
        author_or_speaker=author_or_speaker,
        year_created=year_created,
    )

    extension = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    object_key = f"{archive_item_id}/{uuid.uuid4()}.{extension}"
    minio_service.upload_media_fileobj(file.file, object_key, file.content_type)

    register_media_asset(
        archive_item_id=archive_item_id,
        storage_bucket=minio_service.MEDIA_BUCKET,
        storage_key=object_key,
        mime_type=file.content_type,
        duration_seconds=duration_seconds,
    )

    media_url = minio_service.get_presigned_url(object_key)
    return MediaItem(
        id=archive_item_id,
        title=title,
        description=description,
        item_type=item_type,
        author_or_speaker=author_or_speaker,
        year_created=year_created,
        media_url=media_url,
        mime_type=file.content_type,
        duration_seconds=duration_seconds,
        has_media=True,
    )
