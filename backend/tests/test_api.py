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
    listing = create_temp_listing("Listing Detail Shape Test")
    try:
        response = client.get(f"/api/v1/listings/{listing['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == listing["id"]
        assert isinstance(data["host"], dict)
    finally:
        delete_listing(listing["id"])


def test_listing_crud_flow():
    created = create_temp_listing("CRUD Flow Test")
    listing_id = created["id"]

    try:
        get_res = client.get(f"/api/v1/listings/{listing_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "CRUD Flow Test"

        update_res = client.put(
            f"/api/v1/listings/{listing_id}?host_id=1",
            json={**listing_payload("Updated Title"), "amenity_ids": [1]},
        )
        assert update_res.status_code == 200
        assert update_res.json()["title"] == "Updated Title"
    finally:
        delete_listing(listing_id)

    deleted_res = client.get(f"/api/v1/listings/{listing_id}")
    assert deleted_res.status_code == 404


def test_photo_management_flow():
    created = create_temp_listing("Photo Flow Test")
    listing_id = created["id"]

    try:
        add_res = client.post(
            f"/api/v1/listings/{listing_id}/images?host_id=1",
            json={
                "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
                "alt_text": "Bedroom",
                "is_primary": False,
                "order": 1,
            },
        )
        assert add_res.status_code == 201
        new_image_id = add_res.json()["id"]

        del_res = client.delete(
            f"/api/v1/listings/{listing_id}/images/{new_image_id}?host_id=1"
        )
        assert del_res.status_code == 204
    finally:
        delete_listing(listing_id)


def test_availability_management_flow():
    created = create_temp_listing("Availability Flow Test")
    listing_id = created["id"]
    test_date = (date.today() + timedelta(days=10)).isoformat()

    try:
        set_res = client.post(
            f"/api/v1/availability/listings/{listing_id}?host_id=1",
            json={
                "start_date": test_date,
                "end_date": test_date,
                "is_available": False,
                "price": 250.0,
            },
        )
        assert set_res.status_code == 200
        avail_entries = set_res.json()
        assert len(avail_entries) == 1
        avail_id = avail_entries[0]["id"]

        get_res = client.get(
            f"/api/v1/availability/listings/{listing_id}?start_date={test_date}&end_date={test_date}"
        )
        assert get_res.status_code == 200
        items = get_res.json()
        assert len(items) == 1
        assert items[0]["is_available"] is False
        assert items[0]["price"] == 250.0

        del_res = client.delete(
            f"/api/v1/availability/{avail_id}?host_id=1"
        )
        assert del_res.status_code == 204
    finally:
        delete_listing(listing_id)


def test_booking_validation():
    created = create_temp_listing("Booking Validation Test")
    listing_id = created["id"]

    try:
        valid_payload = {
            "listing_id": listing_id,
            "check_in": (datetime.now() + timedelta(days=40)).isoformat(),
            "check_out": (datetime.now() + timedelta(days=43)).isoformat(),
            "num_guests": 2,
            "special_requests": "Quiet room please",
        }
        res = client.post("/api/v1/bookings/?guest_id=2", json=valid_payload)
        assert res.status_code == 201
        booking = res.json()
        assert booking["total_price"] > 0

        past_payload = {
            "listing_id": listing_id,
            "check_in": (datetime.now() - timedelta(days=5)).isoformat(),
            "check_out": (datetime.now() - timedelta(days=2)).isoformat(),
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
    created_listing = create_temp_listing("Booking Detail Test Listing")
    listing_id = created_listing["id"]

    try:
        booking_payload = {
            "listing_id": listing_id,
            "check_in": (datetime.now() + timedelta(days=70)).isoformat(),
            "check_out": (datetime.now() + timedelta(days=73)).isoformat(),
            "num_guests": 2,
        }
        booking_res = client.post("/api/v1/bookings/?guest_id=2", json=booking_payload)
        assert booking_res.status_code == 201
        booking_id = booking_res.json()["id"]

        detail = client.get(f"/api/v1/bookings/{booking_id}")
        assert detail.status_code == 200
        data = detail.json()
        assert isinstance(data["listing"], dict)
        assert isinstance(data["guest"], dict)

        listing_bookings = client.get(f"/api/v1/bookings/listing/{listing_id}?host_id=1")
        assert listing_bookings.status_code == 200
        assert isinstance(listing_bookings.json(), list)
    finally:
        delete_listing(listing_id)


def test_wishlist_response_shape():
    response = client.get("/api/v1/wishlists/?user_id=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "items" in data[0]
        assert isinstance(data[0]["items"], list)
