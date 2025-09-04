
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import MarketPricesScreen from '../screens/Tabs/Home/MarketPricesScreen';

export type AppStackParamList = {
  Splash: undefined;
  Auth: undefined;
  MainTabs: undefined;
  MarketPrices: undefined;
};

const AppStack = createStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  const { isLoading, isAuthenticated, isOnboardingCompleted } = useAuth();

  // Show splash screen while checking auth state
  if (isLoading) {
    return (
      <NavigationContainer>
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Splash" component={SplashScreen} />
        </AppStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // User not authenticated - show auth flow
          <AppStack.Screen name="Auth" component={AuthNavigator} />
        ) : !isOnboardingCompleted ? (
          // User authenticated but onboarding not completed - show onboarding
          <AppStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // User authenticated and onboarding completed - show main app
          <>
            <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
            <AppStack.Screen name="MarketPrices" component={MarketPricesScreen} />
          </>
        )}
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;