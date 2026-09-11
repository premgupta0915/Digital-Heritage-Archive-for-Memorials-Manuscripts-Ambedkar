"""
Kiosk-facing endpoints.

Note: the physical thermal printer / USB hardware integration is out of
scope for now. This endpoint only generates the *content* a printer
would need — a short summary and a QR payload — as plain data. Wiring
that up to an actual thermal printer (e.g. via python-escpos) can be
added later as a separate hardware-side script.
"""

from __future__ import annotations

import base64
import io

import qrcode
from fastapi import APIRouter, HTTPException

from schemas import PrintSouvenirRequest, PrintSouvenirResponse
from services.db_service import get_archive_item

router = APIRouter(prefix="/api/v1/kiosk", tags=["kiosk"])

ARCHIVE_BASE_URL = "https://heritage-archive.example.org/items"  # replace with real deployed URL


@router.post("/print-souvenir", response_model=PrintSouvenirResponse)
def print_souvenir(request: PrintSouvenirRequest) -> PrintSouvenirResponse:
    item = get_archive_item(request.archive_item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Archive item not found")

    summary_lines = [item["title"]]
    if item.get("author_or_speaker"):
        summary_lines.append(f"By {item['author_or_speaker']}")
    if item.get("source_volume"):
        page_range = ""
        if item.get("source_page_start"):
            page_range = f", p.{item['source_page_start']}"
            if item.get("source_page_end") and item["source_page_end"] != item["source_page_start"]:
                page_range += f"-{item['source_page_end']}"
        summary_lines.append(f"{item['source_volume']}{page_range}")
    if item.get("year_created"):
        summary_lines.append(f"Year: {item['year_created']}")

    summary_text = "\n".join(summary_lines)
    qr_payload = f"{ARCHIVE_BASE_URL}/{item['id']}"

    qr_image_base64 = None
    if request.include_qr:
        qr_image_base64 = _generate_qr_base64(qr_payload)

    return PrintSouvenirResponse(
        summary_text=summary_text,
        qr_payload=qr_payload,
        qr_image_base64=qr_image_base64,
    )


def _generate_qr_base64(payload: str) -> str:
    img = qrcode.make(payload)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
