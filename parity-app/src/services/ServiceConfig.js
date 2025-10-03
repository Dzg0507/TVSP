import NetworkService from './NetworkService';

/**
 * Universal service configuration for all API services
 * This ensures all services use the correct endpoints automatically
 */

class ServiceConfig {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await NetworkService.init();
    this.initialized = true;
    console.log('🔵 [SERVICE CONFIG] All services configured with dynamic endpoints');
  }

  // Get endpoint for any service
  async getEndpoint(serviceName) {
    await this.init();
    return await NetworkService.getServiceEndpoint(serviceName);
  }

  // Get all endpoints
  async getAllEndpoints() {
    await this.init();
    return await NetworkService.getAllEndpoints();
  }

  // Create axios instance for any service
  async createAxiosInstance(serviceName, options = {}) {
    const endpoint = await this.getEndpoint(serviceName);
    if (!endpoint) {
      throw new Error(`Service ${serviceName} endpoint not found`);
    }

    const axios = require('axios');
    return axios.create({
      baseURL: endpoint,
      timeout: 10000,
      ...options,
    });
  }

  // Create authenticated axios instance for any service
  async createAuthenticatedAxiosInstance(serviceName, token, options = {}) {
    const instance = await this.createAxiosInstance(serviceName, options);
    
    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('🔴 [SERVICE CONFIG] Authentication failed for', serviceName);
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  // Get service status
  async getServiceStatus() {
    await this.init();
    return await NetworkService.getServiceStatus();
  }

  // Refresh all endpoints
  async refreshEndpoints() {
    await NetworkService.refreshEndpoints();
    this.initialized = false;
    await this.init();
  }

  // Get network info for debugging
  getNetworkInfo() {
    return NetworkService.getNetworkInfo();
  }
}

export default new ServiceConfig();
