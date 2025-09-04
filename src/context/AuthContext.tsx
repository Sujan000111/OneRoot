import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

interface User {
  id: string;
  phone: string;
  name?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  cropnames?: string[];
  language?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  language: string;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState('en'); // Default to English

  const isAuthenticated = !!user;
  const isOnboardingCompleted = user?.onboardingCompleted || false;

  // Check authentication state on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored token and user data
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const storedLanguage = await AsyncStorage.getItem('userLanguage');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid
        if (authService.isTokenValid(token)) {
          setUser(parsedUser);
          authService.setJwt(token);
          
          if (storedLanguage) {
            setLanguageState(storedLanguage);
          }
          
          console.log('🔐 AuthContext - User authenticated from storage:', parsedUser);
        } else {
          // Token expired, clear storage
          await logout();
        }
      }
    } catch (error) {
      console.error('❌ AuthContext - Error checking auth state:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token: string) => {
    try {
      // Store token and user data
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Set in auth service
      authService.setJwt(token);
      
      // Set user state
      setUser(userData);
      
      console.log('🔐 AuthContext - User logged in:', userData);
    } catch (error) {
      console.error('❌ AuthContext - Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userLanguage']);
      
      // Clear auth service
      authService.setJwt(null);
      
      // Clear state
      setUser(null);
      setLanguageState('en');
      
      console.log('🔐 AuthContext - User logged out');
    } catch (error) {
      console.error('❌ AuthContext - Error during logout:', error);
    }
  };

  const completeOnboarding = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update user data
      const updatedUser = { ...user, ...userData, onboardingCompleted: true };
      
      // Store updated user data
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      console.log('🔐 AuthContext - Onboarding completed:', updatedUser);
    } catch (error) {
      console.error('❌ AuthContext - Error completing onboarding:', error);
      throw error;
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      // Store language preference
      await AsyncStorage.setItem('userLanguage', lang);
      
      // Update state
      setLanguageState(lang);
      
      console.log('🔐 AuthContext - Language set to:', lang);
    } catch (error) {
      console.error('❌ AuthContext - Error setting language:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isOnboardingCompleted,
    language,
    login,
    logout,
    completeOnboarding,
    setLanguage,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
