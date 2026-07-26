from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    
    num_guests = Column(Integer, nullable=False)
    
    total_price = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    
    special_requests = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    guest = relationship("User", back_populates="bookings")
    listing = relationship("Listing", back_populates="bookings")
