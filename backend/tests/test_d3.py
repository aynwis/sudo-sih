from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_receipt_143_ground_truth_count():
    resp = client.get("/api/v1/receipts/143_ground_truth_count")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_file"] == "PS26009_GroundTruth_Supplemented.xlsx"
    assert data["sheet"] == "Ground_Truth_Clean"


def test_receipt_13_regression_points():
    resp = client.get("/api/v1/receipts/13_regression_points")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_file"] == "PS26009_GroundTruth_Supplemented.xlsx"
    assert data["sheet"] == "Grade_Tonnage_Clean"


def test_receipt_site_lookup():
    resp = client.get("/api/v1/receipts/beldongri%20mine")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_file"] == "PS26009_GroundTruth_Supplemented.xlsx"
    assert data["row"] > 1


def test_receipt_fallback():
    resp = client.get("/api/v1/receipts/nonexistent_metric_key")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_file"] == "PS26009_GroundTruth_Supplemented.xlsx"
    assert data["sheet"] == "Ground_Truth_Clean"
    assert data["row"] == 2