import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

const SETTINGS_STORAGE_KEY = '@parity_settings';
const USER_PROFILE_KEY = '@parity_user_profile';

class SettingsService {
  constructor() {
    this.settings = null;
    this.userProfile = null;
    this.listeners = new Map();
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in settings event listener for ${event}:`, error);
        }
      });
    }
  }

  // Initialize settings
  async initialize() {
    try {
      await this.loadSettings();
      await this.loadUserProfile();
      this.emit('initialized', { settings: this.settings, profile: this.userProfile });
    } catch (error) {
      console.error('Error initializing settings:', error);
      this.emit('error', error);
    }
  }

  // Get authentication token from AuthService
  async getAuthToken() {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.settings = this.getDefaultSettings();
        await this.saveSettings();
      }
      return this.settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
      return this.settings;
    }
  }

  // Load user profile from storage
  async loadUserProfile() {
    try {
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        this.userProfile = JSON.parse(storedProfile);
      } else {
        this.userProfile = this.getDefaultProfile();
        await this.saveUserProfile();
      }
      return this.userProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userProfile = this.getDefaultProfile();
      return this.userProfile;
    }
  }

  // Get default settings
  getDefaultSettings() {
    return {
      notifications: {
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: false,
        partnerUpdates: true,
        weeklyInsights: true,
        socialActivity: true,
        aiGuidance: true,
        soundEnabled: true,
        vibrationEnabled: true,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        },
        reminderFrequency: 'daily'
      },
      privacy: {
        shareProgress: true,
        publicProfile: false,
        dataCollection: true,
        analyticsOptIn: false,
        locationSharing: false,
        socialVisibility: 'friends',
        profilePictureVisibility: 'public',
        activityStatus: 'visible'
      },
      preferences: {
        darkMode: false,
        language: 'English',
        theme: 'default',
        fontSize: 'medium',
        hapticFeedback: true,
        reducedMotion: false,
        communicationStyle: 'supportive',
        aiPersonality: 'friendly',
        reminderStyle: 'gentle'
      },
      security: {
        biometricAuth: false,
        autoLock: false,
        lockTimeout: 5, // minutes
        twoFactorAuth: false,
        sessionTimeout: 30, // minutes
        dataEncryption: true
      },
      data: {
        autoBackup: true,
        backupFrequency: 'weekly',
        dataRetention: '1year',
        exportFormat: 'json',
        syncAcrossDevices: true
      },
      accessibility: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        voiceOver: false,
        keyboardNavigation: false,
        reducedTransparency: false
      }
    };
  }

  // Get default user profile
  getDefaultProfile() {
    return {
      personal: {
        name: 'Anonymous User',
        email: '',
        avatar: '👤',
        bio: 'Supporting healthy relationships',
        location: '',
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      relationship: {
        status: 'single',
        partnerId: null,
        relationshipStartDate: null,
        communicationGoals: [],
        relationshipType: 'romantic'
      },
      stats: {
        conversationsAnalyzed: 0,
        improvementScore: 0,
        streakDays: 0,
        partnersConnected: 0,
        badgesEarned: 0,
        totalPoints: 0,
        sessionsCompleted: 0,
        hoursSpent: 0,
        messagesExchanged: 0
      },
      preferences: {
        favoriteTopics: [],
        learningStyle: 'visual',
        communicationLevel: 'beginner',
        goals: [],
        interests: []
      },
      social: {
        followers: 0,
        following: 0,
        posts: 0,
        reputation: 0,
        level: 1,
        isVerified: false,
        privacyLevel: 'private'
      }
    };
  }

  // Save settings to storage
  async saveSettings() {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      this.emit('settingsChanged', this.settings);
      
      // Sync with backend if available
      try {
        await this.syncSettingsToBackend();
      } catch (error) {
        console.warn('Failed to sync settings to backend:', error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Save user profile to storage
  async saveUserProfile() {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(this.userProfile));
      this.emit('profileChanged', this.userProfile);
      
      // Sync with backend if available
      try {
        await this.syncProfileToBackend();
      } catch (error) {
        console.warn('Failed to sync profile to backend:', error);
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  // Update specific setting
  async updateSetting(category, key, value) {
    if (!this.settings[category]) {
      this.settings[category] = {};
    }
    
    this.settings[category][key] = value;
    await this.saveSettings();
    
    this.emit('settingChanged', { category, key, value, settings: this.settings });
    return this.settings;
  }

  // Update multiple settings
  async updateSettings(updates) {
    Object.keys(updates).forEach(category => {
      if (!this.settings[category]) {
        this.settings[category] = {};
      }
      Object.assign(this.settings[category], updates[category]);
    });
    
    await this.saveSettings();
    this.emit('settingsChanged', this.settings);
    return this.settings;
  }

  // Update user profile
  async updateProfile(updates) {
    Object.assign(this.userProfile, updates);
    this.userProfile.personal.lastActive = new Date().toISOString();
    await this.saveUserProfile();
    
    this.emit('profileChanged', this.userProfile);
    return this.userProfile;
  }

  // Update stats
  async updateStats(stats) {
    this.userProfile.stats = { ...this.userProfile.stats, ...stats };
    await this.saveUserProfile();
    
    this.emit('statsChanged', this.userProfile.stats);
    return this.userProfile.stats;
  }

  // Get specific setting
  getSetting(category, key, defaultValue = null) {
    if (!this.settings || !this.settings[category]) {
      return defaultValue;
    }
    return this.settings[category][key] ?? defaultValue;
  }

  // Get all settings
  getSettings() {
    return this.settings;
  }

  // Get user profile
  getProfile() {
    return this.userProfile;
  }

  // Reset settings to defaults
  async resetSettings() {
    this.settings = this.getDefaultSettings();
    await this.saveSettings();
    this.emit('settingsReset', this.settings);
    return this.settings;
  }

  // Reset profile to defaults
  async resetProfile() {
    this.userProfile = this.getDefaultProfile();
    await this.saveUserProfile();
    this.emit('profileReset', this.userProfile);
    return this.userProfile;
  }

  // Export user data
  async exportUserData() {
    try {
      const exportData = {
        settings: this.settings,
        profile: this.userProfile,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataString = JSON.stringify(exportData, null, 2);
      
      // In a real app, you might want to save this to a file or send via email
      this.emit('dataExported', exportData);
      
      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Import user data
  async importUserData(data) {
    try {
      if (data.settings) {
        this.settings = { ...this.getDefaultSettings(), ...data.settings };
        await this.saveSettings();
      }
      
      if (data.profile) {
        this.userProfile = { ...this.getDefaultProfile(), ...data.profile };
        await this.saveUserProfile();
      }
      
      this.emit('dataImported', { settings: this.settings, profile: this.userProfile });
      return { settings: this.settings, profile: this.userProfile };
    } catch (error) {
      console.error('Error importing user data:', error);
      throw error;
    }
  }

  // Delete all user data
  async deleteAllData() {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      
      this.settings = null;
      this.userProfile = null;
      
      this.emit('dataDeleted', {});
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Sync settings to backend
  async syncSettingsToBackend() {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      const axios = AuthService.getAuthenticatedAxios();
      const response = await axios.put('/users/settings', {
        settings: this.settings
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing settings to backend:', error);
      throw error;
    }
  }

  // Sync profile to backend
  async syncProfileToBackend() {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      const axios = AuthService.getAuthenticatedAxios();
      const response = await axios.put('/users/profile', {
        profile: this.userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing profile to backend:', error);
      throw error;
    }
  }

  // Load settings from backend
  async loadSettingsFromBackend() {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      const axios = AuthService.getAuthenticatedAxios();
      const response = await axios.get('/users/settings');
      this.settings = { ...this.getDefaultSettings(), ...response.data };
      await this.saveSettings();
      return this.settings;
    } catch (error) {
      console.error('Error loading settings from backend:', error);
      return this.settings;
    }
  }

  // Load profile from backend
  async loadProfileFromBackend() {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      const axios = AuthService.getAuthenticatedAxios();
      const response = await axios.get('/users/profile');
      this.userProfile = { ...this.getDefaultProfile(), ...response.data };
      await this.saveUserProfile();
      return this.userProfile;
    } catch (error) {
      console.error('Error loading profile from backend:', error);
      return this.userProfile;
    }
  }

  // Notification management
  async updateNotificationSettings(notifications) {
    return await this.updateSetting('notifications', notifications);
  }

  async enableQuietHours(startTime, endTime) {
    return await this.updateSetting('notifications', 'quietHours', {
      enabled: true,
      startTime,
      endTime
    });
  }

  async disableQuietHours() {
    return await this.updateSetting('notifications', 'quietHours', {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    });
  }

  // Privacy management
  async updatePrivacySettings(privacy) {
    return await this.updateSetting('privacy', privacy);
  }

  async setSocialVisibility(level) {
    return await this.updateSetting('privacy', 'socialVisibility', level);
  }

  // Theme management
  async setTheme(theme) {
    return await this.updateSetting('preferences', 'theme', theme);
  }

  async toggleDarkMode() {
    const currentMode = this.getSetting('preferences', 'darkMode', false);
    return await this.updateSetting('preferences', 'darkMode', !currentMode);
  }

  // Language management
  async setLanguage(language) {
    return await this.updateSetting('preferences', 'language', language);
  }

  // Security management
  async enableBiometricAuth() {
    return await this.updateSetting('security', 'biometricAuth', true);
  }

  async disableBiometricAuth() {
    return await this.updateSetting('security', 'biometricAuth', false);
  }

  async setAutoLock(timeout) {
    return await this.updateSetting('security', 'autoLock', true);
  }

  // Accessibility management
  async updateAccessibilitySettings(accessibility) {
    return await this.updateSetting('accessibility', accessibility);
  }

  async enableHighContrast() {
    return await this.updateSetting('accessibility', 'highContrast', true);
  }

  async enableLargeText() {
    return await this.updateSetting('accessibility', 'largeText', true);
  }

  // Profile management
  async updatePersonalInfo(info) {
    return await this.updateProfile({ personal: { ...this.userProfile.personal, ...info } });
  }

  async updateRelationshipInfo(info) {
    return await this.updateProfile({ relationship: { ...this.userProfile.relationship, ...info } });
  }

  async updateSocialInfo(info) {
    return await this.updateProfile({ social: { ...this.userProfile.social, ...info } });
  }

  // Achievement management
  async addAchievement(achievement) {
    if (!this.userProfile.achievements) {
      this.userProfile.achievements = [];
    }
    
    this.userProfile.achievements.push({
      ...achievement,
      earnedAt: new Date().toISOString()
    });
    
    await this.saveUserProfile();
    this.emit('achievementEarned', achievement);
    return this.userProfile.achievements;
  }

  // Stats management
  async incrementStat(statName, value = 1) {
    const currentValue = this.userProfile.stats[statName] || 0;
    return await this.updateStats({ [statName]: currentValue + value });
  }

  async updateImprovementScore(score) {
    return await this.updateStats({ improvementScore: Math.max(0, Math.min(100, score)) });
  }

  // Validation
  validateSettings(settings) {
    const requiredCategories = ['notifications', 'privacy', 'preferences', 'security', 'data', 'accessibility'];
    
    for (const category of requiredCategories) {
      if (!settings[category]) {
        throw new Error(`Missing required settings category: ${category}`);
      }
    }
    
    return true;
  }

  validateProfile(profile) {
    const requiredSections = ['personal', 'relationship', 'stats', 'social'];
    
    for (const section of requiredSections) {
      if (!profile[section]) {
        throw new Error(`Missing required profile section: ${section}`);
      }
    }
    
    return true;
  }

  // Utility methods
  isQuietHours() {
    const quietHours = this.getSetting('notifications', 'quietHours', { enabled: false });
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      // Quiet hours within same day
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  shouldSendNotification(type) {
    const notifications = this.getSetting('notifications', {}, {});
    
    if (this.isQuietHours() && type !== 'urgent') {
      return false;
    }
    
    return notifications[type] !== false;
  }

  getThemeColors() {
    const isDark = this.getSetting('preferences', 'darkMode', false);
    const theme = this.getSetting('preferences', 'theme', 'default');
    
    // Return theme colors based on dark mode and theme preference
    if (isDark) {
      return {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#1a1a1a',
        surface: '#2a2a2a',
        text: '#ffffff',
        textSecondary: '#cccccc'
      };
    } else {
      return {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#f5f5f5',
        surface: '#ffffff',
        text: '#333333',
        textSecondary: '#666666'
      };
    }
  }
}

// Create and export singleton instance
const settingsService = new SettingsService();
export default settingsService;
