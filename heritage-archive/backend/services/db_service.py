"""
db_service.py
===============
Minimal Postgres access layer — currently just what the souvenir/print
endpoint needs (looking up an archive_item's metadata). Expand this as
more endpoints need relational data beyond what's in Qdrant payloads.
"""

from __future__ import annotations

import os

import psycopg2
import psycopg2.extras

DB_DSN = os.environ.get(
    "DATABASE_URL",
    "postgresql://heritage_admin:change_me_in_env@localhost:5432/heritage_archive",
)


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
