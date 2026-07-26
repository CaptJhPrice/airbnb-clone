# Staybnb - Airbnb Clone

A full-stack Airbnb-inspired marketplace built with free and open-source tools. The project includes a FastAPI backend, SQLite database, Next.js App Router frontend, mock authentication flows, listings, booking validation, wishlists, host CRUD, filters, tests, and deployment-ready structure.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, React Query, Axios, React Hook Form, Zod, Framer Motion, React Hot Toast, Lucide Icons
- Backend: Python, FastAPI, SQLAlchemy, Alembic, Pydantic
- Database: SQLite
- Testing: Pytest, Vitest, React Testing Library
- Deployment targets: Vercel for frontend, Render or another free backend host for API

## Project Structure

```text
airbnb-clone/
  backend/      FastAPI app, SQLAlchemy models, Alembic migrations, tests
  frontend/     Next.js App Router app and UI components
  docs/         Architecture, API, database, and deployment docs
  assets/       Project assets and screenshots
  database/     Database notes/exports if needed
  scripts/      Project-level automation scripts
  .github/      Future CI workflows and GitHub templates
```

## Local Setup

### Backend

```powershell
cd E:\Projects\airbnb-clone\backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

API docs:

- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

### Frontend

```powershell
cd E:\Projects\airbnb-clone\frontend
npm run dev
```

Open http://localhost:3000.

## Test Commands

Backend:

```powershell
cd E:\Projects\airbnb-clone\backend
.\venv\Scripts\python.exe -m pytest
```

Frontend:

```powershell
cd E:\Projects\airbnb-clone\frontend
npm run lint
npm run test
npm run build
```

## GitHub

The root repository is initialized on `main`. See [docs/GITHUB.md](docs/GITHUB.md) for authentication, remote setup, and push commands.

## Deployment

Deployment config is included:

- `render.yaml` for the FastAPI backend
- `frontend/vercel.json` for the Next.js frontend
- `backend/Procfile` and `backend/start.sh` for Python web-service hosts

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Implemented Features

- Home page with Airbnb-style header, category navigation, search, filters, sort, and responsive listing grid
- Listing detail page with gallery, amenities, reviews, host summary, and booking card
- Booking validation for date order and backend overlap prevention
- Wishlist save/remove flow and wishlist page
- Host dashboard with listing create, edit, delete, and metrics
- Loading skeletons, 404 page, global error state, toast notifications
- Backend API tests and frontend unit/component tests

## Mock Users

Seed data includes:

- Host: `john@example.com`
- Guest: `jane@example.com`
- Admin: `admin@example.com`

The current UI uses mock IDs:

- Host ID `1`
- Guest ID `2`

## Notes

This is a portfolio/assignment clone. It recreates Airbnb-like product behavior and visual patterns from scratch without copying Airbnb source code.
