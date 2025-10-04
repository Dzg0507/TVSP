"""
Pydantic schemas for AI coaching modules.
"""

from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ModulePublic(BaseModel):
    id: UUID
    title: str
    description: str
    content: Dict[str, Any]
    category: str
    order: int

    class Config:
        from_attributes = True


class UserProgressPublic(BaseModel):
    id: UUID
    module_id: UUID
    completed: bool
    progress_percentage: int
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    progress_percentage: int = Field(ge=0, le=100)
    completed: bool = False
