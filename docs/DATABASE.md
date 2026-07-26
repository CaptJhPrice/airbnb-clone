# Database

The project uses SQLite for local development and portfolio deployment simplicity.

## Core Tables

- `users`: guest, host, and admin users
- `categories`: listing categories
- `amenities`: reusable amenity definitions
- `listings`: stay inventory owned by hosts
- `listing_images`: listing photo gallery
- `listing_amenities`: join table between listings and amenities
- `availability`: per-date availability and price overrides
- `bookings`: guest reservations
- `reviews`: guest reviews
- `wishlists`: user wishlist collections
- `wishlist_items`: listings saved to wishlists

## ER Diagram

```mermaid
erDiagram
  USERS ||--o{ LISTINGS : hosts
  USERS ||--o{ BOOKINGS : books
  USERS ||--o{ REVIEWS : writes
  USERS ||--o{ WISHLISTS : owns

  CATEGORIES ||--o{ LISTINGS : classifies
  LISTINGS ||--o{ LISTING_IMAGES : has
  LISTINGS ||--o{ LISTING_AMENITIES : has
  AMENITIES ||--o{ LISTING_AMENITIES : included_in
  LISTINGS ||--o{ AVAILABILITY : controls
  LISTINGS ||--o{ BOOKINGS : receives
  LISTINGS ||--o{ REVIEWS : receives
  WISHLISTS ||--o{ WISHLIST_ITEMS : contains
  LISTINGS ||--o{ WISHLIST_ITEMS : saved_as
```

## Seed Data

Seed data is in:

```text
backend/scripts/seed_db.py
```

It creates categories, amenities, users, listings, sample bookings, reviews, and wishlists.
