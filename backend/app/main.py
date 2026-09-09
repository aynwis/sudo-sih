import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

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


# Validation Points
@app.get("/api/validation-points")
@app.get("/api/v1/validation-points")
def get_validation_points():
    if not EXCEL_PATH.exists():
        raise HTTPException(status_code=500, detail="Ground truth data not found")

    df = pd.read_excel(EXCEL_PATH, sheet_name="Ground_Truth_Clean")
    df = df.fillna("")

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

    return {"count": len(sites), "sites": sites}


# Regression Estimate
@app.get("/api/regression-estimate")
@app.get("/api/v1/regression-estimate")
def get_regression_estimate():
    return {
        "status": "final",
        "gradeR2": 0.86,
        "tonnageR2": 0.97,
        "meanGradePct": 13.78,
        "meanTonnageMt": 4.54,
        "predicted_grade_pct": 13.78,
        "confidence_interval_pct": [10.06, 28.12],
        "method": "XGBoost Multi-Sensor Regression",
    }


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