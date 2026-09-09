# Cache Pattern & Fallback Specification (Day 2 Deliverable)

## Architecture
* **Storage**: Flat-file on disk inside `backend/cache/`. Zero runtime dependencies on Redis.
* **Write Path**: Handled strictly offline via `scripts/precompute_cache.py`. No live inference or dynamic PNG rendering during HTTP requests.
* **Read Path**: Endpoints verify file presence via `cache_path.exists()` and stream static artifacts.
* **Error / Miss Handling**: Raises HTTP 503 ("Refuse-and-Explain") prompting the precompute script.
* **Guidance for Syed (Day 3 Fallback Wrapper)**: Wrap data queries in a `try/except` block that serves cached payloads upon failure to prevent unhandled runtime errors during demo presentation.