# API Documentation

Base URL:

```text
http://127.0.0.1:8000/api/v1
```

Interactive docs:

```text
http://127.0.0.1:8000/docs
```

## Listings

### List Listings

```http
GET /listings/
```

Query params:

- `skip`
- `limit`
- `category_id`
- `location`
- `min_price`
- `max_price`
- `min_guests`
- `property_type`
- `sort_by`: `recommended`, `price_asc`, `price_desc`, `newest`

### Listing Detail

```http
GET /listings/{listing_id}
```

Returns listing data with host, category, amenities, images, rating summary, and reviews.

### Host Listings

```http
GET /listings/host/{host_id}
```

### Create Listing

```http
POST /listings/?host_id=1
```

### Update Listing

```http
PUT /listings/{listing_id}?host_id=1
```

### Delete Listing

```http
DELETE /listings/{listing_id}?host_id=1
```

## Categories And Amenities

```http
GET /listings/categories/
GET /listings/amenities/
```

## Bookings

### Create Booking

```http
POST /bookings/?guest_id=2
```

Validates:

- checkout after check-in
- listing availability
- overlapping confirmed/pending bookings

### Guest Bookings

```http
GET /bookings/?guest_id=2
```

### Cancel Booking

```http
POST /bookings/{booking_id}/cancel?guest_id=2
```

## Wishlists

### User Wishlists

```http
GET /wishlists/?user_id=2
```

### Create Wishlist

```http
POST /wishlists/?user_id=2
```

### Add Listing

```http
POST /wishlists/{wishlist_id}/items?user_id=2
```

### Remove Listing

```http
DELETE /wishlists/{wishlist_id}/items/{listing_id}?user_id=2
```
