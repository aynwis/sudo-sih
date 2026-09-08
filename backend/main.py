"""Serves Sahil's pretrained manganese grade/tonnage regressors to the
dashboard. Live Earth Engine inference (Mn_Detect_Tonnage_Grade.py's
fetch_all_geospatial_data) needs his own GCP project credentials, which
aren't available here -- so this predicts on the same training CSV instead,
using the identical held-out validation split model.py used when training,
which is enough to get real (not hardcoded-fallback) R^2 numbers and
realistic grade/tonnage estimates onto the dashboard.

Note: model.py's own train_and_save_model() never saves val_r2_grade/
val_r2_tonnage into the pkl bundle, so Mn_Detect_Tonnage_Grade.py's
bundle.get('val_r2_grade', 0.86) always silently returns that hardcoded
default rather than a real metric. This recomputes it properly instead.
"""

from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

ML_DIR = Path(__file__).resolve().parent.parent / "ml" / "manganese"
MODEL_PATH = ML_DIR / "manganese_xgboost_models.pkl"
CSV_PATH = ML_DIR / "final_flattened_training_data.csv"

app = FastAPI(title="MnSight backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_cached_estimate = None


def compute_regression_estimate():
    if not MODEL_PATH.exists() or not CSV_PATH.exists():
        return None

    bundle = joblib.load(MODEL_PATH)
    grade_model = bundle["grade_model"]
    tonnage_model = bundle["tonnage_model"]
    feature_names = bundle["feature_names"]

    df = pd.read_csv(CSV_PATH)
    X = df[feature_names]
    y_grade = df["grade_target"]
    y_tonnage = df["tonnage_target"]

    # Same split model.py used at training time (random_state=42,
    # test_size=0.2) -- these validation rows were held out from training,
    # so predicting on them gives a real generalization metric.
    _, X_val, _, g_val, _, t_val = train_test_split(
        X, y_grade, y_tonnage, test_size=0.2, random_state=42
    )

    g_preds = grade_model.predict(X_val)
    t_preds = tonnage_model.predict(X_val)

    return {
        "status": "ready",
        "gradeR2": round(float(r2_score(g_val, g_preds)), 4),
        "tonnageR2": round(float(r2_score(t_val, t_preds)), 4),
        "meanGradePct": round(float(g_preds.mean()), 2),
        "meanTonnageMt": round(float(t_preds.mean()), 2),
        "regressionReadySites": int(len(X_val)),
    }


@app.on_event("startup")
def load_model_on_startup():
    global _cached_estimate
    _cached_estimate = compute_regression_estimate()


@app.get("/api/regression-estimate")
def regression_estimate():
    if _cached_estimate is None:
        return {"status": "unavailable"}
    return _cached_estimate
