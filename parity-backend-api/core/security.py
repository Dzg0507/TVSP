"""
Security utilities for password hashing and JWT token management.
"""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from .config import settings
from .database import DbDependency

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def generate_link_code() -> str:
    """Generates a unique, URL-safe link code."""
    return secrets.token_urlsafe(16)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hashes a password for storing."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """Dependency to get the current authenticated user from a JWT."""
    from schemas.auth import TokenData
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("user_id")
        if user_id_str is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception
    
    # Find user in our in-memory storage
    from api.users import users_db
    user_data = None
    for email, data in users_db.items():
        if data["id"] == user_id_str:
            user_data = data
            break
    
    if not user_data:
        raise credentials_exception
    
    # Return user object
    class User:
        def __init__(self, user_data):
            self.id = user_data["id"]
            self.email = user_data["email"]
            self.created_at = user_data["created_at"]
            self.partner_id = user_data["partner_id"]
    
    return User(user_data)


# Dependency for current authenticated user
CurrentUserDependency = Annotated[object, Depends(get_current_user)]
