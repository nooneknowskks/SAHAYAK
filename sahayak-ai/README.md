# Sahayak AI

Monorepo layout:

- **frontend/** — Vite + HTML/CSS/JS UI (`npm run dev` on port 3000)
- **backend/** — Express API (`npm run start`, default port 5000)
- **ai-service/** — Python FastAPI OCR helper (`uvicorn`, default port 8000)
- **database/** — `schemes.json` (government scheme dataset)

## Prerequisites

- Node.js 18+
- Python 3.11+ (for `ai-service`)

## Quick start

1. **Environment**

   Copy `.env.example` to `.env` in `sahayak-ai/`. Set `GROQ_API_KEY` for AI chat and translation (optional; the app falls back to search-based replies if unset).

2. **Backend**

   ```bash
   cd backend
   npm install
   npm run start
   ```

3. **Frontend** (new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open the printed URL (e.g. http://localhost:3000). The UI calls the API at `VITE_API_URL` or `http://localhost:5000`.

4. **AI / OCR service** (optional)

   ```bash
   cd ai-service
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

   Install [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) on your system for real image text extraction; without it, the service still returns a text fallback.

   ```bash
   uvicorn app:app --reload --port 8000
   ```

   The Node backend calls `AI_SERVICE_URL` (default `http://127.0.0.1:8000`) on `/ocr` when users upload documents.

## How pieces connect

| Component | Role |
|-----------|------|
| `frontend/script.js` | Uses `VITE_API_URL` + `/api/*` routes (schemes, chat, eligibility, upload, auth). |
| `backend/server.js` | Loads `database/schemes.json`, mounts route modules under `routes/`. |
| `ai-service/app.py` | `/ocr` accepts multipart file uploads; Node merges results into document upload responses. |
| `database/schemes.json` | Single source of truth for scheme listings (override with `SCHEMES_PATH` in `.env`). |

## Production build

```bash
cd frontend
npm run build
```

Serve the `frontend/dist` folder with any static host; configure the same origin or CORS for your API URL.
