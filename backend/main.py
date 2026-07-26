from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, users, listings, bookings, reviews, wishlists

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Airbnb Clone API - A complete vacation rental platform"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["Authentication"])
app.include_router(users.router, prefix=settings.API_V1_STR + "/users", tags=["Users"])
app.include_router(listings.router, prefix=settings.API_V1_STR + "/listings", tags=["Listings"])
app.include_router(bookings.router, prefix=settings.API_V1_STR + "/bookings", tags=["Bookings"])
app.include_router(reviews.router, prefix=settings.API_V1_STR + "/reviews", tags=["Reviews"])
app.include_router(wishlists.router, prefix=settings.API_V1_STR + "/wishlists", tags=["Wishlists"])


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Airbnb Clone API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
