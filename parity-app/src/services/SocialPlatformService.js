import axios from 'axios';
import io from 'socket.io-client';

// Use your computer's IP address instead of localhost for Android
const SOCIAL_API_URL = 'http://192.168.12.246:4000';
const SOCKET_URL = 'http://192.168.12.246:4000';

class SocialPlatformService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Initialize WebSocket connection
  connect() {
    // Temporarily disable websocket connection to prevent errors
    console.log('🔵 [SOCIAL PLATFORM] WebSocket connection disabled for now');
    return null;
    
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to social platform');
      this.isConnected = true;
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from social platform');
      this.isConnected = false;
      this.emit('connection', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection', { connected: false, error });
    });

    // Listen for social platform events
    this.socket.on('new_post', (post) => {
      this.emit('new_post', post);
    });

    this.socket.on('update_post_likes', (update) => {
      this.emit('update_post_likes', update);
    });

    this.socket.on('update_post_comments', (update) => {
      this.emit('update_post_comments', update);
    });

    this.socket.on('update_post_gestures', (update) => {
      this.emit('update_post_gestures', update);
    });

    this.socket.on('post_deleted', (postId) => {
      this.emit('post_deleted', postId);
    });

    this.socket.on('comment_deleted', (commentId) => {
      this.emit('comment_deleted', commentId);
    });

    return this.socket;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // API Methods

  // Posts
  async getPosts(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/posts`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw this.handleError(error);
    }
  }

  async createPost(content, metadata = {}) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts`, {
        content: content.trim(),
        ...metadata
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw this.handleError(error);
    }
  }

  async deletePost(postId) {
    try {
      const response = await axios.delete(`${SOCIAL_API_URL}/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw this.handleError(error);
    }
  }

  async likePost(postId) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw this.handleError(error);
    }
  }

  async unlikePost(postId) {
    try {
      const response = await axios.delete(`${SOCIAL_API_URL}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw this.handleError(error);
    }
  }

  async addCaringGesture(postId) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts/${postId}/gesture`);
      return response.data;
    } catch (error) {
      console.error('Error adding caring gesture:', error);
      throw this.handleError(error);
    }
  }

  // Comments
  async getComments(postId) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw this.handleError(error);
    }
  }

  async addComment(postId, content) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts/${postId}/comments`, {
        content: content.trim()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw this.handleError(error);
    }
  }

  async deleteComment(commentId) {
    try {
      const response = await axios.delete(`${SOCIAL_API_URL}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw this.handleError(error);
    }
  }

  // Content Moderation
  async reportContent(postId, violationTypes, description) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts/${postId}/report`, {
        violation_types: violationTypes,
        description: description
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw this.handleError(error);
    }
  }

  async getModerationStatus(postId) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/posts/${postId}/moderation`);
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation status:', error);
      throw this.handleError(error);
    }
  }

  // User Profile
  async getUserProfile(userId) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw this.handleError(error);
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const response = await axios.put(`${SOCIAL_API_URL}/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw this.handleError(error);
    }
  }

  // Groups API
  async getGroups() {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/groups`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw this.handleError(error);
    }
  }

  async joinGroup(groupId, userId) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/groups/${groupId}/join`, {
        userId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw this.handleError(error);
    }
  }

  async leaveGroup(groupId, userId) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/groups/${groupId}/leave`, {
        userId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw this.handleError(error);
    }
  }

  // Trending Topics API
  async getTrendingTopics() {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/trending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw this.handleError(error);
    }
  }

  // Notifications API
  async getNotifications(userId, page = 1, limit = 20) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/notifications/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw this.handleError(error);
    }
  }

  // Search API
  async searchPosts(query, filters = {}) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/search/posts`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw this.handleError(error);
    }
  }

  async searchUsers(query) {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/search/users`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw this.handleError(error);
    }
  }

  // Utility Methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || 'Server error',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null
      };
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Connection Status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get Socket Instance
  getSocket() {
    return this.socket;
  }
}

// Create and export singleton instance
const socialPlatformService = new SocialPlatformService();
export default socialPlatformService;
