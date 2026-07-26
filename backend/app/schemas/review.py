from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    listing_id: int
    booking_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    cleanliness: Optional[int] = Field(None, ge=1, le=5)
    communication: Optional[int] = Field(None, ge=1, le=5)
    check_in: Optional[int] = Field(None, ge=1, le=5)
    accuracy: Optional[int] = Field(None, ge=1, le=5)
    location: Optional[int] = Field(None, ge=1, le=5)
    value: Optional[int] = Field(None, ge=1, le=5)


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    is_visible: bool
    created_at: datetime

    class Config:
        from_attributes = True
