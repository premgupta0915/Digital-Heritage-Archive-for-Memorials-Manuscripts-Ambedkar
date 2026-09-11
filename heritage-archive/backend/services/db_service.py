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
