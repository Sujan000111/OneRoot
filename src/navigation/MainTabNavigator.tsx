import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from '../screens/Tabs/Home/HomeScreen';
import CallsScreen from '../screens/Tabs/Calls/CallsScreen';
import FindBuyerScreen from '../screens/Tabs/FindBuyer/FindBuyerScreen';
import BuyerScreen from '../screens/Tabs/Buyer/BuyerScreen';
import ProfileScreen from '../screens/Tabs/Profile/ProfileScreen';

// Import custom components and theme
import { COLORS } from '../theme/colors';
import TabBarActionButton from './TabBarActionButton';

export type MainTabParamList = {
  Home: undefined;
  Calls: undefined;
  FindMatch: undefined;
  Buyers: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="call-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FindMatch"
        component={FindBuyerScreen}
        options={{
          tabBarLabel: 'Find a Match',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="handshake-outline" color={COLORS.secondary} size={30} />
          ),
          tabBarButton: (props) => (
            <TabBarActionButton {...props} />
          ),
          tabBarLabelStyle: styles.findMatchLabel,
        }}
      />
      <Tab.Screen
        name="Buyers"
        component={BuyerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    height: 70,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  findMatchLabel: {
    fontSize: 12,
    marginBottom: 8, // Moves "Find a Match" text a little lower
  },
});

export default MainTabNavigator;