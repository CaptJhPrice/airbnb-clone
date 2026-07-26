from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    CONDO = "condo"
    VILLA = "villa"
    COTTAGE = "cottage"
    CABIN = "cabin"
    STUDIO = "studio"
    LOFT = "loft"
    ROOM = "room"
    OTHER = "other"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    icon = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listings = relationship("Listing", back_populates="category")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    icon = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(Enum(PropertyType), default=PropertyType.APARTMENT)
    
    location_country = Column(String, nullable=False)
    location_city = Column(String, nullable=False)
    location_address = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Integer, default=1)
    max_guests = Column(Integer, default=1)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    host = relationship("User", back_populates="listings")
    category = relationship("Category", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("ListingAmenity", back_populates="listing", cascade="all, delete-orphan")
    availability = relationship("Availability", back_populates="listing", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)
    alt_text = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="images")


class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="amenities")
    amenity = relationship("Amenity")


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    is_available = Column(Boolean, default=True)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="availability")
