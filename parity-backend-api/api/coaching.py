"""
AI coaching API endpoints for solo learning modules and progress tracking.
"""

from typing import List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends

from schemas.coaching import ModulePublic, UserProgressPublic, ProgressUpdate
from models.module import Module
from models.user_progress import UserProgress
from models.user import User
from core.database import DbDependency
from core.security import get_current_user

router = APIRouter(prefix="/coaching", tags=["AI Coaching"])


@router.get("/modules", response_model=List[ModulePublic])
async def get_modules(
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get all available coaching modules."""
    modules = db.query(Module).order_by(Module.order).all()
    return [ModulePublic.model_validate(module) for module in modules]


@router.get("/modules/{module_id}", response_model=ModulePublic)
async def get_module(
    module_id: UUID,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get a specific coaching module by ID."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found."
        )
    return ModulePublic.model_validate(module)


@router.get("/progress", response_model=List[UserProgressPublic])
async def get_user_progress(
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get current user's progress on all modules."""
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    return [UserProgressPublic.model_validate(p) for p in progress]


@router.post("/modules/{module_id}/progress", response_model=UserProgressPublic)
async def update_module_progress(
    module_id: UUID,
    progress_update: ProgressUpdate,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Update progress on a specific module."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found."
        )
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.module_id == module_id
    ).first()
    
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            module_id=module_id,
            progress_percentage=0,
            completed=False
        )
        db.add(progress)
    
    progress.progress_percentage = progress_update.progress_percentage
    progress.completed = progress_update.completed
    
    if progress_update.completed and not progress.completed_at:
        progress.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    
    return UserProgressPublic.model_validate(progress)
