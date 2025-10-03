import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useAuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [showQuickMenu, setShowQuickMenu] = useState(false);

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

  const handleStartConversation = () => {
    navigation.navigate('Chat', { partnerName: 'Sarah' });
  };

  const handleViewSocialFeed = () => {
    navigation.navigate('SocialFeed');
  };

  const handleViewInsights = () => {
    navigation.navigate('RelationshipInsights');
  };

  const handleSettings = () => {
    navigation.navigate('UserProfile');
  };

  const handleMessageImport = () => {
    navigation.navigate('MessageImport');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={['#4facfe', '#00f2fe', '#43e97b']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Elements */}
      <View style={[styles.floatingElement, styles.element1]} />
      <View style={[styles.floatingElement, styles.element2]} />
      <View style={[styles.floatingElement, styles.element3]} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView 
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning! 🌅</Text>
              <Text style={styles.username}>Welcome back, Alex</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={handleSettings}>
              <Text style={styles.profileIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <Animated.View style={[styles.statsContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Sessions</Text>
                <Text style={styles.statSubtext}>This month</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Progress</Text>
                <Text style={styles.statSubtext}>Communication</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AICoachChat')}>
              <LinearGradient
                colors={['#ff9a9e', '#fecfef']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>🤖</Text>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>AI Coach - Dr. Sebiv Doog</Text>
                    <Text style={styles.actionSubtitle}>Get personalized relationship guidance</Text>
                    
                    {/* Empathy Score Preview */}
                    <View style={styles.empathyPreview}>
                      <Text style={styles.empathyLabel}>Last Empathy Score:</Text>
                      <View style={styles.empathyScorePreview}>
                        <Text style={styles.empathyScoreText}>82%</Text>
                      </View>
                    </View>
                    
                    {/* Quick Tip Preview */}
                    <Text style={styles.quickTip}>💡 "Try using 'I feel' statements for better connection"</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewSocialFeed}>
              <LinearGradient
                colors={['#a8edea', '#fed6e3']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Community Support</Text>
                    <Text style={styles.actionSubtitle}>Connect with others anonymously</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewInsights}>
              <LinearGradient
                colors={['#ffecd2', '#fcb69f']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Relationship Insights</Text>
                    <Text style={styles.actionSubtitle}>View your progress analytics</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleMessageImport}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>📥</Text>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Import Messages</Text>
                    <Text style={styles.actionSubtitle}>Analyze your conversation history</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Completed coaching session</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: '#ff6b6b' }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Posted in community</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: '#4ecdc4' }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Linked with partner</Text>
                  <Text style={styles.activityTime}>3 days ago</Text>
                </View>
              </View>
            </View>
          </View>

        </Animated.ScrollView>

        {/* Floating Quick Access Menu */}
        <TouchableOpacity 
          style={styles.floatingMenuButton}
          onPress={() => setShowQuickMenu(!showQuickMenu)}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}>
            <Text style={styles.floatingButtonIcon}>{showQuickMenu ? '✕' : '☰'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {showQuickMenu && (
          <Animated.View style={[styles.quickMenuOverlay, { opacity: fadeAnim }]}>
            <View style={styles.quickMenuContainer}>
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { handleStartConversation(); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#4ecdc4', '#44a08d']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>💬</Text>
                  <Text style={styles.quickMenuText}>Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { handleViewSocialFeed(); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#feca57', '#ff9ff3']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>🌟</Text>
                  <Text style={styles.quickMenuText}>Social</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { handleViewInsights(); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#ff6b6b', '#ee5a24']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>📊</Text>
                  <Text style={styles.quickMenuText}>Insights</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { handleMessageImport(); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>📥</Text>
                  <Text style={styles.quickMenuText}>Import</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { navigation.navigate('AICoachChat'); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>🤖</Text>
                  <Text style={styles.quickMenuText}>AI Coach</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickMenuItem} onPress={() => { handleSettings(); setShowQuickMenu(false); }}>
                <LinearGradient colors={['#96ceb4', '#ffeaa7']} style={styles.quickMenuGradient}>
                  <Text style={styles.quickMenuIcon}>👤</Text>
                  <Text style={styles.quickMenuText}>Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  element1: {
    width: 100,
    height: 100,
    top: 100,
    right: -20,
  },
  element2: {
    width: 60,
    height: 60,
    top: 300,
    left: -10,
  },
  element3: {
    width: 80,
    height: 80,
    bottom: 200,
    right: 30,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  username: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileIcon: {
    fontSize: 20,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 5,
  },
  statSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionCard: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  actionGradient: {
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  actionArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  empathyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  empathyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  empathyScorePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  empathyScoreText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  quickTip: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  recentActivity: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ecdc4',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Floating Menu Styles
  floatingMenuButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  quickMenuOverlay: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  quickMenuContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
  quickMenuItem: {
    borderRadius: 25,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  quickMenuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
  },
  quickMenuIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  quickMenuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DashboardScreen;
