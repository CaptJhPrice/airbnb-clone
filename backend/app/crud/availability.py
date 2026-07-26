from sqlalchemy.orm import Session
from datetime import date, datetime, time, timedelta
from typing import List, Optional
from app.models.listing import Availability, Listing
from app.schemas.listing import AvailabilityBatchCreate, AvailabilityCreate


def get_availability_by_listing(
    db: Session,
    listing_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Availability]:
    """Get availability entries for a listing within an optional date range."""
    query = db.query(Availability).filter(Availability.listing_id == listing_id)
    if start_date:
        start_dt = datetime.combine(start_date, time.min)
        query = query.filter(Availability.date >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, time.max)
        query = query.filter(Availability.date <= end_dt)
    return query.order_by(Availability.date.asc()).all()


def set_listing_availability_range(
    db: Session,
    listing_id: int,
    batch_data: AvailabilityBatchCreate
) -> List[Availability]:
    """Set or update availability for a date range."""
    results = []
    current_date = batch_data.start_date
    
    while current_date <= batch_data.end_date:
        current_dt = datetime.combine(current_date, time.min)
        # Check if record exists for date
        existing = db.query(Availability).filter(
            Availability.listing_id == listing_id,
            Availability.date == current_dt
        ).first()
        
        if existing:
            existing.is_available = batch_data.is_available
            if batch_data.price is not None:
                existing.price = batch_data.price
            results.append(existing)
        else:
            new_avail = Availability(
                listing_id=listing_id,
                date=current_dt,
                is_available=batch_data.is_available,
                price=batch_data.price
            )
            db.add(new_avail)
            results.append(new_avail)
            
        current_date += timedelta(days=1)
        
    db.commit()
    for item in results:
        db.refresh(item)
    return results


def delete_availability_entry(db: Session, availability_id: int) -> bool:
    """Delete a specific availability entry."""
    entry = db.query(Availability).filter(Availability.id == availability_id).first()
    if entry:
        db.delete(entry)
        db.commit()
        return True
    return False
