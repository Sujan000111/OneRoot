import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../theme/colors';
import { authService } from '../../services/authService';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

// Fixed crop enum list
const CROPS = [
  { id: 'tender-coconut', name: 'Tender Coconut', image: require('../../assets/images/tender-coconut.png') },
  { id: 'dry-coconut', name: 'Dry Coconut', image: require('../../assets/images/dry-coconut.png') },
  { id: 'turmeric', name: 'Turmeric', image: require('../../assets/images/turmeric.png') },
  { id: 'banana', name: 'Banana', image: require('../../assets/images/banana.png') },
  { id: 'sunflower', name: 'Sunflower', image: require('../../assets/images/sunflower.png') },
  { id: 'maize', name: 'Maize', image: require('../../assets/images/maize.png') },
];

// --- Simple Placeholder Icons ---
const BackArrowIcon = () => <Text style={styles.iconText}>←</Text>;
const SearchIcon = () => <Text style={styles.iconText}>🔍</Text>;

// --- Navigation Type ---
type OnboardingNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OnboardingScreen2'
> & {
  dispatch: (action: any) => void;
};

const OnboardingScreen2 = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { completeOnboarding } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCrops = useMemo(() => {
    return CROPS.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      Alert.alert('Please select crop(s)', 'Choose at least one crop to continue.');
      return;
    }
    try {
      const token = authService.getJwt();
      if (!token) {
        Alert.alert('Not logged in', 'Please login again.');
        return;
      }
      
      const requestBody = { cropnames: selected };
      console.log('🌾 Onboarding2 - Request body:', requestBody);
      console.log('🌾 Onboarding2 - Selected crops:', selected);
      console.log('🌾 Onboarding2 - API URL:', buildApiUrl('/user/profile'));
      
      const res = await fetch(buildApiUrl('/user/profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const json = await res.json();
      console.log('🌾 Onboarding2 - Response status:', res.status);
      console.log('🌾 Onboarding2 - Response body:', json);
      
      if (!res.ok || !json.success) {
        console.error('❌ Onboarding2 - API Error:', json);
        throw new Error(json?.message || 'Failed to save crops');
      }

      // Complete onboarding with crop data
      await completeOnboarding({
        cropnames: selected
      });

      // Navigate to main app
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save crops');
    }
  };

  const renderCropItem = ({ item }: { item: { id: string; name: string; image: any } }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.cropItemContainer}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.cropImageContainer, isSelected && styles.selectedCrop]}>
          <Image source={item.image} style={styles.cropImage} resizeMode="cover" />
        </View>
        <Text style={styles.cropName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Select the crop that you want to Sell</Text>
      <Text style={styles.subtitle}>You can select crop that you want to buy</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>2 of 2 steps completed</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Crop"
          placeholderTextColor={COLORS.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCrops}
        renderItem={renderCropItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 8,
    marginBottom: 20,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.black,
  },
  gridContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  cropItemContainer: {
    width: (Dimensions.get('window').width - 20 * 2 - 10 * 2) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  cropImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  selectedCrop: {
    borderColor: COLORS.primary,
    backgroundColor: '#E7F2E5',
  },
  cropName: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconText: {
    fontSize: 20,
    color: COLORS.darkGray,
  },
});

export default OnboardingScreen2;