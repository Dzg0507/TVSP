#!/usr/bin/env python3
"""
Parity API - User & Relationship Management
A robust FastAPI backend for managing users, authentication, and partner linking.

This is the main application entry point that brings together all the modules.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json

# from core import Base, engine  # Skip database for now
from api import users_router, partners_router

# Create FastAPI application
app = FastAPI(
    title="Parity API - User & Relationship Management",
    description="A robust FastAPI backend for managing users, authentication, and partner linking.",
    version="1.0.0",
)

# Add CORS middleware
# CRITICAL: Since allow_credentials=True is set, the wildcard (*) 
# for origins is invalid and causes the browser to reject the preflight OPTIONS request
origins = [
    "http://localhost:8081",  # Expo/React Native bundler
    "http://localhost:8082",  # Alternative port
    "http://localhost",       # Standard localhost
    "http://127.0.0.1",       # Standard loopback IP
    "http://192.168.12.246",  # LAN IP for mobile devices
    "http://192.168.12.246:8000",  # LAN IP with port
    "http://localhost:8000",  # Backend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # Now using explicit list
    allow_credentials=True,    # Allows Authorization headers
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    
    # Log request body for POST requests
    if request.method == "POST":
        try:
            body = await request.body()
            if body:
                print(f"Request body: {body.decode('utf-8')}")
        except Exception as e:
            print(f"Error reading request body: {e}")
    
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

# Include API routers
app.include_router(users_router)
app.include_router(partners_router)

# Root endpoints
@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint."""
    return {"status": "Parity API is running."}


@app.get("/health", tags=["Health Check"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


# Startup event to create database tables
# @app.on_event("startup")
# def on_startup():
#     """Create database tables on application startup."""
#     Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
