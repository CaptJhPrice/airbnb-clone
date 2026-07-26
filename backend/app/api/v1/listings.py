from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingResponse, ListingDetail,
    ListingImageCreate, ListingImageResponse
)
from app.crud.listing import (
    get_listing, get_listings, create_listing, update_listing,
    delete_listing, get_categories, get_amenities, get_listing_rating,
    add_listing_image, delete_listing_image
)

router = APIRouter()


@router.get("/", response_model=List[ListingResponse])
def get_all_listings(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_guests: Optional[int] = Query(None),
    amenity_ids: Optional[List[int]] = Query(None),
    min_rating: Optional[float] = Query(None),
    sort_by: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all listings with filtering and sorting."""
    valid_sorts = [
        "price_asc", "price_desc", "rating",
        "created_at", "title", "price", "-price", "-created_at"
    ]
    if sort_by and sort_by not in valid_sorts:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid sort_by option. Must be one of: {', '.join(valid_sorts)}"
        )
    
    listings = get_listings(
        db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        location=location,
        min_price=min_price,
        max_price=max_price,
        min_guests=min_guests,
        amenity_ids=amenity_ids,
        min_rating=min_rating,
        sort_by=sort_by
    )

    for listing in listings:
        rating_info = get_listing_rating(db, listing.id)
        listing.average_rating = rating_info["average_rating"]
        listing.review_count = rating_info["review_count"]

    return listings


@router.get("/categories")
def get_all_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    return get_categories(db)


@router.get("/amenities")
def get_all_amenities(db: Session = Depends(get_db)):
    """Get all amenities."""
    return get_amenities(db)


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    """Get a listing by ID with full details."""
    listing = get_listing(db, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    rating_info = get_listing_rating(db, listing.id)
    listing.average_rating = rating_info["average_rating"]
    listing.review_count = rating_info["review_count"]

    response = ListingResponse.model_validate(listing).model_dump()

    if listing.host:
        response["host"] = {
            "id": listing.host.id,
            "full_name": listing.host.full_name,
            "username": listing.host.username,
            "email": listing.host.email,
            "role": listing.host.role.value if hasattr(listing.host.role, "value") else str(listing.host.role),
            "avatar_url": listing.host.avatar_url,
            "is_verified": listing.host.is_verified,
        }
    else:
        response["host"] = {
            "id": listing.host_id,
            "full_name": "Verified Host",
            "username": f"host_{listing.host_id}",
            "email": f"host{listing.host_id}@staybnb.com",
            "role": "host",
            "avatar_url": None,
            "is_verified": True,
        }

    response["category"] = listing.category
    response["amenities"] = [
        listing_amenity.amenity
        for listing_amenity in listing.amenities
        if listing_amenity.amenity
    ]
    response["reviews"] = [
        {
            "id": review.id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "cleanliness": review.cleanliness,
            "accuracy": review.accuracy,
            "communication": review.communication,
            "location": review.location,
            "check_in": review.check_in,
            "value": review.value,
            "created_at": review.created_at,
            "user": {
                "id": review.user.id,
                "full_name": review.user.full_name,
                "avatar_url": review.user.avatar_url,
            } if review.user else None,
        }
        for review in listing.reviews
    ]
    return response


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_new_listing(
    listing: ListingCreate,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Create a new listing."""
    return create_listing(db, listing, host_id)


@router.put("/{listing_id}", response_model=ListingResponse)
def update_existing_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Update a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    return update_listing(db, listing_id, listing_update)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_listing(
    listing_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Delete a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    delete_listing(db, listing_id)
    return None


@router.post("/{listing_id}/images", response_model=ListingImageResponse, status_code=status.HTTP_201_CREATED)
def add_photo_to_listing(
    listing_id: int,
    image_data: ListingImageCreate,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Add an image to a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add photos to this listing"
        )
    
    return add_listing_image(db, listing_id, image_data)


@router.delete("/{listing_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_photo_from_listing(
    listing_id: int,
    image_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Delete an image from a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete photos from this listing"
        )
    
    success = delete_listing_image(db, image_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    return None
