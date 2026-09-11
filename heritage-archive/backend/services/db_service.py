"""
db_service.py
===============
Minimal Postgres access layer for archive_items and historical_places
lookups used by the API routers.
"""

from __future__ import annotations

import os

import psycopg2
import psycopg2.extras

DB_DSN = os.environ.get(
    "DATABASE_URL",
    "postgresql://heritage_admin:change_me_in_env@localhost:5432/heritage_archive",
)

# Maps the frontend's category filter values to our `archive_item_type` enum.
CATEGORY_TO_ITEM_TYPES = {
    "speeches": ["speech"],
    "manuscripts": ["manuscript", "letter", "constitutional_debate"],
}


def get_archive_item(archive_item_id: str) -> dict | None:
    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, title, description, item_type, source_volume,
                       source_page_start, source_page_end, year_created,
                       author_or_speaker
                FROM archive_items
                WHERE id = %s
                """,
                (archive_item_id,),
            )
            row = cur.fetchone()
            return dict(row) if row else None


def list_archive_items(category: str = "all", search: str | None = None, limit: int = 100) -> list[dict]:
    """
    Returns archive_items (and, for 'memorials'/'all', historical_places)
    shaped for the frontend: { id, title, category, author, description, date }.
    """
    results: list[dict] = []

    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if category in ("all", "speeches", "manuscripts"):
                item_types = CATEGORY_TO_ITEM_TYPES.get(category)
                query = """
                    SELECT id, title, description, item_type, author_or_speaker, year_created
                    FROM archive_items
                    WHERE is_public = TRUE
                """
                params: list = []
                if item_types:
                    query += " AND item_type = ANY(%s)"
                    params.append(item_types)
                if search:
                    query += " AND (title ILIKE %s OR description ILIKE %s)"
                    params.extend([f"%{search}%", f"%{search}%"])
                query += " ORDER BY year_created NULLS LAST LIMIT %s"
                params.append(limit)

                cur.execute(query, params)
                for row in cur.fetchall():
                    results.append({
                        "id": str(row["id"]),
                        "title": row["title"],
                        "category": _item_type_to_category(row["item_type"]),
                        "author": row.get("author_or_speaker") or "Unknown",
                        "description": row.get("description") or "",
                        "date": str(row["year_created"]) if row.get("year_created") else "Undated",
                    })

            if category in ("all", "memorials"):
                query = "SELECT id, name, description, place_type FROM historical_places"
                params = []
                if search:
                    query += " WHERE name ILIKE %s OR description ILIKE %s"
                    params.extend([f"%{search}%", f"%{search}%"])
                query += " LIMIT %s"
                params.append(limit)

                cur.execute(query, params)
                for row in cur.fetchall():
                    results.append({
                        "id": str(row["id"]),
                        "title": row["name"],
                        "category": "memorials",
                        "author": "National Heritage Site",
                        "description": row.get("description") or "",
                        "date": "Permanent",
                    })

    return results[:limit]


def _item_type_to_category(item_type: str) -> str:
    if item_type == "speech":
        return "speeches"
    return "manuscripts"


def list_media_items(limit: int = 100) -> list[dict]:
    """
    Returns archive_items of type 'audio_recording' or 'video', each with
    its media_file digital_asset (storage location, duration) if one has
    been uploaded. Items without an uploaded file yet are still listed
    (asset fields come back null) so the frontend can show them as
    "not yet digitized" rather than hiding them entirely.
    """
    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT ai.id, ai.title, ai.description, ai.item_type,
                       ai.author_or_speaker, ai.year_created,
                       da.id AS asset_id, da.storage_bucket, da.storage_key,
                       da.mime_type, da.duration_seconds
                FROM archive_items ai
                LEFT JOIN digital_assets da
                    ON da.archive_item_id = ai.id AND da.asset_kind = 'media_file'
                WHERE ai.item_type IN ('audio_recording', 'video') AND ai.is_public = TRUE
                ORDER BY ai.year_created NULLS LAST
                LIMIT %s
                """,
                (limit,),
            )
            return [dict(row) for row in cur.fetchall()]


def register_media_asset(
    archive_item_id: str,
    storage_bucket: str,
    storage_key: str,
    mime_type: str,
    duration_seconds: float | None = None,
) -> str:
    """Insert a digital_assets row pointing at an uploaded media file."""
    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO digital_assets
                    (archive_item_id, asset_kind, storage_bucket, storage_key, mime_type, duration_seconds)
                VALUES (%s, 'media_file', %s, %s, %s, %s)
                RETURNING id
                """,
                (archive_item_id, storage_bucket, storage_key, mime_type, duration_seconds),
            )
            asset_id = cur.fetchone()[0]
        conn.commit()
    return str(asset_id)


def create_media_archive_item(
    title: str,
    description: str,
    item_type: str,
    author_or_speaker: str | None,
    year_created: int | None,
) -> str:
    """Create a new archive_items row for a documentary/lecture/interview upload."""
    with psycopg2.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO archive_items (title, description, item_type, author_or_speaker, year_created, is_public)
                VALUES (%s, %s, %s, %s, %s, TRUE)
                RETURNING id
                """,
                (title, description, item_type, author_or_speaker, year_created),
            )
            item_id = cur.fetchone()[0]
        conn.commit()
    return str(item_id)
