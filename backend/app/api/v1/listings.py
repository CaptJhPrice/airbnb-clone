from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingResponse, ListingDetail,
    CategoryCreate, CategoryResponse, AmenityCreate, AmenityResponse,
    ListingImageBase, ListingImageResponse
)
from app.crud.listing import (
    get_listing, get_listings, get_listings_by_host,
    create_listing, update_listing, delete_listing,
    get_categories, get_category, create_category,
    get_amenities, get_amenity, create_amenity,
    add_listing_image, delete_listing_image
)
from app.crud.review import get_listing_rating

router = APIRouter()


@router.get("/categories/", response_model=List[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    return get_categories(db)


@router.post("/categories/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_new_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category."""
    return create_category(db, category.model_dump())


@router.get("/amenities/", response_model=List[AmenityResponse])
def get_all_amenities(db: Session = Depends(get_db)):
    """Get all amenities."""
    return get_amenities(db)


@router.post("/amenities/", response_model=AmenityResponse, status_code=status.HTTP_201_CREATED)
def create_new_amenity(amenity: AmenityCreate, db: Session = Depends(get_db)):
    """Create a new amenity."""
    return create_amenity(db, amenity.model_dump())


@router.get("/host/{host_id}", response_model=List[ListingResponse])
def get_host_listings(host_id: int, db: Session = Depends(get_db)):
    """Get all listings by a host."""
    listings = get_listings_by_host(db, host_id)
    for listing in listings:
        rating_info = get_listing_rating(db, listing.id)
        listing.average_rating = rating_info["average_rating"]
        listing.review_count = rating_info["review_count"]
    return listings


@router.get("/", response_model=List[ListingResponse])
def get_all_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_guests: Optional[int] = None,
    property_type: Optional[str] = None,
    amenity_ids: Optional[str] = Query(None, description="Comma separated amenity IDs, e.g. 1,2,3"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0),
    sort_by: Optional[str] = Query(None, pattern="^(recommended|price_asc|price_desc|newest)$"),
    db: Session = Depends(get_db)
):
    """Get all listings with optional filters."""
    parsed_amenity_ids = None
    if amenity_ids:
        try:
            parsed_amenity_ids = [int(a.strip()) for a in amenity_ids.split(",") if a.strip()]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid amenity_ids format")

    listings = get_listings(
        db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        location=location,
        min_price=min_price,
        max_price=max_price,
        min_guests=min_guests,
        property_type=property_type,
        amenity_ids=parsed_amenity_ids,
        min_rating=min_rating,
        sort_by=sort_by,
    )
    
    # Add rating info to each listing
    for listing in listings:
        rating_info = get_listing_rating(db, listing.id)
        listing.average_rating = rating_info["average_rating"]
        listing.review_count = rating_info["review_count"]
    
    return listings


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
    response["host"] = {
        "id": listing.host.id,
        "full_name": listing.host.full_name,
        "username": listing.host.username,
        "email": listing.host.email,
        "role": listing.host.role.value if listing.host.role else None,
        "avatar_url": listing.host.avatar_url,
        "is_verified": listing.host.is_verified,
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
            "communication": review.communication,
            "check_in": review.check_in,
            "accuracy": review.accuracy,
            "location": review.location,
            "value": review.value,
            "created_at": review.created_at,
            "user": {
                "id": review.user.id,
                "full_name": review.user.full_name,
                "username": review.user.username,
                "avatar_url": review.user.avatar_url,
            } if review.user else None,
        }
        for review in listing.reviews
        if review.is_visible
    ]

    return response


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_new_listing(
    listing: ListingCreate,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Create a new listing."""
    db_listing = create_listing(db, listing, host_id)
    return db_listing


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
    
    updated_listing = update_listing(db, listing_id, listing_update)
    return updated_listing


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
def add_image_to_listing(
    listing_id: int,
    image: ListingImageBase,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Add a new image to a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return add_listing_image(db, listing_id, image)


@router.delete("/{listing_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_image_from_listing(
    listing_id: int,
    image_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Delete an image from a listing."""
    db_listing = get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    delete_listing_image(db, image_id)
    return None
