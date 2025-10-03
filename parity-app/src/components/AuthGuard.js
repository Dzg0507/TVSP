import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const AuthGuard = ({ children, fallback: FallbackComponent }) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    // Default fallback - redirect to login
    return null; // This should be handled by navigation logic
  }

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
});

export default AuthGuard;
