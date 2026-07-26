from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class WishlistBase(BaseModel):
    name: str = Field(default="My Wishlist")
    description: Optional[str] = None
    is_public: bool = False


class WishlistCreate(WishlistBase):
    pass


class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[dict] = []

    class Config:
        from_attributes = True


class WishlistItemCreate(BaseModel):
    listing_id: int
    note: Optional[str] = None
