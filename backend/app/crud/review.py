from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.models.review import Review
from app.schemas.review import ReviewCreate


def get_review(db: Session, review_id: int) -> Review:
    """Get a review by ID."""
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews_by_listing(db: Session, listing_id: int) -> List[Review]:
    """Get all reviews for a listing."""
    return (
        db.query(Review)
        .filter(Review.listing_id == listing_id, Review.is_visible == True)
        .all()
    )


def get_reviews_by_user(db: Session, user_id: int) -> List[Review]:
    """Get all reviews by a user."""
    return db.query(Review).filter(Review.user_id == user_id).all()


def create_review(db: Session, review: ReviewCreate, user_id: int) -> Review:
    """Create a new review."""
    db_review = Review(
        user_id=user_id,
        **review.model_dump(),
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_listing_rating(db: Session, listing_id: int) -> dict:
    """Get average rating and count for a listing."""
    result = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .filter(Review.listing_id == listing_id, Review.is_visible == True)
        .first()
    )
    
    return {
        "average_rating": float(result.avg_rating) if result.avg_rating else None,
        "review_count": result.review_count or 0,
    }
