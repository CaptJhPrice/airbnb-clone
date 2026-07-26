from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.schemas.listing import AvailabilityBatchCreate, AvailabilityResponse
from app.crud.availability import (
    get_availability_by_listing,
    set_listing_availability_range,
    delete_availability_entry
)
from app.crud.listing import get_listing

router = APIRouter()


@router.get("/listings/{listing_id}", response_model=List[AvailabilityResponse])
def get_listing_availability(
    listing_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get availability entries for a listing."""
    listing = get_listing(db, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    return get_availability_by_listing(db, listing_id, start_date, end_date)


@router.post("/listings/{listing_id}", response_model=List[AvailabilityResponse])
def set_availability(
    listing_id: int,
    batch_data: AvailabilityBatchCreate,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Set availability or custom pricing for a date range."""
    listing = get_listing(db, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify availability for this listing"
        )

    if batch_data.end_date < batch_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date"
        )

    return set_listing_availability_range(db, listing_id, batch_data)


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_availability_entry(
    availability_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Remove a specific availability override entry."""
    success = delete_availability_entry(db, availability_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found"
        )
    return None
