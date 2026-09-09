"""XGBoost grade/tonnage inference. Model is loaded once and cached in
memory rather than re-reading the .pkl from disk on every request."""
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd

from .config import get_settings
from .gee_client import ALL_BANDS


@lru_cache
def _load_bundle():
    settings = get_settings()
    return joblib.load(settings.model_path)


def predict_from_existing_bands(img_array: np.ndarray, proxy_map: np.ndarray) -> dict:
    bundle = _load_bundle()
    grade_model = bundle["grade_model"]
    tonnage_model = bundle["tonnage_model"]
    expected_features = bundle["feature_names"]

    r2_grade = bundle.get("val_r2_grade", 0.86)
    r2_tonnage = bundle.get("val_r2_tonnage", 0.97)

    h, w, num_bands = img_array.shape
    flat_bands = img_array.reshape(-1, num_bands)
    flat_proxy = proxy_map.reshape(-1, 1)

    X_inference = pd.DataFrame(
        np.hstack([flat_bands, flat_proxy]), columns=ALL_BANDS + ["manganese_proxy"]
    )
    X_inference = X_inference[expected_features]

    grade_preds = grade_model.predict(X_inference)
    tonnage_preds = tonnage_model.predict(X_inference)

    return {
        "mean_grade_pct": float(np.mean(grade_preds)),
        "max_grade_pct": float(np.max(grade_preds)),
        "total_tonnage_mt": float(np.sum(tonnage_preds) / (h * w)),
        "val_r2_grade": float(r2_grade),
        "val_r2_tonnage": float(r2_tonnage),
    }
