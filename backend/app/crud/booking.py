from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime, timedelta
from app.models.booking import Booking
from app.models.listing import Listing
from app.schemas.booking import BookingCreate


def get_booking(db: Session, booking_id: int) -> Booking:
    """Get a booking by ID."""
    return db.query(Booking).filter(Booking.id == booking_id).first()


def get_bookings_by_guest(db: Session, guest_id: int) -> List[Booking]:
    """Get all bookings by a guest."""
    return db.query(Booking).filter(Booking.guest_id == guest_id).all()


def get_bookings_by_listing(db: Session, listing_id: int) -> List[Booking]:
    """Get all bookings for a listing."""
    return db.query(Booking).filter(Booking.listing_id == listing_id).all()


def check_availability(
    db: Session,
    listing_id: int,
    check_in: datetime,
    check_out: datetime,
) -> bool:
    """Check if a listing is available for the given dates."""
    # Check for overlapping confirmed bookings
    overlapping = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status.in_(["confirmed", "pending"]),
        or_(
            and_(Booking.check_in <= check_in, Booking.check_out > check_in),
            and_(Booking.check_in < check_out, Booking.check_out >= check_out),
            and_(Booking.check_in >= check_in, Booking.check_out <= check_out),
        ),
    ).first()
    
    return overlapping is None


def calculate_price(
    db: Session,
    listing_id: int,
    check_in: datetime,
    check_out: datetime,
    num_guests: int,
) -> dict:
    """Calculate total price for a booking."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None
    
    nights = (check_out - check_in).days
    if nights <= 0:
        return None
    
    base_price = listing.price_per_night * nights
    cleaning_fee = listing.cleaning_fee
    service_fee = base_price * 0.12  # 12% service fee
    total_price = base_price + cleaning_fee + service_fee
    
    return {
        "nights": nights,
        "base_price": base_price,
        "cleaning_fee": cleaning_fee,
        "service_fee": service_fee,
        "total_price": total_price,
    }


def create_booking(db: Session, booking: BookingCreate, guest_id: int) -> Booking:
    """Create a new booking."""
    # Calculate price
    price_info = calculate_price(
        db,
        booking.listing_id,
        booking.check_in,
        booking.check_out,
        booking.num_guests,
    )
    
    if not price_info:
        raise ValueError("Invalid booking parameters")
    
    # Check availability
    if not check_availability(
        db,
        booking.listing_id,
        booking.check_in,
        booking.check_out,
    ):
        raise ValueError("Listing is not available for these dates")
    
    db_booking = Booking(
        guest_id=guest_id,
        listing_id=booking.listing_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        num_guests=booking.num_guests,
        special_requests=booking.special_requests,
        total_price=price_info["total_price"],
        cleaning_fee=price_info["cleaning_fee"],
        service_fee=price_info["service_fee"],
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def update_booking_status(db: Session, booking_id: int, status: str) -> Booking:
    """Update booking status."""
    db_booking = get_booking(db, booking_id)
    if db_booking:
        db_booking.status = status
        db.commit()
        db.refresh(db_booking)
    return db_booking


def cancel_booking(db: Session, booking_id: int) -> Booking:
    """Cancel a booking."""
    return update_booking_status(db, booking_id, "cancelled")
