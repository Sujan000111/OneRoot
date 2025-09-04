import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput, Alert, Image, Platform } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';
import { authService } from '../../../../services/authService';
import { buildApiUrl } from '../../../../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

// Define the structure for the crop data
interface CropData {
  id: string;
  name: string;
  image: string;
  status: 'on' | 'off' | 'days';
  daysLeft?: number;
  expectedPrice?: number;
  quantity?: string;
  nextHarvestDate?: string;
  lastHarvestDate?: string;
  cropImage?: string;
  isListing?: boolean;
  listingData?: any;
  cropVariety?: string;
}

interface BookCardModalProps {
  visible: boolean;
  onClose: () => void;
  crop: CropData | null;
  onCropUpdate?: (crop: CropData) => void;
}

const AddButton = ({ text, onPress }: { text: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
        <AntDesign name="plus" size={16} color="#D9534F" />
        <Text style={styles.addButtonText}>{text}</Text>
    </TouchableOpacity>
);

const BookCardModal: React.FC<BookCardModalProps> = ({ visible, onClose, crop, onCropUpdate }) => {
  const navigation = useNavigation<any>();
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [showNextHarvestPicker, setShowNextHarvestPicker] = useState(false);
  const [showLastHarvestPicker, setShowLastHarvestPicker] = useState(false);
  
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [nextHarvestDate, setNextHarvestDate] = useState(new Date());
  const [lastHarvestDate, setLastHarvestDate] = useState(new Date());

  // Try multiple navigation patterns to reach Buyer screen
  const navigateToBuyer = (payload: any) => {
    // Correct route hierarchy in this app: AppStack('MainTabs') -> Tab('Buyers')
    try {
      navigation.navigate('MainTabs', { screen: 'Buyers', params: { job: payload } });
      return true;
    } catch {}
    // Fallbacks in case navigation context differs
    try {
      navigation.navigate('Buyers', { job: payload });
      return true;
    } catch {}
    try {
      const parent = (navigation as any).getParent?.();
      if (parent) {
        parent.navigate('MainTabs', { screen: 'Buyers', params: { job: payload } });
        return true;
      }
    } catch {}
    console.warn('Navigation to Buyer screen failed. Verify route name in navigator.');
    return false;
  };

  // Load crop data when modal opens
  useEffect(() => {
    if (visible && crop) {
      loadCropDetails();
    }
  }, [visible, crop]);

  const loadCropDetails = async () => {
    if (!crop) return;
    
    setIsLoading(true);
    try {
      const token = authService.getJwt();
      console.log('🔐 BookCardModal - Token:', token ? 'Found' : 'Not found');
      console.log('🔐 BookCardModal - Crop ID:', crop.id);
      console.log('🔐 BookCardModal - Is Listing:', crop.isListing);
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Handle crop listings differently from user crops
      if (crop.isListing && crop.listingData) {
        // For crop listings, use the data directly
        const listingData = crop.listingData;
        setCropData({
          ...crop,
          expectedPrice: listingData.expected_price,
          quantity: listingData.quantity,
          cropVariety: listingData.crop_variety,
        });
        
        // Set form values
        setPrice(listingData.expected_price?.toString() || '');
        setQuantity(listingData.quantity || '');
        
        // For listings, we don't have harvest dates, so use current date
        setNextHarvestDate(new Date());
        setLastHarvestDate(new Date());
      } else {
        // For user crops, fetch from user-crops API
        const apiUrl = buildApiUrl(`/user-crops/${crop.id}`);
        console.log('🌐 BookCardModal - API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.success) {
          const cropDetails = result.data.crop;
          setCropData({
            ...crop,
            ...cropDetails,
            expectedPrice: cropDetails.expected_price,
            nextHarvestDate: cropDetails.next_harvest_date,
            lastHarvestDate: cropDetails.last_harvest_date,
          });
          
          // Set form values
          setPrice(cropDetails.expected_price?.toString() || '');
          setQuantity(cropDetails.quantity || '');
          
          // Parse dates
          if (cropDetails.next_harvest_date) {
            setNextHarvestDate(new Date(cropDetails.next_harvest_date));
          }
          if (cropDetails.last_harvest_date) {
            setLastHarvestDate(new Date(cropDetails.last_harvest_date));
          }
        } else {
          // If crop doesn't exist in database, use the passed crop data
          setCropData(crop);
          setPrice(crop.expectedPrice?.toString() || '');
          setQuantity(crop.quantity || '');
          
          // Parse dates from crop data
          if (crop.nextHarvestDate) {
            setNextHarvestDate(new Date(crop.nextHarvestDate));
          }
          if (crop.lastHarvestDate) {
            setLastHarvestDate(new Date(crop.lastHarvestDate));
          }
        }
      }
    } catch (error) {
      console.error('Error loading crop details:', error);
      setCropData(crop);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCropDetails = async (updateData: any) => {
    if (!crop) return;
    
    try {
      const token = authService.getJwt();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Handle crop listings differently from user crops
      if (cropData?.isListing) {
        // For crop listings, update via crop-listings API
        const apiUrl = buildApiUrl(`/crop-listings/${cropData.id}`);
        console.log('🌐 BookCardModal - Update Listing API URL:', apiUrl);
        console.log('🌐 BookCardModal - Update data:', updateData);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();
        
        if (result.success) {
          const updatedListing = result.data.listing;
          const newCropData = {
            ...cropData,
            ...updatedListing,
            expectedPrice: updatedListing.expected_price,
            quantity: updatedListing.quantity,
            cropVariety: updatedListing.crop_variety,
          };
          setCropData(newCropData);
          onCropUpdate?.(newCropData);
          Alert.alert('Success', 'Crop listing updated successfully');
        } else {
          Alert.alert('Error', result.message || 'Failed to update crop listing');
        }
      } else {
        // For user crops, update via user-crops API
        const apiUrl = buildApiUrl(`/user-crops/${crop.id}`);
        console.log('🌐 BookCardModal - Update User Crop API URL:', apiUrl);
        console.log('🌐 BookCardModal - Update data:', updateData);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();
        
        if (result.success) {
          const updatedCrop = result.data.crop;
          const newCropData = {
            ...cropData,
            ...updatedCrop,
            expectedPrice: updatedCrop.expected_price,
            nextHarvestDate: updatedCrop.next_harvest_date,
            lastHarvestDate: updatedCrop.last_harvest_date,
          };
          setCropData(newCropData);
          onCropUpdate?.(newCropData);
          Alert.alert('Success', 'Crop details updated successfully');
        } else {
          Alert.alert('Error', result.message || 'Failed to update crop details');
        }
      }
    } catch (error) {
      console.error('Error updating crop details:', error);
      Alert.alert('Error', 'Failed to update crop details');
    }
  };

  const toggleCropStatus = async () => {
    if (!cropData) return;
    
    const newStatus = cropData.status === 'on' ? 'off' : 'on';
    
    try {
      const token = authService.getJwt();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Handle crop listings differently from user crops
      if (cropData.isListing) {
        // For crop listings, update the is_ready status
        const updateData = { is_ready: newStatus === 'on' };
        const apiUrl = buildApiUrl(`/crop-listings/${cropData.id}`);
        console.log('🌐 BookCardModal - Update Listing Status API URL:', apiUrl);
        console.log('🌐 BookCardModal - Update data:', updateData);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();
        
        if (result.success) {
          const updatedCrop: CropData = { 
            ...cropData, 
            status: newStatus as 'on' | 'off' | 'days',
            // Ensure all required properties are present for CropCellCard
            id: cropData.id,
            name: cropData.name,
            image: cropData.image as any,
            daysLeft: cropData.daysLeft
          };
          setCropData(updatedCrop);
          onCropUpdate?.(updatedCrop);
          console.log('✅ BookCardModal - Listing status updated and callback called:', updatedCrop);
        } else {
          Alert.alert('Error', result.message || 'Failed to update crop listing status');
        }
      } else {
        // For user crops, use the status endpoint
        const apiUrl = buildApiUrl(`/user-crops/${cropData.id}/status`);
        console.log('🌐 BookCardModal - User Crop Status API URL:', apiUrl);
        console.log('🌐 BookCardModal - New status:', newStatus);
        
        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();
        
        if (result.success) {
          const updatedCrop: CropData = { 
            ...cropData, 
            status: newStatus as 'on' | 'off' | 'days',
            // Ensure all required properties are present for CropCellCard
            id: cropData.id,
            name: cropData.name,
            image: cropData.image as any,
            daysLeft: cropData.daysLeft
          };
          setCropData(updatedCrop);
          onCropUpdate?.(updatedCrop);
          console.log('✅ BookCardModal - User crop status updated and callback called:', updatedCrop);
        } else {
          Alert.alert('Error', result.message || 'Failed to update crop status');
        }
      }
    } catch (error) {
      console.error('Error toggling crop status:', error);
      Alert.alert('Error', 'Failed to update crop status');
    }
  };

  const handleSavePrice = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    updateCropDetails({ expected_price: priceValue });
    setEditingPrice(false);
  };

  const handleSaveQuantity = () => {
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    updateCropDetails({ quantity: quantity.trim() });
    setEditingQuantity(false);
  };

  const handleNextHarvestChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || nextHarvestDate;
    setShowNextHarvestPicker(Platform.OS === 'ios');
    setNextHarvestDate(currentDate);
    
    if (selectedDate) {
      updateCropDetails({ next_harvest_date: currentDate.toISOString().split('T')[0] });
    }
  };

  const handleLastHarvestChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || lastHarvestDate;
    setShowLastHarvestPicker(Platform.OS === 'ios');
    setLastHarvestDate(currentDate);
    
    if (selectedDate) {
      updateCropDetails({ last_harvest_date: currentDate.toISOString().split('T')[0] });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!crop || !cropData) return null; // Don't render if there's no crop data

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={styles.imagePlaceholder}>
              {cropData.cropImage ? (
                <Image source={{ uri: cropData.cropImage }} style={styles.cropImage} />
              ) : (
                <Feather name="image" size={40} color={COLORS.mediumGray} />
              )}
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.cropName}>{cropData.name}</Text>
              <Text style={styles.cropQuantity}>
                {cropData.quantity || 'No quantity set'}
              </Text>
              <AddButton 
                text="Add Image" 
                onPress={() => Alert.alert('Coming Soon', 'Image upload feature will be available soon')}
              />
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Expected Price</Text>
                {editingPrice ? (
                  <View style={styles.priceEditRow}>
                    <TextInput
                      style={styles.priceInput}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="Enter price per kg"
                      placeholderTextColor={COLORS.mediumGray}
                      keyboardType="numeric"
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleSavePrice} style={styles.priceSaveButton}>
                      <Text style={styles.priceSaveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingPrice(false);
                        setPrice(cropData.expectedPrice?.toString() || '');
                      }} 
                      style={styles.priceCancelButton}
                    >
                      <Text style={styles.priceCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.priceDisplayButton}
                    onPress={() => setEditingPrice(true)}
                  >
                    <Text style={styles.priceDisplayText}>
                      {cropData.expectedPrice ? `₹${cropData.expectedPrice}/kg` : "Set Price"}
                    </Text>
                    <Feather name="edit-2" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Middle Section */}
          <View style={styles.middleSection}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Next Harvest Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowNextHarvestPicker(true)}
              >
                <Text style={styles.dateValue}>
                  {cropData.nextHarvestDate ? formatDate(new Date(cropData.nextHarvestDate)) : 'Select Date'}
                </Text>
                <Feather name="calendar" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Last Harvest Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowLastHarvestPicker(true)}
              >
                <Text style={styles.dateValue}>
                  {cropData.lastHarvestDate ? formatDate(new Date(cropData.lastHarvestDate)) : 'Select Date'}
                </Text>
                <Feather name="calendar" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Quantity</Text>
              {editingQuantity ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.dateInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g., 100 kg"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                  <TouchableOpacity onPress={handleSaveQuantity} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setEditingQuantity(true)}>
                  <Text style={styles.dateValue}>
                    {cropData.quantity || 'Not set'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={[
                styles.turnOffButton, 
                cropData.status === 'on' ? styles.turnOnButton : styles.turnOffButton
              ]}
              onPress={toggleCropStatus}
            >
              <Text style={[
                styles.turnOffButtonText,
                cropData.status === 'on' ? styles.turnOnButtonText : styles.turnOffButtonText
              ]}>
                {cropData.status === 'on' ? 'Turn Off' : 'Turn On'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.findBuyerButton}
              onPress={() => {
                if (!cropData) return;
                const payload = {
                  cropName: cropData.name,
                  quantity: cropData.quantity || '',
                  cropVariety: (cropData as any).cropVariety || '',
                  expectedPrice: cropData.expectedPrice || null,
                  nextHarvestDate: cropData.nextHarvestDate || null,
                  lastHarvestDate: cropData.lastHarvestDate || null,
                  image: cropData.image || null,
                  status: cropData.status,
                  daysLeft: cropData.daysLeft || null,
                };
                if (navigateToBuyer(payload)) {
                  onClose();
                }
              }}
            >
              <Text style={styles.findBuyerButtonText}>Find More Buyer</Text>
            </TouchableOpacity>
          </View>

          {/* Date Pickers */}
          {showNextHarvestPicker && (
            <DateTimePicker
              value={nextHarvestDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleNextHarvestChange}
              minimumDate={new Date()}
            />
          )}
          
          {showLastHarvestPicker && (
            <DateTimePicker
              value={lastHarvestDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleLastHarvestChange}
              maximumDate={new Date()}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
  },
  topSection: {
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cropName: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  cropQuantity: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginVertical: 4,
  },
  addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEE2E2',
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 6,
      marginTop: 6,
      alignSelf: 'flex-start'
  },
  addButtonText: {
      color: '#D9534F',
      marginLeft: 5,
      fontSize: 12,
      fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 20,
  },
  middleSection: {
      // styles for this section if needed
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  turnOffButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  turnOffButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  findBuyerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  findBuyerButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  cropImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: COLORS.black,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  turnOnButton: {
    backgroundColor: COLORS.primary,
  },
  turnOnButtonText: {
    color: COLORS.secondary,
  },
  editModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  // removed duplicate priceInput style (defined later)
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  priceContainer: {
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  priceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.black,
  },
  priceSaveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceSaveButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceCancelButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceCancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  priceDisplayText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
});

export default BookCardModal;