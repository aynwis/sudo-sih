from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_raster_mock_tile():
    from scripts.precompute_cache import precompute
    precompute()

    resp = client.get("/api/v1/raster/tile02_jamunjhola")
    assert resp.status_code == 200

    body = resp.json()
    assert body["tile_id"] == "tile02_jamunjhola"
    assert body["source"] == "mock"
    assert set(body["bounds"].keys()) == {"left", "right", "top", "bottom"}