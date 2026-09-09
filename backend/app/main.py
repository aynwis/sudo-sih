import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

from app.api_contracts import ReceiptResponse
from app.services.receipt_service import lookup_receipt
from app.routers import raster

app = FastAPI(title="Mineral Exploration System API", version="1.0.0")

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
EXCEL_PATH = DATA_DIR / "PS26009_GroundTruth_Supplemented.xlsx"
ML_DIR = BASE_DIR.parent / "ml" / "manganese"
MODEL_PATH = ML_DIR / "manganese_xgboost_models.pkl"
CSV_PATH = ML_DIR / "final_flattened_training_data.csv"
CACHE_DIR = BASE_DIR / "cache"
VALIDATION_CACHE_PATH = CACHE_DIR / "validation_points.json"
REGRESSION_CACHE_PATH = CACHE_DIR / "regression_estimate.json"

_regression_cache = None


def _read_cache(path: Path):
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _write_cache(path: Path, payload: dict) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    temporary.replace(path)


def _compute_regression_estimate():
    if not MODEL_PATH.exists() or not CSV_PATH.exists():
        return None
    bundle = joblib.load(MODEL_PATH)
    df = pd.read_csv(CSV_PATH)
    features = bundle["feature_names"]
    x = df[features]
    y_grade = df["grade_target"]
    y_tonnage = df["tonnage_target"]
    _, x_val, _, grade_val, _, tonnage_val = train_test_split(
        x, y_grade, y_tonnage, test_size=0.2, random_state=42
    )
    grade_pred = bundle["grade_model"].predict(x_val)
    tonnage_pred = bundle["tonnage_model"].predict(x_val)
    grade_r2 = round(float(r2_score(grade_val, grade_pred)), 4)
    tonnage_r2 = round(float(r2_score(tonnage_val, tonnage_pred)), 4)
    mean_grade = round(float(grade_pred.mean()), 2)
    mean_tonnage = round(float(tonnage_pred.mean()), 2)
    return {
        "status": "final",
        "gradeR2": grade_r2,
        "tonnageR2": tonnage_r2,
        "meanGradePct": mean_grade,
        "meanTonnageMt": mean_tonnage,
        "predicted_grade_pct": mean_grade,
        "confidence_interval_pct": None,
        "method": "XGBoost regression (grade + tonnage), held-out validation",
    }


# Validation Points
@app.get("/api/validation-points")
@app.get("/api/v1/validation-points")
def get_validation_points():
    try:
        if not EXCEL_PATH.exists():
            raise FileNotFoundError(EXCEL_PATH)
        df = pd.read_excel(EXCEL_PATH, sheet_name="Ground_Truth_Clean").fillna("")
        sites = []
        for _, row in df.iterrows():
            prec = str(row.get("coord_precision", "")).strip().lower()
            flag = "block_level" if "block" in prec else "mine_level"
            sites.append({
                "site_id": str(row.get("name", "")),
                "cluster_id": str(row.get("cluster_id", "")),
                "lat": float(row.get("latitude", 0.0)),
                "lon": float(row.get("longitude", 0.0)),
                "precision_flag": flag,
                "state": str(row.get("state_norm", "")),
                "source": str(row.get("source", "")),
            })
        payload = {"count": len(sites), "sites": sites}
        _write_cache(VALIDATION_CACHE_PATH, payload)
        return payload
    except Exception as live_error:
        cached = _read_cache(VALIDATION_CACHE_PATH)
        if cached is not None:
            return cached
        raise HTTPException(
            status_code=503,
            detail=f"Validation data unavailable and no cached response exists: {live_error}",
        ) from live_error


# Regression Estimate
@app.get("/api/regression-estimate")
@app.get("/api/v1/regression-estimate")
def get_regression_estimate():
    global _regression_cache
    try:
        if _regression_cache is None:
            _regression_cache = _compute_regression_estimate()
        if _regression_cache is None:
            raise FileNotFoundError("model or training data missing")
        _write_cache(REGRESSION_CACHE_PATH, _regression_cache)
        return _regression_cache
    except Exception as live_error:
        cached = _read_cache(REGRESSION_CACHE_PATH)
        if cached is not None:
            return cached
        raise HTTPException(
            status_code=503,
            detail=f"Regression data unavailable and no cached response exists: {live_error}",
        ) from live_error


# Receipt Sheet Lookup
@app.get("/api/receipt-sheet/{site_id}", response_model=ReceiptResponse)
@app.get("/api/v1/receipt-sheet/{site_id}", response_model=ReceiptResponse)
@app.get("/api/receipts/{site_id}", response_model=ReceiptResponse)
@app.get("/api/v1/receipts/{site_id}", response_model=ReceiptResponse)
def get_receipt_sheet(site_id: str):
    if not site_id.strip():
        raise HTTPException(status_code=400, detail="site_id cannot be empty")
    return lookup_receipt(site_id)

#Raster Router
app.include_router(raster.router)
