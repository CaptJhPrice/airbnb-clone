from sqlalchemy.orm import Session
from typing import List
from app.models.wishlist import Wishlist, WishlistItem
from app.schemas.wishlist import WishlistCreate, WishlistItemCreate


def get_wishlist(db: Session, wishlist_id: int) -> Wishlist:
    """Get a wishlist by ID."""
    return db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()


def get_wishlists_by_user(db: Session, user_id: int) -> List[Wishlist]:
    """Get all wishlists for a user."""
    return db.query(Wishlist).filter(Wishlist.user_id == user_id).all()


def create_wishlist(db: Session, wishlist: WishlistCreate, user_id: int) -> Wishlist:
    """Create a new wishlist."""
    db_wishlist = Wishlist(
        user_id=user_id,
        **wishlist.model_dump(),
    )
    db.add(db_wishlist)
    db.commit()
    db.refresh(db_wishlist)
    return db_wishlist


def add_to_wishlist(
    db: Session, wishlist_id: int, item: WishlistItemCreate
) -> WishlistItem:
    """Add a listing to a wishlist."""
    # Check if already in wishlist
    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.wishlist_id == wishlist_id,
            WishlistItem.listing_id == item.listing_id,
        )
        .first()
    )
    
    if existing:
        return existing
    
    db_item = WishlistItem(
        wishlist_id=wishlist_id,
        **item.model_dump(),
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def remove_from_wishlist(db: Session, wishlist_id: int, listing_id: int) -> bool:
    """Remove a listing from a wishlist."""
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.wishlist_id == wishlist_id,
            WishlistItem.listing_id == listing_id,
        )
        .first()
    )
    
    if item:
        db.delete(item)
        db.commit()
        return True
    return False


def delete_wishlist(db: Session, wishlist_id: int) -> bool:
    """Delete a wishlist."""
    db_wishlist = get_wishlist(db, wishlist_id)
    if db_wishlist:
        db.delete(db_wishlist)
        db.commit()
        return True
    return False
