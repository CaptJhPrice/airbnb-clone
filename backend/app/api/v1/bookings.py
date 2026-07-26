from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse, BookingDetail
from app.crud.booking import (
    get_booking, get_bookings_by_guest, get_bookings_by_listing,
    create_booking, cancel_booking
)

router = APIRouter()


def serialize_booking_detail(booking):
    """Convert booking ORM relationships into the public API detail shape."""
    return {
        "id": booking.id,
        "guest_id": booking.guest_id,
        "listing_id": booking.listing_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "num_guests": booking.num_guests,
        "special_requests": booking.special_requests,
        "total_price": booking.total_price,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "status": booking.status,
        "created_at": booking.created_at,
        "listing": {
            "id": booking.listing.id,
            "title": booking.listing.title,
            "location_city": booking.listing.location_city,
            "location_country": booking.listing.location_country,
            "location_address": booking.listing.location_address,
            "price_per_night": booking.listing.price_per_night,
            "images": [
                {
                    "id": image.id,
                    "url": image.url,
                    "alt_text": image.alt_text,
                    "is_primary": image.is_primary,
                    "order": image.order,
                    "created_at": image.created_at,
                }
                for image in booking.listing.images
            ],
        } if booking.listing else None,
        "guest": {
            "id": booking.guest.id,
            "full_name": booking.guest.full_name,
            "username": booking.guest.username,
            "email": booking.guest.email,
        } if booking.guest else None,
    }


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    guest_id: int,
    db: Session = Depends(get_db)
):
    """Get all bookings for the current user."""
    return get_bookings_by_guest(db, guest_id)


@router.get("/listing/{listing_id}", response_model=List[BookingResponse])
def get_listing_bookings(listing_id: int, host_id: int, db: Session = Depends(get_db)):
    """Get all bookings for a listing (host only)."""
    return get_bookings_by_listing(db, listing_id)


@router.get("/{booking_id}", response_model=BookingDetail)
def get_booking_detail(booking_id: int, db: Session = Depends(get_db)):
    """Get a booking by ID with full details."""
    booking = get_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return serialize_booking_detail(booking)


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(
    booking: BookingCreate,
    guest_id: int,
    db: Session = Depends(get_db)
):
    """Create a new booking."""
    try:
        db_booking = create_booking(db, booking, guest_id)
        return db_booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_existing_booking(booking_id: int, guest_id: int, db: Session = Depends(get_db)):
    """Cancel a booking."""
    booking = get_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.guest_id != guest_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    return cancel_booking(db, booking_id)
