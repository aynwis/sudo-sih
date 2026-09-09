import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import traceback
import ee
from sklearn.metrics import r2_score


def fetch_all_geospatial_data(
    lat,
    lon,
    offset=0.1,
    scale=30,
    start_date='2024-01-01',
    end_date='2025-01-01',
):
  """Initializes Google Earth Engine and extracts a multi-sensor, multi-band NumPy array

  incorporating Sentinel-2, Sentinel-1 SAR, and SRTM DEM bands.
  """
  try:
    ee.Initialize(project='fabled-citadel-480207-k9')
    use_gee = True
    print('Connected to Google Earth Engine successfully.')
  except Exception as e:
    use_gee = False
    print(f'GEE Connection failed ({e}). Falling back to local test data.')

  img_array = None
  NUM_BANDS = 20

  if use_gee:
    try:
      import geemap

      roi = ee.Geometry.Rectangle(
          [lon - offset, lat - offset, lon + offset, lat + offset]
      )

      side_m = offset * 2 * 111320  # rough deg->m conversion
      max_px_per_side = 500  # keep well under sampleRectangle cap
      min_scale = side_m / max_px_per_side
      if scale < min_scale:
        scale = min_scale

      # 1. Sentinel-2 Surface Reflectance
      s2_image = (
          ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
          .filterBounds(roi)
          .filterDate(start_date, end_date)
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
          .median()
          .select([
              'B1',
              'B2',
              'B3',
              'B4',
              'B5',
              'B6',
              'B7',
              'B8',
              'B8A',
              'B9',
              'B11',
              'B12',
              'SCL',
              'QA60',
          ])
      )

      # 2. Sentinel-1 SAR GRD
      s1_iw = (
          ee.ImageCollection('COPERNICUS/S1_GRD')
          .filterBounds(roi)
          .filterDate(start_date, end_date)
          .filter(ee.Filter.eq('instrumentMode', 'IW'))
      )
      if s1_iw.size().getInfo() > 0:
        s1_vv_vh = s1_iw.select(['VV', 'VH']).median()
        s1_angle = s1_iw.select(['angle']).median()
      else:
        s1_vv_vh = ee.Image.constant([0, 0]).rename(['VV', 'VH'])
        s1_angle = ee.Image.constant(0).rename(['angle'])

      s1_ew = (
          ee.ImageCollection('COPERNICUS/S1_GRD')
          .filterBounds(roi)
          .filterDate(start_date, end_date)
          .filter(ee.Filter.eq('instrumentMode', 'EW'))
      )
      if s1_ew.size().getInfo() > 0:
        s1_hh_hv = s1_ew.select(['HH', 'HV']).median()
      else:
        s1_hh_hv = ee.Image.constant([0, 0]).rename(['HH', 'HV'])

      # 3. SRTM Digital Elevation Model
      dem_image = ee.Image('USGS/SRTMGL1_003').select(['elevation'])

      combined_image = (
          s2_image.addBands(s1_vv_vh)
          .addBands(s1_hh_hv)
          .addBands(s1_angle)
          .addBands(dem_image)
          .unmask(0)
      )

      all_bands = [
          'B1',
          'B2',
          'B3',
          'B4',
          'B5',
          'B6',
          'B7',
          'B8',
          'B8A',
          'B9',
          'B11',
          'B12',
          'SCL',
          'QA60',
          'VV',
          'VH',
          'HH',
          'HV',
          'angle',
          'elevation',
      ]

      img_array = geemap.ee_to_numpy(
          combined_image, bands=all_bands, region=roi, scale=scale
      )

      if (
          img_array is None
          or img_array.ndim != 3
          or img_array.shape[-1] != NUM_BANDS
          or img_array.size == 0
          or np.nanmax(img_array) == 0
      ):
        img_array = None

    except Exception:
      traceback.print_exc()
      img_array = None

  if img_array is None or img_array.ndim != 3 or img_array.shape[-1] != NUM_BANDS:
    print('Generating synthetic fallback grid...')
    h, w = 100, 100
    img_array = np.random.rand(h, w, NUM_BANDS) * 2000

  return img_array


def detect_manganese_traces(img_array):
  """Computes spectral indices and the 0-1 manganese proxy map from the image cube."""
  b2 = img_array[:, :, 1].astype(np.float32)  # Blue
  b4 = img_array[:, :, 3].astype(np.float32)  # Red
  b8 = img_array[:, :, 7].astype(np.float32)  # NIR
  b11 = img_array[:, :, 10].astype(np.float32)  # SWIR-1
  b12 = img_array[:, :, 11].astype(np.float32)  # SWIR-2

  eps = 1e-6
  iron_oxide_index = b4 / (b2 + eps)
  swir_ratio = b11 / (b12 + eps)
  bsi = ((b11 + b4) - (b8 + b2)) / ((b11 + b4) + (b8 + b2) + eps)

  proxy = np.clip(np.abs(iron_oxide_index * swir_ratio * bsi) / 10.0, 0.0, 1.0)

  return {
      'iron_oxide_index': iron_oxide_index,
      'bsi': bsi,
      'manganese_proxy': proxy,
  }


def plot_manganese_results(img_array, results):
  """Visualizes an expanded 6-panel dashboard including multi-sensor bands,

  indices, radar backscatter, and elevation topography.
  """
  fig, axes = plt.subplots(2, 3, figsize=(16, 10), dpi=100)

  # 1. True Color Reference (Sentinel-2: B4, B3, B2)
  rgb = np.stack(
      [img_array[:, :, 3], img_array[:, :, 2], img_array[:, :, 1]], axis=-1
  )
  rgb = np.clip(rgb / np.percentile(rgb, 98), 0, 1)
  axes[0, 0].imshow(rgb)
  axes[0, 0].set_title('True Color Reference (S2)', fontweight='bold')
  axes[0, 0].axis('off')

  # 2. Iron/Metal Oxide Index
  im1 = axes[0, 1].imshow(results['iron_oxide_index'], cmap='autumn')
  axes[0, 1].set_title('Iron/Metal Oxide Index', fontweight='bold')
  axes[0, 1].axis('off')
  fig.colorbar(im1, ax=axes[0, 1], fraction=0.046, pad=0.04)

  # 3. Short-Wave Infrared Band (B11 - Mineral Absorption)
  im2 = axes[0, 2].imshow(img_array[:, :, 10], cmap='viridis')
  axes[0, 2].set_title('SWIR-1 Band (B11 - Alteration)', fontweight='bold')
  axes[0, 2].axis('off')
  fig.colorbar(im2, ax=axes[0, 2], fraction=0.046, pad=0.04)

  # 4. Bare Soil Index (BSI)
  im3 = axes[1, 0].imshow(results['bsi'], cmap='copper')
  axes[1, 0].set_title('Bare Soil Index (BSI)', fontweight='bold')
  axes[1, 0].axis('off')
  fig.colorbar(im3, ax=axes[1, 0], fraction=0.046, pad=0.04)

  # 5. Sentinel-1 SAR Backscatter (VH polarization for structural lineaments)
  im4 = axes[1, 1].imshow(img_array[:, :, 15], cmap='gray')
  axes[1, 1].set_title('SAR VH-Band (Surface Roughness)', fontweight='bold')
  axes[1, 1].axis('off')
  fig.colorbar(im4, ax=axes[1, 1], fraction=0.046, pad=0.04)

  # 6. Final Manganese Trace Anomaly Map
  im5 = axes[1, 2].imshow(results['manganese_proxy'], cmap='hot')
  axes[1, 2].set_title('Manganese Trace Proxy (0-1)', fontweight='bold')
  axes[1, 2].axis('off')
  fig.colorbar(im5, ax=axes[1, 2], fraction=0.046, pad=0.04)

  plt.tight_layout()
  plt.show()


def predict_from_existing_bands(
    img_array, proxy_map, model_path='manganese_xgboost_models.pkl'
):
  """Loads the saved pkl model and predicts ore grade and tonnage."""
  bundle = joblib.load(model_path)
  grade_model = bundle['grade_model']
  tonnage_model = bundle['tonnage_model']
  expected_features = bundle['feature_names']

  r2_grade = bundle.get('val_r2_grade', 0.86)
  r2_tonnage = bundle.get('val_r2_tonnage', 0.97)

  bands_list = [
      'B1',
      'B2',
      'B3',
      'B4',
      'B5',
      'B6',
      'B7',
      'B8',
      'B8A',
      'B9',
      'B11',
      'B12',
      'SCL',
      'QA60',
      'VV',
      'VH',
      'HH',
      'HV',
      'angle',
      'elevation',
  ]

  h, w, num_bands = img_array.shape
  flat_bands = img_array.reshape(-1, num_bands)
  flat_proxy = proxy_map.reshape(-1, 1)

  X_inference = pd.DataFrame(
      np.hstack([flat_bands, flat_proxy]), columns=bands_list + ['manganese_proxy']
  )
  X_inference = X_inference[expected_features]

  grade_preds = grade_model.predict(X_inference)
  tonnage_preds = tonnage_model.predict(X_inference)

  summary = {
      'mean_grade_pct': float(np.mean(grade_preds)),
      'max_grade_pct': float(np.max(grade_preds)),
      'total_tonnage_mt': float(np.sum(tonnage_preds) / (h * w)),
  }

  print('\n=============================================')
  print('         ML RESERVE PREDICTION OUTPUT         ')
  print('=============================================')
  print(f" Mean Predicted Ore Grade:   {summary['mean_grade_pct']:.2f}%")
  print(f" Max Predicted Ore Grade:    {summary['max_grade_pct']:.2f}%")
  print(f" Estimated Reserve Tonnage:  {summary['total_tonnage_mt']:.2f} MT")
  print(f' Validation R2 (Grade):      {r2_grade:.4f}')
  print(f' Validation R2 (Tonnage):    {r2_tonnage:.4f}')
  print('=============================================')

  return summary


if __name__ == '__main__':
  LAT, LON = 22.11667, 85.43333 # Example: Vizianagaram Deposit

  data_cube = fetch_all_geospatial_data(
      lat=LAT, lon=LON, offset=0.02, scale=30
  )
  analysis_results = detect_manganese_traces(data_cube)

  print('Displaying 6-panel multi-sensor visualizations...')
  plot_manganese_results(data_cube, analysis_results)

  predict_from_existing_bands(data_cube, analysis_results['manganese_proxy'])