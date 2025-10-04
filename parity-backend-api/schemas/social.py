"""
Pydantic schemas for social feed features.
"""

from datetime import datetime
from uuid import UUID
from typing import List
from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class PostPublic(BaseModel):
    id: UUID
    content: str
    anonymous_user_id: str
    created_at: datetime
    like_count: int
    comment_count: int
    caring_gesture_count: int

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class CommentPublic(BaseModel):
    id: UUID
    post_id: UUID
    content: str
    anonymous_user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CaringGestureCreate(BaseModel):
    gesture_type: str = Field(pattern="^(hug|encouragement|comfort|mindfulness)$")


class CaringGesturePublic(BaseModel):
    id: UUID
    post_id: UUID
    gesture_type: str
    created_at: datetime

    class Config:
        from_attributes = True
