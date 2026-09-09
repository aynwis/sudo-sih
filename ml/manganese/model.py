import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


def train_and_save_model(csv_path='final_flattened_training_data.csv'):
  """Loads the flattened training CSV, trains XGBoost Regressors for

  grade and tonnage predictions, and saves them permanently to disk.
  """
  print(f"Loading training data from '{csv_path}'...")
  try:
    df = pd.read_csv(csv_path)
  except FileNotFoundError:
    print(
        f"Error: '{csv_path}' not found. Please run the GEE extraction script"
        ' first.'
    )
    return

  # Separate features (X) and targets (y)
  # Target columns are 'grade_target' and 'tonnage_target'
  X = df.drop(columns=['grade_target', 'tonnage_target'])
  y_grade = df['grade_target']
  y_tonnage = df['tonnage_target']

  print(
      f'Feature matrix loaded. Shape: {X.shape}. Splitting into train/test'
      ' sets...'
  )

  # Train / Validation Split
  X_train, X_val, g_train, g_val, t_train, t_val = train_test_split(
      X, y_grade, y_tonnage, test_size=0.2, random_state=42
  )

  # 1. Train Grade Regressor
  print('Training XGBoost Regressor for Ore Grade...')
  grade_model = xgb.XGBRegressor(
      n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42
  )
  grade_model.fit(X_train, g_train)

  # 2. Train Tonnage Regressor
  print('Training XGBoost Regressor for Tonnage...')
  tonnage_model = xgb.XGBRegressor(
      n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42
  )
  tonnage_model.fit(X_train, t_train)

  # Evaluate validation metrics
  g_preds = grade_model.predict(X_val)
  t_preds = tonnage_model.predict(X_val)
  print(
      f'Validation RMSE - Grade: {np.sqrt(mean_squared_error(g_val, g_preds)):.4f}'
  )
  print(
      f'Validation RMSE - Tonnage: {np.sqrt(mean_squared_error(t_val, t_preds)):.4f}'
  )
  print(
      f'Validation R² - Grade: {r2_score(g_val, g_preds):.4f}'
  )
  print(
      f'Validation R² - Tonnage: {r2_score(t_val, t_preds):.4f}'
  )

  # 3. Permanently Save Model Bundle
  model_bundle = {
      'grade_model': grade_model,
      'tonnage_model': tonnage_model,
      'feature_names': list(X.columns),
      'val_r2_grade': float(r2_score(g_val, g_preds)),
      'val_r2_tonnage': float(r2_score(t_val, t_preds)),
  }
  joblib.dump(model_bundle, 'manganese_xgboost_models.pkl')
  print(
      "\nSuccess! Models trained and permanently saved to"
      " 'manganese_xgboost_models.pkl'."
  )


def predict_new_site(new_features_df, model_path='manganese_xgboost_models.pkl'):
  """Instantly loads the pretrained model bundle and predicts grade & tonnage

  for any new site's flattened feature data without retraining.
  """
  print(f"\nLoading saved model bundle from '{model_path}'...")
  bundle = joblib.load(model_path)

  grade_model = bundle['grade_model']
  tonnage_model = bundle['tonnage_model']
  expected_cols = bundle['feature_names']

  # Ensure columns match training order
  new_features_df = new_features_df[expected_cols]

  # Make predictions
  grades = grade_model.predict(new_features_df)
  tonnages = tonnage_model.predict(new_features_df)

  print(f'Predicted Average Grade: {np.mean(grades):.2f}%')
  print(f'Predicted Average Tonnage: {np.mean(tonnages):.2f} Million Tonnes')

  return grades, tonnages


if __name__ == '__main__':
  # Step 1: Train and save once using your CSV
  train_and_save_model('final_flattened_training_data.csv')

  # Step 2: Example of how to use the saved model for inference anytime later
  # (Simulating new input rows matching the CSV feature columns)
  sample_input = pd.read_csv(
      'final_flattened_training_data.csv', nrows=20
  ).drop(columns=['grade_target', 'tonnage_target'])
  predict_new_site(sample_input)