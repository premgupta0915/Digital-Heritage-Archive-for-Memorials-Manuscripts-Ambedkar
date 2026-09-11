-- =====================================================================
-- Digital Heritage Archive & Platform (SIH26096)
-- PostgreSQL + PostGIS schema
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------

CREATE TYPE archive_item_type AS ENUM (
    'manuscript', 'speech', 'photograph', 'constitutional_debate',
    'letter', 'newspaper_clipping', 'audio_recording', 'video'
);

CREATE TYPE script_type AS ENUM (
    'modi', 'devanagari_archaic', 'devanagari_modern',
    'english', 'urdu', 'other'
);

CREATE TYPE processing_status AS ENUM (
    'pending', 'preprocessing', 'ocr_in_progress',
    'embedding_in_progress', 'completed', 'failed', 'needs_review'
);

CREATE TYPE asset_kind AS ENUM (
    'original_scan', 'preprocessed_image', 'ocr_text',
    'thumbnail', 'audio_transcript', 'translated_text', 'media_file'
);

-- ---------------------------------------------------------------------
-- TABLE: archive_items
-- Core metadata record for every digitized item in the archive
-- ---------------------------------------------------------------------

CREATE TABLE archive_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    description         TEXT,
    item_type           archive_item_type NOT NULL,
    script               script_type,
    language            VARCHAR(10),                  -- ISO 639-1/2 code
    source_volume       VARCHAR(100),                  -- e.g. "Writings and Speeches Vol. 5"
    source_page_start   INTEGER,
    source_page_end     INTEGER,
    year_created        INTEGER,
    year_created_approx BOOLEAN NOT NULL DEFAULT FALSE,
    author_or_speaker   TEXT,
    location_name       TEXT,
    processing_status   processing_status NOT NULL DEFAULT 'pending',
    ocr_confidence      NUMERIC(5,2),                  -- 0.00 - 100.00
    is_public           BOOLEAN NOT NULL DEFAULT TRUE,
    tags                TEXT[] DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_page_range CHECK (
        source_page_end IS NULL OR source_page_start IS NULL
        OR source_page_end >= source_page_start
    ),
    CONSTRAINT chk_year_reasonable CHECK (
        year_created IS NULL OR (year_created BETWEEN 1700 AND EXTRACT(YEAR FROM now())::INT)
    )
);

CREATE INDEX idx_archive_items_type ON archive_items (item_type);
CREATE INDEX idx_archive_items_status ON archive_items (processing_status);
CREATE INDEX idx_archive_items_year ON archive_items (year_created);
CREATE INDEX idx_archive_items_tags ON archive_items USING GIN (tags);
CREATE INDEX idx_archive_items_title_trgm ON archive_items USING GIN (title gin_trgm_ops);

-- ---------------------------------------------------------------------
-- TABLE: digital_assets
-- Every derived/original file (scan, thumbnail, ocr text blob, etc.)
-- tied to an archive_item. Actual bytes live in MinIO/S3; this stores
-- the pointer + processing metadata.
-- ---------------------------------------------------------------------

CREATE TABLE digital_assets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_item_id     UUID NOT NULL REFERENCES archive_items(id) ON DELETE CASCADE,
    asset_kind          asset_kind NOT NULL,
    storage_bucket      VARCHAR(100) NOT NULL,
    storage_key         TEXT NOT NULL,                 -- path/key inside MinIO/S3
    mime_type           VARCHAR(100),
    file_size_bytes     BIGINT,
    checksum_sha256     CHAR(64),
    width_px            INTEGER,
    height_px           INTEGER,
    ocr_engine          VARCHAR(50),                    -- 'tesseract' | 'trocr' | null
    ocr_raw_text        TEXT,
    duration_seconds    NUMERIC(10,2),                   -- for asset_kind = 'media_file' (audio/video)
    qdrant_point_id     UUID,                            -- id of vector in Qdrant, if applicable
    qdrant_collection   VARCHAR(100),                    -- 'ambedkar_texts_v1' | 'ambedkar_visuals_v1'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_storage_location UNIQUE (storage_bucket, storage_key)
);

CREATE INDEX idx_digital_assets_item ON digital_assets (archive_item_id);
CREATE INDEX idx_digital_assets_kind ON digital_assets (asset_kind);
CREATE INDEX idx_digital_assets_qdrant ON digital_assets (qdrant_collection, qdrant_point_id);

-- ---------------------------------------------------------------------
-- TABLE: historical_places
-- Geo-tagged locations (memorials, birthplaces, event sites) using
-- PostGIS GEOGRAPHY points for accurate distance/map queries.
-- ---------------------------------------------------------------------

CREATE TABLE historical_places (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    description         TEXT,
    place_type          VARCHAR(50),                    -- 'memorial' | 'birthplace' | 'institution' | 'event_site'
    address             TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    country             VARCHAR(100) NOT NULL DEFAULT 'India',
    geo_point           GEOGRAPHY(POINT, 4326) NOT NULL,
    related_archive_item_id UUID REFERENCES archive_items(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_historical_places_geo ON historical_places USING GIST (geo_point);
CREATE INDEX idx_historical_places_related_item ON historical_places (related_archive_item_id);

-- ---------------------------------------------------------------------
-- TABLE: timeline_events
-- Chronological events for the interactive timeline navigator.
-- ---------------------------------------------------------------------

CREATE TABLE timeline_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    summary             TEXT,
    event_date          DATE,
    event_year          INTEGER NOT NULL,
    event_year_approx   BOOLEAN NOT NULL DEFAULT FALSE,
    related_archive_item_id UUID REFERENCES archive_items(id) ON DELETE SET NULL,
    related_place_id    UUID REFERENCES historical_places(id) ON DELETE SET NULL,
    display_order       INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_event_year_reasonable CHECK (
        event_year BETWEEN 1700 AND EXTRACT(YEAR FROM now())::INT
    )
);

CREATE INDEX idx_timeline_events_year ON timeline_events (event_year);
CREATE INDEX idx_timeline_events_item ON timeline_events (related_archive_item_id);

-- ---------------------------------------------------------------------
-- TABLE: kiosk_analytics
-- Lightweight usage analytics from kiosk/web sessions.
-- Kept generic (no hardware-specific columns) since the physical
-- kiosk build-out is deferred for now.
-- ---------------------------------------------------------------------

CREATE TABLE kiosk_analytics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL,
    event_type          VARCHAR(50) NOT NULL,           -- 'search' | 'rag_query' | 'view_item' | 'voice_query' | 'print_souvenir'
    archive_item_id     UUID REFERENCES archive_items(id) ON DELETE SET NULL,
    query_text          TEXT,
    language_code       VARCHAR(10),
    response_time_ms    INTEGER,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kiosk_analytics_session ON kiosk_analytics (session_id);
CREATE INDEX idx_kiosk_analytics_event_type ON kiosk_analytics (event_type);
CREATE INDEX idx_kiosk_analytics_created_at ON kiosk_analytics (created_at);
CREATE INDEX idx_kiosk_analytics_metadata ON kiosk_analytics USING GIN (metadata);

-- ---------------------------------------------------------------------
-- Trigger: auto-update updated_at on archive_items
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_items_updated_at
    BEFORE UPDATE ON archive_items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
