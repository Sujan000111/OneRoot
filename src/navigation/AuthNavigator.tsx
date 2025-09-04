import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import MarketPricesScreen from '../screens/Tabs/Home/MarketPricesScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="MainTabs" component={MainTabNavigator} />
			<Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
		</Stack.Navigator>
	);
};

export default AuthNavigator;