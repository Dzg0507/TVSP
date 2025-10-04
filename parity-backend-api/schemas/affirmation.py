"""
Pydantic schemas for affirmations feature.
"""

from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class AffirmationTemplatePublic(BaseModel):
    id: UUID
    title: str
    content: str
    category: str

    class Config:
        from_attributes = True


class AffirmationCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)
    template_id: Optional[UUID] = None
    sent_via: str = Field(pattern="^(in-app|sms|email|social)$")
    recipient_info: Dict[str, Any]


class AffirmationPublic(BaseModel):
    id: UUID
    content: str
    sent_via: str
    created_at: datetime

    class Config:
        from_attributes = True
