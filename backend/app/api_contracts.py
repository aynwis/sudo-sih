from pydantic import BaseModel, Field
from typing import Literal

class Bounds(BaseModel):
    left: float
    right: float
    top: float
    bottom: float

class RasterResponse(BaseModel):
    tile_id: str
    image_base64: str = Field(description="Raw PNG base64 string, no data-URI prefix")
    bounds: Bounds
    source: Literal["mock", "real"]

class ValidationPoint(BaseModel):
    site_id: str
    lat: float
    lon: float
    precision_flag: Literal["mine_level", "block_level"]
    commodity: str = "Manganese"

class ValidationPointsResponse(BaseModel):
    tile_id: str
    count: int
    points: list[ValidationPoint]

class RegressionEstimate(BaseModel):
    site_id: str
    grade_pct_estimate: float
    tonnage_estimate: float
    confidence: Literal["preliminary"] = "preliminary"

class RegressionResponse(BaseModel):
    status: Literal["preliminary"]
    method: str
    n_training_points: int
    estimates: list[RegressionEstimate]

class ReceiptResponse(BaseModel):
    source_file: str
    sheet: str
    row: int
    