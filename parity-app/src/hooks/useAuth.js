import { useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService';
import { Alert } from 'react-native';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    console.log('🔵 [USE AUTH] Starting auth initialization...');
    
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const isAuth = AuthService.isAuthenticated();
        const currentUser = AuthService.getCurrentUser();
        const currentToken = AuthService.getToken();
        
        console.log('🔵 [USE AUTH] Auth check result:', { isAuth, hasUser: !!currentUser, hasToken: !!currentToken });
        
        if (isAuth && currentUser && currentToken) {
          console.log('🟢 [USE AUTH] User already authenticated, restoring state...');
          setIsAuthenticated(true);
          setUser(currentUser);
          setToken(currentToken);
        } else {
          console.log('🔵 [USE AUTH] No existing authentication found');
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('🔴 [USE AUTH] Error during auth initialization:', error);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
        console.log('🔵 [USE AUTH] Auth initialization completed');
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.login(email, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setToken(result.token);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (email, password) => {
    try {
      console.log('🔵 [USE AUTH] Starting registration...');
      setLoading(true);
      setError(null);
      
      const result = await AuthService.register(email, password);
      console.log('🔵 [USE AUTH] Registration result:', result);
      
      if (result.success) {
        console.log('🟢 [USE AUTH] Registration successful, updating auth state...');
        console.log('🟢 [USE AUTH] User data:', result.user);
        console.log('🟢 [USE AUTH] Token:', result.token);
        
        setIsAuthenticated(true);
        setUser(result.user);
        setToken(result.token);
        
        console.log('🟢 [USE AUTH] Auth state updated successfully');
        return { success: true, user: result.user };
      } else {
        console.log('🔴 [USE AUTH] Registration failed:', result.error);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('🔴 [USE AUTH] Registration error:', err);
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('🔵 [USE AUTH] Registration process completed');
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.logout();
      
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get authenticated axios instance
  const getAuthenticatedAxios = useCallback(() => {
    return AuthService.getAuthenticatedAxios();
  }, []);

  return {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    getAuthenticatedAxios
  };
};

export default useAuth;
