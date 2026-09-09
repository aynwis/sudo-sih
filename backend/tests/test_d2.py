import shutil
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from scripts.precompute_cache import precompute

client = TestClient(app)
CACHE_DIR = Path(__file__).resolve().parents[1] / "cache"


@pytest.fixture(autouse=True)
def clean_cache():
    shutil.rmtree(CACHE_DIR, ignore_errors=True)
    yield
    shutil.rmtree(CACHE_DIR, ignore_errors=True)


def test_raster_503s_with_no_cache():
    resp = client.get("/api/v1/raster/tile02_jamunjhola")
    assert resp.status_code == 503
    assert "precompute_cache.py" in resp.json()["detail"]


def test_raster_serves_from_cache_after_precompute():
    precompute()
    resp = client.get("/api/v1/raster/tile02_jamunjhola")
    assert resp.status_code == 200
    assert resp.json()["source"] == "mock"


def test_unknown_tile_still_404s_even_with_cache_present():
    precompute()
    resp = client.get("/api/v1/raster/does-not-exist")
    assert resp.status_code == 404