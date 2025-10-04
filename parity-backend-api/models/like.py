"""
Like model for social posts.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, UniqueConstraint, ForeignKey

from core.database import Base, UUID


class Like(Base):
    __tablename__ = "likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    anonymous_user_id = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('post_id', 'anonymous_user_id', name='uq_post_user_like'),
    )
