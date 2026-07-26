# Deployment Guide

This project should stay on free or open-source tooling.

## Frontend: Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set root directory to `frontend`.
4. Set environment variable:

```text
NEXT_PUBLIC_API_URL=https://your-backend-url
```

5. Build command:

```text
npm run build
```

The frontend also includes:

```text
frontend/vercel.json
frontend/.env.example
```

## Backend: Render Web Service

The repository includes a root Render Blueprint:

```text
render.yaml
```

Render's official blueprint docs expect this file in the Git repository root. The blueprint configures:

- `rootDir: backend`
- Python runtime
- health check at `/health`
- Alembic migrations before startup
- seed script before startup

Manual setup values, if not using the blueprint:

Build command:

```text
pip install -r requirements.txt
```

Start command:

```text
alembic upgrade head && python scripts/seed_db.py && uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```text
DATABASE_URL=sqlite:///./airbnb.db
SECRET_KEY=<long-random-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=["https://your-vercel-app.vercel.app","http://localhost:3000"]
```

## Production Notes

- SQLite is acceptable for this assignment and portfolio scope, but a production marketplace should use PostgreSQL.
- Replace query-param mock auth with real auth before production use.
- Add persistent media storage before enabling real uploads.
- Confirm current free-tier limitations before deploying, because platform policies can change.
