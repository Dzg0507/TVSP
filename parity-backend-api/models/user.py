"""
User database model.
"""

import uuid
import hashlib
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from core.database import Base, UUID
from core.security import generate_link_code


class User(Base):
    """User model for storing user account information."""
    
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    partner_link_code = Column(String, unique=True, index=True, default=generate_link_code)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Establishes a one-to-one relationship with another User
    partner = relationship(
        "User",
        uselist=False,
        remote_side=[id],
        primaryjoin="User.partner_id == User.id",
        backref="partner_of"
    )

    @property
    def anonymous_id(self) -> str:
        """Generate a consistent anonymous ID for social posts."""
        return hashlib.sha256(str(self.id).encode()).hexdigest()[:16]
