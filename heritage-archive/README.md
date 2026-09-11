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

`services/bhashini_client.py` wraps BHASHINI for speech-to-text, text-to-speech, and translation, used to power multilingual voice interaction from the frontend.

## Status

- [x] Database schema & infra configs
- [x] OCR + embedding ingestion pipeline
- [x] Backend API & RAG engine
- [ ] Kiosk/web frontend
- [ ] Physical hardware kiosk (Raspberry Pi / thermal printer) — deferred

## Frontend integration (Next.js, repo root `app/`)

The frontend fetches `http://localhost:8000/api/archives?category=...` and
posts to `http://localhost:8000/api/search`. These are lightweight
Postgres-backed endpoints (`routers/archives.py`) separate from the
AI-powered `/api/v1/search/cross-modal` and `/api/v1/rag/chat` — kept
fast and dependency-light so the landing page works without the
embedding models/Qdrant running.

Run both together:
```bash
# terminal 1
cd heritage-archive/backend && uvicorn main:app --reload --port 8000

# terminal 2
npm install && npm run dev
```
