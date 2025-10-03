import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetworkService from './NetworkService';

const AUTH_TOKEN_KEY = '@parity_auth_token';
const USER_DATA_KEY = '@parity_user_data';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.listeners = {};
  }

  // Initialize auth service
  async init() {
    try {
      // Initialize network service first
      await NetworkService.init();
      console.log('🔵 [AUTH SERVICE] Network service initialized');
      
      // Check if we have working endpoints, if not, try localhost first
      const endpoints = await NetworkService.getAllEndpoints();
      if (!endpoints.backend) {
        console.log('🔵 [AUTH SERVICE] No backend endpoint found, trying localhost...');
        await NetworkService.setKnownWorkingIP('localhost');
        console.log('🔵 [AUTH SERVICE] Set localhost as fallback');
      }
      
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.emit('authenticated', { user: this.user, token: this.token });
        console.log('🔵 [AUTH SERVICE] Auth service initialized with existing session');
      } else {
        console.log('🔵 [AUTH SERVICE] Auth service initialized - no existing session');
      }
    } catch (error) {
      console.error('🔴 [AUTH SERVICE] Error initializing auth service:', error);
    }
  }

  // Login user
  async login(email, password) {
    console.log('🔵 [AUTH SERVICE] Starting login process...');
    console.log('🔵 [AUTH SERVICE] Email:', email);
    console.log('🔵 [AUTH SERVICE] Password length:', password ? password.length : 0);
    
    // Get dynamic API URL
    const apiURL = await NetworkService.getServiceEndpoint('backend');
    console.log('🔵 [AUTH SERVICE] API URL:', `${apiURL}/users/login`);
    
    // Test connectivity before making the request
    console.log('🔵 [AUTH SERVICE] Testing backend connectivity...');
    const isBackendReachable = await NetworkService.testServiceConnectivity('backend');
    if (!isBackendReachable) {
      console.log('🔴 [AUTH SERVICE] Backend is not reachable, aborting login');
      return { 
        success: false, 
        error: 'Backend service is not reachable. Please check your network connection and try again.' 
      };
    }
    console.log('🟢 [AUTH SERVICE] Backend connectivity confirmed, proceeding with login');
    
    try {
      // Create form data manually for React Native compatibility
      const formData = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      
      console.log('🔵 [AUTH SERVICE] Manual form data created for login');
      console.log('🔵 [AUTH SERVICE] Username field:', email);
      console.log('🔵 [AUTH SERVICE] Password field length:', password ? password.length : 0);
      console.log('🔵 [AUTH SERVICE] Form data string:', formData);
      console.log('🔵 [AUTH SERVICE] Form data size:', formData.length);

      const response = await fetch(`${apiURL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });
      
      const responseData = await response.json();
      console.log('🟢 [AUTH SERVICE] Login response received!');
      console.log('🟢 [AUTH SERVICE] Response status:', response.status);
      console.log('🟢 [AUTH SERVICE] Response data:', JSON.stringify(responseData, null, 2));

      if (responseData.access_token) {
        this.token = responseData.access_token;
        console.log('🟢 [AUTH SERVICE] Token received, fetching user profile...');
        
        // Get user data
        const userResponse = await fetch(`${apiURL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        const userData = await userResponse.json();
        console.log('🟢 [AUTH SERVICE] User profile response received!');
        console.log('🟢 [AUTH SERVICE] User profile status:', userResponse.status);
        console.log('🟢 [AUTH SERVICE] User profile data:', JSON.stringify(userData, null, 2));

        this.user = userData;

        // Store in AsyncStorage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, this.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(this.user));
        
        console.log('🟢 [AUTH SERVICE] User data stored in AsyncStorage');
        console.log('🟢 [AUTH SERVICE] Login process completed successfully!');

        this.emit('authenticated', { user: this.user, token: this.token });
        return { success: true, user: this.user, token: this.token };
      } else {
        console.log('🔴 [AUTH SERVICE] No access token in response!');
        return { success: false, error: 'No access token received' };
      }
    } catch (error) {
      console.error('🔴 [AUTH SERVICE] Login error occurred!');
      console.error('🔴 [AUTH SERVICE] Error type:', error.constructor.name);
      console.error('🔴 [AUTH SERVICE] Error message:', error.message);
      console.error('🔴 [AUTH SERVICE] Error response status:', error.status);
      console.error('🔴 [AUTH SERVICE] Error response data:', error.data);
      console.error('🔴 [AUTH SERVICE] Full error object:', error);
      
      // Handle specific error cases gracefully
      if (error.status === 401) {
        console.log('🔴 [AUTH SERVICE] 401 Unauthorized - Invalid credentials');
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        };
      } else if (error.status === 422) {
        console.log('🔴 [AUTH SERVICE] 422 Validation error');
        return { 
          success: false, 
          error: 'Please check your email format and ensure password is at least 8 characters.' 
        };
      }
      
      this.emit('error', error);
      return { success: false, error: error.message };
    }
  }

  // Register user
  async register(email, password) {
    console.log('🔵 [AUTH SERVICE] Starting registration process...');
    console.log('🔵 [AUTH SERVICE] Email:', email);
    console.log('🔵 [AUTH SERVICE] Password length:', password ? password.length : 0);
    
    // Get dynamic API URL
    const apiURL = await NetworkService.getServiceEndpoint('backend');
    console.log('🔵 [AUTH SERVICE] Raw API URL from NetworkService:', apiURL);
    const fullURL = `${apiURL}/users/register`;
    console.log('🔵 [AUTH SERVICE] Constructed full URL:', fullURL);
    
    // Test connectivity before making the request
    console.log('🔵 [AUTH SERVICE] Testing backend connectivity...');
    const isBackendReachable = await NetworkService.testServiceConnectivity('backend');
    if (!isBackendReachable) {
      console.log('🔴 [AUTH SERVICE] Backend is not reachable, aborting registration');
      return { 
        success: false, 
        error: 'Backend service is not reachable. Please check your network connection and try again.' 
      };
    }
    console.log('🟢 [AUTH SERVICE] Backend connectivity confirmed, proceeding with registration');
    
        // Skip POST test for now - backend is hanging on POST requests
        console.log('🔵 [AUTH SERVICE] Skipping POST test - backend has POST hanging issues');
    
    try {
      const requestData = { email, password };
      console.log('🔵 [AUTH SERVICE] Request data:', JSON.stringify(requestData, null, 2));
      
      console.log('🔵 [AUTH SERVICE] Making fetch request...');
      console.log('🔵 [AUTH SERVICE] URL:', fullURL);
      console.log('🔵 [AUTH SERVICE] Request data:', requestData);
      
      // Add cache-busting parameter to help debug
      const debugURL = `${fullURL}?t=${Date.now()}&debug=true`;
      console.log('🔵 [AUTH SERVICE] Debug URL with timestamp:', debugURL);
      console.log('🔵 [AUTH SERVICE] About to make fetch request to:', debugURL);
      console.log('🔵 [AUTH SERVICE] URL length:', debugURL.length);
      console.log('🔵 [AUTH SERVICE] URL includes /users/register:', debugURL.includes('/users/register'));
      
      // Use the detected API URL from NetworkService
      const baseURL = apiURL; // Use the detected URL instead of hardcoded localhost
      const endpoint = '/users/register';
      const timestamp = Date.now();
      const hardcodedURL = baseURL + endpoint + '?t=' + timestamp + '&debug=true';
      console.log('🔵 [AUTH SERVICE] Using detected API URL:', hardcodedURL);
      console.log('🔵 [AUTH SERVICE] Base URL:', baseURL);
      console.log('🔵 [AUTH SERVICE] Endpoint:', endpoint);
      
      // Try a completely different URL format to see if that helps
      const alternativeURL = baseURL + '/users/register?timestamp=' + timestamp + '&debug=true&test=1';
      console.log('🔵 [AUTH SERVICE] Alternative URL format:', alternativeURL);
      
      // Try a completely different approach - use a different variable name
      const finalRequestURL = alternativeURL;
      console.log('🔵 [AUTH SERVICE] Final request URL:', finalRequestURL);
      console.log('🔵 [AUTH SERVICE] Final URL includes /users/register:', finalRequestURL.includes('/users/register'));
      
      // Add a unique identifier to help track this request
      const uniqueId = Math.random().toString(36).substr(2, 9);
      console.log('🔵 [AUTH SERVICE] Unique request ID:', uniqueId);
      
      // Force a fresh request by adding cache-busting headers
      // TEMPORARY: Use hardcoded URL to test
      
      // Add a breakpoint-style log to see exactly what's happening
      console.log('🔵 [AUTH SERVICE] ===== ABOUT TO MAKE FETCH REQUEST =====');
      console.log('🔵 [AUTH SERVICE] Final URL being passed to fetch:', finalRequestURL);
      console.log('🔵 [AUTH SERVICE] URL type:', typeof finalRequestURL);
      console.log('🔵 [AUTH SERVICE] URL length:', finalRequestURL.length);
      console.log('🔵 [AUTH SERVICE] URL starts with http:', finalRequestURL.startsWith('http'));
      console.log('🔵 [AUTH SERVICE] URL contains users/register:', finalRequestURL.includes('users/register'));
      
      // Use fetch for React Native compatibility
      console.log('🔵 [AUTH SERVICE] Using fetch for React Native...');
      
      const response = await fetch(finalRequestURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('🔵 [AUTH SERVICE] Fetch completed');
      
      console.log('🔵 [AUTH SERVICE] Fetch request completed');
      console.log('🔵 [AUTH SERVICE] Response status:', response.status);
      const responseData = await response.json();
      console.log('🔵 [AUTH SERVICE] Response data:', responseData);
      
      console.log('🟢 [AUTH SERVICE] Registration response received!');
      console.log('🟢 [AUTH SERVICE] Response status:', response.status);
      console.log('🟢 [AUTH SERVICE] Response data:', JSON.stringify(responseData, null, 2));

      // Check if registration was successful (201 Created)
      if (response.status === 201 && responseData.id) {
        console.log('🟢 [AUTH SERVICE] User ID found, proceeding to auto-login...');
        // Auto-login after registration
        return await this.login(email, password);
      } else if (response.status === 400) {
        // Handle 400 Bad Request errors
        const errorDetail = responseData?.detail;
        console.log('🔴 [AUTH SERVICE] 400 error detail:', errorDetail);
        
        if (errorDetail === 'Email already registered') {
          return { 
            success: false, 
            error: 'This email is already registered. Please use a different email or try logging in instead.' 
          };
        } else if (errorDetail && Array.isArray(errorDetail)) {
          // Handle validation errors
          const validationErrors = errorDetail.map(err => err.msg).join(', ');
          return {
            success: false,
            error: `Validation error: ${validationErrors}`
          };
        } else {
          return {
            success: false,
            error: errorDetail || 'Registration failed. Please check your information and try again.'
          };
        }
      } else {
        console.log('🔴 [AUTH SERVICE] Unexpected response status:', response.status);
        return { success: false, error: `Registration failed with status ${response.status}` };
      }
    } catch (error) {
      console.error('🔴 [AUTH SERVICE] Registration error occurred!');
      console.error('🔴 [AUTH SERVICE] Error type:', error.constructor.name);
      console.error('🔴 [AUTH SERVICE] Error message:', error.message);
      console.error('🔴 [AUTH SERVICE] Error code:', error.code);
      console.error('🔴 [AUTH SERVICE] Error response status:', error.status);
      console.error('🔴 [AUTH SERVICE] Error response data:', error.data);
      console.error('🔴 [AUTH SERVICE] Error response headers:', error.headers);
      console.error('🔴 [AUTH SERVICE] Error config:', error.config);
      console.error('🔴 [AUTH SERVICE] Full error object:', JSON.stringify(error, null, 2));
      
      // Handle network errors and other exceptions
      if (error.message === 'Network request failed' || error.message === 'Network Error') {
        return {
          success: false,
          error: 'Network connection failed. Please check your internet connection and try again.'
        };
      }
      
      this.emit('error', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    try {
      this.token = null;
      this.user = null;
      
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      
      this.emit('loggedOut');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get authenticated axios instance
  async getAuthenticatedAxios() {
    const apiURL = await NetworkService.getServiceEndpoint('backend');
    const instance = axios.create({
      baseURL: apiURL,
    });

    instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          await this.logout();
          this.emit('tokenExpired');
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  // Event system
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default new AuthService();
