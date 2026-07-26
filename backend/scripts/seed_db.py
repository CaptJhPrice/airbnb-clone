"""
Database seeding script for Airbnb Clone.
Populates the database with realistic sample data.
"""
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.listing import Listing, Category, Amenity, ListingImage, ListingAmenity, PropertyType
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.wishlist import Wishlist, WishlistItem


def seed_categories(db: Session):
    """Seed categories."""
    categories_data = [
        {"name": "Amazing Views", "icon": "🏔️", "description": "Properties with breathtaking views"},
        {"name": "Beachfront", "icon": "🏖️", "description": "Properties right on the beach"},
        {"name": "Cabins", "icon": "🏕️", "description": "Cozy cabins in nature"},
        {"name": "Countryside", "icon": "🌾", "description": "Rural properties and farms"},
        {"name": "Islands", "icon": "🏝️", "description": "Properties on islands"},
        {"name": "Lakefront", "icon": "🌊", "description": "Properties by lakes"},
        {"name": "Skiing", "icon": "⛷️", "description": "Properties near ski resorts"},
        {"name": "Castles", "icon": "🏰", "description": "Historic castles and manors"},
        {"name": "Trending", "icon": "🔥", "description": "Popular destinations"},
        {"name": "Tropical", "icon": "🌴", "description": "Tropical paradise properties"},
    ]
    
    for cat_data in categories_data:
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing:
            category = Category(**cat_data)
            db.add(category)
    
    db.commit()
    print("[ok] Categories seeded")


def seed_amenities(db: Session):
    """Seed amenities."""
    amenities_data = [
        {"name": "WiFi", "icon": "📶", "description": "High-speed internet"},
        {"name": "Kitchen", "icon": "🍳", "description": "Full kitchen"},
        {"name": "Parking", "icon": "🚗", "description": "Free parking"},
        {"name": "Pool", "icon": "🏊", "description": "Swimming pool"},
        {"name": "Hot Tub", "icon": "🛁", "description": "Hot tub or jacuzzi"},
        {"name": "Air Conditioning", "icon": "❄️", "description": "Central AC"},
        {"name": "Heating", "icon": "🔥", "description": "Central heating"},
        {"name": "Washer", "icon": "🧺", "description": "Washing machine"},
        {"name": "Dryer", "icon": "👕", "description": "Clothes dryer"},
        {"name": "TV", "icon": "📺", "description": "Smart TV"},
        {"name": "Gym", "icon": "💪", "description": "Fitness center"},
        {"name": "BBQ", "icon": "🍖", "description": "BBQ grill"},
    ]
    
    for amenity_data in amenities_data:
        existing = db.query(Amenity).filter(Amenity.name == amenity_data["name"]).first()
        if not existing:
            amenity = Amenity(**amenity_data)
            db.add(amenity)
    
    db.commit()
    print("[ok] Amenities seeded")


def seed_users(db: Session):
    """Seed users."""
    users_data = [
        {
            "email": "john@example.com",
            "username": "johnhost",
            "full_name": "John Smith",
            "password": "password123",
            "role": UserRole.HOST,
            "phone": "+1234567890",
        },
        {
            "email": "jane@example.com",
            "username": "janeguest",
            "full_name": "Jane Doe",
            "password": "password123",
            "role": UserRole.GUEST,
            "phone": "+1234567891",
        },
        {
            "email": "admin@example.com",
            "username": "admin",
            "full_name": "Admin User",
            "password": "admin123",
            "role": UserRole.ADMIN,
            "phone": "+1234567892",
        },
    ]
    
    for user_data in users_data:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            password = user_data.pop("password")
            user_data["hashed_password"] = get_password_hash(password)
            user = User(**user_data)
            db.add(user)
    
    db.commit()
    print("[ok] Users seeded")


def seed_listings(db: Session):
    """Seed listings."""
    # Get host user
    host = db.query(User).filter(User.email == "john@example.com").first()
    if not host:
        print("[error] Host user not found")
        return
    
    # Get categories
    categories = {cat.name: cat for cat in db.query(Category).all()}
    
    # Get amenities
    amenities = {amenity.name: amenity for amenity in db.query(Amenity).all()}
    
    listings_data = [
        {
            "title": "Modern Downtown Loft with City Views",
            "description": "Stunning modern loft in the heart of downtown. Floor-to-ceiling windows offer breathtaking city views. Perfect for business travelers and couples looking for a stylish urban retreat.",
            "property_type": PropertyType.LOFT,
            "location_country": "United States",
            "location_city": "New York",
            "location_address": "123 Manhattan Ave, New York, NY 10001",
            "latitude": 40.7580,
            "longitude": -73.9855,
            "price_per_night": 250.00,
            "cleaning_fee": 50.00,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "max_guests": 2,
            "category": categories.get("Amazing Views"),
            "amenities": ["WiFi", "Kitchen", "Air Conditioning", "TV", "Washer"],
            "images": [
                {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "alt_text": "Living room with city view", "is_primary": True, "order": 0},
                {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt_text": "Modern bedroom", "is_primary": False, "order": 1},
                {"url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800", "alt_text": "Kitchen", "is_primary": False, "order": 2},
            ]
        },
        {
            "title": "Beachfront Villa with Private Pool",
            "description": "Luxurious beachfront villa with stunning ocean views. Wake up to the sound of waves and enjoy your private pool just steps from the beach. Perfect for families and groups.",
            "property_type": PropertyType.VILLA,
            "location_country": "United States",
            "location_city": "Miami",
            "location_address": "456 Ocean Drive, Miami Beach, FL 33139",
            "latitude": 25.7907,
            "longitude": -80.1300,
            "price_per_night": 450.00,
            "cleaning_fee": 100.00,
            "bedrooms": 3,
            "beds": 4,
            "bathrooms": 2,
            "max_guests": 6,
            "category": categories.get("Beachfront"),
            "amenities": ["WiFi", "Kitchen", "Pool", "Parking", "BBQ", "Washer", "Dryer"],
            "images": [
                {"url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800", "alt_text": "Beach view", "is_primary": True, "order": 0},
                {"url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "alt_text": "Private pool", "is_primary": False, "order": 1},
                {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "alt_text": "Living room", "is_primary": False, "order": 2},
            ]
        },
        {
            "title": "Cozy Mountain Cabin",
            "description": "Escape to this charming mountain cabin surrounded by nature. Perfect for hiking enthusiasts and those seeking peace and tranquility. Features a fireplace and stunning mountain views.",
            "property_type": PropertyType.CABIN,
            "location_country": "United States",
            "location_city": "Aspen",
            "location_address": "789 Mountain Road, Aspen, CO 81611",
            "latitude": 39.1911,
            "longitude": -106.8175,
            "price_per_night": 300.00,
            "cleaning_fee": 75.00,
            "bedrooms": 2,
            "beds": 3,
            "bathrooms": 1,
            "max_guests": 4,
            "category": categories.get("Cabins"),
            "amenities": ["WiFi", "Kitchen", "Heating", "Parking", "BBQ"],
            "images": [
                {"url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800", "alt_text": "Cabin exterior", "is_primary": True, "order": 0},
                {"url": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800", "alt_text": "Cozy interior", "is_primary": False, "order": 1},
                {"url": "https://images.unsplash.com/photo-1520984032042-162d526883e0?w=800", "alt_text": "Fireplace", "is_primary": False, "order": 2},
            ]
        },
        {
            "title": "Historic Castle Suite",
            "description": "Experience luxury in this authentic 16th-century castle. Stay in beautifully restored suites with original features and modern amenities. A truly unique and unforgettable experience.",
            "property_type": PropertyType.OTHER,
            "location_country": "United Kingdom",
            "location_city": "Edinburgh",
            "location_address": "101 Castle Hill, Edinburgh EH1 2NG",
            "latitude": 55.9486,
            "longitude": -3.1999,
            "price_per_night": 600.00,
            "cleaning_fee": 150.00,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2,
            "max_guests": 4,
            "category": categories.get("Castles"),
            "amenities": ["WiFi", "Heating", "TV", "Gym"],
            "images": [
                {"url": "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800", "alt_text": "Castle exterior", "is_primary": True, "order": 0},
                {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt_text": "Luxury suite", "is_primary": False, "order": 1},
            ]
        },
        {
            "title": "Tropical Paradise Bungalow",
            "description": "Wake up to paradise in this stunning overwater bungalow. Crystal clear waters, white sand beaches, and unforgettable sunsets. The ultimate tropical getaway.",
            "property_type": PropertyType.OTHER,
            "location_country": "Maldives",
            "location_city": "Malé",
            "location_address": "Resort Island, Malé 20000",
            "latitude": 3.2028,
            "longitude": 73.2207,
            "price_per_night": 800.00,
            "cleaning_fee": 200.00,
            "bedrooms": 1,
            "beds": 1,
            "bathrooms": 1,
            "max_guests": 2,
            "category": categories.get("Tropical"),
            "amenities": ["WiFi", "Pool", "Hot Tub", "Kitchen", "Air Conditioning"],
            "images": [
                {"url": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800", "alt_text": "Overwater bungalow", "is_primary": True, "order": 0},
                {"url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800", "alt_text": "Beach view", "is_primary": False, "order": 1},
            ]
        },
    ]
    
    for listing_data in listings_data:
        existing = db.query(Listing).filter(Listing.title == listing_data["title"]).first()
        if existing:
            continue

        category = listing_data.pop("category")
        amenity_names = listing_data.pop("amenities")
        images_data = listing_data.pop("images")
        
        listing = Listing(
            **listing_data,
            host_id=host.id,
            category_id=category.id if category else None,
        )
        db.add(listing)
        db.flush()
        
        # Add images
        for img_data in images_data:
            image = ListingImage(listing_id=listing.id, **img_data)
            db.add(image)
        
        # Add amenities
        for amenity_name in amenity_names:
            amenity = amenities.get(amenity_name)
            if amenity:
                listing_amenity = ListingAmenity(
                    listing_id=listing.id,
                    amenity_id=amenity.id,
                )
                db.add(listing_amenity)
    
    db.commit()
    print("[ok] Listings seeded")


def seed_bookings(db: Session):
    """Seed bookings."""
    guest = db.query(User).filter(User.email == "jane@example.com").first()
    listing = db.query(Listing).first()
    
    if not guest or not listing:
        print("[error] Guest or listing not found")
        return
    
    bookings_data = [
        {
            "guest_id": guest.id,
            "listing_id": listing.id,
            "check_in": datetime.now() + timedelta(days=30),
            "check_out": datetime.now() + timedelta(days=35),
            "num_guests": 2,
            "total_price": 1250.00,
            "cleaning_fee": 50.00,
            "service_fee": 150.00,
            "status": BookingStatus.CONFIRMED,
        },
        {
            "guest_id": guest.id,
            "listing_id": listing.id,
            "check_in": datetime.now() - timedelta(days=60),
            "check_out": datetime.now() - timedelta(days=55),
            "num_guests": 2,
            "total_price": 1250.00,
            "cleaning_fee": 50.00,
            "service_fee": 150.00,
            "status": BookingStatus.COMPLETED,
        },
    ]
    
    for booking_data in bookings_data:
        existing = db.query(Booking).filter(
            Booking.guest_id == booking_data["guest_id"],
            Booking.listing_id == booking_data["listing_id"],
            Booking.check_in == booking_data["check_in"]
        ).first()
        
        if not existing:
            booking = Booking(**booking_data)
            db.add(booking)
    
    db.commit()
    print("[ok] Bookings seeded")


def seed_reviews(db: Session):
    """Seed reviews."""
    guest = db.query(User).filter(User.email == "jane@example.com").first()
    listing = db.query(Listing).first()
    
    if not guest or not listing:
        print("[error] Guest or listing not found")
        return
    
    reviews_data = [
        {
            "user_id": guest.id,
            "listing_id": listing.id,
            "rating": 5,
            "comment": "Absolutely amazing place! The views were breathtaking and the host was incredibly responsive. Would definitely stay again!",
            "cleanliness": 5,
            "communication": 5,
            "check_in": 5,
            "accuracy": 5,
            "location": 5,
            "value": 5,
        },
    ]
    
    for review_data in reviews_data:
        existing = db.query(Review).filter(
            Review.user_id == review_data["user_id"],
            Review.listing_id == review_data["listing_id"]
        ).first()
        
        if not existing:
            review = Review(**review_data)
            db.add(review)
    
    db.commit()
    print("[ok] Reviews seeded")


def seed_wishlists(db: Session):
    """Seed wishlists."""
    guest = db.query(User).filter(User.email == "jane@example.com").first()
    listing = db.query(Listing).first()
    
    if not guest or not listing:
        print("[error] Guest or listing not found")
        return
    
    wishlist = db.query(Wishlist).filter(
        Wishlist.user_id == guest.id,
        Wishlist.name == "My Favorites",
    ).first()

    if not wishlist:
        wishlist = Wishlist(
            user_id=guest.id,
            name="My Favorites",
            description="Places I want to visit",
        )
        db.add(wishlist)
        db.flush()

    existing_item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.listing_id == listing.id,
    ).first()

    if existing_item:
        db.commit()
        print("[ok] Wishlists seeded")
        return
    
    wishlist_item = WishlistItem(
        wishlist_id=wishlist.id,
        listing_id=listing.id,
        note="Must visit this place!",
    )
    db.add(wishlist_item)
    
    db.commit()
    print("[ok] Wishlists seeded")


def main():
    """Main seeding function."""
    print("Starting database seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        seed_categories(db)
        seed_amenities(db)
        seed_users(db)
        seed_listings(db)
        seed_bookings(db)
        seed_reviews(db)
        seed_wishlists(db)
        
        print("\n[ok] Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n[error] Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
