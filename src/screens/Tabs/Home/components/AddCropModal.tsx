import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';
import { authService } from '../../../../services/authService';
import { buildApiUrl } from '../../../../config/api';

interface AddCropModalProps {
  visible: boolean;
  onClose: () => void;
  onCropCreated?: (crop: any) => void;
}

interface CropType {
  id: string;
  name: string;
  image: string;
  varieties: string[];
}

interface CropListing {
  id: string;
  crop_type: string;
  crop_variety?: string;
  expected_price: number;
  quantity: string;
  is_ready: boolean;
  ready_in_days?: number;
  images: string[];
  status: string;
  created_at: string;
}

// --- Reusable Components for the Form ---

const DropdownInput = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.dropdown}>
      <Text style={styles.dropdownPlaceholder}>{placeholder}</Text>
      <AntDesign name="down" size={16} color={COLORS.darkGray} />
    </TouchableOpacity>
  </View>
);

const StepperInput = ({ value, onIncrement, onDecrement }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>Ready in how many Days?*</Text>
        <View style={styles.stepperContainer}>
            <TouchableOpacity style={styles.stepperButton} onPress={onDecrement}>
                <AntDesign name="minus" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.stepperValueContainer}>
                <Text style={styles.stepperValue}>{value}</Text>
                <Text style={styles.stepperLabel}>Days</Text>
            </View>
            <TouchableOpacity style={styles.stepperButton} onPress={onIncrement}>
                <AntDesign name="plus" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    </View>
);

// --- Main Modal Component ---

const AddCropModal: React.FC<AddCropModalProps> = ({ visible, onClose, onCropCreated }) => {
  const [step, setStep] = useState(1);
  const [isCropReady, setIsCropReady] = useState<boolean | null>(null);
  const [days, setDays] = useState(1);
  
  // Form data
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);
  const [expectedPrice, setExpectedPrice] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Available crop types
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load crop types when modal opens
  useEffect(() => {
    if (visible) {
      loadCropTypes();
    }
  }, [visible]);

  const loadCropTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('/crop-listings/crop-types'));
      const result = await response.json();
      
      if (result.success) {
        setCropTypes(result.data.cropTypes);
      } else {
        Alert.alert('Error', 'Failed to load crop types');
      }
    } catch (error) {
      console.error('Error loading crop types:', error);
      Alert.alert('Error', 'Failed to load crop types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropSelect = (crop: CropType) => {
    setSelectedCrop(crop);
    setCropVariety(''); // Reset variety when crop changes
  };

  const handleNext = () => {
    if (!selectedCrop || !expectedPrice) {
      Alert.alert('Error', 'Please select a crop and enter expected price');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedCrop || !expectedPrice || !quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const token = authService.getJwt();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(buildApiUrl('/crop-listings'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop_type: selectedCrop.id,
          crop_variety: cropVariety || null,
          expected_price: parseFloat(expectedPrice),
          quantity,
          is_ready: isCropReady || false,
          ready_in_days: isCropReady ? null : days,
          images
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Crop listing created successfully!');
        onCropCreated?.(result.data.listing);
        handleClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to create crop listing');
      }
    } catch (error) {
      console.error('Error creating crop listing:', error);
      Alert.alert('Error', 'Failed to create crop listing');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    onClose();
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setSelectedCrop(null);
      setExpectedPrice('');
      setCropVariety('');
      setQuantity('');
      setImages([]);
      setIsCropReady(null);
      setDays(1);
    }, 500);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>Complete to get interested Buyer</Text>
            
            {/* --- Progress Bar --- */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{step} of 2 steps completed</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
              </View>
            </View>

            {/* --- Step 1 Form (Crop Selection & Expected Rate) --- */}
            {step === 1 && (
              <>
                <Text style={styles.subtitle}>Select your crop and set expected price.</Text>
                
                {/* Crop Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Select Crop *</Text>
                  <FlatList
                    data={cropTypes}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.cropCard,
                          selectedCrop?.id === item.id && styles.cropCardSelected
                        ]}
                        onPress={() => handleCropSelect(item)}
                      >
                        <Image
                          source={getCropImage(item.image)}
                          style={styles.cropImage}
                          resizeMode="cover"
                        />
                        <Text style={[
                          styles.cropName,
                          selectedCrop?.id === item.id && styles.cropNameSelected
                        ]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Expected Price */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Expected Rate (per kg) *</Text>
                    <View style={styles.rateInputContainer}>
                        <TextInput 
                          style={styles.rateInput} 
                          placeholder="eg. 350" 
                          keyboardType="numeric"
                          value={expectedPrice}
                          onChangeText={setExpectedPrice}
                        />
                        <View style={styles.currencySymbol}>
                            <Text style={styles.currencyText}>₹</Text>
                        </View>
                    </View>
                </View>

                {/* Images */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Add Images of your crop</Text>
                    <TouchableOpacity style={styles.mainImagePicker}>
                        <Feather name="image" size={30} color={COLORS.mediumGray} />
                        <Text style={styles.imagePickerText}>Add Photos Here</Text>
                    </TouchableOpacity>
                    <View style={styles.thumbnailContainer}>
                        <TouchableOpacity style={styles.thumbnail} />
                        <TouchableOpacity style={styles.thumbnail} />
                    </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} 
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Loading...' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* --- Step 2 Form (Crop Details) --- */}
            {step === 2 && (
              <>
                <Text style={styles.subtitle}>Complete your crop details.</Text>
                
                {/* Crop Ready Toggle */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Crop ready?*</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[styles.toggleButton, isCropReady === true && styles.toggleButtonActive]}
                      onPress={() => setIsCropReady(true)}
                    >
                      <Text style={[styles.toggleText, isCropReady === true && styles.toggleTextActive]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, isCropReady === false && styles.toggleButtonActive]}
                      onPress={() => setIsCropReady(false)}
                    >
                      <Text style={[styles.toggleText, isCropReady === false && styles.toggleTextActive]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Crop Variety */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Crop Variety</Text>
                  <View style={styles.dropdown}>
                    <TextInput
                      style={styles.dropdownInput}
                      placeholder="e.g., Green, Yellow, Hybrid"
                      value={cropVariety}
                      onChangeText={setCropVariety}
                    />
                  </View>
                </View>

                {/* Crop Quantity */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Crop Quantity *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 100 kg, 50 bags"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>

                {/* Ready in Days (only show if crop is not ready) */}
                {isCropReady === false && (
                  <StepperInput 
                    value={days}
                    onIncrement={() => setDays(d => d + 1)}
                    onDecrement={() => setDays(d => Math.max(1, d - 1))}
                  />
                )}
                
                <TouchableOpacity 
                  style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} 
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Creating...' : 'Create Listing'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Helper function to get crop image
const getCropImage = (imageName: string) => {
  const imageMap = {
    'tender-coconut.png': require('../../../../assets/images/tender-coconut.png'),
    'dry-coconut.png': require('../../../../assets/images/dry-coconut.png'),
    'turmeric.png': require('../../../../assets/images/turmeric.png'),
    'banana.png': require('../../../../assets/images/banana.png'),
    'sunflower.png': require('../../../../assets/images/sunflower.png'),
    'maize.png': require('../../../../assets/images/maize.png'),
  };
  
  return imageMap[imageName] || require('../../../../assets/images/tender-coconut.png'); // Default fallback
};

// --- Styles ---
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  subtitle: {
      fontSize: 16,
      color: COLORS.darkGray,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 10,
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
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  inputGroup: {
      marginBottom: 15,
  },
  label: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 8,
  },
  toggleContainer: {
      flexDirection: 'row'
  },
  toggleButton: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 30,
      marginRight: 10,
  },
  toggleButtonActive: {
      backgroundColor: '#E7F2E5',
      borderColor: COLORS.primary,
  },
  toggleText: {
      fontSize: 16,
      color: COLORS.darkGray,
      fontWeight: '500'
  },
  toggleTextActive: {
      color: COLORS.primary,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: COLORS.mediumGray,
  },
  stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  stepperButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
  },
  stepperValueContainer: {
      backgroundColor: '#E7F2E5',
      borderRadius: 8,
      paddingVertical: 10,
      width: 120,
      alignItems: 'center',
  },
  stepperValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.primary,
  },
  stepperLabel: {
      fontSize: 12,
      color: COLORS.primary,
  },
  rateInputContainer: {
      flexDirection: 'row',
  },
  rateInput: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: '#F9FAFB',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
  },
  currencySymbol: {
      height: 50,
      width: 50,
      backgroundColor: COLORS.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
  },
  currencyText: {
      fontSize: 18,
      color: COLORS.primary,
      fontWeight: 'bold',
  },
  mainImagePicker: {
      height: 120,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: COLORS.lightGray,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
  },
  imagePickerText: {
      marginTop: 8,
      color: COLORS.mediumGray,
  },
  thumbnailContainer: {
      flexDirection: 'row',
      marginTop: 10,
  },
  thumbnail: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: COLORS.lightGray,
      marginRight: 10,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  cropCard: {
    width: 80,
    marginRight: 15,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.secondary,
  },
  cropCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E7F2E5',
  },
  cropImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  cropName: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  cropNameSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dropdownInput: {
    fontSize: 16,
    color: COLORS.black,
    padding: 0,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
});

export default AddCropModal;