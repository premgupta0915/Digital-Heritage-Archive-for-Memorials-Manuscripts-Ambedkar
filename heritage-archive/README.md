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

## Status

- [x] Database schema & infra configs
- [x] OCR + embedding ingestion pipeline
- [ ] Backend API & RAG engine
- [ ] Kiosk/web frontend
