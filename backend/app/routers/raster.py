import base64, io, json
from pathlib import Path

from fastapi import APIRouter, HTTPException
import matplotlib as mpl
import numpy as np
from PIL import Image

from app.api_contracts import Bounds, RasterResponse

router = APIRouter(prefix="/api", tags=["raster"])

#path points to the 'backend/' root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MOCK_DIR = BASE_DIR / "data" / "mock"


@router.get("/raster", response_model=RasterResponse)
def get_raster(tile_id: str = "tile02_Jamunjhola", source: str = "mock"):
    npy_path = MOCK_DIR / "probability.npy"
    bounds_path = MOCK_DIR / "bounds.json"

    #Ensure files exist, raise 404 not found if not
    if not npy_path.exists() or not bounds_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Mock data files not found in {MOCK_DIR}",
        )

    #Load the binary probability array
    data = np.load(npy_path)

    #Load bounding box metadata
    with open(bounds_path, "r") as f: bounds_dict = json.load(f)

    #Colorize array of floats from 0.0 to 1.0 into RGBA with Matplotlib
    colormap = mpl.colormaps["viridis"]
    rgba_image = colormap(data)
    rgba_uint8 = (rgba_image * 255).astype(np.uint8)

    #Save RGBA array into an in-memory PNG buffer (RAM, no disk writes)
    img = Image.fromarray(rgba_uint8, mode="RGBA")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    #Encode to Base 64 string
    img_b64 = base64.b64encode(buffer.read()).decode("utf-8")
    data_uri = f"data:image/png;base64,{img_b64}"

    #Return matching your Pydantic schema
    return RasterResponse(
        tile_id=tile_id,
        image_base64=data_uri,
        bounds=Bounds(**bounds_dict),
        source="mock",
    )
