import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
};

const TabBarActionButton = ({ children, onPress }: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={styles.button}>
      {children}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default TabBarActionButton;


