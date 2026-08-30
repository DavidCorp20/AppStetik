"""FastAPI Cloud entrypoint for Stetik MVP Production."""

# FastAPI Cloud autodetects backend/main.py as ``main:app``.
# Route that entrypoint through the production hardening layer so the
# deployed application is the MVP Production app, not the legacy server app.
from production_app import app

__all__ = ["app"]
