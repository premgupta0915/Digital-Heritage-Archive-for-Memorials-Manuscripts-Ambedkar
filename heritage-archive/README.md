# Digital Heritage Archive (SIH26096)

Digital Heritage Archive for Memorials, Manuscripts & Ambedkar — built for
Smart India Hackathon, Problem Statement SIH26096, sponsored by the
Ministry of Social Justice and Empowerment (MoSJE).

An AI-powered platform that digitizes, processes, and makes searchable
historical Indian manuscripts (including Modi script), speeches, photos,
and constitutional debates associated with Dr. B.R. Ambedkar and national
memorials.

## Stack

- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL + PostGIS
- **Vector search:** Qdrant (`bge-m3` text embeddings, CLIP visual embeddings)
- **Object storage:** MinIO (S3-compatible)
- **Cache/queue:** Redis
- **OCR:** Tesseract (standard text) + TrOCR (historical Modi/Devanagari scripts)
- **Frontend:** React + Tailwind CSS
- **Multilingual voice/translation:** BHASHINI API (Govt. of India)

> Note: the physical hardware kiosk (Raspberry Pi / thermal printer) is
> out of scope for the current build.

## Repo structure

```
heritage-archive/
├── infra/
│   └── schema.sql          # PostgreSQL + PostGIS schema
├── backend/                # FastAPI app, ingestion pipeline, RAG engine
├── docker-compose.yml      # postgres-postgis, qdrant, minio, redis
└── README.md
```

## Getting started

```bash
docker compose up -d
```

This spins up Postgres (auto-loads `infra/schema.sql`), Qdrant, MinIO,
and Redis.

## Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Tesseract itself is a system binary, not a pip package — install it separately:
- Ubuntu/Debian: `sudo apt install tesseract-ocr tesseract-ocr-hin`
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- macOS: `brew install tesseract`

Run ingestion on a folder of scanned pages:
```bash
python backend/ingestion_pipeline.py --input ./scans --script modi --volume "Writings and Speeches Vol. 5"
```

## Backend API & RAG

```bash
export ANTHROPIC_API_KEY=your_key_here
export DATABASE_URL=postgresql://heritage_admin:change_me_in_env@localhost:5432/heritage_archive
export BHASHINI_USER_ID=your_bhashini_user_id
export BHASHINI_ULCA_API_KEY=your_bhashini_key

cd backend
uvicorn main:app --reload --port 8000
```

Endpoints:
- `POST /api/v1/search/cross-modal` — semantic text search + text-to-image / image-to-image search
- `POST /api/v1/rag/chat` — grounded RAG chat, every claim cited with (Volume, Page)
- `POST /api/v1/kiosk/print-souvenir` — souvenir summary text + QR payload (printing to actual hardware is not wired up — see Status)
- `GET /api/media` — list audio/video documentaries, lectures, interviews, with a playable presigned URL when a file has been uploaded
- `POST /api/media/upload` — upload a new audio/video file (multipart form: title, description, item_type, file, etc.) — stored in MinIO, registered in Postgres
- `POST /api/v1/translate` — translate text into any language (German, Spanish, French, Japanese, etc.) via Claude, for foreign-language kiosk support beyond BHASHINI's Indian-language scope

> The embedding models (`bge-m3`, CLIP) are ~2GB+ and load lazily on
> first request to `/api/v1/search/*` or `/api/v1/rag/chat` — not at
> server startup — so `uvicorn main:app` starts instantly and
> `/api/archives`, `/api/search`, and `/health` work immediately. The
> first RAG/search request will be slow (downloading + loading the
> model into memory); after that it's cached.

`services/bhashini_client.py` wraps BHASHINI for speech-to-text, text-to-speech, and translation, used to power multilingual voice interaction from the frontend.

## Status

- [x] Database schema & infra configs
- [x] OCR + embedding ingestion pipeline
- [x] Backend API & RAG engine
- [x] Frontend (React + Vite + Tailwind, in `../frontend/`)
- [ ] Physical hardware kiosk (Raspberry Pi / thermal printer) — deferred
