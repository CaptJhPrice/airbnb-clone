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
- [x] Listings API with pagination parameters, search, category, price, guest, property-type filters
- [x] Sorting: recommended, price low-high, price high-low, newest
- [x] Booking API with price calculation and overlap prevention
- [x] Wishlist API
- [x] Reviews API
- [x] Mock authentication APIs and role data
- [~] Full auth role switching in frontend
  - Backend roles exist.
  - Frontend currently uses mock IDs for host and guest.
- [~] Availability management
  - Schema exists.
  - Dedicated host availability UI/API workflow is still pending.

## Frontend

- [x] Airbnb-style responsive navbar and sticky search
- [x] Category navigation
- [x] Home listing grid
- [x] Search by location and guests
- [x] Filter modal: price, property type, sorting
- [x] Listing cards with hover effects and wishlist action
- [x] Listing detail page with gallery, amenities, reviews, host summary
- [x] Floating booking card
- [x] Booking form validation with React Hook Form and Zod
- [x] Booking persistence via API
- [x] Wishlist page
- [x] Trips page with upcoming, past, cancelled tabs and cancel action
- [x] Host dashboard with listing create, edit, delete and stats
- [x] Loading skeletons, error page, not-found page, empty states, toasts
- [x] Responsive desktop/tablet/mobile layouts for implemented pages
- [~] Shadcn UI setup
  - `components.json` exists and design-system patterns are in place.
  - Dedicated shadcn-generated primitives can be expanded later.
- [~] Hero section
  - Current Airbnb-like home emphasizes sticky search and listing grid.
  - A fuller first-viewport hero can be added if the assignment expects one.
- [ ] Dark mode bonus
- [ ] Map view with OpenStreetMap/Leaflet
- [ ] Infinite scrolling
- [~] Pagination
  - Backend supports `skip` and `limit`.
  - Frontend pagination/infinite-scroll UI pending.
- [~] Amenities/rating filter
  - Amenities and ratings exist.
  - Frontend filter controls pending.

## Host Dashboard

- [x] Create listings
- [x] Edit listings
- [x] Delete listings
- [x] View basic statistics
- [~] View bookings
  - Trips exist for guest.
  - Host booking management view pending.
- [~] CRUD photos
  - Primary image URL can be created/edited with listing form.
  - Dedicated multi-photo manager pending.
- [~] CRUD amenities
  - Backend supports amenity relationships.
  - Dedicated dashboard amenity picker/manager pending.
- [ ] CRUD availability calendar

## Booking Logic

- [x] Prevent invalid checkout-before-check-in dates
- [x] Prevent overlapping reservations
- [x] Persist bookings
- [x] Cleaning fee and service fee
- [~] Taxes
  - UI says total before taxes.
  - Dedicated tax calculation pending.
- [x] Guest count validation
- [x] Past date validation
- [~] Availability calendar / blocked dates
  - Booking overlap prevention exists.
  - Dedicated availability table checks pending.

## Testing

- [x] Backend pytest suite
- [x] API smoke and behavior tests
- [x] Frontend Vitest setup
- [x] Frontend utility/component tests
- [x] Manual smoke checklist
- [~] Broader frontend interaction tests

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
- [~] Screenshots
  - Assets folder exists.
  - Screenshots should be captured after final UI pass.

## Deployment

- [x] Render blueprint config
- [x] Vercel config
- [x] Environment examples
- [x] Production build verified locally
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Connect production frontend to production backend
- [ ] Verify deployed production URLs

## Current Blockers

- GitHub push requires account authentication in browser.
- Actual Render/Vercel deployment requires GitHub remote and service login.

## Recommended Next Milestone

Build the host bookings/availability management screen.
