import json, sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend root to path so imports work cleanly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
from PIL import Image
import matplotlib as mpl

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
CACHE_DIR = Path(__file__).resolve().parents[1] / "cache"

def _find_source_dir() -> tuple[Path, str] | None:
    for source, folder in (("real", "real"), ("mock", "mock")):
        npy_path = DATA_DIR / folder / "probability.npy"
        if npy_path.exists():
            return DATA_DIR / folder, source
    return None

def grid_to_png_bytes(grid: np.ndarray) -> bytes:
    import io
    colormap = mpl.colormaps["viridis"]
    rgba_image = colormap(grid)
    rgba_uint8 = (rgba_image * 255).astype(np.uint8)
    img = Image.fromarray(rgba_uint8, mode="RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def precompute() -> None:
    found = _find_source_dir()
    if found is None:
        raise FileNotFoundError("No probability.npy found in data/real or data/mock")
    src_dir, source = found

    grid = np.load(src_dir / "probability.npy")
    bounds = json.loads((src_dir / "bounds.json").read_text())

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    png_bytes = grid_to_png_bytes(grid)
    (CACHE_DIR / "probability.png").write_bytes(png_bytes)

    meta = {
        "source": source,
        "bounds": bounds,
        "cached_at": datetime.now(timezone.utc).isoformat(),
    }

    (CACHE_DIR / "probability.meta.json").write_text(json.dumps(meta, indent=2))
    print(f"[cached] probability (source={source}, {len(png_bytes)} bytes)")


if __name__ == "__main__":
    precompute()