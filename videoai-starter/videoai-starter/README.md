
# VideoAI Starter

End-to-end YouTube -> Learning resources app.

## Quick Start

### 1) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # add OPENAI_API_KEY if you have it
uvicorn main:app --reload
```

### 2) Frontend
Just open `frontend/index.html` in the browser, or serve it:
```bash
# simple server
python -m http.server 8080 -d frontend
```
Set API base if needed:
Open DevTools console and run: `localStorage.setItem('apiBase', 'http://127.0.0.1:8000')`

## Notes
- Requires FFmpeg for audio fallback (transcription) and yt-dlp. Install from your OS package manager.
- Database defaults to SQLite (`videoai.db`). Switch to Postgres by setting `DATABASE_URL` in `.env`.
