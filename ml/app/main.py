"""
FastAPI backend for the manganese reserve/grade prediction dashboard.

Run locally:
    uvicorn app.main:app --reload --port 8000

Endpoints:
    GET  /health              -> liveness + whether GEE is connected
    POST /predict              -> {lat, lon} -> grade/tonnage summary (JSON)
    POST /dashboard             -> {lat, lon} -> same summary + base64 PNG dashboard image
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .detection import detect_manganese_traces
from .gee_client import fetch_all_geospatial_data, init_earth_engine, is_gee_ready
from .inference import predict_from_existing_bands
from .visualization import render_manganese_dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts, not per-request.
    init_earth_engine()
    yield


app = FastAPI(title="Manganese Reserve Prediction API", lifespan=lifespan)

# Adjust allow_origins to your actual frontend URL(s) before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    offset: float = Field(0.02, gt=0, le=1, description="ROI half-width in degrees")
    scale: int = Field(30, gt=0, description="Pixel resolution in meters")


class PredictResponse(BaseModel):
    mean_grade_pct: float
    max_grade_pct: float
    total_tonnage_mt: float
    val_r2_grade: float
    val_r2_tonnage: float
    used_real_satellite_data: bool


class DashboardResponse(PredictResponse):
    dashboard_png_base64: str


@app.get("/health")
def health():
    return {"status": "ok", "gee_connected": is_gee_ready()}


def _run_pipeline(req: PredictRequest):
    img_array, used_real_data = fetch_all_geospatial_data(
        lat=req.lat, lon=req.lon, offset=req.offset, scale=req.scale
    )
    results = detect_manganese_traces(img_array)
    try:
        summary = predict_from_existing_bands(img_array, results["manganese_proxy"])
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=f"Model file not found: {exc}")
    except Exception:
        logger.exception("Inference failed")
        raise HTTPException(status_code=500, detail="Model inference failed")
    return img_array, results, summary, used_real_data


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    _, _, summary, used_real_data = _run_pipeline(req)
    return {**summary, "used_real_satellite_data": used_real_data}


@app.post("/dashboard", response_model=DashboardResponse)
def dashboard(req: PredictRequest):
    img_array, results, summary, used_real_data = _run_pipeline(req)
    png_b64 = render_manganese_dashboard(img_array, results)
    return {**summary, "used_real_satellite_data": used_real_data, "dashboard_png_base64": png_b64}
