import ServiceConfig from './ServiceConfig';

/**
 * Social Service
 * Uses universal service configuration for dynamic endpoint detection
 */
class SocialService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await ServiceConfig.init();
    this.initialized = true;
    console.log('🔵 [SOCIAL SERVICE] Initialized with dynamic endpoint');
  }

  async getAxiosInstance(token = null) {
    await this.init();
    
    if (token) {
      return await ServiceConfig.createAuthenticatedAxiosInstance('socialAffirmation', token);
    } else {
      return await ServiceConfig.createAxiosInstance('socialAffirmation');
    }
  }

  async getSocialFeed(token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.get('/feed');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [SOCIAL SERVICE] Error getting social feed:', error);
      return { success: false, error: error.message };
    }
  }

  async createPost(postData, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.post('/posts', postData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [SOCIAL SERVICE] Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.post(`/posts/${postId}/like`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [SOCIAL SERVICE] Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async commentOnPost(postId, commentData, token) {
    try {
      const axios = await this.getAxiosInstance(token);
      const response = await axios.post(`/posts/${postId}/comments`, commentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🔴 [SOCIAL SERVICE] Error commenting on post:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SocialService();
