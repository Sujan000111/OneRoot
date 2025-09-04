import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

interface BuyerDetailModalProps {
    visible: boolean;
    onClose: () => void;
    buyer?: any;
}

const clampToStars = (score: any) => {
    const val = typeof score === 'number' ? score : Number(score || 0);
    if (Number.isNaN(val)) return 0;
    // map score (0-100 or 0-5) to 0-5
    return Math.max(0, Math.min(5, val > 5 ? Math.round((val / 100) * 5) : Math.round(val)));
};

const BuyerDetailModal: React.FC<BuyerDetailModalProps> = ({ visible, onClose, buyer }) => {
    const stars = clampToStars(buyer?.score);
    const crop = Array.isArray(buyer?.cropnames) && buyer.cropnames.length > 0 ? String(buyer.cropnames[0]) : undefined;
    const cropImages: Record<string, any> = {
        'tender-coconut': require('../../../../assets/images/tender-coconut.png'),
        'dry-coconut': require('../../../../assets/images/dry-coconut.png'),
        'turmeric': require('../../../../assets/images/turmeric.png'),
        'banana': require('../../../../assets/images/banana.png'),
        'sunflower': require('../../../../assets/images/sunflower.png'),
        'maize': require('../../../../assets/images/maize.png'),
    };
    const cropImage = crop ? cropImages[crop] : undefined;
    const quantityVal = buyer?.capacity_kg;
    const quantity = typeof quantityVal === 'number' ? `${quantityVal} kg` : (quantityVal ? `${quantityVal} kg` : '—');

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalBackground} onPress={() => {}}>
                    <View style={styles.contentContainer}>
                        <Image source={{ uri: buyer?.profileimage || `https://i.pravatar.cc/150?u=${buyer?.id || 'buyer'}` }} style={styles.avatar} />
                        <Text style={styles.name}>{buyer?.name || 'Buyer'}</Text>
                        <Text style={styles.location}>{buyer?.taluk || ''}{buyer?.district ? `, ${buyer?.district}` : ''}</Text>
                        <View style={styles.rating}>
                            {[1,2,3,4,5].map(i => (
                                <Ionicons key={i} name="star" size={18} color={i <= stars ? '#FFD700' : COLORS.lightGray} />
                            ))}
                        </View>

                        <View style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Buying</Text>
                            <View style={styles.row}>
                                {cropImage ? <Image source={cropImage} style={styles.cropImage} /> : null}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cropName}>{crop ? crop.replace('-', ' ') : 'Crop'}</Text>
                                    <Text style={styles.quantity}>Required Quantity: {quantity}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => {
                                    const num = (buyer?.mobilenumber || buyer?.phone || '').toString().trim();
                                    if (!num) {
                                        Alert.alert('No number', 'This buyer does not have a phone number.');
                                        return;
                                    }
                                    const telUrl = `tel:${num}`;
                                    Linking.canOpenURL(telUrl).then((supported) => {
                                        if (supported) Linking.openURL(telUrl);
                                        else Alert.alert('Cannot call', 'Calling is not supported on this device.');
                                    });
                                }}
                            >
                                <Text style={styles.primaryButtonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalBackground: { backgroundColor: COLORS.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: '50%' },
    contentContainer: { flex: 1, padding: 20, alignItems: 'center' },
    avatar: { width: 84, height: 84, borderRadius: 42 },
    name: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
    location: { color: COLORS.darkGray },
    rating: { flexDirection: 'row', marginVertical: 6 },
    detailsCard: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, width: '100%', marginTop: 14 },
    sectionTitle: { fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    cropImage: { width: 50, height: 50, marginRight: 12, borderRadius: 8 },
    cropName: { fontWeight: 'bold', textTransform: 'capitalize', color: COLORS.black },
    quantity: { color: COLORS.darkGray, marginTop: 4 },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, width: '100%' },
    primaryButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
    primaryButtonText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
});

export default BuyerDetailModal;

