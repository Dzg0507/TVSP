import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, 
  Animated, Dimensions, TextInput, Alert, Modal, ActivityIndicator, 
  FlatList, Image, Share, Clipboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import useSettings from '../hooks/useSettings';
import useSocialPlatform from '../hooks/useSocialPlatform';

const { width, height } = Dimensions.get('window');

const EnhancedUserProfileScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [isEditing, setIsEditing] = useState(false);
    
    // Use hooks
    const {
        profile,
        settings,
        loading,
        saving,
        updateProfile,
        updatePersonalInfo,
        updateStats,
        incrementStat,
        addAchievement,
        getSetting
    } = useSettings();

    const {
        posts,
        likedPosts,
        savedPosts,
        formatTimeAgo
    } = useSocialPlatform();
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    
    // Form states
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        location: '',
        avatar: '',
        interests: [],
        goals: []
    });

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

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

        // Start continuous animations
        startContinuousAnimations();
    }, []);

    const startContinuousAnimations = () => {
        // Pulse animation for stats
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotate animation for achievements
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: true,
            })
        ).start();
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveProfile();
        } else {
            setEditForm({
                name: profile?.personal?.name || '',
                bio: profile?.personal?.bio || '',
                location: profile?.personal?.location || '',
                avatar: profile?.personal?.avatar || '👤',
                interests: profile?.preferences?.interests || [],
                goals: profile?.preferences?.goals || []
            });
            setShowEditModal(true);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updatePersonalInfo(editForm);
            setIsEditing(false);
            setShowEditModal(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    const handleAvatarChange = () => {
        const avatars = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓', '👨‍🚀', '👩‍🚀', '🧑‍🎨', '👨‍🎨', '👩‍🎨'];
        Alert.alert(
            'Choose Avatar',
            'Select your profile avatar',
            avatars.map(emoji => ({
                text: emoji,
                onPress: () => setEditForm(prev => ({ ...prev, avatar: emoji }))
            })).concat([{ text: 'Cancel', style: 'cancel' }])
        );
    };

    const handleShareProfile = async () => {
        try {
            const shareText = `Check out my Parity profile! I've completed ${profile?.stats?.conversationsAnalyzed || 0} conversations and have an improvement score of ${profile?.stats?.improvementScore || 0}%!`;
            await Share.share({
                message: shareText,
                title: 'My Parity Profile'
            });
        } catch (error) {
            console.error('Error sharing profile:', error);
        }
    };

    const handleCopyProfileLink = async () => {
        try {
            await Clipboard.setString('https://parity.app/profile/user123');
            Alert.alert('Copied', 'Profile link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    // Advanced Stats Component
    const AdvancedStatsCard = ({ title, stats, color }) => (
        <Animated.View style={[styles.statsCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
                colors={[color, color + '80']}
                style={styles.statsGradient}>
                <Text style={styles.statsTitle}>{title}</Text>
                <View style={styles.statsGrid}>
                    {Object.entries(stats).map(([key, value]) => (
                        <View key={key} style={styles.statItem}>
                            <Text style={styles.statValue}>{value}</Text>
                            <Text style={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </Animated.View>
    );

    // Achievement Component with Animation
    const AchievementCard = ({ achievement, index }) => {
        const rotateInterpolate = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <Animated.View 
                style={[
                    styles.achievementCard, 
                    !achievement.earned && styles.lockedAchievement,
                    { transform: [{ rotate: achievement.earned ? rotateInterpolate : '0deg' }] }
                ]}>
                <LinearGradient
                    colors={achievement.earned ? 
                        ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] : 
                        ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                    }
                    style={styles.achievementGradient}>
                    <Text style={[styles.achievementEmoji, !achievement.earned && styles.lockedEmoji]}>
                        {achievement.earned ? achievement.emoji : '🔒'}
                    </Text>
                    <View style={styles.achievementInfo}>
                        <Text style={[styles.achievementTitle, !achievement.earned && styles.lockedText]}>
                            {achievement.title}
                        </Text>
                        <Text style={[styles.achievementDescription, !achievement.earned && styles.lockedText]}>
                            {achievement.description}
                        </Text>
                        {achievement.earned && (
                            <Text style={styles.achievementDate}>
                                Earned {formatTimeAgo(achievement.earnedAt)}
                            </Text>
                        )}
                    </View>
                    {achievement.earned && (
                        <View style={styles.earnedBadge}>
                            <Text style={styles.earnedText}>✓</Text>
                        </View>
                    )}
                </LinearGradient>
            </Animated.View>
        );
    };

    // Social Activity Component
    const SocialActivityCard = () => (
        <View style={styles.socialCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.socialGradient}>
                <Text style={styles.socialTitle}>Social Activity</Text>
                <View style={styles.socialStats}>
                    <View style={styles.socialStat}>
                        <Text style={styles.socialStatValue}>{posts?.length || 0}</Text>
                        <Text style={styles.socialStatLabel}>Posts</Text>
                    </View>
                    <View style={styles.socialStat}>
                        <Text style={styles.socialStatValue}>{likedPosts?.size || 0}</Text>
                        <Text style={styles.socialStatLabel}>Likes Given</Text>
                    </View>
                    <View style={styles.socialStat}>
                        <Text style={styles.socialStatValue}>{savedPosts?.size || 0}</Text>
                        <Text style={styles.socialStatLabel}>Saved</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.viewActivityButton}
                    onPress={() => navigation.navigate('SocialFeed')}>
                    <Text style={styles.viewActivityText}>View Activity</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    // Progress Chart Component
    const ProgressChart = () => (
        <View style={styles.progressCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.progressGradient}>
                <Text style={styles.progressTitle}>Progress Over Time</Text>
                <View style={styles.chartContainer}>
                    {/* Progress visualization */}
                    <View style={styles.progressVisualization}>
                        <Text style={styles.progressTitle}>📊 Progress Chart</Text>
                        <Text style={styles.progressSubtext}>Communication improvement over time</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '75%' }]} />
                        </View>
                        <Text style={styles.progressText}>75% improvement this month</Text>
                    </View>
                    <View style={styles.chartLabels}>
                        <Text style={styles.chartLabel}>Week 1</Text>
                        <Text style={styles.chartLabel}>Week 2</Text>
                        <Text style={styles.chartLabel}>Week 3</Text>
                        <Text style={styles.chartLabel}>Week 4</Text>
                        <Text style={styles.chartLabel}>Week 5</Text>
                        <Text style={styles.chartLabel}>Week 6</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

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
                    <Text style={styles.headerTitle}>Profile 👤</Text>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
                        <Text style={styles.shareIcon}>🔗</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}>

                    {/* Enhanced Profile Card */}
                    <Animated.View style={[styles.profileCard, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.profileGradient}>
                            
                            {/* Avatar Section with Animation */}
                            <TouchableOpacity 
                                style={styles.avatarContainer}
                                onPress={isEditing ? handleAvatarChange : null}>
                                <Animated.View style={[styles.avatar, { transform: [{ scale: pulseAnim }] }]}>
                                    <Text style={styles.avatarEmoji}>
                                        {isEditing ? editForm.avatar : (profile?.personal?.avatar || '👤')}
                                    </Text>
                                </Animated.View>
                                {isEditing && (
                                    <View style={styles.editAvatarBadge}>
                                        <Text style={styles.editAvatarText}>✏️</Text>
                                    </View>
                                )}
                                {/* Level Badge */}
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Lv.{profile?.social?.level || 1}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Profile Info */}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {profile?.personal?.name || 'Anonymous User'}
                                </Text>
                                <Text style={styles.profileEmail}>
                                    {profile?.personal?.email || 'No email set'}
                                </Text>
                                <Text style={styles.profileLocation}>
                                    📍 {profile?.personal?.location || 'Location not set'}
                                </Text>
                                <Text style={styles.profileJoinDate}>
                                    Joined {new Date(profile?.personal?.joinDate || Date.now()).toLocaleDateString()}
                                </Text>
                                <Text style={styles.profileBio}>
                                    {profile?.personal?.bio || 'Supporting healthy relationships'}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.profileActions}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={handleEditToggle}>
                                    <LinearGradient
                                        colors={['#4ecdc4', '#44a08d']}
                                        style={styles.actionGradient}>
                                        <Text style={styles.actionIcon}>{isEditing ? '💾' : '✏️'}</Text>
                                        <Text style={styles.actionText}>{isEditing ? 'Save' : 'Edit'}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={handleCopyProfileLink}>
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.actionGradient}>
                                        <Text style={styles.actionIcon}>🔗</Text>
                                        <Text style={styles.actionText}>Share</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Advanced Stats */}
                    <AdvancedStatsCard
                        title="📊 Communication Stats"
                        stats={{
                            conversations: profile?.stats?.conversationsAnalyzed || 0,
                            improvement: `${profile?.stats?.improvementScore || 0}%`,
                            streak: `${profile?.stats?.streakDays || 0} days`,
                            points: profile?.stats?.totalPoints || 0
                        }}
                        color="#4ecdc4"
                    />

                    {/* Social Activity */}
                    <SocialActivityCard />

                    {/* Progress Chart */}
                    <ProgressChart />

                    {/* Enhanced Achievements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
                        <Text style={styles.sectionSubtitle}>
                            {profile?.achievements?.filter(a => a.earned).length || 0} of {profile?.achievements?.length || 0} unlocked
                        </Text>
                        <FlatList
                            data={profile?.achievements || []}
                            renderItem={({ item, index }) => <AchievementCard achievement={item} index={index} />}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
                        <View style={styles.actionsGrid}>
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => navigation.navigate('Settings')}>
                                <LinearGradient
                                    colors={['#4ecdc4', '#44a08d']}
                                    style={styles.quickActionGradient}>
                                    <Text style={styles.quickActionIcon}>⚙️</Text>
                                    <Text style={styles.quickActionText}>Settings</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => navigation.navigate('RelationshipAnalytics')}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.quickActionGradient}>
                                    <Text style={styles.quickActionIcon}>📈</Text>
                                    <Text style={styles.quickActionText}>Analytics</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => navigation.navigate('SocialFeed')}>
                                <LinearGradient
                                    colors={['#f093fb', '#f5576c']}
                                    style={styles.quickActionGradient}>
                                    <Text style={styles.quickActionIcon}>🌟</Text>
                                    <Text style={styles.quickActionText}>Social</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.quickAction}
                                onPress={() => navigation.navigate('SoloPreparation')}>
                                <LinearGradient
                                    colors={['#feca57', '#ff9ff3']}
                                    style={styles.quickActionGradient}>
                                    <Text style={styles.quickActionIcon}>🎯</Text>
                                    <Text style={styles.quickActionText}>Practice</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.modalGradient}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Name"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={editForm.name}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                            />
                            
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Location"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={editForm.location}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, location: text }))}
                            />
                            
                            <TextInput
                                style={[styles.modalInput, styles.bioInput]}
                                placeholder="Bio"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={editForm.bio}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                                multiline
                                numberOfLines={3}
                            />
                            
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveProfile}>
                                <Text style={styles.modalSaveText}>Save Changes</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowEditModal(false)}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#667eea',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareIcon: {
        fontSize: 18,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    profileCard: {
        marginBottom: 30,
        borderRadius: 20,
        overflow: 'hidden',
    },
    profileGradient: {
        padding: 25,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarEmoji: {
        fontSize: 50,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 10,
        right: width/2 - 80,
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#4ecdc4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarText: {
        fontSize: 16,
    },
    levelBadge: {
        position: 'absolute',
        top: 10,
        right: width/2 - 80,
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
    },
    profileEmail: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    profileLocation: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 5,
    },
    profileJoinDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 15,
    },
    profileBio: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 20,
    },
    profileActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 15,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    actionIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    statsCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    statsGradient: {
        padding: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    socialCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    socialGradient: {
        padding: 20,
    },
    socialTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    socialStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    socialStat: {
        alignItems: 'center',
    },
    socialStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    socialStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    viewActivityButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    viewActivityText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    progressCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    progressGradient: {
        padding: 20,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    chartContainer: {
        alignItems: 'center',
    },
    progressVisualization: {
        alignItems: 'center',
        padding: 20,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    progressSubtext: {
        fontSize: 14,
        color: COLORS.lightGray,
        marginBottom: 15,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    chartBar: {
        width: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 2,
        borderRadius: 2,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    chartLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 15,
    },
    achievementCard: {
        marginBottom: 12,
        borderRadius: 15,
        overflow: 'hidden',
    },
    lockedAchievement: {
        opacity: 0.6,
    },
    achievementGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    achievementEmoji: {
        fontSize: 24,
        marginRight: 15,
    },
    lockedEmoji: {
        opacity: 0.5,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    achievementDate: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
    },
    lockedText: {
        color: 'rgba(255,255,255,0.5)',
    },
    earnedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4ecdc4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earnedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    quickActionGradient: {
        padding: 20,
        alignItems: 'center',
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
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
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 15,
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
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
});

export default EnhancedUserProfileScreen;
