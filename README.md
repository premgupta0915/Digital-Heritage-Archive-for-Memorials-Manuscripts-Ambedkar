# Digital Heritage Archive for Memorials, Manuscripts & Ambedkar (SIH26096)

An AI-powered digital heritage platform dedicated to Dr. B. R. Ambedkar,
built for Smart India Hackathon (Problem Statement SIH26096), sponsored
by the Ministry of Social Justice and Empowerment — designed for
institutions like the Dr. Ambedkar International Centre.

It digitizes and makes searchable Ambedkar's writings, speeches, rare
manuscripts (including historical Modi script), and constitutional
debates, with an AI research assistant grounded in the archive and
multilingual support.

## Repo layout

```
.
├── heritage-archive/
│   ├── backend/          # FastAPI backend (this branch's source of truth)
│   ├── infra/            # DB schema, migrations, seed data
│   └── docker-compose.yml
├── frontend/             # Basic React + Vite frontend (this branch)
└── README.md             # you are here
```

> A separate, richer kiosk UI (chatbot widget, live voice search, camera
> document scanner, audio-visual vault, foreign-language narration) lives
> on the `frontendd` branch — see its own README for that version's setup.
> This branch's `frontend/` is the simpler reference implementation.

## What it does

- **AI-powered semantic & cross-modal search** — Qdrant-backed vector
  search over text and images (`bge-m3` text embeddings, CLIP visual
  embeddings).
- **OCR digitization** — Tesseract for standard English/Hindi text,
  TrOCR for historical manuscripts (Modi script, archaic Devanagari),
  with OpenCV preprocessing (denoise, deskew, contrast).
- **Grounded RAG research assistant** — answers questions using Claude,
  strictly citing volume/page from retrieved archive sources; refuses to
  answer beyond what the sources support.
- **Souvenir generation** — real QR codes linking to archive records,
  for a printable commemorative kiosk slip.
- **Audio/video media library** — real file storage (MinIO) and
  streaming playback for documentaries, lectures, and oral history
  recordings.
- **Multilingual support** — BHASHINI integration for Indian-language
  voice (speech-to-text, text-to-speech, translation); a general
  Claude-powered translation endpoint covers other languages (German,
  Spanish, French, Japanese, etc.).
- **Interactive timeline & metadata** — PostGIS-backed geo-tagging of
  memorial locations, chronological event tracking.

## Tech stack

**Backend:** FastAPI (Python), PostgreSQL + PostGIS, Qdrant, MinIO,
Redis, Tesseract + TrOCR, BAAI/bge-m3, CLIP, Claude (Anthropic API),
BHASHINI.

**Frontend (this branch):** React + Vite, Tailwind CSS, axios.

## Backend setup

```bash
cd heritage-archive
docker compose up -d          # Postgres, Qdrant, MinIO, Redis

cd backend
pip install -r requirements.txt

export ANTHROPIC_API_KEY=your_key_here
export DATABASE_URL=postgresql://heritage_admin:change_me_in_env@localhost:5432/heritage_archive

uvicorn main:app --reload --port 8000
```

Optional (BHASHINI voice/translation, MinIO media uploads):

```bash
export BHASHINI_USER_ID=...
export BHASHINI_ULCA_API_KEY=...
export MINIO_ACCESS_KEY=heritage_admin
export MINIO_SECRET_KEY=change_me_in_env
```

The embedding models (bge-m3, CLIP) are large and load lazily on first
use of `/api/v1/search/*` or `/api/v1/rag/chat` — the server itself
starts instantly, and `/api/archives`, `/api/search`, and `/health`
don't need them.

### API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/archives` | List archive items (speeches, manuscripts, memorials) |
| `POST /api/search` | Fast Postgres text search |
| `POST /api/v1/search/cross-modal` | Semantic + text-to-image vector search |
| `POST /api/v1/rag/chat` | Grounded AI research assistant, with citations |
| `POST /api/v1/kiosk/print-souvenir` | Souvenir summary + QR code |
| `GET /api/media` | List audio/video documentaries, lectures, interviews |
| `POST /api/media/upload` | Upload a new audio/video file |
| `POST /api/v1/translate` | Translate text into any language via Claude |

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend calls the backend at
`http://localhost:8000` by default (override with `VITE_API_BASE_URL`
in a `.env` file inside `frontend/`).

## Running both together

```bash
# terminal 1 — backend
cd heritage-archive/backend && uvicorn main:app --reload --port 8000

# terminal 2 — frontend
cd frontend && npm run dev
```

## Status

- [x] Database schema & infra (Postgres/PostGIS, Qdrant, MinIO, Redis)
- [x] OCR + embedding ingestion pipeline
- [x] Backend API: cross-modal search, RAG chat, souvenir/QR, media
      library, translation
- [x] Reference frontend (this branch) + richer kiosk UI (`frontendd`)
- [ ] Camera-based document scanner wired to backend OCR/image search
      (built on `frontendd`, currently matches a local demo catalog)
- [ ] Physical hardware kiosk (Raspberry Pi / thermal printer) — out of
      scope for the current build; software platform prioritized first
