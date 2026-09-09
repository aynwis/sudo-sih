import base64
import json
from pathlib import Path

from app.api_contracts import Bounds, RasterResponse
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["raster"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CACHE_DIR = BASE_DIR / "cache"
VALID_TILE_IDS = {"tile02", "tile02_jamunjhola"}


@router.get("/api/v1/raster/{tile_id}", response_model=RasterResponse)
@router.get("/api/raster/{tile_id}", response_model=RasterResponse)
def get_raster(tile_id: str):
  normalized_id = tile_id.lower().strip()
  if normalized_id not in VALID_TILE_IDS:
    raise HTTPException(
        status_code=404,
        detail=(
            f"Unknown tile_id='{tile_id}'. Expected one of:"
            f" {sorted(VALID_TILE_IDS)}"
        ),
    )

  png_path = CACHE_DIR / "probability.png"
  meta_path = CACHE_DIR / "probability.meta.json"

  # Enforce refuse-and-explain: fail loudly if precompute hasn't run
  if not png_path.exists() or not meta_path.exists():
    raise HTTPException(
        status_code=503,
        detail="No cache built yet. Run: python3 scripts/precompute_cache.py",
    )

  meta = json.loads(meta_path.read_text())
  png_bytes = png_path.read_bytes()
  b = meta["bounds"]

  return RasterResponse(
      tile_id=tile_id,
      image_base64=base64.b64encode(png_bytes).decode("ascii"),
      bounds=Bounds(
          left=b["left"], right=b["right"], top=b["top"], bottom=b["bottom"]
      ),
      source=meta.get("source", "precomputed"),
  )