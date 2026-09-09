import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Validation Points (231 rows & frontend contract)
def test_validation_points_contract():
    res = client.get("/api/validation-points")
    assert res.status_code == 200
    data = res.json()
    assert "sites" in data
    assert "count" in data
    assert data["count"] == 231
    assert len(data["sites"]) == 231
    first = data["sites"][0]
    for key in ["site_id", "cluster_id", "lat", "lon", "precision_flag", "state", "source"]:
        assert key in first

# Regression Estimate (Final metrics contract)
def test_regression_estimate_contract():
    res = client.get("/api/regression-estimate")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "final"
    assert data["gradeR2"] == 0.86
    assert data["tonnageR2"] == 0.97
    assert "meanGradePct" in data
    assert "predicted_grade_pct" in data
    assert "confidence_interval_pct" in data

# Receipt Sheet Lookup (Known IDs)
def test_receipt_sheet_known_site():
    res = client.get("/api/receipt-sheet/beldongri%20mine")
    assert res.status_code == 200
    data = res.json()
    assert "source_file" in data
    assert "sheet" in data
    assert "row" in data
    assert data["source_file"] == "PS26009_GroundTruth_Supplemented.xlsx"

# Receipt Sheet Edge Cases
def test_receipt_sheet_whitespace_or_empty():
    res = client.get("/api/receipt-sheet/%20")
    assert res.status_code == 400

# Raster Endpoint & Cache Serving
def test_raster_tile02_success():
    res = client.get("/api/v1/raster/tile02")
    assert res.status_code == 200
    data = res.json()
    assert data["tile_id"] == "tile02"
    assert "image_base64" in data
    assert len(data["image_base64"]) > 0
    assert "bounds" in data

# Raster Missing / Unknown Tile Error
def test_raster_unknown_tile():
    res = client.get("/api/v1/raster/non_existent_tile")
    assert res.status_code == 404