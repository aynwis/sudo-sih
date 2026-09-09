"""Spectral index / manganese proxy computation. Pure function, no I/O."""
import numpy as np


def detect_manganese_traces(img_array: np.ndarray) -> dict[str, np.ndarray]:
    b2 = img_array[:, :, 1].astype(np.float32)   # Blue
    b4 = img_array[:, :, 3].astype(np.float32)   # Red
    b8 = img_array[:, :, 7].astype(np.float32)   # NIR
    b11 = img_array[:, :, 10].astype(np.float32)  # SWIR-1
    b12 = img_array[:, :, 11].astype(np.float32)  # SWIR-2

    eps = 1e-6
    iron_oxide_index = b4 / (b2 + eps)
    swir_ratio = b11 / (b12 + eps)
    bsi = ((b11 + b4) - (b8 + b2)) / ((b11 + b4) + (b8 + b2) + eps)

    proxy = np.clip(np.abs(iron_oxide_index * swir_ratio * bsi) / 10.0, 0.0, 1.0)

    return {
        "iron_oxide_index": iron_oxide_index,
        "bsi": bsi,
        "manganese_proxy": proxy,
    }
