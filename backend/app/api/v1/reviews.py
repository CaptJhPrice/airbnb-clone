from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.crud.review import get_review, get_reviews_by_listing, get_reviews_by_user, create_review

router = APIRouter()


@router.get("/listing/{listing_id}", response_model=List[ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a listing."""
    return get_reviews_by_listing(db, listing_id)


@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews by a user."""
    return get_reviews_by_user(db, user_id)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_new_review(
    review: ReviewCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create a new review."""
    db_review = create_review(db, review, user_id)
    return db_review
