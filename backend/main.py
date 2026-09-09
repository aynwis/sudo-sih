from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MnSight backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

DATA_PATH = Path("/tmp/ground_truth.xlsx")


@app.get("/api/validation-points")
def validation_points():
    if not DATA_PATH.exists():
        return {
            "count": 0,
            "points": [],
            "error": "Ground truth data file not found",
        }

    df = pd.read_excel(
        DATA_PATH,
        sheet_name="Ground_Truth_Clean",
    )

    df = df.dropna(subset=["latitude", "longitude"])

    points = []

    for _, row in df.iterrows():
        points.append(
            {
                "site_id": str(row["cluster_id"]),
                "name": str(row["name"]),
                "lat": float(row["latitude"]),
                "lon": float(row["longitude"]),
                "precision_flag": str(row["coord_precision"]),
            }
        )

    return {
        "count": len(points),
        "points": points,
    }
