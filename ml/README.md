# Manganese Reserve Prediction — FastAPI Backend

Refactored from `Mn_Detect_Tonnage_Grade.py` into a real, deployable backend.

## ⚠️ Before you do anything else
The original script had a live GCP service account private key hardcoded in
plaintext. **Revoke and regenerate that key now** if it hasn't been already:
GCP Console → IAM & Admin → Service Accounts → (the account) → Keys → delete
the old key → Add Key → Create new key. That key must never go back into
source code.

## What changed vs. the original script
- **No hardcoded secrets.** Credentials load from `GEE_SERVICE_ACCOUNT_JSON`
  (an env var), not from a Python dict in source.
- **No temp key file.** `key_data=` passes the credential JSON to the Earth
  Engine SDK directly in memory — nothing is written to disk.
- **GEE initializes once**, at server startup (`lifespan`), not per-request.
- **`plt.show()` is gone.** The dashboard is rendered to a base64 PNG string
  (`/dashboard` endpoint) that a frontend can put straight into an `<img src>`.
- **Fallback data is flagged, not hidden.** If GEE is unreachable or returns
  no imagery, the response includes `"used_real_satellite_data": false` so the
  frontend/dashboard can warn the user instead of silently showing synthetic
  numbers as if they were real predictions.
- Split into modules (`gee_client`, `detection`, `inference`, `visualization`)
  instead of one script, and the model (`.pkl`) is loaded once and cached.

## Setup
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env:
#   GEE_SERVICE_ACCOUNT_JSON = the full JSON of your NEW service account key, one line
#   GEE_PROJECT_ID           = your GCP project id
#   MODEL_PATH                = path to manganese_xgboost_models.pkl

mkdir -p models
# copy your manganese_xgboost_models.pkl into ./models/

uvicorn app.main:app --reload --port 8000
```

## Endpoints
- `GET  /health` — `{"status": "ok", "gee_connected": true|false}`
- `POST /predict` — body `{"lat": 22.1, "lon": 85.4, "offset": 0.02, "scale": 30}`
  → grade/tonnage summary as JSON
- `POST /dashboard` — same body → summary + `dashboard_png_base64` (6-panel image)

Interactive API docs are auto-generated at `http://localhost:8000/docs`.

## Connecting your web app
Point your frontend at these endpoints (adjust `allow_origins` in
`app/main.py`'s CORS middleware to your actual frontend URL before deploying —
`"*"` is fine for local dev only).

## Deployment note
GEE calls + XGBoost inference can take several seconds per request. For a
production web app, consider running `/predict` and `/dashboard` as
background jobs (Celery/RQ) with the frontend polling a status endpoint,
rather than blocking an HTTP request thread — especially if you expect
concurrent users.
