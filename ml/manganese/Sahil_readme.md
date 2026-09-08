# AI-Powered Mineral Prospectivity & Reserve Estimation Pipeline 🛰️⛏️

An end-to-end geospatial and machine learning pipeline designed for automated **manganese ore exploration and reserve estimation** in India. The system leverages multi-sensor satellite imagery, radar backscatter, topographic profiling, and advanced regression models to predict ore grade percentages and total reserve tonnages.

---

## 🚀 Key Features

* **Multi-Sensor Data Fusion:** Automatically queries and extracts data from Google Earth Engine (GEE) using `geemap`:
  * **Sentinel-2 Surface Reflectance:** Optical bands for mineral absorption and surface alteration tracking.
  * **Sentinel-1 SAR (GRD - IW/EW modes):** Radar backscatter for surface roughness and structural lineament detection.
  * **SRTM DEM:** Topographic elevation profiles for geomorphological context.
* **Custom Spectral Index Engineering:** Computes specialized geological indices including:
  * Iron/Metal Oxide Index
  * Short-Wave Infrared (SWIR) Ratio
  * Bare Soil Index (BSI)
  * Normalized 0–1 **Manganese Proxy Confidence Map**
* **Machine Learning Inference:** Deploys pretrained **XGBoost Regressors** optimized for spatial pixel-level prediction of ore grade (%) and reserve tonnage (MT).
* **Publication-Grade 6-Panel Dashboard:** Renders high-resolution (300 DPI) visualizations combining true-color reference, alteration indices, SAR roughness, and final anomaly maps.
* **Production-Ready FastAPI Backend:** Exposes a high-performance REST API (`/predict`) capable of live spatial inference for any coordinate-based Region of Interest (ROI).

---

## 🛠️ Project Structure

```text
├── main.py                          # Core pipeline script (GEE extraction, indices, plotting, inference)
├── backend.py                       # FastAPI production server for cloud/local deployment
├── manganese_xgboost_models.pkl     # Pretrained model bundle (XGBoost models + feature metadata)
├── requirements.txt                 # Python dependencies
└── README.md                        # Project documentation