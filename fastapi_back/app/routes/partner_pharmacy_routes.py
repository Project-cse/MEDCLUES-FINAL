"""Deprecated — Inbound partner pharmacy routes removed in favor of native hospital pharmacy."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/partner/pharmacy", tags=["Partner Pharmacy (Deprecated)"])
