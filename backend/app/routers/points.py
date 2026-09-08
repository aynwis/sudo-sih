import csv
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from app.api_contracts import ValidationPoint, ValidationPointsResponse

router = APIRouter(prefix="/api", tags=["points"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MOCK_DIR = BASE_DIR / "data" / "mock"

ALLOWED_PRECISION = {"mine-level", "district-level", "state-level"}


@router.get("/points", response_model=ValidationPointsResponse)
def get_points(tile_id: str = "tile02_Jamunjhola", source: str = "mock"):
    csv_path = MOCK_DIR / "points_55.csv"

    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Points data file '{csv_path.name}' not found.",
        )

    points_list: List[ValidationPoint] = []

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for idx, raw_row in enumerate(reader):
            row = {k.strip().lower(): v.strip() for k, v in raw_row.items() if k and v}

            raw_lat = row.get("latitude") or row.get("lat") or row.get("y")
            raw_lon = row.get("longitude") or row.get("lon") or row.get("x")
            site_id = row.get("site_id") or row.get("id") or f"pt_{idx:03d}"

            if raw_lat is None or raw_lon is None:
                continue

            raw_prec = row.get("precision_flag") or row.get("precision")
            precision = raw_prec if raw_prec in ALLOWED_PRECISION else "mine-level"

            points_list.append(
                ValidationPoint(
                    site_id=str(site_id),
                    lat=float(raw_lat),
                    lon=float(raw_lon),
                    precision_flag=precision,
                )
            )

    return ValidationPointsResponse(
        tile_id=tile_id,
        count=len(points_list),
        points=points_list,
        source=source,
    )