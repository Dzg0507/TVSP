"""
CaringGesture model for social posts.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey

from core.database import Base, UUID


class CaringGesture(Base):
    __tablename__ = "caring_gestures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    gesture_type = Column(String(50), nullable=False)
    anonymous_user_id = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
