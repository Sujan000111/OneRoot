import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Animated } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

// --- (No changes to data or types) ---
type CropKey = 'tender-coconut' | 'dry-coconut' | 'turmeric' | 'banana' | 'sunflower' | 'maize';

const CROP_IMAGES: Record<CropKey, any> = {
  'tender-coconut': require('../../../assets/images/tender-coconut.png'),
  'dry-coconut': require('../../../assets/images/dry-coconut.png'),
  'turmeric': require('../../../assets/images/turmeric.png'),
  'banana': require('../../../assets/images/banana.png'),
  'sunflower': require('../../../assets/images/sunflower.png'),
  'maize': require('../../../assets/images/maize.png'),
};

const CROPS: CropKey[] = ['tender-coconut', 'dry-coconut', 'sunflower', 'turmeric', 'maize', 'banana'];
type MandiPrice = { mandi: string; min: number; max: number; modal: number };

const DEMO_PRICES: Record<CropKey, MandiPrice[]> = {
  'tender-coconut': [
    { mandi: 'Tiptur', min: 12, max: 18, modal: 15 },
    { mandi: 'Kunigal', min: 11, max: 17, modal: 14 },
    { mandi: 'Tumakuru', min: 10, max: 16, modal: 13 },
    { mandi: 'Arsikere', min: 13, max: 19, modal: 16 },
    { mandi: 'Channarayapatna', min: 12, max: 18, modal: 15 },
    { mandi: 'Maddur', min: 11, max: 16, modal: 14 },
  ],
  'dry-coconut': [
    { mandi: 'Tiptur', min: 9000, max: 11000, modal: 10000 },
    { mandi: 'Tumakuru', min: 8800, max: 10800, modal: 9800 },
    { mandi: 'Gubbi', min: 8900, max: 10900, modal: 9900 },
    { mandi: 'Kadur', min: 8700, max: 10700, modal: 9700 },
    { mandi: 'Hassan', min: 9100, max: 11200, modal: 10100 },
  ],
  'turmeric': [
    { mandi: 'Chikkamagaluru', min: 6500, max: 7800, modal: 7200 },
    { mandi: 'Hassan', min: 6400, max: 7700, modal: 7100 },
    { mandi: 'Belur', min: 6600, max: 7900, modal: 7300 },
    { mandi: 'Sakleshpur', min: 6300, max: 7600, modal: 7000 },
    { mandi: 'Mysuru', min: 6700, max: 8000, modal: 7400 },
    { mandi: 'Kollegal', min: 6800, max: 8100, modal: 7500 },
  ],
  'banana': [
    { mandi: 'Hosur (border)', min: 14, max: 22, modal: 18 },
    { mandi: 'Chikkaballapura', min: 12, max: 20, modal: 16 },
    { mandi: 'Kolar', min: 15, max: 23, modal: 19 },
    { mandi: 'Bengaluru', min: 16, max: 25, modal: 20 },
    { mandi: 'Nanjangud', min: 13, max: 21, modal: 17 },
  ],
  'sunflower': [
    { mandi: 'Kadur', min: 5400, max: 6100, modal: 5800 },
    { mandi: 'Chitradurga', min: 5300, max: 6000, modal: 5700 },
    { mandi: 'Davanagere', min: 5500, max: 6200, modal: 5900 },
    { mandi: 'Hiriyur', min: 5200, max: 5900, modal: 5600 },
    { mandi: 'Molakalmuru', min: 5100, max: 5800, modal: 5500 },
    { mandi: 'Ballari', min: 5600, max: 6300, modal: 6000 },
  ],
  'maize': [
    { mandi: 'Davangere', min: 1850, max: 2050, modal: 1950 },
    { mandi: 'Haveri', min: 1800, max: 2000, modal: 1900 },
    { mandi: 'Ranebennur', min: 1820, max: 2020, modal: 1920 },
    { mandi: 'Byadagi', min: 1790, max: 1990, modal: 1890 },
    { mandi: 'Shiggaon', min: 1810, max: 2010, modal: 1910 },
    { mandi: 'Gadag', min: 1840, max: 2040, modal: 1940 },
  ],
};
// --- (Redesigned Components) ---

const CropChip: React.FC<{ crop: CropKey; selected: boolean; onPress: () => void }> = ({ crop, selected, onPress }) => (
  <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
    <Image source={CROP_IMAGES[crop]} style={styles.chipImage} />
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{crop.replace('-', ' ')}</Text>
  </TouchableOpacity>
);

const PriceCard: React.FC<{ item: MandiPrice; index: number }> = ({ item, index }) => {
    // Animation for each card
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: index * 100, // Stagger animation
            useNativeDriver: true,
        }).start();
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, slideAnim, index]);

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.mandiName}>{item.mandi}</Text>
            <View style={styles.priceRow}>
                <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Min Price</Text>
                    <Text style={styles.priceValue}>₹{item.min}</Text>
                </View>
                <View style={[styles.priceItem, styles.modalPriceItem]}>
                    <Text style={[styles.priceLabel, styles.modalPriceLabel]}>Modal Price</Text>
                    <Text style={[styles.priceValue, styles.modalPriceValue]}>₹{item.modal}</Text>
                </View>
                <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Max Price</Text>
                    <Text style={styles.priceValue}>₹{item.max}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const MarketPricesScreen: React.FC = () => {
  const [selected, setSelected] = useState<CropKey>('tender-coconut');
  const data = useMemo(() => DEMO_PRICES[selected], [selected]);

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Ionicons name="trending-up-outline" size={32} color={COLORS.primary} />
            <Text style={styles.title}>Mandi Prices</Text>
        </View>
        <Text style={styles.subtitle}>Latest prices from mandis across Karnataka</Text>

      <View>
        <FlatList
          data={CROPS}
          horizontal
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => (
            <CropChip crop={item} selected={item === selected} onPress={() => setSelected(item)} />
          )}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(it, idx) => `${it.mandi}-${idx}-${selected}`} // Key needs to change when data changes
        renderItem={({ item, index }) => <PriceCard item={item} index={index} />}
        contentContainerStyle={styles.priceListContainer}
      />
    </SafeAreaView>
  );
};

// --- (New Styles) ---

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.black, 
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chipsList: { 
    paddingHorizontal: 15, 
    paddingVertical: 10,
  },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.secondary, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 25, 
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: { 
    backgroundColor: '#E7F2E5',
    borderColor: COLORS.primary,
  },
  chipImage: { 
    width: 28, 
    height: 28, 
    marginRight: 8 
  },
  chipText: { 
    color: COLORS.darkGray, 
    fontWeight: '600', 
    textTransform: 'capitalize',
    fontSize: 14,
  },
  chipTextSelected: { 
    color: COLORS.primary 
  },
  priceListContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  mandiName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  modalPriceItem: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.lightGray,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  modalPriceLabel: {
    color: COLORS.primary,
  },
  modalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  }
});

export default MarketPricesScreen;