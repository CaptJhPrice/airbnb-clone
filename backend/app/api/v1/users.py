from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.crud.user import get_user, update_user, delete_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    """Get current user profile."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    user = update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(user_id: int, db: Session = Depends(get_db)):
    """Delete current user account."""
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return None


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID (public profile)."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
