import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthContext } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';

// Authentication screens
import UltraComprehensiveLoginScreen from '../screens/UltraComprehensiveLoginScreen';
import EnhancedOnboardingScreen from '../screens/EnhancedOnboardingScreen';

// Main app screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import EnhancedPartnerLinkingScreen from '../screens/EnhancedPartnerLinkingScreen';
import ChatScreen from '../screens/ChatScreen';
import EnhancedSocialFeedScreen from '../screens/EnhancedSocialFeedScreen';
import RelationshipInsightsScreen from '../screens/RelationshipInsightsScreen';
import RelationshipAnalyticsScreen from '../screens/RelationshipAnalyticsScreen';
import EnhancedUserProfileScreen from '../screens/EnhancedUserProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import MessageImportScreen from '../screens/MessageImportScreen';
import AICoachChatScreen from '../screens/AICoachChatScreen';

// AI Coaching screens
import SoloPreparationScreen from '../screens/SoloPreparationScreen';
import JointSessionScreen from '../screens/JointSessionScreen';
import CommunicationSkillsScreen from '../screens/CommunicationSkillsScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { isAuthenticated, loading, user } = useAuthContext();

  console.log('🔵 [AUTH NAVIGATOR] Current state:', { isAuthenticated, loading, user: !!user });

  // Show loading screen while checking authentication
  if (loading) {
    console.log('🔵 [AUTH NAVIGATOR] Still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 18, color: '#333' }}>Loading...</Text>
      </View>
    );
  }

  console.log('🔵 [AUTH NAVIGATOR] Rendering main navigator...');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated || !user ? (
        // Authentication screens
        <>
          {console.log('🔵 [AUTH NAVIGATOR] Showing authentication screens')}
          <Stack.Screen name="Login" component={UltraComprehensiveLoginScreen} />
          <Stack.Screen name="Onboarding" component={EnhancedOnboardingScreen} />
        </>
      ) : (
        // Authenticated screens - Main App
        <>
          {console.log('🔵 [AUTH NAVIGATOR] Showing authenticated screens - Dashboard')}
          {/* Main Dashboard */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          
          {/* Profile & Setup */}
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="UserProfile" component={EnhancedUserProfileScreen} />
          
          {/* Partner & Relationship */}
          <Stack.Screen name="PartnerLinking" component={EnhancedPartnerLinkingScreen} />
          <Stack.Screen name="RelationshipInsights" component={RelationshipInsightsScreen} />
          <Stack.Screen name="RelationshipAnalytics" component={RelationshipAnalyticsScreen} />
          
          {/* Communication & Chat */}
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="AICoachChat" component={AICoachChatScreen} />
          <Stack.Screen name="MessageImport" component={MessageImportScreen} />
          
          {/* Social Features */}
          <Stack.Screen name="SocialFeed" component={EnhancedSocialFeedScreen} />
          
          {/* AI Coaching Features */}
          <Stack.Screen name="SoloPreparation" component={SoloPreparationScreen} />
          <Stack.Screen name="JointSession" component={JointSessionScreen} />
          <Stack.Screen name="CommunicationSkills" component={CommunicationSkillsScreen} />
          
          {/* Settings & Configuration */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
