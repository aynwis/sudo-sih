"""Dashboard plotting. Unlike the original script, this never calls
plt.show() — for a web backend that just hangs / does nothing useful.
Instead it renders to an in-memory buffer and returns a base64 PNG
string the frontend can drop straight into an <img> src."""
import base64
import io

import matplotlib
matplotlib.use("Agg")  # headless backend, required on a server
import matplotlib.pyplot as plt
import numpy as np


def render_manganese_dashboard(img_array: np.ndarray, results: dict) -> str:
    fig, axes = plt.subplots(2, 3, figsize=(16, 10), dpi=100)

    rgb = np.stack([img_array[:, :, 3], img_array[:, :, 2], img_array[:, :, 1]], axis=-1)
    rgb = np.clip(rgb / np.percentile(rgb, 98), 0, 1)
    axes[0, 0].imshow(rgb)
    axes[0, 0].set_title("True Color Reference (S2)", fontweight="bold")
    axes[0, 0].axis("off")

    im1 = axes[0, 1].imshow(results["iron_oxide_index"], cmap="autumn")
    axes[0, 1].set_title("Iron/Metal Oxide Index", fontweight="bold")
    axes[0, 1].axis("off")
    fig.colorbar(im1, ax=axes[0, 1], fraction=0.046, pad=0.04)

    im2 = axes[0, 2].imshow(img_array[:, :, 10], cmap="viridis")
    axes[0, 2].set_title("SWIR-1 Band (B11 - Alteration)", fontweight="bold")
    axes[0, 2].axis("off")
    fig.colorbar(im2, ax=axes[0, 2], fraction=0.046, pad=0.04)

    im3 = axes[1, 0].imshow(results["bsi"], cmap="copper")
    axes[1, 0].set_title("Bare Soil Index (BSI)", fontweight="bold")
    axes[1, 0].axis("off")
    fig.colorbar(im3, ax=axes[1, 0], fraction=0.046, pad=0.04)

    im4 = axes[1, 1].imshow(img_array[:, :, 15], cmap="gray")
    axes[1, 1].set_title("SAR VH-Band (Surface Roughness)", fontweight="bold")
    axes[1, 1].axis("off")
    fig.colorbar(im4, ax=axes[1, 1], fraction=0.046, pad=0.04)

    im5 = axes[1, 2].imshow(results["manganese_proxy"], cmap="hot")
    axes[1, 2].set_title("Manganese Trace Proxy (0-1)", fontweight="bold")
    axes[1, 2].axis("off")
    fig.colorbar(im5, ax=axes[1, 2], fraction=0.046, pad=0.04)

    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")
