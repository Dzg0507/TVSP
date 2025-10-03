import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Modal,
  Switch,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useAuthContext } from '../contexts/AuthContext';
import StyledTextInput from '../components/StyledTextInput';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BiometricService from '../services/BiometricService';

const { width, height } = Dimensions.get('window');

const UltraComprehensiveLoginScreen = ({ navigation }) => {
  const { login, register, loading, error, clearError } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Additional comprehensive features
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [socialLoginLoading, setSocialLoginLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Load saved credentials if remember me was enabled
    loadSavedCredentials();
    
    // Check biometric availability
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
    // Calculate password strength
    if (password.length > 0) {
      calculatePasswordStrength(password);
    }
  }, [password]);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('saved_email');
      const savedRememberMe = await AsyncStorage.getItem('remember_me');
      if (savedEmail && savedRememberMe === 'true') {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isBiometricAvailable();
      const enabled = await BiometricService.isBiometricEnabled('current_user');
      const type = BiometricService.getBiometricType();
      
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
      setBiometricEnabled(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    setShowPasswordStrength(password.length > 0);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }

    // Validate confirm password for registration
    if (!isLogin) {
      if (!confirmPassword.trim()) {
        setConfirmPasswordError('Please confirm your password');
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        isValid = false;
      }
    }

    // Validate terms acceptance for registration
    if (!isLogin && !acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service and Privacy Policy to continue.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    console.log('🔵 [LOGIN SCREEN] ===== AUTHENTICATION STARTED =====');
    console.log('🔵 [LOGIN SCREEN] Mode:', isLogin ? 'LOGIN' : 'REGISTER');
    console.log('🔵 [LOGIN SCREEN] Email:', email);
    console.log('🔵 [LOGIN SCREEN] Password length:', password ? password.length : 0);
    console.log('🔵 [LOGIN SCREEN] Remember me:', rememberMe);
    console.log('🔵 [LOGIN SCREEN] Accepted terms:', acceptedTerms);
    
    if (!validateForm()) {
      console.log('🔴 [LOGIN SCREEN] Form validation failed - stopping authentication');
      return;
    }

    console.log('🟢 [LOGIN SCREEN] Form validation passed - proceeding with API call');

    try {
      let result;
      if (isLogin) {
        console.log('🔵 [LOGIN SCREEN] Calling login function...');
        result = await login(email.trim(), password);
      } else {
        console.log('🔵 [LOGIN SCREEN] Calling register function...');
        result = await register(email.trim(), password);
      }
      
      console.log('🔵 [LOGIN SCREEN] API call completed');
      console.log('🔵 [LOGIN SCREEN] Result success:', result.success);
      console.log('🔵 [LOGIN SCREEN] Result error:', result.error);
      console.log('🔵 [LOGIN SCREEN] Full result object:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('🟢 [LOGIN SCREEN] Authentication successful!');
        
        // Save credentials if remember me is enabled
        if (rememberMe) {
          console.log('🔵 [LOGIN SCREEN] Saving credentials to AsyncStorage...');
          await AsyncStorage.setItem('saved_email', email);
          await AsyncStorage.setItem('remember_me', 'true');
          console.log('🟢 [LOGIN SCREEN] Credentials saved');
        } else {
          console.log('🔵 [LOGIN SCREEN] Clearing saved credentials...');
          await AsyncStorage.removeItem('saved_email');
          await AsyncStorage.removeItem('remember_me');
          console.log('🟢 [LOGIN SCREEN] Credentials cleared');
        }

        // Update authentication state instead of navigating directly
        if (isLogin) {
          console.log('🟢 [LOGIN SCREEN] Login successful - showing success alert');
          // For login, update auth state which will trigger navigation to Dashboard
          // The AuthNavigator will handle the navigation based on auth state
          Alert.alert('Success', 'Welcome back!');
        } else {
          console.log('🟢 [LOGIN SCREEN] Registration successful - auth state updated');
          // For registration, the auto-login should have updated auth state
          // The AuthNavigator will handle the navigation based on auth state
          Alert.alert('Success', 'Account created successfully!');
        }
      } else {
        console.log('🔴 [LOGIN SCREEN] Authentication failed');
        console.log('🔴 [LOGIN SCREEN] Error details:', result.error);
        
        // Handle specific error cases with helpful messages
        if (result.error && result.error.includes('already registered')) {
          console.log('🔴 [LOGIN SCREEN] Email already registered error');
          Alert.alert(
            'Email Already Registered',
            result.error,
            [
              { text: 'Try Different Email', style: 'cancel' },
              { 
                text: 'Login Instead', 
                onPress: () => {
                  console.log('🔵 [LOGIN SCREEN] User chose to login instead');
                  setIsLogin(true);
                  // Pre-fill the email for login
                  setEmail(email);
                }
              }
            ]
          );
        } else if (result.error && result.error.includes('Invalid email or password')) {
          console.log('🔴 [LOGIN SCREEN] Invalid credentials error');
          Alert.alert(
            'Login Failed',
            result.error,
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Forgot Password?', 
                onPress: () => handleForgotPassword()
              }
            ]
          );
        } else {
          console.log('🔴 [LOGIN SCREEN] Generic error - showing alert');
          Alert.alert('Error', result.error || 'Authentication failed');
        }
      }
    } catch (err) {
      console.error('🔴 [LOGIN SCREEN] Unexpected error in handleSubmit!');
      console.error('🔴 [LOGIN SCREEN] Error type:', err.constructor.name);
      console.error('🔴 [LOGIN SCREEN] Error message:', err.message);
      console.error('🔴 [LOGIN SCREEN] Full error object:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    }
  };

  const handleBiometricLogin = async () => {
    console.log('🔵 [LOGIN SCREEN] ===== BIOMETRIC LOGIN STARTED =====');
    console.log('🔵 [LOGIN SCREEN] Biometric available:', biometricAvailable);
    console.log('🔵 [LOGIN SCREEN] Biometric type:', biometricType);
    
    setSocialLoginLoading(true);
    try {
      // Check if biometric is available
      if (!biometricAvailable) {
        console.log('🔴 [LOGIN SCREEN] Biometric not available on device');
        Alert.alert('Biometric Unavailable', 'Biometric authentication is not available on this device.');
        return;
      }

      console.log('🔵 [LOGIN SCREEN] Starting biometric authentication...');
      // Authenticate using fingerprint/face ID
      const authResult = await BiometricService.authenticate('Use your fingerprint to login');
      console.log('🔵 [LOGIN SCREEN] Biometric auth result:', authResult);
      
      if (!authResult.success) {
        console.log('🔴 [LOGIN SCREEN] Biometric authentication failed');
        Alert.alert('Biometric Authentication Failed', authResult.error || 'Please try again');
        return;
      }

      console.log('🔵 [LOGIN SCREEN] Biometric auth successful, getting stored credentials...');
      // Get stored credentials
      const storedEmail = await AsyncStorage.getItem('saved_email');
      console.log('🔵 [LOGIN SCREEN] Stored email:', storedEmail);
      
      if (!storedEmail) {
        console.log('🔴 [LOGIN SCREEN] No stored email found');
        Alert.alert('No Stored Credentials', 'Please login with email and password first to enable biometric login.');
        return;
      }

      // Get stored biometric credentials
      const biometricCredentials = await BiometricService.getBiometricCredentials('current_user');
      console.log('🔵 [LOGIN SCREEN] Biometric credentials found:', !!biometricCredentials);
      
      if (!biometricCredentials) {
        console.log('🔴 [LOGIN SCREEN] No biometric credentials stored');
        Alert.alert('Biometric Not Set Up', 'Please enable biometric authentication in settings first.');
        return;
      }

      console.log('🔵 [LOGIN SCREEN] Attempting login with stored credentials...');
      // Login using stored credentials
      const result = await login(storedEmail, biometricCredentials.password);
      console.log('🔵 [LOGIN SCREEN] Biometric login result:', result);
      
      if (result.success) {
        console.log('🟢 [LOGIN SCREEN] Biometric login successful!');
        Alert.alert('Success', `${biometricType} authentication successful!`);
        // Auth state is now updated, AuthNavigator will handle navigation
      } else {
        console.log('🔴 [LOGIN SCREEN] Biometric login failed');
        Alert.alert('Login Failed', result.error || 'Failed to login with biometric credentials');
      }
    } catch (error) {
      console.error('🔴 [LOGIN SCREEN] Biometric login error occurred!');
      console.error('🔴 [LOGIN SCREEN] Error type:', error.constructor.name);
      console.error('🔴 [LOGIN SCREEN] Error message:', error.message);
      console.error('🔴 [LOGIN SCREEN] Full error object:', error);
      Alert.alert('Biometric Error', 'Biometric authentication failed. Please try again.');
    } finally {
      console.log('🔵 [LOGIN SCREEN] Biometric login process completed');
      setSocialLoginLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      if (!biometricAvailable) {
        Alert.alert('Biometric Unavailable', 'Biometric authentication is not available on this device.');
        return;
      }

      if (!email || !password) {
        Alert.alert('Credentials Required', 'Please enter your email and password first.');
        return;
      }

      // First authenticate with current credentials
      const loginResult = await login(email.trim(), password);
      if (!loginResult.success) {
        Alert.alert('Authentication Failed', 'Please verify your credentials first.');
        return;
      }

      // Enable biometric authentication
      const biometricResult = await BiometricService.enableBiometric('current_user', {
        email: email.trim(),
        password: password,
      });

      if (biometricResult.success) {
        setBiometricEnabled(true);
        Alert.alert('Biometric Enabled', `${biometricType} authentication has been enabled for your account.`);
      } else {
        Alert.alert('Enable Failed', biometricResult.error || 'Failed to enable biometric authentication.');
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication.');
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoginLoading(true);
    try {
      // Simulate social login
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For social login, we need to call the actual login function
      // In a real app, this would get the social auth token and user info
      const socialEmail = `user@${provider.toLowerCase()}.com`;
      const result = await login(socialEmail, 'social_auth');
      
      if (result.success) {
        Alert.alert('Social Login', `${provider} login successful!`);
        // Auth state is now updated, AuthNavigator will handle navigation
      } else {
        Alert.alert('Social Login Error', `${provider} login failed`);
      }
    } catch (error) {
      Alert.alert('Social Login Error', `${provider} login failed`);
    } finally {
      setSocialLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('http://192.168.12.246:8000/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Reset Link Sent',
          'If an account with that email exists, a password reset link has been sent. Check your email for instructions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setConfirmPassword('');
    setAcceptedTerms(false);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setConfirmPasswordError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ff6b6b';
    if (passwordStrength <= 3) return '#feca57';
    return '#4ecdc4';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const renderPasswordStrength = () => {
    if (!showPasswordStrength) return null;
    
    return (
      <View style={styles.passwordStrengthContainer}>
        <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
        <View style={styles.passwordStrengthBar}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              style={[
                styles.passwordStrengthSegment,
                {
                  backgroundColor: level <= passwordStrength ? getPasswordStrengthColor() : '#e0e0e0'
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
          {getPasswordStrengthText()}
        </Text>
      </View>
    );
  };

  const renderTermsModal = () => (
    <Modal
      visible={showTermsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Terms of Service</Text>
          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.modalText}>
              By using Parity, you agree to our Terms of Service. This includes:
              {'\n\n'}
              • Respectful communication with your partner
              {'\n'}
              • Privacy and data protection
              {'\n'}
              • Responsible use of AI coaching features
              {'\n'}
              • Compliance with community guidelines
              {'\n\n'}
              Full terms available at parity-app.com/terms
            </Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Privacy Policy</Text>
          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.modalText}>
              Your privacy is important to us. We collect and use your data to:
              {'\n\n'}
              • Provide personalized relationship coaching
              {'\n'}
              • Improve our AI algorithms
              {'\n'}
              • Send relevant notifications
              {'\n'}
              • Ensure platform security
              {'\n\n'}
              We never share your personal conversations or data with third parties.
              {'\n\n'}
              Full policy available at parity-app.com/privacy
            </Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Animated.Text style={[styles.title, { transform: [{ scale: pulseAnim }] }]}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Animated.Text>
                <Text style={styles.subtitle}>
                  {isLogin 
                    ? 'Sign in to continue your journey' 
                    : 'Join us and start building better relationships'
                  }
                </Text>
              </View>

              {/* Biometric Login (Login only) */}
              {isLogin && biometricAvailable && (
                <View style={styles.biometricContainer}>
                  {biometricEnabled ? (
                    <TouchableOpacity
                      style={styles.biometricButton}
                      onPress={handleBiometricLogin}
                      disabled={socialLoginLoading}
                    >
                      <Text style={styles.biometricIcon}>
                        {biometricType === 'Fingerprint' ? '👆' : biometricType === 'Face ID' ? '👤' : '🔐'}
                      </Text>
                      <Text style={styles.biometricText}>
                        {socialLoginLoading ? 'Authenticating...' : `Use ${biometricType}`}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.biometricButton, styles.biometricEnableButton]}
                      onPress={handleEnableBiometric}
                    >
                      <Text style={styles.biometricIcon}>
                        {biometricType === 'Fingerprint' ? '👆' : biometricType === 'Face ID' ? '👤' : '🔐'}
                      </Text>
                      <Text style={styles.biometricText}>
                        Enable {biometricType}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialTitle}>Or continue with</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialLogin('Google')}
                    disabled={socialLoginLoading}
                  >
                    <Text style={styles.socialIcon}>🔍</Text>
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('Apple')}
                    disabled={socialLoginLoading}
                  >
                    <Text style={styles.socialIcon}>🍎</Text>
                    <Text style={styles.socialText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <StyledTextInput
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    error={emailError}
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <StyledTextInput
                      value={password}
                      onChangeText={handlePasswordChange}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      error={passwordError}
                      style={styles.passwordInput}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={togglePasswordVisibility}
                      disabled={loading}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  {renderPasswordStrength()}
                </View>

                {/* Confirm Password Input (Registration only) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <StyledTextInput
                      value={confirmPassword}
                      onChangeText={handleConfirmPasswordChange}
                      placeholder="Confirm your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      error={confirmPasswordError}
                    />
                    {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                  </View>
                )}

                {/* Remember Me & Advanced Options */}
                <View style={styles.optionsContainer}>
                  <View style={styles.rememberMeContainer}>
                    <Switch
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      trackColor={{ false: '#767577', true: '#4ecdc4' }}
                      thumbColor={rememberMe ? '#fff' : '#f4f3f4'}
                    />
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.advancedButton}
                    onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <Text style={styles.advancedButtonText}>Advanced Options</Text>
                    <Text style={styles.advancedButtonIcon}>{showAdvancedOptions ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <View style={styles.advancedContainer}>
                    <View style={styles.advancedOption}>
                      <Switch
                        value={twoFactorEnabled}
                        onValueChange={setTwoFactorEnabled}
                        trackColor={{ false: '#767577', true: '#4ecdc4' }}
                        thumbColor={twoFactorEnabled ? '#fff' : '#f4f3f4'}
                      />
                      <Text style={styles.advancedOptionText}>Enable 2FA</Text>
                    </View>
                  </View>
                )}

                {/* Terms and Privacy (Registration only) */}
                {!isLogin && (
                  <View style={styles.termsContainer}>
                    <View style={styles.termsCheckbox}>
                      <TouchableOpacity
                        style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                      >
                        {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View style={styles.termsTextContainer}>
                        <Text style={styles.termsText}>
                          I agree to the{' '}
                          <Text
                            style={styles.termsLink}
                            onPress={() => setShowTermsModal(true)}
                          >
                            Terms of Service
                          </Text>
                          {' '}and{' '}
                          <Text
                            style={styles.termsLink}
                            onPress={() => setShowPrivacyModal(true)}
                          >
                            Privacy Policy
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title={loading ? 'Please Wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    onPress={handleSubmit}
                    disabled={loading || socialLoginLoading}
                    style={[styles.submitButton, (loading || socialLoginLoading) && styles.disabledButton]}
                  />
                  {(loading || socialLoginLoading) && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                      style={styles.loadingIndicator}
                    />
                  )}
                </View>

                {/* Toggle Mode */}
                <TouchableOpacity
                  style={styles.toggleContainer}
                  onPress={toggleMode}
                  disabled={loading || socialLoginLoading}
                >
                  <Text style={styles.toggleText}>
                    {isLogin 
                      ? "Don't have an account? " 
                      : "Already have an account? "
                    }
                    <Text style={styles.toggleLink}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password (Login only) */}
                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                    disabled={loading || socialLoginLoading}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modals */}
      {renderTermsModal()}
      {renderPrivacyModal()}
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
    height: height,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  biometricContainer: {
    marginBottom: SIZES.padding,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  biometricEnableButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  biometricIcon: {
    fontSize: 20,
    marginRight: SIZES.base,
  },
  biometricText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: SIZES.padding,
  },
  socialTitle: {
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.base,
    fontSize: SIZES.body3,
    opacity: 0.9,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base / 2,
  },
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  appleButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  socialIcon: {
    fontSize: 18,
    marginRight: SIZES.base / 2,
  },
  socialText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: COLORS.white,
    marginHorizontal: SIZES.base,
    fontSize: SIZES.body3,
    opacity: 0.7,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    backdropFilter: 'blur(10px)',
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  passwordStrengthContainer: {
    marginTop: SIZES.base / 2,
  },
  passwordStrengthLabel: {
    color: COLORS.white,
    fontSize: SIZES.caption,
    marginBottom: SIZES.base / 4,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    marginBottom: SIZES.base / 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: SIZES.padding,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  rememberMeText: {
    color: COLORS.white,
    marginLeft: SIZES.base,
    fontSize: SIZES.body3,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base / 2,
  },
  advancedButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
  },
  advancedButtonIcon: {
    color: COLORS.white,
    fontSize: 12,
  },
  advancedContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.padding,
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedOptionText: {
    color: COLORS.white,
    marginLeft: SIZES.base,
    fontSize: SIZES.body3,
  },
  termsContainer: {
    marginBottom: SIZES.padding,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 4,
    marginRight: SIZES.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: COLORS.white,
    fontSize: SIZES.caption,
    lineHeight: 18,
  },
  termsLink: {
    color: '#4ecdc4',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginBottom: SIZES.padding,
    position: 'relative',
  },
  submitButton: {
    marginBottom: SIZES.base,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  toggleText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
  },
  toggleLink: {
    color: '#4ecdc4',
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#4ecdc4',
    fontSize: SIZES.body3,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: SIZES.caption,
    marginTop: SIZES.base / 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    maxHeight: height * 0.7,
    width: '100%',
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: height * 0.4,
  },
  modalText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SIZES.padding,
  },
  modalButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  modalButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body3,
    fontWeight: '600',
  },
});

export default UltraComprehensiveLoginScreen;
