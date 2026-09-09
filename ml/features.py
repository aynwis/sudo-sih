import os
import sys
import ee
import pandas as pd

SERVICE_ACCOUNT = "gee-backend-bot-sudo@fabled-citadel-480207-k9.iam.gserviceaccount.com"
KEY_PATH = os.path.join(os.path.dirname(__file__), "credentials", "fabled-citadel-480207-k9-67d1cc635dcf.json")

_real_initialize = ee.Initialize
def _patched_initialize(*args, **kwargs):
    credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_PATH)
    return _real_initialize(credentials=credentials, project="fabled-citadel-480207-k9")
ee.Initialize = _patched_initialize

sys.path.append(os.path.join(os.path.dirname(__file__), "manganese"))
from Mn_Detect_Tonnage_Grade import fetch_all_geospatial_data, detect_manganese_traces

BAND_NAMES = ["B1","B2","B3","B4","B5","B6","B7","B8","B8A","B9",
              "B11","B12","SCL","QA60","VV","VH","HH","HV","angle","elevation"]

def pixel_to_latlon(row, col, bounds, shape):
    rows, cols = shape
    frac_x = col / cols
    frac_y = row / rows
    lon = bounds["left"] + frac_x * (bounds["right"] - bounds["left"])
    lat = bounds["top"] - frac_y * (bounds["top"] - bounds["bottom"])
    return lat, lon

def extract_features_for_point(lat, lon):
    img_array = fetch_all_geospatial_data(lat, lon, offset=0.01, scale=30)
    proxy_map = detect_manganese_traces(img_array)["manganese_proxy"]
    h, w, _ = img_array.shape
    r, c = h // 2, w // 2
    values = list(img_array[r, c, :]) + [proxy_map[r, c]]
    return dict(zip(BAND_NAMES + ["manganese_proxy"], values))

def extract_features(pixel_coords, bounds, shape):
    rows = []
    for (row, col) in pixel_coords:
        lat, lon = pixel_to_latlon(row, col, bounds, shape)
        rows.append(extract_features_for_point(lat, lon))
    return pd.DataFrame(rows)


if __name__ == "__main__":
    from sampling import sample_positives, sample_negatives

    gt = pd.read_csv("tile02_jamunjhola_validation_ready.csv")
    gt.columns = gt.columns.str.lower()
    bounds = {"left": 78.85, "right": 80.57, "bottom": 21.26, "top": 21.79}
    shape = (131, 639)
    pos_pixels, _ = sample_positives(gt, bounds, shape)
    neg_pixels = sample_negatives(pos_pixels, shape, n_needed=200)

    pos_df = extract_features(pos_pixels, bounds, shape)
    pos_df["label"] = 1

    neg_df = extract_features(neg_pixels, bounds, shape)
    neg_df["label"] = 0

    training_table = pd.concat([pos_df, neg_df], ignore_index=True)
    print(training_table.shape, training_table["label"].value_counts().to_dict())
    training_table.to_csv("training_table.csv", index=False)