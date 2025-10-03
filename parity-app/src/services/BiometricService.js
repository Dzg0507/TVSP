import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BiometricService {
  constructor() {
    this.isAvailable = false;
    this.supportedTypes = [];
    this.init();
  }

  async init() {
    try {
      // Check if biometric authentication is available
      this.isAvailable = await LocalAuthentication.hasHardwareAsync();
      
      if (this.isAvailable) {
        // Get supported authentication types
        this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log('Biometric authentication available:', this.supportedTypes);
      } else {
        console.log('Biometric authentication not available on this device');
      }
    } catch (error) {
      console.error('Error initializing biometric service:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  getBiometricType() {
    if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    } else if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(reason = 'Authenticate to access your account') {
    try {
      if (!this.isAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        throw new Error('No biometric credentials are enrolled on this device');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return {
        success: result.success,
        error: result.success ? null : 'Biometric authentication failed',
        errorCode: result.error,
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Store biometric credentials for a user
   */
  async storeBiometricCredentials(userId, credentials) {
    try {
      const key = `biometric_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(credentials));
      return true;
    } catch (error) {
      console.error('Error storing biometric credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve biometric credentials for a user
   */
  async getBiometricCredentials(userId) {
    try {
      const key = `biometric_${userId}`;
      const credentials = await AsyncStorage.getItem(key);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error retrieving biometric credentials:', error);
      return null;
    }
  }

  /**
   * Remove biometric credentials for a user
   */
  async removeBiometricCredentials(userId) {
    try {
      const key = `biometric_${userId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing biometric credentials:', error);
      return false;
    }
  }

  /**
   * Check if biometric is enabled for a user
   */
  async isBiometricEnabled(userId) {
    try {
      const credentials = await this.getBiometricCredentials(userId);
      return credentials !== null;
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for a user
   */
  async enableBiometric(userId, userCredentials) {
    try {
      // First authenticate with biometrics to ensure it's working
      const authResult = await this.authenticate('Enable biometric authentication for your account');
      
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Biometric authentication failed',
        };
      }

      // Store the user credentials
      const stored = await this.storeBiometricCredentials(userId, userCredentials);
      
      if (!stored) {
        return {
          success: false,
          error: 'Failed to store biometric credentials',
        };
      }

      return {
        success: true,
        message: 'Biometric authentication enabled successfully',
      };
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return {
        success: false,
        error: error.message || 'Failed to enable biometric authentication',
      };
    }
  }

  /**
   * Disable biometric authentication for a user
   */
  async disableBiometric(userId) {
    try {
      const removed = await this.removeBiometricCredentials(userId);
      
      if (!removed) {
        return {
          success: false,
          error: 'Failed to remove biometric credentials',
        };
      }

      return {
        success: true,
        message: 'Biometric authentication disabled successfully',
      };
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return {
        success: false,
        error: error.message || 'Failed to disable biometric authentication',
      };
    }
  }
}

export default new BiometricService();
