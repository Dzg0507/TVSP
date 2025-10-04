"""
Social feed API endpoints for anonymous posts, likes, comments, and caring gestures.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import desc

from schemas.social import (
    PostCreate,
    PostPublic,
    CommentCreate,
    CommentPublic,
    CaringGestureCreate,
    CaringGesturePublic
)
from models.post import Post
from models.like import Like
from models.comment import Comment
from models.caring_gesture import CaringGesture
from models.user import User
from core.database import DbDependency, get_db
from core.security import get_current_user

router = APIRouter(prefix="/social", tags=["Social Feed"])


@router.post("/posts", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Create a new anonymous post."""
    new_post = Post(
        content=post.content,
        anonymous_user_id=current_user.anonymous_id
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return PostPublic.model_validate(new_post)


@router.get("/posts", response_model=List[PostPublic])
async def get_posts(
    db: DbDependency,
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Get paginated feed of anonymous posts."""
    posts = db.query(Post).order_by(desc(Post.created_at)).limit(limit).offset(offset).all()
    return [PostPublic.model_validate(post) for post in posts]


@router.post("/posts/{post_id}/like", status_code=status.HTTP_200_OK)
async def toggle_like(
    post_id: UUID,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Toggle like on a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )
    
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.anonymous_user_id == current_user.anonymous_id
    ).first()
    
    if existing_like:
        db.delete(existing_like)
        post.like_count = max(0, post.like_count - 1)
        message = "Like removed."
    else:
        new_like = Like(
            post_id=post_id,
            anonymous_user_id=current_user.anonymous_id
        )
        db.add(new_like)
        post.like_count += 1
        message = "Post liked."
    
    db.commit()
    
    return {"message": message, "like_count": post.like_count}


@router.post("/posts/{post_id}/comments", response_model=CommentPublic, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: UUID,
    comment: CommentCreate,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )
    
    new_comment = Comment(
        post_id=post_id,
        content=comment.content,
        anonymous_user_id=current_user.anonymous_id
    )
    
    db.add(new_comment)
    post.comment_count += 1
    db.commit()
    db.refresh(new_comment)
    
    return CommentPublic.model_validate(new_comment)


@router.get("/posts/{post_id}/comments", response_model=List[CommentPublic])
async def get_comments(
    post_id: UUID,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get comments for a post."""
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at).all()
    return [CommentPublic.model_validate(comment) for comment in comments]


@router.post("/posts/{post_id}/gestures", response_model=CaringGesturePublic, status_code=status.HTTP_201_CREATED)
async def send_caring_gesture(
    post_id: UUID,
    gesture: CaringGestureCreate,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Send a caring gesture to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )
    
    new_gesture = CaringGesture(
        post_id=post_id,
        gesture_type=gesture.gesture_type,
        anonymous_user_id=current_user.anonymous_id
    )
    
    db.add(new_gesture)
    post.caring_gesture_count += 1
    db.commit()
    db.refresh(new_gesture)
    
    return CaringGesturePublic.model_validate(new_gesture)


@router.get("/posts/{post_id}/gestures", response_model=List[CaringGesturePublic])
async def get_caring_gestures(
    post_id: UUID,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    """Get caring gestures for a post."""
    gestures = db.query(CaringGesture).filter(CaringGesture.post_id == post_id).order_by(CaringGesture.created_at).all()
    return [CaringGesturePublic.model_validate(gesture) for gesture in gestures]
