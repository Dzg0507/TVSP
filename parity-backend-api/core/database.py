"""
Database configuration and session management.
"""

from typing import Annotated
from sqlalchemy import create_engine, TypeDecorator, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from fastapi import Depends
import uuid as uuid_pkg

from .config import settings


class UUID(TypeDecorator):
    """Platform-independent UUID type.
    
    Uses PostgreSQL's UUID type, otherwise uses String(36) for SQLite.
    """
    impl = String
    cache_ok = True

    def __init__(self, as_uuid=True):
        """Initialize UUID type.
        
        Args:
            as_uuid: Whether to return UUID objects (True) or strings (False).
                     This parameter is accepted for compatibility but always uses UUID objects.
        """
        self.as_uuid = as_uuid
        super().__init__()

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid_pkg.UUID):
                return str(value)
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid_pkg.UUID):
            return value
        return uuid_pkg.UUID(value)


# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency for database session
DbDependency = Annotated[Session, Depends(get_db)]
