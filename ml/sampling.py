import numpy as np
from sklearn.neighbors import NearestNeighbors

def latlon_to_pixel(lat, lon, bounds, shape):
    # "what fraction of the way across the bounding box is this point"
    # then scale that fraction by the raster's actual row/col count
    rows, cols = shape
    frac_x = (lon - bounds["left"]) / (bounds["right"] - bounds["left"])
    frac_y = (bounds["top"] - lat) / (bounds["top"] - bounds["bottom"])  # top-down, since row 0 is the top
    return int(frac_y * rows), int(frac_x * cols)

def buffer_radius(precision):
    # tight radius when we trust the exact GPS location, wider when we don't
    return 1 if precision == "mine_level" else 4

def sample_positives(ground_truth_df, bounds, shape):
    pixels, radii = [], []
    for _, r in ground_truth_df.iterrows():
        row, col = latlon_to_pixel(r.latitude, r.longitude, bounds, shape)
        pixels.append((row, col))
        radii.append(buffer_radius(r.coord_precision))
    return np.array(pixels), np.array(radii)

def sample_negatives(pos_pixels, shape, n_needed, min_dist_px=5, seed=42):
    rng = np.random.default_rng(seed)  # seeded so results are reproducible across runs
    nn = NearestNeighbors(radius=min_dist_px).fit(pos_pixels)  # fit ONCE on all positives
    negatives = []
    attempts = 0
    while len(negatives) < n_needed:
        attempts += 1
        if attempts > n_needed * 200:
            # safety valve -- if this fires, the raster is too small for how many
            # negatives you're asking for relative to how many positives it has
            raise RuntimeError("Could not find enough negatives -- shape too small relative to n_needed")
        candidate = (int(rng.integers(0, shape[0])), int(rng.integers(0, shape[1])))
        dist, _ = nn.kneighbors([candidate], n_neighbors=1)  # distance to nearest positive
        if dist[0][0] > min_dist_px:  # far enough away -- accept it
            negatives.append(candidate)
    return np.array(negatives)


if __name__ == "__main__":
    import pandas as pd

    gt = pd.read_csv("tile02_jamunjhola_validation_ready.csv")
    gt.columns = gt.columns.str.lower()
    bounds = {"left": 78.85, "right": 80.57, "bottom": 21.26, "top": 21.79}
    shape = (131, 639)  # matches the real tile02 raster shape

    pos_pixels, radii = sample_positives(gt, bounds, shape)
    print("Positive pixels:", pos_pixels.shape)

    neg_pixels = sample_negatives(pos_pixels, shape, n_needed=200)
    print("Negative pixels:", neg_pixels.shape)