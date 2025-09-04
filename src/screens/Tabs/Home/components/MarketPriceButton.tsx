import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

const MarketPriceButton = () => {
  const navigation: any = useNavigation();
  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('MarketPrices') }>
      <MaterialCommunityIcons name="currency-inr" size={24} color={COLORS.primary} />
      <Text style={styles.text}>Market Prices</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F2E5', // Light green background
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 15,
    marginVertical: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
    marginRight: 4,
  },
});

export default MarketPriceButton;