import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import useSettings from '../hooks/useSettings';
import { useAuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    
    // Use auth context
    const { logout, user } = useAuthContext();
    
    // Use settings hook
    const {
        settings,
        profile,
        loading,
        error,
        saving,
        updateSetting,
        toggleSetting,
        getSetting,
        updateNotificationSettings,
        updatePrivacySettings,
        setLanguage,
        toggleDarkMode,
        exportUserData,
        deleteAllData,
        resetSettings,
        syncWithBackend,
        loadFromBackend
    } = useSettings();
    
    // Modal states
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
    
    // Form states
    const [quietHoursStart, setQuietHoursStart] = useState('22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
    const [backupFrequency, setBackupFrequency] = useState('weekly');
    const [lockTimeout, setLockTimeout] = useState(5);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Real handler functions with actual functionality
    const handleNotificationToggle = async (key) => {
        await toggleSetting('notifications', key);
    };

    const handlePrivacyToggle = async (key) => {
        await toggleSetting('privacy', key);
    };

    const handlePreferenceToggle = async (key) => {
        await toggleSetting('preferences', key);
    };

    const handleLanguageChange = () => {
        setShowLanguageModal(true);
    };

    const handleLanguageSelect = async (language) => {
        await setLanguage(language);
        setShowLanguageModal(false);
    };

    const handleQuietHoursSetup = () => {
        setShowQuietHoursModal(true);
    };

    const handleQuietHoursSave = async () => {
        await updateSetting('notifications', 'quietHours', {
            enabled: true,
            startTime: quietHoursStart,
            endTime: quietHoursEnd
        });
        setShowQuietHoursModal(false);
    };

    const handleQuietHoursDisable = async () => {
        await updateSetting('notifications', 'quietHours', {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
        });
    };

    const handleExportData = async () => {
        await exportUserData();
    };

    const handleDeleteAccount = async () => {
        await deleteAllData();
    };

    const handleResetSettings = async () => {
        await resetSettings();
    };


    const handleSyncWithServer = async () => {
        await syncWithBackend();
    };

    const handleLoadFromServer = async () => {
        await loadFromBackend();
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await logout();
                        if (result.success) {
                            // Navigation will be handled by AuthNavigator
                            Alert.alert('Success', 'You have been logged out successfully.');
                        } else {
                            Alert.alert('Error', result.error || 'Logout failed');
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ title, subtitle, value, onToggle, type = 'switch', onPress, icon, disabled = false }) => (
        <View style={[styles.settingItem, disabled && styles.disabledSetting]}>
            <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{icon}</Text>
                <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.settingRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#4ecdc4' }}
                        thumbColor={value ? '#fff' : 'rgba(255,255,255,0.8)'}
                        disabled={disabled || saving}
                    />
                ) : type === 'button' ? (
                    <TouchableOpacity 
                        style={[styles.settingButton, disabled && styles.disabledButton]} 
                        onPress={onPress}
                        disabled={disabled || saving}>
                        <Text style={[styles.settingButtonText, disabled && styles.disabledText]}>{value}</Text>
                        <Text style={[styles.settingArrow, disabled && styles.disabledText]}>›</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.actionButton, disabled && styles.disabledButton]} 
                        onPress={onPress}
                        disabled={disabled || saving}>
                        <LinearGradient
                            colors={title.includes('Delete') ? ['#ff6b6b', '#ee5a24'] : ['#4ecdc4', '#44a08d']}
                            style={styles.actionButtonGradient}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.actionButtonText}>{value}</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const SettingSection = ({ title, children }) => (
        <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.sectionGradient}>
                    {children}
                </LinearGradient>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Gradient Background */}
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings ⚙️</Text>
                    <View style={styles.headerSpacer} />
                </Animated.View>

                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}>

                    {/* Profile Section */}
                    <Animated.View style={[styles.profileSection, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.profileGradient}>
                            <View style={styles.profileAvatar}>
                                <Text style={styles.profileEmoji}>
                                    {profile?.personal?.avatar || '👤'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {profile?.personal?.name || 'Loading...'}
                                </Text>
                                <Text style={styles.profileEmail}>
                                    {profile?.personal?.email || 'No email set'}
                                </Text>
                                <TouchableOpacity 
                                    style={styles.editProfileButton}
                                    onPress={() => navigation.navigate('UserProfile')}>
                                    <Text style={styles.editProfileText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Notifications Settings */}
                    <SettingSection title="🔔 Notifications">
                        <SettingItem
                            title="Push Notifications"
                            subtitle="Receive notifications on your device"
                            value={getSetting('notifications', 'pushNotifications', true)}
                            onToggle={() => handleNotificationToggle('pushNotifications')}
                            icon="📱"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Email Notifications"
                            subtitle="Receive updates via email"
                            value={getSetting('notifications', 'emailNotifications', false)}
                            onToggle={() => handleNotificationToggle('emailNotifications')}
                            icon="📧"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Partner Updates"
                            subtitle="Get notified about partner's progress"
                            value={getSetting('notifications', 'partnerUpdates', true)}
                            onToggle={() => handleNotificationToggle('partnerUpdates')}
                            icon="💕"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Weekly Insights"
                            subtitle="Receive weekly communication insights"
                            value={getSetting('notifications', 'weeklyInsights', true)}
                            onToggle={() => handleNotificationToggle('weeklyInsights')}
                            icon="📊"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Sound Effects"
                            subtitle="Enable app sounds and vibrations"
                            value={getSetting('notifications', 'soundEnabled', true)}
                            onToggle={() => handleNotificationToggle('soundEnabled')}
                            icon="🔊"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Quiet Hours"
                            subtitle={getSetting('notifications', 'quietHours', { enabled: false }).enabled ? 
                                `Active from ${getSetting('notifications', 'quietHours').startTime} to ${getSetting('notifications', 'quietHours').endTime}` : 
                                'Set quiet hours for notifications'
                            }
                            value={getSetting('notifications', 'quietHours', { enabled: false }).enabled ? 'Enabled' : 'Disabled'}
                            type="button"
                            onPress={getSetting('notifications', 'quietHours', { enabled: false }).enabled ? 
                                handleQuietHoursDisable : handleQuietHoursSetup
                            }
                            icon="🌙"
                            disabled={loading}
                        />
                    </SettingSection>

                    {/* Privacy Settings */}
                    <SettingSection title="🔒 Privacy & Security">
                        <SettingItem
                            title="Share Progress"
                            subtitle="Allow others to see your progress"
                            value={getSetting('privacy', 'shareProgress', true)}
                            onToggle={() => handlePrivacyToggle('shareProgress')}
                            icon="📈"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Public Profile"
                            subtitle="Make your profile visible to others"
                            value={getSetting('privacy', 'publicProfile', false)}
                            onToggle={() => handlePrivacyToggle('publicProfile')}
                            icon="👥"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Data Collection"
                            subtitle="Help improve the app with usage data"
                            value={getSetting('privacy', 'dataCollection', true)}
                            onToggle={() => handlePrivacyToggle('dataCollection')}
                            icon="📊"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Analytics"
                            subtitle="Share anonymous analytics data"
                            value={getSetting('privacy', 'analyticsOptIn', false)}
                            onToggle={() => handlePrivacyToggle('analyticsOptIn')}
                            icon="📈"
                            disabled={loading}
                        />
                    </SettingSection>

                    {/* App Preferences */}
                    <SettingSection title="🎨 Preferences">
                        <SettingItem
                            title="Dark Mode"
                            subtitle="Use dark theme throughout the app"
                            value={getSetting('preferences', 'darkMode', false)}
                            onToggle={() => handlePreferenceToggle('darkMode')}
                            icon="🌙"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Language"
                            subtitle="Choose your preferred language"
                            value={getSetting('preferences', 'language', 'English')}
                            type="button"
                            onPress={handleLanguageChange}
                            icon="🌍"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Haptic Feedback"
                            subtitle="Enable vibration feedback"
                            value={getSetting('preferences', 'hapticFeedback', true)}
                            onToggle={() => handlePreferenceToggle('hapticFeedback')}
                            icon="📳"
                            disabled={loading}
                        />
                    </SettingSection>

                    {/* Sync & Backup */}
                    <SettingSection title="☁️ Sync & Backup">
                        <SettingItem
                            title="Sync with Server"
                            subtitle="Upload your settings to the cloud"
                            value="Sync"
                            type="action"
                            onPress={handleSyncWithServer}
                            icon="☁️"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Load from Server"
                            subtitle="Download settings from the cloud"
                            value="Load"
                            type="action"
                            onPress={handleLoadFromServer}
                            icon="⬇️"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Export Data"
                            subtitle="Download your personal data"
                            value="Export"
                            type="action"
                            onPress={handleExportData}
                            icon="📥"
                            disabled={loading}
                        />
                    </SettingSection>

                    {/* Account Actions */}
                    <SettingSection title="👤 Account">
                        <SettingItem
                            title="Reset Settings"
                            subtitle="Reset all settings to defaults"
                            value="Reset"
                            type="action"
                            onPress={handleResetSettings}
                            icon="🔄"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Logout"
                            subtitle="Sign out of your account"
                            value="Logout"
                            type="action"
                            onPress={handleLogout}
                            icon="🚪"
                            disabled={loading}
                        />
                        <SettingItem
                            title="Delete Account"
                            subtitle="Permanently delete your account"
                            value="Delete"
                            type="action"
                            onPress={handleDeleteAccount}
                            icon="🗑️"
                            disabled={loading}
                        />
                    </SettingSection>

                    {/* App Info */}
                    <View style={styles.appInfo}>
                        <Text style={styles.appInfoText}>Parity v1.0.0</Text>
                        <Text style={styles.appInfoSubtext}>Made with ❤️ for better communication</Text>
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLanguageModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.modalGradient}>
                            <Text style={styles.modalTitle}>Choose Language</Text>
                            
                            {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'].map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={styles.languageOption}
                                    onPress={() => handleLanguageSelect(lang)}>
                                    <Text style={styles.languageText}>{lang}</Text>
                                </TouchableOpacity>
                            ))}
                            
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowLanguageModal(false)}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>

            {/* Quiet Hours Modal */}
            <Modal
                visible={showQuietHoursModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowQuietHoursModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.modalGradient}>
                            <Text style={styles.modalTitle}>Set Quiet Hours</Text>
                            
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeLabel}>Start Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={quietHoursStart}
                                    onChangeText={setQuietHoursStart}
                                    placeholder="22:00"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                />
                            </View>
                            
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeLabel}>End Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={quietHoursEnd}
                                    onChangeText={setQuietHoursEnd}
                                    placeholder="08:00"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                />
                            </View>
                            
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleQuietHoursSave}>
                                <Text style={styles.modalSaveText}>Save Quiet Hours</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowQuietHoursModal(false)}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            )}

            {/* Error Display */}
            {error && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    gradientBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    profileSection: {
        marginBottom: 30,
        borderRadius: 20,
        overflow: 'hidden',
    },
    profileGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileEmoji: {
        fontSize: 28,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    editProfileButton: {
        alignSelf: 'flex-start',
    },
    editProfileText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    settingSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        marginLeft: 5,
    },
    sectionContent: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    sectionGradient: {
        padding: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    settingRight: {
        marginLeft: 10,
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    settingButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        marginRight: 8,
    },
    settingArrow: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
    },
    actionButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    appInfo: {
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 20,
    },
    appInfoText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 4,
    },
    appInfoSubtext: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    disabledSetting: {
        opacity: 0.5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxWidth: 400,
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalGradient: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    languageOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    timeInputContainer: {
        marginBottom: 15,
    },
    timeLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 8,
    },
    timeInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    modalSaveButton: {
        backgroundColor: '#4ecdc4',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalCloseButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    errorOverlay: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: '#ff6b6b',
        padding: 15,
        borderRadius: 10,
        zIndex: 1000,
    },
    errorText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default SettingsScreen;
