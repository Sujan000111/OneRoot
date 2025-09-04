import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

const MenuButton = ({ icon, label, onPress, isDestructive, animStyle }) => {
  const textColor = isDestructive ? COLORS.error : COLORS.darkGray;
  const iconColor = isDestructive ? COLORS.error : COLORS.primary;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.mediumGray} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
});

export default MenuButton;