import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

const InfoRow = ({ icon, label, value }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textContainer: {
    marginLeft: 15,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
});

export default InfoRow;