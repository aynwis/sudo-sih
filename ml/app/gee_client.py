"""
Google Earth Engine access layer.

Key differences from the original script:
  - No credentials are hardcoded here.
  - No temp JSON key file is written to disk — `key_data=` passes the
    key straight to the EE SDK in memory.
  - Initialization happens once (call `init_earth_engine()` at app
    startup), not on every request — GEE auth is slow and rate-limited.
"""
import json
import logging

import ee
import numpy as np

from .config import get_settings

logger = logging.getLogger(__name__)

_initialized = False


def init_earth_engine() -> bool:
    """Call once, at application startup. Returns True if GEE is usable,
    False if the app should run in fallback/synthetic-data mode."""
    global _initialized
    if _initialized:
        return True

    settings = get_settings()
    try:
        credentials = ee.ServiceAccountCredentials(
            settings.gee_service_account["client_email"],
            key_data=json.dumps(settings.gee_service_account),
        )
        ee.Initialize(credentials, project=settings.gee_project_id)
        _initialized = True
        logger.info("Connected to Google Earth Engine via service account.")
        return True
    except Exception:
        logger.exception("GEE initialization failed; fallback mode will be used.")
        _initialized = False
        return False


def is_gee_ready() -> bool:
    return _initialized


NUM_BANDS = 20
ALL_BANDS = [
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9",
    "B11", "B12", "SCL", "QA60", "VV", "VH", "HH", "HV", "angle", "elevation",
]


def fetch_all_geospatial_data(
    lat: float,
    lon: float,
    offset: float = 0.1,
    scale: int = 30,
    start_date: str = "2024-01-01",
    end_date: str = "2025-01-01",
) -> tuple[np.ndarray, bool]:
    """Returns (image_cube, used_real_data).

    used_real_data=False means GEE was unavailable or returned no usable
    imagery for the ROI and a synthetic fallback grid was substituted —
    callers (and API responses) should surface this flag rather than
    silently presenting fallback data as real.
    """
    if not is_gee_ready():
        logger.warning("GEE not initialized; returning synthetic fallback grid.")
        return _synthetic_grid(), False

    try:
        import geemap

        roi = ee.Geometry.Rectangle([lon - offset, lat - offset, lon + offset, lat + offset])

        side_m = offset * 2 * 111320
        max_px_per_side = 500
        min_scale = side_m / max_px_per_side
        if scale < min_scale:
            scale = min_scale

        s2_image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(roi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 50))
            .median()
            .select(["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "B11", "B12", "SCL", "QA60"])
        )

        s1_iw = (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(roi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
        )
        if s1_iw.size().getInfo() > 0:
            s1_vv_vh = s1_iw.select(["VV", "VH"]).median()
            s1_angle = s1_iw.select(["angle"]).median()
        else:
            s1_vv_vh = ee.Image.constant([0, 0]).rename(["VV", "VH"])
            s1_angle = ee.Image.constant(0).rename(["angle"])

        s1_ew = (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(roi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.eq("instrumentMode", "EW"))
        )
        if s1_ew.size().getInfo() > 0:
            s1_hh_hv = s1_ew.select(["HH", "HV"]).median()
        else:
            s1_hh_hv = ee.Image.constant([0, 0]).rename(["HH", "HV"])

        dem_image = ee.Image("USGS/SRTMGL1_003").select(["elevation"])

        combined_image = (
            s2_image.addBands(s1_vv_vh)
            .addBands(s1_hh_hv)
            .addBands(s1_angle)
            .addBands(dem_image)
            .unmask(0)
        )

        img_array = geemap.ee_to_numpy(combined_image, bands=ALL_BANDS, region=roi, scale=scale)

        if (
            img_array is None
            or img_array.ndim != 3
            or img_array.shape[-1] != NUM_BANDS
            or img_array.size == 0
            or np.nanmax(img_array) == 0
        ):
            logger.warning("GEE returned no usable imagery for this ROI; using fallback grid.")
            return _synthetic_grid(), False

        return img_array, True

    except Exception:
        logger.exception("GEE fetch failed; using fallback grid.")
        return _synthetic_grid(), False


def _synthetic_grid(h: int = 100, w: int = 100) -> np.ndarray:
    return np.random.rand(h, w, NUM_BANDS) * 2000
