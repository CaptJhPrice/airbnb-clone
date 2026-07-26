from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.booking import Booking
from app.models.listing import Listing, Availability
from app.schemas.booking import BookingCreate


def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
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
    # Check for overlapping confirmed or pending bookings
    overlapping_booking = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status.in_(["confirmed", "pending"]),
        or_(
            and_(Booking.check_in <= check_in, Booking.check_out > check_in),
            and_(Booking.check_in < check_out, Booking.check_out >= check_out),
            and_(Booking.check_in >= check_in, Booking.check_out <= check_out),
        ),
    ).first()
    
    if overlapping_booking:
        return False

    # Check for host-blocked dates in Availability table
    check_in_date = check_in.date() if isinstance(check_in, datetime) else check_in
    check_out_date = check_out.date() if isinstance(check_out, datetime) else check_out
    
    blocked_avail = db.query(Availability).filter(
        Availability.listing_id == listing_id,
        Availability.is_available == False,
        Availability.date >= check_in_date,
        Availability.date < check_out_date
    ).first()

    return blocked_avail is None


def calculate_price(
    db: Session,
    listing_id: int,
    check_in: datetime,
    check_out: datetime,
    num_guests: int,
) -> Optional[dict]:
    """Calculate total price for a booking including taxes and custom night rates if set."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None

    if num_guests > listing.max_guests:
        return None
    
    nights = (check_out - check_in).days
    if nights <= 0:
        return None
    
    # Calculate base price, checking if custom prices exist for specific dates
    check_in_date = check_in.date() if isinstance(check_in, datetime) else check_in
    custom_availabilities = {
        avail.date: avail.price
        for avail in db.query(Availability).filter(
            Availability.listing_id == listing_id,
            Availability.date >= check_in_date,
            Availability.date < (check_in_date + timedelta(days=nights))
        ).all()
        if avail.price is not None
    }
    
    base_price = 0.0
    for i in range(nights):
        day_date = check_in_date + timedelta(days=i)
        base_price += custom_availabilities.get(day_date, listing.price_per_night)

    cleaning_fee = listing.cleaning_fee
    service_fee = base_price * 0.12  # 12% service fee
    subtotal = base_price + cleaning_fee + service_fee
    tax = subtotal * 0.10  # 10% tax
    total_price = subtotal + tax
    
    return {
        "nights": nights,
        "base_price": round(base_price, 2),
        "cleaning_fee": round(cleaning_fee, 2),
        "service_fee": round(service_fee, 2),
        "subtotal": round(subtotal, 2),
        "tax": round(tax, 2),
        "total_price": round(total_price, 2),
    }


def create_booking(db: Session, booking: BookingCreate, guest_id: int) -> Booking:
    """Create a new booking."""
    if booking.check_in < datetime.now():
        raise ValueError("Check-in date cannot be in the past")

    # Calculate price
    price_info = calculate_price(
        db,
        booking.listing_id,
        booking.check_in,
        booking.check_out,
        booking.num_guests,
    )
    
    if not price_info:
        raise ValueError("Invalid booking parameters or guest count exceeds listing capacity")
    
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


def update_booking_status(db: Session, booking_id: int, status: str) -> Optional[Booking]:
    """Update booking status."""
    db_booking = get_booking(db, booking_id)
    if db_booking:
        db_booking.status = status
        db.commit()
        db.refresh(db_booking)
    return db_booking


def cancel_booking(db: Session, booking_id: int) -> Optional[Booking]:
    """Cancel a booking."""
    return update_booking_status(db, booking_id, "cancelled")
