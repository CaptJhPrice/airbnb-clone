# Testing

## Backend

Run:

```powershell
cd E:\Projects\airbnb-clone\backend
.\venv\Scripts\python.exe -m pytest
```

Coverage currently includes:

- health endpoint
- listing filters and sorting
- invalid sort validation
- listing detail response shape
- host listing CRUD
- booking overlap prevention
- wishlist response shape

## Frontend

Run:

```powershell
cd E:\Projects\airbnb-clone\frontend
npm run lint
npm run test
npm run build
```

Coverage currently includes:

- currency/date/night utility behavior
- listing grid empty state
- listing grid card rendering

## Manual Smoke Checklist

- Home page renders listing cards.
- Search by location changes results.
- Filter modal applies price/type/sort filters.
- Listing detail page opens from a card.
- Booking form rejects invalid dates.
- Heart button saves/removes a listing.
- Wishlist page shows saved homes.
- Host dashboard creates, edits, and deletes a temporary listing.
