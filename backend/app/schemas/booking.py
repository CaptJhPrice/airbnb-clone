from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    listing_id: int
    check_in: datetime
    check_out: datetime
    num_guests: int = Field(..., ge=1)
    special_requests: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    guest_id: int
    total_price: float
    cleaning_fee: float
    service_fee: float
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BookingDetail(BookingResponse):
    listing: dict
    guest: dict
