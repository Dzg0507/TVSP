"""
Affirmation model for positive affirmations feature.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON

from core.database import Base, UUID


class Affirmation(Base):
    __tablename__ = "affirmations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("affirmation_templates.id", ondelete="SET NULL"), nullable=True)
    sent_via = Column(String(50), nullable=False)
    recipient_info = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
