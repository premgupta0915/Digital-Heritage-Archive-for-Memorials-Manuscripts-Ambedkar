# Digital Heritage Archive for Memorials, Manuscripts & Ambedkar (SIH26096)

Smart India Hackathon 2026 project. Backend docs: [`heritage-archive/README.md`](./heritage-archive/README.md).

## Running locally

```bash
# terminal 1 — backend
cd heritage-archive/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The frontend calls the backend at
`http://localhost:8000` by default (override with `VITE_API_BASE_URL`
in a `.env` file inside `frontend/`).
