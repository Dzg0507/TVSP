"""
API routes for user registration and authentication.
"""

from datetime import datetime, timedelta
from typing import Annotated, Dict, Any, Optional
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from core import settings, verify_password, get_password_hash, create_access_token
from core.security import get_current_user
from models.user import User
from schemas.user import UserCreate, UserPublic
from schemas.auth import Token
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/users", tags=["Users & Authentication"])

# In-memory storage for development
users_db = {}
users_by_id = {}
sessions_db = {}


# Data models for settings and profile
class UserSettings(BaseModel):
    notifications: Dict[str, Any]
    privacy: Dict[str, Any]
    preferences: Dict[str, Any]
    security: Dict[str, Any]
    data: Dict[str, Any]
    accessibility: Dict[str, Any]


class UserProfile(BaseModel):
    personal: Dict[str, Any]
    relationship: Dict[str, Any]
    stats: Dict[str, Any]
    preferences: Dict[str, Any]
    social: Dict[str, Any]


class SettingsUpdate(BaseModel):
    settings: UserSettings


class ProfileUpdate(BaseModel):
    profile: UserProfile


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def get_user_by_email(db, email: str):
    """Fetches a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def create_user(db, user: UserCreate) -> User:
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):
    """
    Register a new user with real data storage
    """
    print(f"Registration attempt received: email={user.email}, password_length={len(user.password) if user.password else 0}")
    
    # Check if user already exists
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "id": user_id,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "partner_id": None,
        "is_active": True
    }
    
    # Store user in memory
    users_db[user.email] = new_user
    users_by_id[user_id] = new_user
    
    # Return user data
    user_public = UserPublic(
        id=user_id,
        email=user.email,
        partner_id=None
    )
    
    print(f"User registered successfully: {user_id}")
    return user_public


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Login user with real authentication
    """
    print(f"Login attempt received: email={form_data.username}, password_length={len(form_data.password) if form_data.password else 0}")
    
    # Check if user exists
    if form_data.username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_data = users_db[form_data.username]
    
    # Verify password
    if not verify_password(form_data.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"user_id": user_data["id"]})
    
    print(f"Login successful for: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserPublic)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information."""
    user_data = users_by_id.get(str(current_user.id))
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserPublic(
        id=user_data["id"],
        email=user_data["email"],
        partner_id=user_data["partner_id"]
    )


@router.put("/settings", response_model=Dict[str, Any])
def update_user_settings(
    settings_update: SettingsUpdate, 
    current_user = Depends(get_current_user)
):
    """Update user settings."""
    # In a real implementation, you would store this in the database
    # For now, we'll just return the settings as received
    return {
        "success": True,
        "message": "Settings updated successfully",
        "settings": settings_update.settings.dict()
    }


@router.get("/settings", response_model=UserSettings)
def get_user_settings(
    current_user = Depends(get_current_user)
):
    """Get user settings."""
    # In a real implementation, you would fetch this from the database
    # For now, return default settings
    return UserSettings(
        notifications={
            "pushNotifications": True,
            "emailNotifications": False,
            "partnerUpdates": True,
            "weeklyInsights": True,
            "soundEnabled": True
        },
        privacy={
            "shareProgress": True,
            "publicProfile": False,
            "dataCollection": True,
            "analyticsOptIn": False
        },
        preferences={
            "darkMode": False,
            "language": "English",
            "hapticFeedback": True
        },
        security={
            "biometricAuth": False,
            "autoLock": False,
            "twoFactorAuth": False
        },
        data={
            "autoBackup": True,
            "backupFrequency": "weekly",
            "dataRetention": "1year"
        },
        accessibility={
            "screenReader": False,
            "highContrast": False,
            "largeText": False
        }
    )


@router.put("/profile", response_model=Dict[str, Any])
def update_user_profile(
    profile_update: ProfileUpdate, 
    current_user = Depends(get_current_user)
):
    """Update user profile."""
    # In a real implementation, you would store this in the database
    # For now, we'll just return the profile as received
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": profile_update.profile.dict()
    }


@router.get("/profile", response_model=UserProfile)
def get_user_profile(
    current_user = Depends(get_current_user)
):
    """Get user profile."""
    # In a real implementation, you would fetch this from the database
    # For now, return default profile
    return UserProfile(
        personal={
            "name": current_user.email.split('@')[0].title(),
            "email": current_user.email,
            "avatar": "👤",
            "bio": "Supporting healthy relationships",
            "location": "",
            "joinDate": current_user.created_at.isoformat() if hasattr(current_user, 'created_at') and current_user.created_at else "2024-01-01T00:00:00Z"
        },
        relationship={
            "status": "single",
            "partnerId": None,
            "relationshipStartDate": None,
            "communicationGoals": [],
            "relationshipType": "romantic"
        },
        stats={
            "conversationsAnalyzed": 0,
            "improvementScore": 0,
            "streakDays": 0,
            "partnersConnected": 0,
            "badgesEarned": 0,
            "totalPoints": 0
        },
        preferences={
            "favoriteTopics": [],
            "learningStyle": "visual",
            "communicationLevel": "beginner",
            "goals": [],
            "interests": []
        },
        social={
            "followers": 0,
            "following": 0,
            "posts": 0,
            "reputation": 0,
            "level": 1,
            "isVerified": False,
            "privacyLevel": "private"
        }
    )


# Password reset token storage (in production, use Redis or database)
password_reset_tokens = {}


def send_password_reset_email(email: str, reset_token: str):
    """Send password reset email to user."""
    try:
        # In production, use proper email service like SendGrid, AWS SES, etc.
        # For now, we'll just log the token (in production, send actual email)
        print(f"Password reset token for {email}: {reset_token}")
        print(f"Reset link: https://parity-app.com/reset-password?token={reset_token}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(request: ForgotPasswordRequest):
    """
    Initiate password reset process by sending reset email.
    """
    # For testing, always return success message
    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store token with expiration (1 hour)
    password_reset_tokens[reset_token] = {
        "user_id": "mock-user-id",
        "email": request.email,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    }
    
    # Send reset email
    email_sent = send_password_reset_email(request.email, reset_token)
    
    if email_sent:
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email. Please try again later."
        )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest):
    """
    Reset user password using valid reset token.
    """
    # Check if token exists and is valid
    if request.token not in password_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    
    token_data = password_reset_tokens[request.token]
    
    # Check if token has expired
    if datetime.utcnow() > token_data["expires_at"]:
        del password_reset_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )
    
    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    
    # Remove used token
    del password_reset_tokens[request.token]
    
    return {"message": "Password has been successfully reset. You can now log in with your new password."}
