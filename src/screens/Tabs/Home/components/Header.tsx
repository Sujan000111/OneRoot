import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';
import MarketPriceButton from './MarketPriceButton';
import { useAuth } from '../../../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  
  // Get user's name or fallback to a generic greeting
  const userName = user?.name || 'Farmer';
  
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity>
          <Feather name="menu" size={28} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello {userName}!</Text>
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity>
          <Ionicons name="headset-outline" size={28} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraIcon}>
          <Feather name="camera" size={28} color={COLORS.black} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>4</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 5,
    backgroundColor: COLORS.background,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 15,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraIcon: {
    marginLeft: 15,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;