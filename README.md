# TVSP - The Very Special Project

A comprehensive relationship coaching and social platform built with React Native and FastAPI.

## 🚀 Features

### Frontend (React Native/Expo)
- **Authentication System**: Secure login/registration with JWT tokens
- **Social Feed**: Real-time social interactions and posts
- **AI Coaching**: Communication skills training and relationship guidance
- **Joint Sessions**: Partner-based relationship exercises
- **Solo Preparation**: Individual relationship preparation tools
- **Real-time Notifications**: WebSocket-based real-time updates

### Backend (FastAPI)
- **User Management**: Registration, authentication, and profile management
- **JWT Authentication**: Secure token-based authentication
- **Real-time APIs**: WebSocket support for live features
- **Microservices Architecture**: Modular, scalable design

## 📁 Project Structure

```
TVSP/
├── parity-app/                 # React Native frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/           # Main app screens
│   │   ├── services/          # API and business logic
│   │   ├── contexts/          # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── navigation/        # Navigation configuration
│   ├── android/               # Android-specific code
│   └── package.json           # Frontend dependencies
├── parity-backend-api/        # FastAPI backend
│   ├── api/                   # API routes
│   ├── core/                  # Core functionality
│   ├── models/                # Data models
│   └── schemas/               # Pydantic schemas
├── docker-compose.yml         # Full stack deployment
├── docker-compose.backend.yml # Backend only
├── docker-compose.frontend.yml # Frontend only
└── README.md                  # This file
```

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for routing
- **Axios** for HTTP requests
- **Socket.io** for real-time features
- **AsyncStorage** for local data persistence
- **Linear Gradient** for UI styling

### Backend
- **FastAPI** for API framework
- **JWT** for authentication
- **bcrypt** for password hashing
- **Pydantic** for data validation
- **Uvicorn** as ASGI server

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.11+
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Backend Setup
```bash
cd parity-backend-api
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd parity-app
npm install
npx expo start
```

### Using Batch Scripts (Windows)
```bash
# Start backend
start-backend.bat

# Start frontend (in another terminal)
start-frontend.bat
```

## 📱 Mobile Development

### Running on Physical Device
1. Install Expo Go app on your phone
2. Start the frontend: `npx expo start --tunnel`
3. Scan the QR code with Expo Go
4. Ensure your phone and computer are on the same network

### Android Development
```bash
cd parity-app
npx expo run:android
```

## 🔧 Configuration

### Backend Configuration
- Edit `parity-backend-api/core/config.py` for settings
- Environment variables can be set in `.env` file

### Frontend Configuration
- Edit `parity-app/app.json` for Expo configuration
- Edit `parity-app/metro.config.js` for Metro bundler settings

## 🐳 Docker Deployment

### Full Stack
```bash
docker-compose up --build
```

### Backend Only
```bash
docker-compose -f docker-compose.backend.yml up --build
```

## 🔐 Authentication

The app uses JWT-based authentication:
- Users register with email/password
- Passwords are hashed with bcrypt
- JWT tokens are used for API authentication
- Tokens expire after 15 minutes (configurable)

## 📊 API Endpoints

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/me` - Get current user info

### Health Check
- `GET /health` - Backend health status

## 🚧 Development Status

### ✅ Completed
- User authentication system
- Real data storage (in-memory)
- JWT token management
- Frontend-backend integration
- Mobile app deployment
- Error handling and logging

### 🔄 In Progress
- Database integration (PostgreSQL)
- Microservices implementation
- Real-time features
- AI coaching integration

### 📋 Planned
- Social platform features
- Relationship analytics
- Content moderation
- Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
1. Check the logs in the terminal
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check the backend health endpoint

## 🔄 Recent Updates

- ✅ Removed all mock data
- ✅ Implemented real user authentication
- ✅ Fixed JWT token validation
- ✅ Added proper error handling
- ✅ Mobile app working on physical devices
- ✅ Backend running with real data storage

---

**TVSP** - Building better relationships through technology 💕
