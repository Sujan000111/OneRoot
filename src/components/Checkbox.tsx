import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const CheckIcon = () => <Text style={styles.checkIcon}>✓</Text>;

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onChange(!checked)}>
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <CheckIcon />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
  },
  checkIcon: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});

export default Checkbox;