"""Deprecated — External PharmaSync provisioning removed in favor of native hospital pharmacy."""
from __future__ import annotations

async def provision_pharmacy(*args, **kwargs) -> dict:
    return {"success": True, "mode": "native", "status": "connected"}
