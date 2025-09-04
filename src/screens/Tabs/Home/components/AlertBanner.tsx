import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../theme/colors';

const AlertBanner = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Placeholder for coconut icon */}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.urgentText}>Urgent</Text>
        <Text style={styles.mainText}>Buyer Requesting for Photos</Text>
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8BC34A', // A lighter green
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    // In a real app, you'd have an Image here
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  urgentText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 12,
  },
  mainText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default AlertBanner;