import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NotificationSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [partnerNotifications, setPartnerNotifications] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('http://192.168.12.246:8004/notifications/preferences/user123');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPushEnabled(data.push_enabled || true);
      setEmailEnabled(data.email_enabled || true);
      setSessionReminders(data.session_reminders || true);
      setPartnerNotifications(data.partner_notifications || true);
      setSocialNotifications(data.social_notifications || true);
      setAchievementNotifications(data.achievement_notifications || true);
      setQuietHoursEnabled(data.quiet_hours_enabled || false);
      setQuietHoursStart(data.quiet_hours_start || '22:00');
      setQuietHoursEnd(data.quiet_hours_end || '08:00');
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      const settings = {
        push_enabled: pushEnabled,
        email_enabled: emailEnabled,
        session_reminders: sessionReminders,
        partner_notifications: partnerNotifications,
        social_notifications: socialNotifications,
        achievement_notifications: achievementNotifications,
        quiet_hours_enabled: quietHoursEnabled,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd
      };

      const response = await fetch('http://192.168.12.246:8004/notifications/preferences/user123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('http://192.168.12.246:8004/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user123',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings are working correctly.',
          category: 'system_update'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      Alert.alert('Test Sent', 'A test notification has been sent to your device');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderNotificationOption = (title, description, value, onValueChange, disabled = false) => (
    <View style={styles.notificationOption}>
      <View style={styles.notificationInfo}>
        <Text style={[styles.notificationTitle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={[styles.notificationDescription, disabled && styles.disabledText]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#4CAF50' }}
        thumbColor={value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
      />
    </View>
  );

  const renderTimeInput = (label, value, onChangeText) => (
    <View style={styles.timeInputContainer}>
      <Text style={styles.timeInputLabel}>{label}</Text>
      <TextInput
        style={styles.timeInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="HH:MM"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        keyboardType="numeric"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading notification settings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>Customize how you receive updates</Text>
          </View>

          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Notifications</Text>
            
            {renderNotificationOption(
              "Push Notifications",
              "Receive real-time updates and alerts on your device",
              pushEnabled,
              setPushEnabled
            )}

            {renderNotificationOption(
              "Email Notifications",
              "Receive weekly summaries and important updates via email",
              emailEnabled,
              setEmailEnabled
            )}
          </View>

          {/* Communication Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communication & Sessions</Text>
            
            {renderNotificationOption(
              "Session Reminders",
              "Get reminded about scheduled communication sessions",
              sessionReminders,
              setSessionReminders,
              !pushEnabled && !emailEnabled
            )}

            {renderNotificationOption(
              "Partner Notifications",
              "Receive updates when your partner interacts with the app",
              partnerNotifications,
              setPartnerNotifications,
              !pushEnabled && !emailEnabled
            )}
          </View>

          {/* Social Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social & Community</Text>
            
            {renderNotificationOption(
              "Social Interactions",
              "Get notified when someone responds to your posts or comments",
              socialNotifications,
              setSocialNotifications,
              !pushEnabled && !emailEnabled
            )}

            {renderNotificationOption(
              "Achievement Notifications",
              "Celebrate your progress with achievement alerts",
              achievementNotifications,
              setAchievementNotifications,
              !pushEnabled && !emailEnabled
            )}
          </View>

          {/* Quiet Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiet Hours</Text>
            
            {renderNotificationOption(
              "Enable Quiet Hours",
              "Set specific times when you don't want to receive notifications",
              quietHoursEnabled,
              setQuietHoursEnabled
            )}

            {quietHoursEnabled && (
              <View style={styles.quietHoursContainer}>
                <Text style={styles.quietHoursDescription}>
                  Choose times when you don't want to be disturbed
                </Text>
                
                <View style={styles.timeInputsRow}>
                  {renderTimeInput("Start Time", quietHoursStart, setQuietHoursStart)}
                  {renderTimeInput("End Time", quietHoursEnd, setQuietHoursEnd)}
                </View>

                <View style={styles.quietHoursInfo}>
                  <Text style={styles.quietHoursInfoText}>
                    💡 Notifications will be delivered after quiet hours end
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Recent Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            
            <View style={styles.recentNotifications}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.notificationIconText}>💬</Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>Session Reminder</Text>
                  <Text style={styles.notificationItemText}>
                    Your communication session starts in 15 minutes
                  </Text>
                  <Text style={styles.notificationTime}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.notificationIconText}>🎉</Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>Achievement Unlocked</Text>
                  <Text style={styles.notificationItemText}>
                    Great job! You've completed 10 communication sessions
                  </Text>
                  <Text style={styles.notificationTime}>1 day ago</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.notificationIconText}>❤️</Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>Partner Connected</Text>
                  <Text style={styles.notificationItemText}>
                    Your partner has joined your communication journey
                  </Text>
                  <Text style={styles.notificationTime}>3 days ago</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testNotification}
            >
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveNotificationSettings}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Settings</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  quietHoursContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  quietHoursDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 16,
    lineHeight: 20,
  },
  timeInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInputContainer: {
    width: '48%',
  },
  timeInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quietHoursInfo: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  quietHoursInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  recentNotifications: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationItemText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  actionButtons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  testButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NotificationSettingsScreen;
