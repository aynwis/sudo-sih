"""Compatibility entrypoint for the unified MnSight API.

The live application is implemented in ``app.main``. Keeping this tiny shim
means the documented ``uvicorn main:app`` command and the explicit
``uvicorn app.main:app`` command start the exact same routes, cache behavior,
and response contracts instead of silently selecting a legacy duplicate app.
"""

from pathlib import Path
import sys

# ``app.main`` uses package-local absolute imports. Add the backend directory
# when this shim is imported as ``backend.main`` from the repository root.
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
