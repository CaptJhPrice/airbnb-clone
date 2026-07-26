from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.wishlist import WishlistCreate, WishlistResponse, WishlistItemCreate
from app.crud.wishlist import (
    get_wishlist, get_wishlists_by_user,
    create_wishlist, add_to_wishlist, remove_from_wishlist, delete_wishlist
)

router = APIRouter()


def serialize_wishlist(wishlist):
    """Convert wishlist ORM relationships into the public API shape."""
    return {
        "id": wishlist.id,
        "user_id": wishlist.user_id,
        "name": wishlist.name,
        "description": wishlist.description,
        "is_public": bool(wishlist.is_public),
        "created_at": wishlist.created_at,
        "items": [
            {
                "id": item.id,
                "wishlist_id": item.wishlist_id,
                "listing_id": item.listing_id,
                "note": item.note,
                "created_at": item.created_at,
                "listing": {
                    "id": item.listing.id,
                    "title": item.listing.title,
                    "location_city": item.listing.location_city,
                    "location_country": item.listing.location_country,
                    "price_per_night": item.listing.price_per_night,
                    "images": [
                        {
                            "id": image.id,
                            "url": image.url,
                            "alt_text": image.alt_text,
                            "is_primary": image.is_primary,
                            "order": image.order,
                            "created_at": image.created_at,
                        }
                        for image in item.listing.images
                    ],
                } if item.listing else None,
            }
            for item in wishlist.items
        ],
    }


@router.get("/", response_model=List[WishlistResponse])
def get_all_wishlists(user_id: int, db: Session = Depends(get_db)):
    """Get all wishlists for the current user."""
    return [serialize_wishlist(wishlist) for wishlist in get_wishlists_by_user(db, user_id)]


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def create_new_wishlist(
    wishlist: WishlistCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create a new wishlist."""
    return serialize_wishlist(create_wishlist(db, wishlist, user_id))


@router.post("/{wishlist_id}/items", response_model=dict)
def add_item_to_wishlist(
    wishlist_id: int,
    item: WishlistItemCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Add a listing to a wishlist."""
    wishlist = get_wishlist(db, wishlist_id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    if wishlist.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this wishlist"
        )
    
    wishlist_item = add_to_wishlist(db, wishlist_id, item)
    return {"message": "Item added to wishlist", "item_id": wishlist_item.id}


@router.delete("/{wishlist_id}/items/{listing_id}", response_model=dict)
def remove_item_from_wishlist(
    wishlist_id: int,
    listing_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Remove a listing from a wishlist."""
    wishlist = get_wishlist(db, wishlist_id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    if wishlist.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this wishlist"
        )
    
    success = remove_from_wishlist(db, wishlist_id, listing_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in wishlist"
        )
    
    return {"message": "Item removed from wishlist"}


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_wishlist(
    wishlist_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete a wishlist."""
    wishlist = get_wishlist(db, wishlist_id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    if wishlist.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this wishlist"
        )
    
    delete_wishlist(db, wishlist_id)
    return None
