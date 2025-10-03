"""
Pydantic schemas for authentication-related data.
"""

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for JWT token payload data."""
    user_id: str
