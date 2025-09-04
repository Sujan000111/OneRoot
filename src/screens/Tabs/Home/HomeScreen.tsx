import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { buildApiUrl } from '../../../config/api';
import { authService } from '../../../services/authService';

// Import all the components
import Header from './components/Header';
import MarketPriceButton from './components/MarketPriceButton';
import CropCellCard from './components/CropCellCard';
import AlertBanner from './components/AlertBanner';
import QuickAccessButton from './components/QuickAccessButton';
import AdBanner from './components/AdBanner';
import BookCardModal from './components/BookCardModal'; 
import AddCropModal from './components/AddCropModal'; // <-- Import the new modal

// Types and mock data for crops
type CropStatus = 'on' | 'off' | 'days';

interface CropItem {
    id: string;
    name: string;
    status: CropStatus;
    quantity?: string;
    nextHarvest?: string;
    lastHarvest?: string;
    daysLeft?: number;
    image?: string | any; // Allow both filename string and require() object
    expectedPrice?: number;
    cropVariety?: string;
    isListing?: boolean;
    listingData?: any;
}

// Mock Data
const cropData: CropItem[] = [
    { id: '1', name: 'Tender Coconut', status: 'on', quantity: '500 Trees', nextHarvest: 'Jan 20, 2025', lastHarvest: 'Jan 10, 2025' },
    { id: '2', name: 'Tender Coconut', status: 'off', quantity: '300 Trees', nextHarvest: 'Feb 15, 2025', lastHarvest: 'Feb 01, 2025' },
    // ... more data
];
const quickAccessData = ['Find Buyer', 'Crop Doctor', 'Manage Crops', 'Market Prices'];

const FindingBuyersCard = ({ type }: { type: 'Trees' | 'Kgs' }) => (
    <View style={styles.findingCard}>
        <Text style={styles.findingTitle}>Finding Buyers</Text>
        <Text style={styles.findingAmount}>{type === 'Trees' ? '500 Trees' : '500 Kgs'}</Text>
        <Text style={styles.findingSub}>100+ Harvesters</Text>
    </View>
);

const HomeScreen = () => {
  const { user } = useAuth();
  
  // State for the modals
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [isAddCropModalVisible, setAddCropModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropItem | null>(null);
  
  // State for user crops and crop listings
  const [userCrops, setUserCrops] = useState<CropItem[]>([]);
  const [cropListings, setCropListings] = useState<CropItem[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user crops and crop listings on component mount
  useEffect(() => {
    fetchUserCrops();
    fetchCropListings();
  }, []);

  const fetchUserCrops = async () => {
    try {
      setIsLoadingCrops(true);
      const token = authService.getJwt();
      
      if (!token) {
        console.log('🌾 HomeScreen - No token available, skipping crop fetch');
        setUserCrops([]);
        return;
      }

      console.log('🌾 HomeScreen - Fetching user crops...');
      
      const res = await fetch(buildApiUrl('/user/crops'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await res.json();
      console.log('🌾 HomeScreen - Crops response:', json);

      if (res.ok && json.success) {
        setUserCrops(json.data.crops || []);
        console.log('🌾 HomeScreen - User crops loaded:', json.data.crops);
      } else {
        console.error('❌ HomeScreen - Failed to fetch crops:', json.message);
        setUserCrops([]);
      }
    } catch (error) {
      console.error('❌ HomeScreen - Error fetching crops:', error);
      setUserCrops([]);
    } finally {
      setIsLoadingCrops(false);
    }
  };

  const fetchCropListings = async () => {
    try {
      const token = authService.getJwt();
      
      if (!token) {
        console.log('🌾 HomeScreen - No token available, skipping crop listings fetch');
        setCropListings([]);
        return;
      }

      console.log('🌾 HomeScreen - Fetching crop listings...');
      
      const res = await fetch(buildApiUrl('/crop-listings'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await res.json();
      console.log('🌾 HomeScreen - Crop listings response:', json);

      if (res.ok && json.success) {
        // Convert crop listings to CropItem format
        const convertedListings = json.data.listings.map((listing: any) => ({
          id: listing.id,
          name: listing.crop_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          status: listing.is_ready ? 'on' : (listing.ready_in_days ? 'days' : 'off'),
          quantity: listing.quantity,
          daysLeft: listing.ready_in_days,
          image: getCropImageFilename(listing.crop_type),
          expectedPrice: listing.expected_price,
          cropVariety: listing.crop_variety,
          isListing: true, // Flag to identify this as a listing
          listingData: listing // Store original listing data
        }));
        
        setCropListings(convertedListings);
        console.log('🌾 HomeScreen - Crop listings loaded:', convertedListings);
      } else {
        console.error('❌ HomeScreen - Failed to fetch crop listings:', json.message);
        setCropListings([]);
      }
    } catch (error) {
      console.error('❌ HomeScreen - Error fetching crop listings:', error);
      setCropListings([]);
    }
  };

  // Helper function to get crop image filename
  const getCropImageFilename = (cropType: string) => {
    return `${cropType}.png`;
  };

  const handleCropPress = (crop: CropItem) => {
    setSelectedCrop(crop);
    setBookModalVisible(true);
  };

  const handleCropUpdate = (updatedCrop: CropItem) => {
    console.log('🔄 HomeScreen - Crop update received:', updatedCrop);
    // Update the crop in the userCrops array
    setUserCrops(prevCrops => {
      const newCrops = prevCrops.map(crop => 
        crop.id === updatedCrop.id ? updatedCrop : crop
      );
      console.log('🔄 HomeScreen - Updated crops array:', newCrops);
      return newCrops;
    });
    // Force re-render by updating refresh key
    setRefreshKey(prev => prev + 1);
  };

  const handleCropCreated = (newCrop: any) => {
    console.log('🌱 HomeScreen - New crop created:', newCrop);
    // Refresh both user crops and crop listings to show the new crop
    fetchUserCrops();
    fetchCropListings();
  };
  
  // --- Function to render the "Add" button ---
  const renderAddButton = () => (
    <CropCellCard isAddButton={true} name="" status='on' onPress={() => setAddCropModalVisible(true)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <MarketPriceButton />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tap when crop is ready to Sell</Text>
          <FlatList<CropItem>
            horizontal
            data={[...userCrops, ...cropListings]}
            renderItem={({ item }) => (
              <CropCellCard
                name={item.name}
                status={item.status}
                daysLeft={item.daysLeft}
                image={item.image}
                onPress={() => handleCropPress(item)}
              />
            )}
            keyExtractor={item => `${item.id}-${item.status}-${refreshKey}`}
            ListFooterComponent={renderAddButton}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              isLoadingCrops ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading your crops...</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No crops selected yet</Text>
                  <Text style={styles.emptySubText}>Add crops to get started</Text>
                </View>
              )
            }
          />
        </View>

        {/* ... (rest of the sections remain the same) ... */}
        <View style={styles.findingContainer}>
            <FindingBuyersCard type="Trees" />
            <FindingBuyersCard type="Kgs" />
        </View>
        <AlertBanner />
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickAccessGrid}>
                {quickAccessData.map(item => <QuickAccessButton key={item} title={item} />)}
            </View>
        </View>
        <AdBanner />
        <View style={{height: 50}} />
      </ScrollView>

      {/* --- Render the Modals --- */}
      <BookCardModal 
        visible={isBookModalVisible}
        onClose={() => setBookModalVisible(false)}
        crop={selectedCrop}
        onCropUpdate={handleCropUpdate}
      />
      <AddCropModal
        visible={isAddCropModalVisible}
        onClose={() => setAddCropModalVisible(false)}
        onCropCreated={handleCropCreated}
      />
    </SafeAreaView>
  );
};

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
      marginTop: 20,
      paddingHorizontal: 15,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.black,
      marginBottom: 15,
  },
  findingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      marginTop: 20,
  },
  findingCard: {
      backgroundColor: COLORS.secondary,
      width: '48%',
      borderRadius: 12,
      padding: 15,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
  },
  findingTitle: {
      fontSize: 14,
      color: COLORS.darkGray,
  },
  findingAmount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.black,
      marginVertical: 4,
  },
  findingSub: {
      fontSize: 12,
      color: COLORS.mediumGray,
  },
  quickAccessGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
  loadingContainer: {
      padding: 20,
      alignItems: 'center',
  },
  loadingText: {
      fontSize: 14,
      color: COLORS.darkGray,
  },
  emptyContainer: {
      padding: 20,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
      color: COLORS.darkGray,
      fontWeight: 'bold',
  },
  emptySubText: {
      fontSize: 14,
      color: COLORS.mediumGray,
      marginTop: 4,
  }
});

export default HomeScreen;