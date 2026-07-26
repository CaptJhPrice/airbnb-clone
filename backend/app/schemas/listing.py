from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.listing import PropertyType


class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AmenityBase(BaseModel):
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None


class AmenityCreate(AmenityBase):
    pass


class AmenityResponse(AmenityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ListingImageBase(BaseModel):
    url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    order: int = 0


class ListingImageCreate(ListingImageBase):
    pass


class ListingImageResponse(ListingImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AvailabilityBase(BaseModel):
    date: date
    is_available: bool = True
    price: Optional[float] = None


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityBatchCreate(BaseModel):
    start_date: date
    end_date: date
    is_available: bool = True
    price: Optional[float] = None


class AvailabilityResponse(AvailabilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    created_at: datetime


class ListingBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=20)
    property_type: PropertyType = PropertyType.APARTMENT
    location_country: str
    location_city: str
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float = Field(..., gt=0)
    cleaning_fee: float = 0.0
    service_fee: float = 0.0
    bedrooms: int = Field(default=1, ge=0)
    beds: int = Field(default=1, ge=0)
    bathrooms: int = Field(default=1, ge=0)
    max_guests: int = Field(default=1, ge=1)
    category_id: Optional[int] = None


class ListingCreate(ListingBase):
    images: Optional[List[ListingImageBase]] = []
    amenity_ids: Optional[List[int]] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[PropertyType] = None
    location_country: Optional[str] = None
    location_city: Optional[str] = None
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    max_guests: Optional[int] = None
    category_id: Optional[int] = None
    amenity_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None


class ListingResponse(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    images: List[ListingImageResponse] = []
    average_rating: Optional[float] = None
    review_count: int = 0


class ListingDetail(ListingResponse):
    host: dict
    category: Optional[CategoryResponse] = None
    amenities: List[AmenityResponse] = []
    reviews: List[dict] = []
