"""
Central configuration. All secrets come from environment variables —
nothing sensitive is ever hardcoded in source.

Required env vars (put these in a local .env file that is git-ignored,
or in your hosting platform's secrets manager):

  GEE_SERVICE_ACCOUNT_JSON   -> the full contents of your GCP service
                                 account key file, as a single-line JSON
                                 string.
  GEE_PROJECT_ID             -> the GCP project id tied to that account.
  MODEL_PATH                 -> path to manganese_xgboost_models.pkl
                                 (defaults to ./models/manganese_xgboost_models.pkl)
"""
import json
import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()  # no-op in production if you set real env vars instead


class Settings:
    def __init__(self) -> None:
        raw_key = os.environ.get("GEE_SERVICE_ACCOUNT_JSON")
        if not raw_key:
            raise RuntimeError(
                "GEE_SERVICE_ACCOUNT_JSON is not set. Put your service "
                "account key JSON (as one line) in a .env file or in "
                "your host's environment variable settings."
            )
        try:
            self.gee_service_account: dict = json.loads(raw_key)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "GEE_SERVICE_ACCOUNT_JSON is not valid JSON."
            ) from exc

        self.gee_project_id: str = os.environ.get(
            "GEE_PROJECT_ID", self.gee_service_account.get("project_id", "")
        )
        self.model_path: str = os.environ.get(
            "MODEL_PATH", "models/manganese_xgboost_models.pkl"
        )


@lru_cache
def get_settings() -> "Settings":
    return Settings()
