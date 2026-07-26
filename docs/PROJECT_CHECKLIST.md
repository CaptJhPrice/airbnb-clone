# Project Checklist

Status legend:

- `[x]` complete
- `[~]` partially complete
- `[ ]` pending / blocked by external account step

## Foundation

- [x] Audit local system tools used by this repo: Python, Node/npm, Git
- [x] Create production folder structure: `frontend`, `backend`, `docs`, `assets`, `database`, `scripts`, `.github`
- [x] Initialize backend with FastAPI, SQLAlchemy, Alembic, Pydantic
- [x] Initialize frontend with Next.js, TypeScript, App Router, Tailwind CSS
- [x] Add strict free/open-source stack only
- [x] Add root Git repository and milestone commits
- [~] Push to GitHub
  - Local Git is ready.
  - GitHub CLI is installed.
  - Blocked until GitHub browser authentication is completed.

## Backend

- [x] Database schema for users, listings, categories, amenities, images, availability, bookings, reviews, wishlists
- [x] Alembic migration
- [x] Seed realistic sample data
- [x] Idempotent deployment-safe seed script
- [x] Listings API with pagination parameters, search, category, price, guest, property-type, amenity, and rating filters
- [x] Sorting: recommended, price low-high, price high-low, newest
- [x] Booking API with price calculation, tax breakdown, and overlap/availability prevention
- [x] Availability API with date blocking and custom rate management
- [x] Multi-photo management API
- [x] Wishlist API
- [x] Reviews API
- [x] Mock authentication APIs and role data
- [x] Full auth role switching in frontend (Guest, Host, Admin persona toggle)
- [x] Availability management backend & CRUD workflows

## Frontend

- [x] Airbnb-style responsive navbar and sticky search
- [x] Category navigation
- [x] Home listing grid
- [x] Search by location and guests
- [x] Filter modal: price, property type, sorting, amenities, minimum rating
- [x] Listing cards with hover effects and wishlist action
- [x] Listing detail page with gallery, amenities, reviews, host summary
- [x] Floating booking card with tax breakdown calculation
- [x] Booking form validation with React Hook Form and Zod
- [x] Booking persistence via API
- [x] Wishlist page
- [x] Trips page with upcoming, past, cancelled tabs and cancel action
- [x] Host dashboard with listing create, edit, delete, stats, multi-photo manager, and amenity picker
- [x] Host Availability Calendar screen for date blocking & custom rates (`/host/availability`)
- [x] Map view with OpenStreetMap/Leaflet integration and floating toggle button
- [x] Pagination controls on home grid
- [x] User role persona switcher in header (Guest / Host / Admin)
- [x] Loading skeletons, error page, not-found page, empty states, toasts
- [x] Responsive desktop/tablet/mobile layouts for implemented pages
- [x] Shadcn UI design patterns

## Host Dashboard

- [x] Create listings
- [x] Edit listings
- [x] Delete listings
- [x] View basic statistics
- [x] View bookings
- [x] CRUD photos (MultiPhotoManager component & image API integration)
- [x] CRUD amenities (Amenity picker in listing form)
- [x] CRUD availability calendar (`/host/availability` page and AvailabilityCalendar component)

## Booking Logic

- [x] Prevent invalid checkout-before-check-in dates
- [x] Prevent overlapping reservations
- [x] Prevent bookings on host-blocked dates
- [x] Persist bookings
- [x] Cleaning fee, service fee (12%), and estimated tax (10%) calculation
- [x] Guest count validation
- [x] Past date validation
- [x] Availability calendar / blocked dates integration

## Testing

- [x] Backend pytest suite (12 passed tests covering CRUD, availability, filtering, photo management, bookings)
- [x] API smoke and behavior tests
- [x] Frontend Vitest setup (6 passed tests)
- [x] Frontend utility/component tests
- [x] Manual smoke checklist

## Documentation

- [x] README
- [x] Architecture documentation
- [x] Folder structure explanation
- [x] API documentation
- [x] Database schema documentation
- [x] ER diagram
- [x] Deployment guide
- [x] Testing guide
- [x] GitHub setup guide

## Deployment

- [x] Render blueprint config (`render.yaml`)
- [x] Vercel config (`frontend/vercel.json`)
- [x] Environment examples
- [x] Production build verified locally (Pytest, Vitest, Next.js build)
- [ ] Deploy backend to Render (requires external account login)
- [ ] Deploy frontend to Vercel (requires external account login)

## Current Status

All core full-stack features, host tools, calendar management, map integrations, filters, role switcher, tests, and production build checks are 100% complete and passing locally!
