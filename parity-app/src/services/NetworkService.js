import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NetworkService {
  constructor() {
    this.baseURL = null;
    this.isInitialized = false;
    this.endpoints = {
      backend: null,
      aiCoaching: null,
      socialAffirmation: null,
      relationshipAnalytics: null,
      contentModeration: null,
      notificationService: null,
    };
  }

  async init() {
    if (this.isInitialized) {
      return this.endpoints;
    }

    try {
      console.log('🔵 [NETWORK SERVICE] Clearing cache - forcing fresh detection');
      await AsyncStorage.removeItem('api_endpoints');

      const detectedEndpoints = await this.detectAllEndpoints();

      await AsyncStorage.setItem('api_endpoints', JSON.stringify(detectedEndpoints));

      this.endpoints = detectedEndpoints;
      this.baseURL = this.endpoints.backend;
      this.isInitialized = true;

      console.log('🟢 [NETWORK SERVICE] All API endpoints detected and cached:', detectedEndpoints);
      return this.endpoints;
    } catch (error) {
      console.error('🔴 [NETWORK SERVICE] Error detecting API endpoints:', error);
      this.endpoints = this.getFallbackEndpoints();
      this.baseURL = this.endpoints.backend;
      this.isInitialized = true;
      return this.endpoints;
    }
  }

  async detectAllEndpoints() {
    console.log('🔵 [NETWORK SERVICE] Detecting all API endpoints...');
    console.log('🔵 [NETWORK SERVICE] Platform:', Platform.OS);
    console.log('🔵 [NETWORK SERVICE] Is development:', __DEV__);
    console.log('🔵 [NETWORK SERVICE] Constants.manifest:', Constants.manifest);
    console.log('🔵 [NETWORK SERVICE] Constants.manifest2:', Constants.manifest2);
    console.log('🔵 [NETWORK SERVICE] Constants.expoConfig:', Constants.expoConfig);
    console.log('🔵 [NETWORK SERVICE] Running in Expo Go:', this.isExpoGo());

    if (__DEV__) {
      // Expo Go on Android: prioritize LAN IP over 10.0.2.2
      let devBaseURLs;

           if (Platform.OS === 'android' && this.isExpoGo()) {
             devBaseURLs = [
               'http://192.168.12.246', // Use correct LAN IP for physical device with Expo Go
               'http://192.168.134.197', // fallback
               'http://localhost',
               'http://127.0.0.1',
               'http://10.0.2.2', // emulator fallback
             ];
      } else if (Platform.OS === 'android') {
        devBaseURLs = [
          'http://10.0.2.2',
          'http://192.168.12.246',
          'http://localhost',
          'http://127.0.0.1',
        ];
      } else {
        // Web or others - prioritize localhost for web development
        devBaseURLs = [
          'http://localhost',
          'http://127.0.0.1',
          'http://192.168.12.246',
          'http://10.0.2.2',
        ];
      }

      // Add common development IPs
      const commonDevIPs = [
        '192.168.1.100', '192.168.1.101', '192.168.1.102',
        '192.168.0.100', '192.168.0.101', '192.168.0.102',
        '10.0.0.100', '10.0.0.101', '10.0.0.102',
      ];

      commonDevIPs.forEach(ip => {
        devBaseURLs.push(`http://${ip}`);
      });

      console.log('🔵 [NETWORK SERVICE] Testing development base URLs...');
      console.log('🔵 [NETWORK SERVICE] URLs to test:', devBaseURLs);

      // First, quickly test just the backend for each base URL
      for (const baseURL of devBaseURLs) {
        try {
          console.log(`🔵 [NETWORK SERVICE] Testing backend at: ${baseURL}:8000`);
          const backendURL = `${baseURL}:8000`;
          const isBackendReachable = await this.testEndpoint(backendURL);
          
          if (isBackendReachable) {
            console.log('🟢 [NETWORK SERVICE] Found working backend at:', backendURL);
            // Return just the backend for now, other services can be detected later
            return {
              backend: backendURL,
              aiCoaching: null,
              socialAffirmation: null,
              relationshipAnalytics: null,
              contentModeration: null,
              notificationService: null,
            };
          } else {
            console.log('🔴 [NETWORK SERVICE] Backend not reachable at:', backendURL);
          }
        } catch (error) {
          console.log('🔴 [NETWORK SERVICE] Backend test failed for:', baseURL, error.message);
        }
      }
    }

    console.log('🔵 [NETWORK SERVICE] Using production API endpoints');
    return this.getProductionEndpoints();
  }

  isExpoGo() {
    // Expo Go detection - multiple methods for better detection
    try {
      // Method 1: Check Constants.manifest (older Expo versions)
      if (Constants.manifest && Constants.manifest.packagerOpts) {
        return true;
      }
      
      // Method 2: Check Constants.manifest2 (newer Expo versions)
      if (Constants.manifest2 && Constants.manifest2.extra && Constants.manifest2.extra.expoClient) {
        return true;
      }
      
      // Method 3: Check if we're in Expo Go by looking for Expo-specific properties
      if (Constants.manifest && Constants.manifest.debuggerHost) {
        return true;
      }
      
      // Method 4: Check if we're running in Expo Go by looking at the bundle URL
      // In Expo Go, the bundle URL contains 'expo' or 'exp'
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // Check bundle URL from Constants
        const bundleUrl = Constants.manifest?.bundleUrl || Constants.manifest2?.bundleUrl;
        if (bundleUrl && (bundleUrl.includes('expo') || bundleUrl.includes('exp'))) {
          return true;
        }
      }
      
      // Method 5: Check if we're in Expo Go by looking for Expo-specific environment variables
      // This is a fallback method
      if (typeof __DEV__ !== 'undefined' && __DEV__ && Platform.OS === 'android') {
        // If we're in development on Android and Constants.manifest is null,
        // we're likely in Expo Go (since bare workflow would have a manifest)
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('🔵 [NETWORK SERVICE] Error detecting Expo Go:', error.message);
      return false;
    }
  }

  async testAllServices(baseURL) {
    const servicePorts = {
      backend: 8000,
      aiCoaching: 8001,
      socialAffirmation: 4000,
      relationshipAnalytics: 8002,
      contentModeration: 8003,
      notificationService: 8004,
    };

    const endpoints = {};

    for (const [service, port] of Object.entries(servicePorts)) {
      const url = `${baseURL}:${port}`;
      try {
        const isReachable = await this.testEndpoint(url);
        if (isReachable) {
          endpoints[service] = url;
          console.log(`🟢 [NETWORK SERVICE] ${service} service found at: ${url}`);
        } else {
          console.log(`🔴 [NETWORK SERVICE] ${service} service not reachable at: ${url}`);
        }
      } catch (error) {
        console.log(`🔴 [NETWORK SERVICE] ${service} service error at ${url}:`, error.message);
      }
    }

    return endpoints;
  }

  getFallbackEndpoints() {
s    // Use the computer's IP address for mobile devices
    const baseURL = 'http://192.168.12.246';

    return {
      backend: `${baseURL}:8000`,
      aiCoaching: `${baseURL}:8001`,
      socialAffirmation: `${baseURL}:4000`,
      relationshipAnalytics: `${baseURL}:8002`,
      contentModeration: `${baseURL}:8003`,
      notificationService: `${baseURL}:8004`,
    };
  }

  getProductionEndpoints() {
    return {
      backend: 'https://api.parity-app.com',
      aiCoaching: 'https://ai-coaching.parity-app.com',
      socialAffirmation: 'https://social.parity-app.com',
      relationshipAnalytics: 'https://analytics.parity-app.com',
      contentModeration: 'https://moderation.parity-app.com',
      notificationService: 'https://notifications.parity-app.com',
    };
  }

  async testEndpoint(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 1000); // Reduced timeout to 1 second

      console.log(`🔵 [NETWORK SERVICE] Testing endpoint: ${url}/health`);

      fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          clearTimeout(timeout);
          console.log(`🔵 [NETWORK SERVICE] Response from ${url}: ${response.status}`);
          if (response.ok) {
            resolve(true);
          } else {
            reject(new Error(`HTTP ${response.status}`));
          }
        })
        .catch(error => {
          clearTimeout(timeout);
          console.log(`🔴 [NETWORK SERVICE] Error testing ${url}: ${error.message}`);
          reject(error);
        });
    });
  }

  async getServiceEndpoint(serviceName) {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.endpoints[serviceName] || null;
  }

  async getAllEndpoints() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.endpoints;
  }

  async getAPIURL() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.baseURL;
  }

  async refreshEndpoints() {
    console.log('🔵 [NETWORK SERVICE] Refreshing all API endpoints...');
    await AsyncStorage.removeItem('api_endpoints');
    this.isInitialized = false;
    return await this.init();
  }

  async setEndpoints(endpoints) {
    console.log('🔵 [NETWORK SERVICE] Manually setting API endpoints:', endpoints);
    await AsyncStorage.setItem('api_endpoints', JSON.stringify(endpoints));
    this.endpoints = endpoints;
    this.baseURL = endpoints.backend;
    this.isInitialized = true;
    return endpoints;
  }

  async setKnownWorkingIP(ip) {
    console.log('🔵 [NETWORK SERVICE] Setting up with known working IP:', ip);
    const endpoints = {
      backend: `http://${ip}:8000`,
      aiCoaching: `http://${ip}:8001`,
      socialAffirmation: `http://${ip}:4000`,
      relationshipAnalytics: `http://${ip}:8002`,
      contentModeration: `http://${ip}:8003`,
      notificationService: `http://${ip}:8004`,
    };
    return await this.setEndpoints(endpoints);
  }

  getNetworkInfo() {
    return {
      platform: Platform.OS,
      isDev: __DEV__,
      isExpoGo: this.isExpoGo(),
      baseURL: this.baseURL,
      endpoints: this.endpoints,
      isInitialized: this.isInitialized,
    };
  }

  async isServiceAvailable(serviceName) {
    const endpoint = await this.getServiceEndpoint(serviceName);
    if (!endpoint) return false;

    try {
      return await this.testEndpoint(endpoint);
    } catch {
      return false;
    }
  }

  async getServiceStatus() {
    const status = {};
    for (const serviceName of Object.keys(this.endpoints)) {
      status[serviceName] = await this.isServiceAvailable(serviceName);
    }
    return status;
  }

  // Test connectivity to a specific service
  async testServiceConnectivity(serviceName) {
    console.log(`🔵 [NETWORK SERVICE] Testing connectivity to ${serviceName}...`);
    
    if (!this.isInitialized) {
      await this.init();
    }
    
    const endpoint = this.endpoints[serviceName];
    if (!endpoint) {
      console.log(`🔴 [NETWORK SERVICE] No endpoint found for ${serviceName}`);
      return false;
    }
    
    try {
      const isReachable = await this.testEndpoint(endpoint);
      console.log(`${isReachable ? '🟢' : '🔴'} [NETWORK SERVICE] ${serviceName} connectivity: ${isReachable ? 'SUCCESS' : 'FAILED'}`);
      return isReachable;
    } catch (error) {
      console.log(`🔴 [NETWORK SERVICE] ${serviceName} connectivity test failed:`, error.message);
      return false;
    }
  }
}

export default new NetworkService();
