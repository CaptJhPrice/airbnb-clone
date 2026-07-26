# Deployment Guide

This project should stay on free or open-source tooling.

## Frontend: Vercel Free Tier

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

## Backend: Render Free Web Service

1. Create a new Render Web Service from the GitHub repository.
2. Set root directory to `backend`.
3. Build command:

```text
pip install -r requirements.txt
```

4. Start command:

```text
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Environment variables:

```text
DATABASE_URL=sqlite:///./airbnb.db
SECRET_KEY=<long-random-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Production Notes

- SQLite is acceptable for this assignment and portfolio scope, but a production marketplace should use PostgreSQL.
- Replace query-param mock auth with real auth before production use.
- Add persistent media storage before enabling real uploads.
- Confirm current free-tier limitations before deploying, because platform policies can change.
