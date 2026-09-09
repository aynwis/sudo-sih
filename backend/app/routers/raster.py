import base64, io, json
from pathlib import Path

from fastapi import APIRouter, HTTPException
import matplotlib as mpl
import numpy as np
from PIL import Image

from app.api_contracts import Bounds, RasterResponse

router = APIRouter(prefix="/api/v1", tags=["raster"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
KNOWN_TILE_ID = "tile02_jamunjhola"

@router.get("/raster/{tile_id}", response_model=RasterResponse)
def get_raster(tile_id: str):
    if tile_id.lower() != KNOWN_TILE_ID:
        raise HTTPException(status_code=404, detail=f"Unknown tile_id='{tile_id}'")

    for source, folder in (("real", "real"), ("mock", "mock")):
        npy_path = DATA_DIR / folder / "probability.npy"
        bounds_path = DATA_DIR / folder / "bounds.json"

        if npy_path.exists() and bounds_path.exists():
            data = np.load(npy_path)
            bounds_dict = json.loads(bounds_path.read_text())

            colormap = mpl.colormaps["viridis"]
            rgba_image = colormap(data)
            rgba_uint8 = (rgba_image * 255).astype(np.uint8)

            img = Image.fromarray(rgba_uint8, mode="RGBA")
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)

            # Raw base64 string (no data:image/png;base64, prefix)
            img_b64 = base64.b64encode(buffer.read()).decode("ascii")

            return RasterResponse(
                tile_id=tile_id,
                image_base64=img_b64,
                bounds=Bounds(**bounds_dict),
                source=source,
            )

    raise HTTPException(status_code=404, detail="No probability data found in data/real or data/mock")