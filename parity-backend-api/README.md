# Parity Backend API

FastAPI backend for the Parity relationship communication app.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Set up PostgreSQL database:
   ```bash
   # Create database
   createdb parity_db
   ```

4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Features

- User registration and authentication
- JWT token-based security
- Partner linking system
- PostgreSQL database integration
- Comprehensive error handling

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
