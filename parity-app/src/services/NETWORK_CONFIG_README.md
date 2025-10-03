# Universal Network Configuration System

This system automatically detects and configures API endpoints for all services, eliminating the need to hardcode IP addresses or URLs.

## 🚀 **Features**

- **Automatic Endpoint Detection**: Scans common development IPs and ports
- **Platform-Aware**: Works on iOS, Android, simulators, and physical devices
- **Service-Specific**: Manages endpoints for all microservices
- **Caching**: Remembers working endpoints for faster startup
- **Fallback Support**: Graceful degradation when services are unavailable
- **Production Ready**: Seamlessly switches to production URLs

## 📁 **Files**

- `NetworkService.js` - Core network detection and management
- `ServiceConfig.js` - Universal service configuration
- `AICoachingService.js` - Example service using dynamic endpoints
- `SocialService.js` - Example service using dynamic endpoints

## 🔧 **How It Works**

### 1. **Automatic Detection**
```javascript
// The system automatically detects working endpoints
const endpoints = await NetworkService.init();
// Returns: {
//   backend: 'http://192.168.12.246:8000',
//   aiCoaching: 'http://192.168.12.246:8001',
//   socialAffirmation: 'http://192.168.12.246:3000',
//   // ... etc
// }
```

### 2. **Service-Specific Usage**
```javascript
// Any service can get its endpoint dynamically
const aiCoachingEndpoint = await NetworkService.getServiceEndpoint('aiCoaching');
const socialEndpoint = await NetworkService.getServiceEndpoint('socialAffirmation');
```

### 3. **Universal Service Creation**
```javascript
// Create axios instances for any service
const axios = await ServiceConfig.createAxiosInstance('backend');
const authenticatedAxios = await ServiceConfig.createAuthenticatedAxiosInstance('aiCoaching', token);
```

## 🌐 **Supported Services**

| Service | Port | Description |
|---------|------|-------------|
| `backend` | 8000 | Main API (users, auth, partners) |
| `aiCoaching` | 8001 | AI coaching and recommendations |
| `socialAffirmation` | 4000 | Social features and posts |
| `relationshipAnalytics` | 8002 | Relationship insights and analytics |
| `contentModeration` | 8003 | Content moderation and safety |
| `notificationService` | 8004 | Push notifications and alerts |

## 🔍 **Detection Process**

### Development Mode
1. **Scans common IPs**: `localhost`, `127.0.0.1`, `10.0.2.2` (Android emulator)
2. **Tests local network IPs**: `192.168.x.x`, `10.0.x.x` ranges
3. **Tests each service port**: 8000, 8001, 3000, 8002, 8003, 8004
4. **Caches working endpoints**: Stores in AsyncStorage for future use

### Production Mode
- Uses predefined production URLs
- No detection needed

## 📱 **Platform Support**

- **iOS Simulator**: `http://localhost:PORT`
- **Android Emulator**: `http://10.0.2.2:PORT`
- **Physical Devices**: `http://YOUR_IP:PORT`
- **Production**: `https://api.parity-app.com`

## 🛠 **Usage Examples**

### Basic Service Usage
```javascript
import AICoachingService from '../services/AICoachingService';

// Get coaching recommendations
const result = await AICoachingService.getCoachingRecommendations(userId, token);
if (result.success) {
  console.log('Recommendations:', result.data);
}
```

### Custom Service Creation
```javascript
import ServiceConfig from '../services/ServiceConfig';

// Create a custom service
const customAxios = await ServiceConfig.createAxiosInstance('backend');
const response = await customAxios.get('/custom-endpoint');
```

### Service Status Checking
```javascript
import NetworkService from '../services/NetworkService';

// Check which services are available
const status = await NetworkService.getServiceStatus();
console.log('Service Status:', status);
// Returns: { backend: true, aiCoaching: false, socialAffirmation: true, ... }
```

## 🔄 **Refreshing Endpoints**

If your IP changes or services move:

```javascript
// Refresh all endpoints
await NetworkService.refreshEndpoints();

// Or refresh via ServiceConfig
await ServiceConfig.refreshEndpoints();
```

## 🐛 **Debugging**

```javascript
// Get detailed network information
const networkInfo = NetworkService.getNetworkInfo();
console.log('Network Info:', networkInfo);
```

## ✅ **Benefits**

1. **No More Hardcoded IPs**: Works on any network automatically
2. **Team-Friendly**: Everyone's device works without configuration
3. **Environment-Aware**: Different endpoints for dev/staging/prod
4. **Service Isolation**: Each microservice has its own endpoint
5. **Caching**: Fast startup after initial detection
6. **Fallback**: Graceful handling when services are down
7. **Future-Proof**: Easy to add new services or change ports

## 🚀 **Getting Started**

1. **Import the service you need**:
   ```javascript
   import AICoachingService from '../services/AICoachingService';
   ```

2. **Use it normally** - endpoint detection happens automatically:
   ```javascript
   const result = await AICoachingService.getCoachingSession(sessionId, token);
   ```

3. **That's it!** The system handles all the network configuration behind the scenes.

## 🔧 **Adding New Services**

1. **Add to NetworkService.js**:
   ```javascript
   this.endpoints = {
     // ... existing services
     newService: null,
   };
   ```

2. **Add port mapping**:
   ```javascript
   const servicePorts = {
     // ... existing services
     newService: 8005,
   };
   ```

3. **Create service file**:
   ```javascript
   import ServiceConfig from './ServiceConfig';
   
   class NewService {
     async getAxiosInstance(token = null) {
       return await ServiceConfig.createAxiosInstance('newService', token);
     }
   }
   ```

This system ensures your app works seamlessly across all devices and environments! 🎉
