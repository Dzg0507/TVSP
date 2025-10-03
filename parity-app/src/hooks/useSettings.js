import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import settingsService from '../services/SettingsService';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const mountedRef = useRef(true);

  // Initialize settings service
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await settingsService.initialize();
        
        if (mountedRef.current) {
          setSettings(settingsService.getSettings());
          setProfile(settingsService.getProfile());
        }
      } catch (err) {
        console.error('Error initializing settings:', err);
        if (mountedRef.current) {
          setError(err.message);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeSettings();

    // Set up event listeners
    const handleSettingsChanged = (newSettings) => {
      if (mountedRef.current) {
        setSettings(newSettings);
      }
    };

    const handleProfileChanged = (newProfile) => {
      if (mountedRef.current) {
        setProfile(newProfile);
      }
    };

    const handleSettingChanged = (data) => {
      if (mountedRef.current) {
        setSettings(data.settings);
      }
    };

    const handleStatsChanged = (newStats) => {
      if (mountedRef.current && profile) {
        setProfile(prev => ({ ...prev, stats: newStats }));
      }
    };

    const handleAchievementEarned = (achievement) => {
      Alert.alert(
        'Achievement Unlocked! 🏆',
        `${achievement.title}\n${achievement.description}`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    };

    const handleError = (err) => {
      console.error('Settings service error:', err);
      if (mountedRef.current) {
        setError(err.message);
      }
    };

    // Register event listeners
    settingsService.on('settingsChanged', handleSettingsChanged);
    settingsService.on('profileChanged', handleProfileChanged);
    settingsService.on('settingChanged', handleSettingChanged);
    settingsService.on('statsChanged', handleStatsChanged);
    settingsService.on('achievementEarned', handleAchievementEarned);
    settingsService.on('error', handleError);

    // Cleanup
    return () => {
      mountedRef.current = false;
      settingsService.off('settingsChanged', handleSettingsChanged);
      settingsService.off('profileChanged', handleProfileChanged);
      settingsService.off('settingChanged', handleSettingChanged);
      settingsService.off('statsChanged', handleStatsChanged);
      settingsService.off('achievementEarned', handleAchievementEarned);
      settingsService.off('error', handleError);
    };
  }, []);

  // Update setting
  const updateSetting = useCallback(async (category, key, value) => {
    if (!mountedRef.current) return;
    
    setSaving(true);
    try {
      const updatedSettings = await settingsService.updateSetting(category, key, value);
      return { success: true, settings: updatedSettings };
    } catch (err) {
      console.error('Error updating setting:', err);
      Alert.alert('Error', err.message || 'Failed to update setting');
      return { success: false, error: err };
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  // Update multiple settings
  const updateSettings = useCallback(async (updates) => {
    if (!mountedRef.current) return;
    
    setSaving(true);
    try {
      const updatedSettings = await settingsService.updateSettings(updates);
      return { success: true, settings: updatedSettings };
    } catch (err) {
      console.error('Error updating settings:', err);
      Alert.alert('Error', err.message || 'Failed to update settings');
      return { success: false, error: err };
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!mountedRef.current) return;
    
    setSaving(true);
    try {
      const updatedProfile = await settingsService.updateProfile(updates);
      return { success: true, profile: updatedProfile };
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
      return { success: false, error: err };
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  // Update stats
  const updateStats = useCallback(async (stats) => {
    if (!mountedRef.current) return;
    
    try {
      const updatedStats = await settingsService.updateStats(stats);
      return { success: true, stats: updatedStats };
    } catch (err) {
      console.error('Error updating stats:', err);
      return { success: false, error: err };
    }
  }, []);

  // Toggle setting
  const toggleSetting = useCallback(async (category, key) => {
    const currentValue = settingsService.getSetting(category, key, false);
    return await updateSetting(category, key, !currentValue);
  }, [updateSetting]);

  // Get specific setting
  const getSetting = useCallback((category, key, defaultValue = null) => {
    return settingsService.getSetting(category, key, defaultValue);
  }, []);

  // Notification management
  const updateNotificationSettings = useCallback(async (notifications) => {
    return await updateSetting('notifications', notifications);
  }, [updateSetting]);

  const enableQuietHours = useCallback(async (startTime, endTime) => {
    return await updateSetting('notifications', 'quietHours', {
      enabled: true,
      startTime,
      endTime
    });
  }, [updateSetting]);

  const disableQuietHours = useCallback(async () => {
    return await updateSetting('notifications', 'quietHours', {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    });
  }, [updateSetting]);

  // Privacy management
  const updatePrivacySettings = useCallback(async (privacy) => {
    return await updateSetting('privacy', privacy);
  }, [updateSetting]);

  const setSocialVisibility = useCallback(async (level) => {
    return await updateSetting('privacy', 'socialVisibility', level);
  }, [updateSetting]);

  // Theme management
  const setTheme = useCallback(async (theme) => {
    return await updateSetting('preferences', 'theme', theme);
  }, [updateSetting]);

  const toggleDarkMode = useCallback(async () => {
    return await settingsService.toggleDarkMode();
  }, []);

  // Language management
  const setLanguage = useCallback(async (language) => {
    return await updateSetting('preferences', 'language', language);
  }, [updateSetting]);

  // Security management
  const enableBiometricAuth = useCallback(async () => {
    return await updateSetting('security', 'biometricAuth', true);
  }, [updateSetting]);

  const disableBiometricAuth = useCallback(async () => {
    return await updateSetting('security', 'biometricAuth', false);
  }, [updateSetting]);

  const setAutoLock = useCallback(async (timeout) => {
    return await updateSetting('security', 'autoLock', true);
  }, [updateSetting]);

  // Accessibility management
  const updateAccessibilitySettings = useCallback(async (accessibility) => {
    return await updateSetting('accessibility', accessibility);
  }, [updateSetting]);

  const enableHighContrast = useCallback(async () => {
    return await updateSetting('accessibility', 'highContrast', true);
  }, [updateSetting]);

  const enableLargeText = useCallback(async () => {
    return await updateSetting('accessibility', 'largeText', true);
  }, [updateSetting]);

  // Profile management
  const updatePersonalInfo = useCallback(async (info) => {
    return await settingsService.updatePersonalInfo(info);
  }, []);

  const updateRelationshipInfo = useCallback(async (info) => {
    return await settingsService.updateRelationshipInfo(info);
  }, []);

  const updateSocialInfo = useCallback(async (info) => {
    return await settingsService.updateSocialInfo(info);
  }, []);

  // Achievement management
  const addAchievement = useCallback(async (achievement) => {
    try {
      const achievements = await settingsService.addAchievement(achievement);
      return { success: true, achievements };
    } catch (err) {
      console.error('Error adding achievement:', err);
      return { success: false, error: err };
    }
  }, []);

  // Stats management
  const incrementStat = useCallback(async (statName, value = 1) => {
    try {
      const stats = await settingsService.incrementStat(statName, value);
      return { success: true, stats };
    } catch (err) {
      console.error('Error incrementing stat:', err);
      return { success: false, error: err };
    }
  }, []);

  const updateImprovementScore = useCallback(async (score) => {
    try {
      const stats = await settingsService.updateImprovementScore(score);
      return { success: true, stats };
    } catch (err) {
      console.error('Error updating improvement score:', err);
      return { success: false, error: err };
    }
  }, []);

  // Data management
  const exportUserData = useCallback(async () => {
    try {
      const data = await settingsService.exportUserData();
      Alert.alert(
        'Data Exported',
        'Your data has been exported successfully. In a real app, this would be saved to a file or sent via email.',
        [{ text: 'OK' }]
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error exporting data:', err);
      Alert.alert('Error', err.message || 'Failed to export data');
      return { success: false, error: err };
    }
  }, []);

  const importUserData = useCallback(async (data) => {
    try {
      const result = await settingsService.importUserData(data);
      Alert.alert('Success', 'Data imported successfully!');
      return { success: true, result };
    } catch (err) {
      console.error('Error importing data:', err);
      Alert.alert('Error', err.message || 'Failed to import data');
      return { success: false, error: err };
    }
  }, []);

  const deleteAllData = useCallback(async () => {
    Alert.alert(
      'Delete All Data',
      'This action cannot be undone. All your settings and profile data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.deleteAllData();
              Alert.alert('Success', 'All data has been deleted');
              return { success: true };
            } catch (err) {
              console.error('Error deleting data:', err);
              Alert.alert('Error', err.message || 'Failed to delete data');
              return { success: false, error: err };
            }
          }
        }
      ]
    );
  }, []);

  // Reset functions
  const resetSettings = useCallback(async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const resetSettings = await settingsService.resetSettings();
              Alert.alert('Success', 'Settings have been reset to defaults');
              return { success: true, settings: resetSettings };
            } catch (err) {
              console.error('Error resetting settings:', err);
              Alert.alert('Error', err.message || 'Failed to reset settings');
              return { success: false, error: err };
            }
          }
        }
      ]
    );
  }, []);

  const resetProfile = useCallback(async () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const resetProfile = await settingsService.resetProfile();
              Alert.alert('Success', 'Profile has been reset to defaults');
              return { success: true, profile: resetProfile };
            } catch (err) {
              console.error('Error resetting profile:', err);
              Alert.alert('Error', err.message || 'Failed to reset profile');
              return { success: false, error: err };
            }
          }
        }
      ]
    );
  }, []);

  // Utility functions
  const isQuietHours = useCallback(() => {
    return settingsService.isQuietHours();
  }, []);

  const shouldSendNotification = useCallback((type) => {
    return settingsService.shouldSendNotification(type);
  }, []);

  const getThemeColors = useCallback(() => {
    return settingsService.getThemeColors();
  }, []);

  // Sync functions
  const syncWithBackend = useCallback(async () => {
    try {
      await settingsService.syncSettingsToBackend();
      await settingsService.syncProfileToBackend();
      Alert.alert('Success', 'Settings synced with server');
      return { success: true };
    } catch (err) {
      console.error('Error syncing with backend:', err);
      Alert.alert('Error', err.message || 'Failed to sync with server');
      return { success: false, error: err };
    }
  }, []);

  const loadFromBackend = useCallback(async () => {
    try {
      await settingsService.loadSettingsFromBackend();
      await settingsService.loadProfileFromBackend();
      setSettings(settingsService.getSettings());
      setProfile(settingsService.getProfile());
      Alert.alert('Success', 'Settings loaded from server');
      return { success: true };
    } catch (err) {
      console.error('Error loading from backend:', err);
      Alert.alert('Error', err.message || 'Failed to load from server');
      return { success: false, error: err };
    }
  }, []);

  return {
    // State
    settings,
    profile,
    loading,
    error,
    saving,
    
    // Basic operations
    updateSetting,
    updateSettings,
    updateProfile,
    updateStats,
    toggleSetting,
    getSetting,
    
    // Notification management
    updateNotificationSettings,
    enableQuietHours,
    disableQuietHours,
    
    // Privacy management
    updatePrivacySettings,
    setSocialVisibility,
    
    // Theme management
    setTheme,
    toggleDarkMode,
    
    // Language management
    setLanguage,
    
    // Security management
    enableBiometricAuth,
    disableBiometricAuth,
    setAutoLock,
    
    // Accessibility management
    updateAccessibilitySettings,
    enableHighContrast,
    enableLargeText,
    
    // Profile management
    updatePersonalInfo,
    updateRelationshipInfo,
    updateSocialInfo,
    
    // Achievement management
    addAchievement,
    
    // Stats management
    incrementStat,
    updateImprovementScore,
    
    // Data management
    exportUserData,
    importUserData,
    deleteAllData,
    
    // Reset functions
    resetSettings,
    resetProfile,
    
    // Utility functions
    isQuietHours,
    shouldSendNotification,
    getThemeColors,
    
    // Sync functions
    syncWithBackend,
    loadFromBackend,
    
    // Service instance
    settingsService
  };
};

export default useSettings;
