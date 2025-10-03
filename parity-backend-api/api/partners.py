"""
API routes for partner linking functionality.
"""

from fastapi import APIRouter, HTTPException, status

from core import DbDependency, CurrentUserDependency
from models.user import User
from schemas.user import PartnerLink, UserPublic

router = APIRouter(prefix="/partner", tags=["Partner Management"])


def get_user_by_link_code(db, code: str):
    """Fetches a user by their partner link code."""
    return db.query(User).filter(User.partner_link_code == code).first()


@router.get("/link_code", response_model=PartnerLink)
def get_partner_link_code(current_user: CurrentUserDependency):
    """
    Retrieves the unique partner link code for the authenticated user.
    """
    return {"partner_link_code": current_user.partner_link_code}


@router.post("/link", status_code=status.HTTP_200_OK)
def link_with_partner(partner_data: PartnerLink, current_user: CurrentUserDependency, db: DbDependency):
    """
    Links the authenticated user with another user via their partner link code.
    - Ensures mutual consent by linking both accounts to each other.
    - Validates that neither user is already partnered.
    """
    if current_user.partner_id:
        raise HTTPException(status_code=400, detail="You are already linked with a partner.")

    target_partner = get_user_by_link_code(db, code=partner_data.partner_link_code)

    if not target_partner:
        raise HTTPException(status_code=404, detail="Partner link code not found.")

    if target_partner.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot link to yourself.")

    if target_partner.partner_id:
        raise HTTPException(status_code=400, detail="This user is already linked with a partner.")

    # Establish the mutual link
    current_user.partner_id = target_partner.id
    target_partner.partner_id = current_user.id
    
    db.add(current_user)
    db.add(target_partner)
    db.commit()

    return {"message": f"Successfully linked with user {target_partner.email}."}


@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: CurrentUserDependency):
    """
    Get details of the currently authenticated user.
    """
    return current_user
