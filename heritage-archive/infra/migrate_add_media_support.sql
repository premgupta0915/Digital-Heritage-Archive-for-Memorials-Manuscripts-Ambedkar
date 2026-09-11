-- Migration: add audio/video media asset support to an already-running
-- database (schema.sql only applies on first container init, so this
-- brings an existing DB up to date without needing to recreate it).

ALTER TYPE asset_kind ADD VALUE IF NOT EXISTS 'media_file';

ALTER TABLE digital_assets ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(10,2);
