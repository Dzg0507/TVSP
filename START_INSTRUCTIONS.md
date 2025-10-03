# Parity App - Start Instructions

## Quick Start (Recommended)

### 1. Start Backend (Separate Terminal)
```bash
# Option 1: Use the batch file
start-backend.bat

# Option 2: Manual command
cd parity-backend-api
python main.py
```

### 2. Start Frontend (New Terminal)
```bash
# Option 1: Use the batch file
start-frontend.bat

# Option 2: Manual command
cd parity-app
npm start
```

## Why Separate?

The backend and frontend are now running in separate processes to prevent:
- Port conflicts
- Process hanging issues
- Resource conflicts
- Easier debugging

## Backend Status
- ✅ Running on: http://localhost:8000
- ✅ Health check: http://localhost:8000/health
- ✅ API docs: http://localhost:8000/docs

## Frontend Status
- ✅ Running on: http://localhost:8081 (web)
- ✅ Mobile: Scan QR code with Expo Go app

## Troubleshooting

If backend hangs:
1. Kill all Python processes: `taskkill /f /im python.exe`
2. Restart backend: `start-backend.bat`

If frontend has issues:
1. Clear cache: `cd parity-app && npx expo start --clear`
2. Restart: `start-frontend.bat`
