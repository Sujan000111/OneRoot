import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

const ProblemCallButton = () => {
  return (
    <TouchableOpacity style={styles.button}>
      <Ionicons name="headset-outline" size={22} color={COLORS.primary} />
      <Text style={styles.text}>Problem? Call Us</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F2E5', // Light green background
    borderRadius: 30,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 80,
    marginBottom: 10,
  },
  text: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProblemCallButton;