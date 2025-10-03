"""
API routes for the Parity backend.
"""

from .users import router as users_router
from .partners import router as partners_router

__all__ = ["users_router", "partners_router"]
