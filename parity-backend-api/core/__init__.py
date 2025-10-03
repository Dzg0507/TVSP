"""
Core utilities and configuration for the Parity API.
"""

from .config import settings
from .database import get_db, DbDependency, Base, engine
from .security import (
    generate_link_code,
    verify_password, 
    get_password_hash,
    create_access_token,
    get_current_user,
    CurrentUserDependency,
    oauth2_scheme
)

__all__ = [
    "settings",
    "get_db",
    "DbDependency", 
    "Base",
    "engine",
    "generate_link_code",
    "verify_password",
    "get_password_hash", 
    "create_access_token",
    "get_current_user",
    "CurrentUserDependency",
    "oauth2_scheme"
]
