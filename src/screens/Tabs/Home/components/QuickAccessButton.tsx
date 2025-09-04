import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 45) / 2; // 15 padding on each side, 15 between cards

interface QuickAccessButtonProps {
  title: string;
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ title }) => {
  return (
    <TouchableOpacity style={styles.container}>
        <View>
            <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.bottomRow}>
            <View style={styles.imagePlaceholder}/>
            <View style={styles.arrowButton}>
                <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
            </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
  },
  imagePlaceholder: {
      width: 50,
      height: 50,
      // You would put an Image component here
  },
  arrowButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuickAccessButton;