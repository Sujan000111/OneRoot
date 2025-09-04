import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme/colors';
import BuyerDetailModal from './components/BuyerDetailModal';

import { useRoute, useNavigation } from '@react-navigation/native';
import API, { buildApiUrl, setApiBaseUrl } from '../../../config/api';
import { authService } from '../../../services/authService';

// --- Interfaces (No Changes) ---
interface BuyerRow {
  id: string;
  name: string | null;
  village: string | null;
  taluk: string | null;
  district: string | null;
  pincode: string | null;
  mobilenumber: string | null;
  latitude: number | null;
  longitude: number | null;
  profileimage: string | null;
}

type CropChip = { id: string; slug: string; displayName: string; image?: any; quantity?: string };

// --- Redesigned Sub-Components ---

// Header Component
const BuyerScreenHeader = ({ onBackPress }: { onBackPress: () => void }) => (
  <View style={styles.header}>
    
    <View style={styles.headerTitleContainer}>
      <Text style={styles.title}>Find Buyers</Text>
      <Text style={styles.subtitle}>Connect with verified buyers near you</Text>
    </View>
    
  </View>
);

// Animated Crop Filter Chip
const CropChipComponent = ({ item, isSelected, onPress }: { item: CropChip, isSelected: boolean, onPress: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: isSelected ? 1.08 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isSelected]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={onPress}
            >
                {item.image ? <Image source={item.image} style={styles.chipImage} /> : <View style={styles.chipImage} />}
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {item.displayName}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


// Animated Buyer List Item Card
const BuyerListItem = ({ item, index, onPress }: { item: BuyerRow, index: number, onPress: (buyer: BuyerRow) => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 50,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 50,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const avatarUri = item.profileimage || `https://i.pravatar.cc/150?u=${item.id}`;

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.details}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name} numberOfLines={1}>{item.name || 'Unknown Buyer'}</Text>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                </View>
                <Text style={styles.location} numberOfLines={1}>{item.taluk || item.district || 'Location not available'}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => onPress(item)}>
                <Ionicons name="call" size={22} color={COLORS.secondary} />
            </TouchableOpacity>
        </Animated.View>
    );
};


// --- Main Screen ---
const BuyerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const job = route?.params?.job || null;
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [crops, setCrops] = useState<CropChip[]>([]);
  const [selectedCropSlug, setSelectedCropSlug] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerRow | null>(null);

  // --- (All data fetching logic is preserved exactly as you provided) ---
  useEffect(() => {
    if (Platform.OS === 'android' && API.baseUrl && API.baseUrl.includes('localhost')) {
      const mapped = API.baseUrl.replace('localhost', '10.0.2.2');
      setApiBaseUrl(mapped);
    }
    setApiReady(true);
  }, []);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const token = authService.getJwt();
        if (!token) { setCrops([]); return; }
        const headers = { 'Authorization': `Bearer ${token}` } as any;

        const [resUser, resListings] = await Promise.all([
          fetch(buildApiUrl('/user/crops'), { headers }),
          fetch(buildApiUrl('/crop-listings'), { headers })
        ]);

        const jsonUser = await resUser.json().catch(() => ({}));
        const jsonListings = await resListings.json().catch(() => ({}));

        const mapImage = (filename: string) => {
          const images: Record<string, any> = {
            'tender-coconut.png': require('../../../assets/images/tender-coconut.png'),
            'dry-coconut.png': require('../../../assets/images/dry-coconut.png'),
            'turmeric.png': require('../../../assets/images/turmeric.png'),
            'banana.png': require('../../../assets/images/banana.png'),
            'sunflower.png': require('../../../assets/images/sunflower.png'),
            'maize.png': require('../../../assets/images/maize.png'),
          };
          return images[filename];
        };

        const userCrops: CropChip[] = (resUser.ok && jsonUser?.success ? (jsonUser.data.crops || []) : [])
          .map((c: any) => ({
            id: c.id || c.name,
            slug: String((c.image || '').replace('.png','').toLowerCase()),
            displayName: (c.name || '').toString(),
            image: c.image ? mapImage(c.image) : undefined,
            quantity: c.quantity,
          }));

        const listingCrops: CropChip[] = (resListings.ok && jsonListings?.success ? (jsonListings.data.listings || []) : [])
          .map((l: any) => ({
            id: l.id,
            slug: String((l.crop_type || '').toLowerCase()),
            displayName: (l.crop_type || '').replace('-', ' ').replace(/\b\w/g, (m: string) => m.toUpperCase()),
            image: mapImage(`${String((l.crop_type || '').toLowerCase())}.png`),
            quantity: l.quantity,
          }));
        
        const merged = [...userCrops, ...listingCrops];
        setCrops(merged);
        if (!selectedCropSlug && merged.length > 0) {
          const initial = (job?.image && typeof job.image === 'string') ? String(job.image).replace('.png','').toLowerCase() : merged[0].slug;
          setSelectedCropSlug(initial);
        }
      } catch {
        setCrops([]);
      }
    };
    if (apiReady) fetchCrops();
  }, [apiReady]);

  useEffect(() => {
    const fetchBuyers = async () => {
      if (!apiReady || !selectedCropSlug) return;
      setLoadingBuyers(true);
      setError(null);
      try {
        const token = authService.getJwt();
        if (token) {
          const res = await fetch(buildApiUrl('/buyers/search'), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ cropType: selectedCropSlug, limit: 50 })
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success) {
            setBuyers((json.data?.buyers || []) as BuyerRow[]);
          } else {
            throw new Error(json?.message || `HTTP ${res.status}`);
          }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load buyers');
      } finally {
        setLoadingBuyers(false);
      }
    };
    fetchBuyers();
  }, [apiReady, selectedCropSlug]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={buyers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <BuyerListItem
            item={item}
            index={index}
            onPress={(buyer) => { setSelectedBuyer(buyer); setModalVisible(true); }}
          />
        )}
        ListHeaderComponent={
          <>
            <BuyerScreenHeader onBackPress={() => navigation.goBack()} />
            {crops.length > 0 && (
              <View>
                  <Text style={styles.filterTitle}>Filter by Crop</Text>
                  <FlatList
                    data={crops}
                    horizontal
                    keyExtractor={(c) => c.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                    renderItem={({ item }) => (
                      <CropChipComponent
                        item={item}
                        isSelected={selectedCropSlug === item.slug}
                        onPress={() => setSelectedCropSlug(item.slug)}
                      />
                    )}
                  />
              </View>
            )}
            <Text style={styles.listTitle}>Verified Buyers</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.placeholder}>
            {loadingBuyers ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
                <>
                    <Ionicons name="search-circle-outline" size={60} color={COLORS.mediumGray} />
                    <Text style={styles.placeholderTitle}>{error ? 'An Error Occurred' : 'No Buyers Found'}</Text>
                    <Text style={styles.placeholderSubtitle}>{error ? error : 'Try selecting a different crop.'}</Text>
                </>
            )}
          </View>
        }
        contentContainerStyle={styles.listContentContainer}
      />
      <BuyerDetailModal visible={modalVisible} onClose={() => setModalVisible(false)} buyer={selectedBuyer as any} />
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: 28,
        left: 20,
        zIndex: 1,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
   
    ButtonText: {
        color: COLORS.error,
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 5,
    },
    // Fhowilter
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkGray,
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    chip: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.secondary, 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 25, 
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: COLORS.lightGray,
    },
    chipSelected: { 
        backgroundColor: '#E7F2E5',
        borderColor: COLORS.primary,
    },
    chipImage: { 
        width: 28, 
        height: 28, 
        borderRadius: 14, 
        marginRight: 8 
    },
    chipText: { 
        color: COLORS.darkGray, 
        fontWeight: '600', 
        textTransform: 'capitalize' 
    },
    chipTextSelected: { 
        color: COLORS.primary 
    },
    // List
    listContentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 120, // Increased for more scroll space
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 20,
        marginBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
    },
    details: {
        flex: 1,
        marginLeft: 15,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginRight: 6,
    },
    location: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    callButton: {
        backgroundColor: COLORS.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginTop: 15,
    },
    placeholderSubtitle: {
        fontSize: 14,
        color: COLORS.mediumGray,
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default BuyerScreen;