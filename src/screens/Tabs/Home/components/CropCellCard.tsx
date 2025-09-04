import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

interface CropCellCardProps {
  name: string;
  status: 'on' | 'off' | 'days';
  daysLeft?: number;
  isAddButton?: boolean;
  image?: string | any; // Allow both filename string and require() object
  onPress?: () => void;
}

const CropCellCard: React.FC<CropCellCardProps> = memo(({ name, status, daysLeft, isAddButton, image, onPress }) => {
  // Debug logging
  console.log('🎯 CropCellCard - Props received:', { name, status, daysLeft, image });
  
  if (isAddButton) {
    return (
        <TouchableOpacity style={styles.addContainer} onPress={onPress}>
            <Feather name="plus" size={30} color={COLORS.primary} />
        </TouchableOpacity>
    );
  }

  const getStatusStyle = () => {
    if (status === 'on') return styles.statusOn;
    if (status === 'off') return styles.statusOff;
    return styles.statusDays;
  };
  
  const getStatusText = () => {
    if (status === 'on') return 'ON';
    if (status === 'off') return 'OFF';
    return `${daysLeft} DAYS TO GO`;
  }

  // Debug status styling
  const statusStyle = getStatusStyle();
  const statusText = getStatusText();
  console.log('🎨 CropCellCard - Status styling:', { 
    status, 
    statusText, 
    statusStyle: statusStyle.backgroundColor || 'no background color' 
  });

  // Helper function to get image source
  const getImageSource = () => {
    if (!image) return null;
    
    // If image is already an object (from require()), return it directly
    if (typeof image === 'object') {
      return image;
    }
    
    // If image is a filename string, map it to the require() object
    const imageMap: Record<string, any> = {
      'tender-coconut.png': require('../../../../assets/images/tender-coconut.png'),
      'dry-coconut.png': require('../../../../assets/images/dry-coconut.png'),
      'turmeric.png': require('../../../../assets/images/turmeric.png'),
      'banana.png': require('../../../../assets/images/banana.png'),
      'sunflower.png': require('../../../../assets/images/sunflower.png'),
      'maize.png': require('../../../../assets/images/maize.png'),
    };
    
    return (imageMap as any)[image] || null;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {image ? (
        <Image source={getImageSource()} style={styles.cropImage} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={[styles.statusBadge, statusStyle]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 80,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
  },
  cropImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  name: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusOn: { 
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusOff: { 
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDays: { 
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  addContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: COLORS.lightGray,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      marginTop: 10
  }
});

CropCellCard.displayName = 'CropCellCard';

export default CropCellCard;