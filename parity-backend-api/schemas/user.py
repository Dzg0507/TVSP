"""
Pydantic schemas for user-related data validation and serialization.
"""

import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user creation (registration)."""
    password: str = Field(min_length=8)


class UserPublic(UserBase):
    """Schema for public user information (response)."""
    id: uuid.UUID
    partner_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class PartnerLink(BaseModel):
    """Schema for partner link code."""
    partner_link_code: str
