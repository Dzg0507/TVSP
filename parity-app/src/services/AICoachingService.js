import ServiceConfig from './ServiceConfig';

/**
 * AI Coaching Service
 * Uses universal service configuration for dynamic endpoint detection
 */
class AICoachingService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await ServiceConfig.init();
    this.initialized = true;
    console.log('🔵 [AI COACHING SERVICE] Initialized with dynamic endpoint');
  }

  async getAxiosInstance(token = null) {
    await this.init();
    
    if (token) {
      return await ServiceConfig.createAuthenticatedAxiosInstance('aiCoaching', token);
    } else {
      return await ServiceConfig.createAxiosInstance('aiCoaching');
    }
  }

  async getCoachingSession(sessionId, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.get(`/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [AI COACHING SERVICE] Error getting coaching session:', error);
      return { success: false, error: error.message };
    }
  }

  async createCoachingSession(sessionData, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.post('/sessions', sessionData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [AI COACHING SERVICE] Error creating coaching session:', error);
      return { success: false, error: error.message };
    }
  }

  async getCoachingRecommendations(userId, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.get(`/recommendations/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [AI COACHING SERVICE] Error getting recommendations:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AICoachingService();
