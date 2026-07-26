import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, date
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def listing_payload(title="Temporary Test Apartment"):
    return {
        "title": title,
        "description": "A temporary listing created during automated API tests and removed immediately after the test completes.",
        "property_type": "apartment",
        "location_country": "India",
        "location_city": "Bengaluru",
        "location_address": "1 Test Street, Bengaluru",
        "price_per_night": 123,
        "cleaning_fee": 12,
        "service_fee": 0,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "max_guests": 2,
        "category_id": 1,
        "images": [
            {
                "url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
                "alt_text": "Temporary test apartment",
                "is_primary": True,
                "order": 0,
            }
        ],
        "amenity_ids": [1],
    }


def create_temp_listing(title="Temporary Test Apartment"):
    response = client.post("/api/v1/listings/?host_id=1", json=listing_payload(title))
    assert response.status_code == 201
    return response.json()


def delete_listing(listing_id):
    response = client.delete(f"/api/v1/listings/{listing_id}?host_id=1")
    assert response.status_code in {204, 404}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_listing_filters_and_sorting():
    ascending = client.get("/api/v1/listings/?sort_by=price_asc")
    assert ascending.status_code == 200
    prices = [item["price_per_night"] for item in ascending.json()]
    assert prices == sorted(prices)

    descending = client.get("/api/v1/listings/?sort_by=price_desc")
    assert descending.status_code == 200
    prices = [item["price_per_night"] for item in descending.json()]
    assert prices == sorted(prices, reverse=True)

    filtered = client.get("/api/v1/listings/?location=Miami&min_guests=2&max_price=500")
    assert filtered.status_code == 200
    assert all(item["location_city"] == "Miami" for item in filtered.json())


def test_amenities_and_rating_filter():
    response = client.get("/api/v1/listings/?amenity_ids=1&min_rating=4.0")
    assert response.status_code == 200
    listings = response.json()
    assert isinstance(listings, list)


def test_invalid_sort_is_rejected():
    response = client.get("/api/v1/listings/?sort_by=bad")
    assert response.status_code == 422


def test_listing_detail_shape():
    response = client.get("/api/v1/listings/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert isinstance(data["host"], dict)
    assert isinstance(data["amenities"], list)
    assert isinstance(data["reviews"], list)


def test_host_listing_crud():
    listing = create_temp_listing("Temporary CRUD Test Apartment")
    listing_id = listing["id"]

    try:
        update = client.put(
            f"/api/v1/listings/{listing_id}?host_id=1",
            json={"title": "Updated CRUD Test Apartment"},
        )
        assert update.status_code == 200
        assert update.json()["title"] == "Updated CRUD Test Apartment"
    finally:
        delete_listing(listing_id)


def test_availability_and_blocked_booking():
    listing = create_temp_listing("Temporary Availability Test Apartment")
    listing_id = listing["id"]
    start_date = (date.today() + timedelta(days=10)).isoformat()
    end_date = (date.today() + timedelta(days=11)).isoformat()

    try:
        # Set availability to blocked for 2 days
        batch = {
            "start_date": start_date,
            "end_date": end_date,
            "is_available": False,
            "price": 250.0
        }
        res = client.post(f"/api/v1/availability/listings/{listing_id}?host_id=1", json=batch)
        assert res.status_code == 200
        avail_items = res.json()
        assert len(avail_items) == 2

        # Query availability
        get_res = client.get(f"/api/v1/availability/listings/{listing_id}?start_date={start_date}&end_date={end_date}")
        assert get_res.status_code == 200
        assert len(get_res.json()) == 2

        # Attempt to book blocked dates should fail
        check_in = datetime.strptime(start_date, "%Y-%m-%d")
        check_out = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        booking_res = client.post("/api/v1/bookings/?guest_id=2", json={
            "listing_id": listing_id,
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "num_guests": 1,
        })
        assert booking_res.status_code == 400
        assert "not available" in booking_res.json()["detail"]
    finally:
        delete_listing(listing_id)


def test_photo_management():
    listing = create_temp_listing("Temporary Photo Test Apartment")
    listing_id = listing["id"]

    try:
        # Add photo
        photo_res = client.post(f"/api/v1/listings/{listing_id}/images?host_id=1", json={
            "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
            "alt_text": "Extra bedroom",
            "is_primary": False,
            "order": 1
        })
        assert photo_res.status_code == 201
        image_data = photo_res.json()
        image_id = image_data["id"]

        # Delete photo
        del_res = client.delete(f"/api/v1/listings/{listing_id}/images/{image_id}?host_id=1")
        assert del_res.status_code == 204
    finally:
        delete_listing(listing_id)


def test_booking_prevents_overlapping_reservations():
    listing = create_temp_listing("Temporary Booking Test Apartment")
    listing_id = listing["id"]
    check_in = datetime.now() + timedelta(days=45)
    check_out = check_in + timedelta(days=3)

    try:
        payload = {
            "listing_id": listing_id,
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "num_guests": 2,
        }
        first = client.post("/api/v1/bookings/?guest_id=2", json=payload)
        assert first.status_code == 201

        second = client.post("/api/v1/bookings/?guest_id=2", json=payload)
        assert second.status_code == 400
        assert "not available" in second.json()["detail"]
    finally:
        delete_listing(listing_id)


def test_booking_rejects_past_dates_and_too_many_guests():
    listing = create_temp_listing("Temporary Validation Test Apartment")
    listing_id = listing["id"]

    try:
        past_payload = {
            "listing_id": listing_id,
            "check_in": (datetime.now() - timedelta(days=2)).isoformat(),
            "check_out": (datetime.now() + timedelta(days=1)).isoformat(),
            "num_guests": 1,
        }
        past = client.post("/api/v1/bookings/?guest_id=2", json=past_payload)
        assert past.status_code == 400
        assert "past" in past.json()["detail"]

        guest_payload = {
            "listing_id": listing_id,
            "check_in": (datetime.now() + timedelta(days=60)).isoformat(),
            "check_out": (datetime.now() + timedelta(days=63)).isoformat(),
            "num_guests": 99,
        }
        too_many_guests = client.post("/api/v1/bookings/?guest_id=2", json=guest_payload)
        assert too_many_guests.status_code == 400
        assert "guest count" in too_many_guests.json()["detail"]
    finally:
        delete_listing(listing_id)


def test_booking_detail_and_listing_routes_are_serialized():
    detail = client.get("/api/v1/bookings/1")
    assert detail.status_code == 200
    data = detail.json()
    assert isinstance(data["listing"], dict)
    assert isinstance(data["guest"], dict)

    listing_bookings = client.get("/api/v1/bookings/listing/1?host_id=1")
    assert listing_bookings.status_code == 200
    assert isinstance(listing_bookings.json(), list)


def test_wishlist_response_shape():
    response = client.get("/api/v1/wishlists/?user_id=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "items" in data[0]
        assert isinstance(data[0]["items"], list)
