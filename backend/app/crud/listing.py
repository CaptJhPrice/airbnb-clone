from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from app.models.listing import Listing, ListingImage, ListingAmenity, Category, Amenity
from app.models.review import Review
from app.schemas.listing import ListingCreate, ListingUpdate, ListingImageBase


def get_listing(db: Session, listing_id: int) -> Optional[Listing]:
    """Get a listing by ID."""
    return db.query(Listing).filter(Listing.id == listing_id).first()


def get_listings(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_guests: Optional[int] = None,
    property_type: Optional[str] = None,
    amenity_ids: Optional[List[int]] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = None,
) -> List[Listing]:
    """Get listings with filters including amenities and minimum average rating."""
    query = db.query(Listing).filter(Listing.is_active == True)
    
    if category_id:
        query = query.filter(Listing.category_id == category_id)
    
    if location:
        query = query.filter(
            or_(
                Listing.location_city.ilike(f"%{location}%"),
                Listing.location_country.ilike(f"%{location}%"),
                Listing.location_address.ilike(f"%{location}%"),
            )
        )
    
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)
    
    if min_guests is not None:
        query = query.filter(Listing.max_guests >= min_guests)
    
    if property_type:
        query = query.filter(Listing.property_type == property_type)

    # Filter by amenities if specified
    if amenity_ids:
        for a_id in amenity_ids:
            query = query.filter(
                Listing.amenities.any(ListingAmenity.amenity_id == a_id)
            )

    # Filter by min_rating if specified
    if min_rating is not None:
        subquery = (
            db.query(Review.listing_id, func.avg(Review.rating).label("avg_rating"))
            .filter(Review.is_visible == True)
            .group_by(Review.listing_id)
            .subquery()
        )
        query = query.join(subquery, Listing.id == subquery.c.listing_id).filter(
            subquery.c.avg_rating >= min_rating
        )

    if sort_by == "price_asc":
        query = query.order_by(Listing.price_per_night.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Listing.price_per_night.desc())
    elif sort_by == "newest":
        query = query.order_by(Listing.created_at.desc())
    else:
        query = query.order_by(Listing.is_verified.desc(), Listing.created_at.desc())
    
    return query.offset(skip).limit(limit).all()


def get_listings_by_host(db: Session, host_id: int) -> List[Listing]:
    """Get all listings by a host."""
    return db.query(Listing).filter(Listing.host_id == host_id).all()


def create_listing(db: Session, listing: ListingCreate, host_id: int) -> Listing:
    """Create a new listing."""
    db_listing = Listing(
        **listing.model_dump(exclude={"images", "amenity_ids"}),
        host_id=host_id,
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    
    # Add images
    if listing.images:
        for idx, img_data in enumerate(listing.images):
            db_image = ListingImage(
                listing_id=db_listing.id,
                url=img_data.url,
                alt_text=img_data.alt_text,
                is_primary=img_data.is_primary or (idx == 0),
                order=img_data.order or idx,
            )
            db.add(db_image)
    
    # Add amenities
    if listing.amenity_ids:
        for amenity_id in listing.amenity_ids:
            db_amenity = ListingAmenity(
                listing_id=db_listing.id,
                amenity_id=amenity_id,
            )
            db.add(db_amenity)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing


def update_listing(db: Session, listing_id: int, listing_update: ListingUpdate) -> Optional[Listing]:
    """Update a listing."""
    db_listing = get_listing(db, listing_id)
    if db_listing:
        update_data = listing_update.model_dump(exclude_unset=True, exclude={"amenity_ids"})
        for field, value in update_data.items():
            setattr(db_listing, field, value)
        
        # Update amenities if provided
        if listing_update.amenity_ids is not None:
            db.query(ListingAmenity).filter(ListingAmenity.listing_id == listing_id).delete()
            for amenity_id in listing_update.amenity_ids:
                db_amenity = ListingAmenity(
                    listing_id=listing_id,
                    amenity_id=amenity_id,
                )
                db.add(db_amenity)
        
        db.commit()
        db.refresh(db_listing)
    return db_listing


def delete_listing(db: Session, listing_id: int) -> bool:
    """Delete a listing."""
    db_listing = get_listing(db, listing_id)
    if db_listing:
        db.delete(db_listing)
        db.commit()
        return True
    return False


def add_listing_image(db: Session, listing_id: int, image_data: ListingImageBase) -> ListingImage:
    """Add an image to a listing."""
    # If is_primary is True, set all other images to is_primary=False
    if image_data.is_primary:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).update({"is_primary": False})
    
    db_image = ListingImage(
        listing_id=listing_id,
        url=image_data.url,
        alt_text=image_data.alt_text,
        is_primary=image_data.is_primary,
        order=image_data.order,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def delete_listing_image(db: Session, image_id: int) -> bool:
    """Delete an image by ID."""
    db_image = db.query(ListingImage).filter(ListingImage.id == image_id).first()
    if db_image:
        db.delete(db_image)
        db.commit()
        return True
    return False


def get_categories(db: Session) -> List[Category]:
    """Get all categories."""
    return db.query(Category).all()


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """Get a category by ID."""
    return db.query(Category).filter(Category.id == category_id).first()


def create_category(db: Session, category_data: dict) -> Category:
    """Create a new category."""
    db_category = Category(**category_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_amenities(db: Session) -> List[Amenity]:
    """Get all amenities."""
    return db.query(Amenity).all()


def get_amenity(db: Session, amenity_id: int) -> Optional[Amenity]:
    """Get an amenity by ID."""
    return db.query(Amenity).filter(Amenity.id == amenity_id).first()


def create_amenity(db: Session, amenity_data: dict) -> Amenity:
    """Create a new amenity."""
    db_amenity = Amenity(**amenity_data)
    db.add(db_amenity)
    db.commit()
    db.refresh(db_amenity)
    return db_amenity
