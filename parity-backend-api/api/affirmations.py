"""
Affirmations API endpoints for sending positive affirmations.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Depends

from schemas.affirmation import (
    AffirmationTemplatePublic,
    AffirmationCreate,
    AffirmationPublic
)
from models.affirmation import Affirmation
from models.affirmation_template import AffirmationTemplate
from models.user import User
from core.database import DbDependency
from core.security import get_current_user

router = APIRouter(prefix="/affirmations", tags=["Affirmations"])


@router.get("/templates", response_model=List[AffirmationTemplatePublic])
async def get_affirmation_templates(
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get all affirmation templates."""
    templates = db.query(AffirmationTemplate).filter(AffirmationTemplate.is_default == True).all()
    return [AffirmationTemplatePublic.model_validate(template) for template in templates]


@router.post("/send", response_model=AffirmationPublic, status_code=status.HTTP_201_CREATED)
async def send_affirmation(
    affirmation: AffirmationCreate,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Send an affirmation."""
    if affirmation.template_id:
        template = db.query(AffirmationTemplate).filter(
            AffirmationTemplate.id == affirmation.template_id
        ).first()
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Affirmation template not found."
            )
    
    new_affirmation = Affirmation(
        user_id=current_user.id,
        content=affirmation.content,
        template_id=affirmation.template_id,
        sent_via=affirmation.sent_via,
        recipient_info=affirmation.recipient_info
    )
    
    db.add(new_affirmation)
    db.commit()
    db.refresh(new_affirmation)
    
    return AffirmationPublic.model_validate(new_affirmation)


@router.get("/sent", response_model=List[AffirmationPublic])
async def get_sent_affirmations(
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get user's sent affirmations."""
    affirmations = db.query(Affirmation).filter(Affirmation.user_id == current_user.id).all()
    return [AffirmationPublic.model_validate(affirmation) for affirmation in affirmations]
