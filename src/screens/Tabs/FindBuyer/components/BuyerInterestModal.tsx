import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Pressable, Linking, Alert, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

interface BuyerInterestModalProps {
    visible: boolean;
    onClose: () => void;
    onFindMore: () => void;
    buyer?: any;
    cropName?: string;
}

const BuyerInterestModal: React.FC<BuyerInterestModalProps> = ({ visible, onClose, onFindMore, buyer, cropName }) => {
    const rise = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(rise, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 90 })
            ]).start();
        } else {
            rise.setValue(0);
            scale.setValue(0.9);
        }
    }, [visible]);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalBackground} onPress={() => {}}>
                    <Animated.View style={[styles.contentContainer, { opacity: rise, transform: [{ translateY: rise.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }, { scale }] }]}>
                        <Image source={{ uri: buyer?.profileimage || 'https://i.pravatar.cc/150?u=buyer' }} style={styles.avatar} />
                        <Text style={styles.name}>{buyer?.name || 'Buyer'}</Text>
                        <Text style={styles.location}>{buyer?.taluk || ''}{buyer?.district ? `, ${buyer?.district}` : ''}</Text>
                        <View style={styles.rating}>
                            {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={16} color={i <= 2 ? '#FFD700' : COLORS.lightGray} />)}
                        </View>
                        <Text style={styles.interestText}>Expressed Interest!</Text>
                        <Text style={styles.forText}>for</Text>
                        <Image source={{ uri: 'https://i.imgur.com/your-coconut-image.png' }} style={styles.cropImage} />
                        <Text style={styles.cropName}>{cropName || 'Selected Crop'}</Text>
                        <View style={styles.detailsCard}>
                            <Text style={styles.quantity}>Quantity <Text style={styles.price}>30-35 Rs</Text></Text>
                            <Text style={styles.quality}>Quality</Text>
                            <Text style={styles.variety}>Variety</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={onFindMore}>
                                <Text style={styles.secondaryButtonText}>Not Interested</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton} onPress={() => {
                                const num = (buyer?.mobilenumber || buyer?.phone || '').toString().trim();
                                if (!num) {
                                    Alert.alert('No number', 'This buyer does not have a phone number.');
                                    return;
                                }
                                const telUrl = `tel:${num}`;
                                Linking.canOpenURL(telUrl).then((supported) => {
                                    if (supported) {
                                        Linking.openURL(telUrl);
                                    } else {
                                        Alert.alert('Cannot call', 'Calling is not supported on this device.');
                                    }
                                });
                            }}>
                                <Text style={styles.primaryButtonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onFindMore}>
                            <Text style={styles.findMoreText}>Find More Buyers</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalBackground: { 
        backgroundColor: COLORS.secondary, 
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '60%',
    },
    contentContainer: { flex: 1, padding: 20, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40 },
    name: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
    location: { color: COLORS.darkGray },
    rating: { flexDirection: 'row', marginVertical: 4 },
    interestText: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginTop: 10 },
    forText: { color: COLORS.darkGray },
    cropImage: { width: 50, height: 50, marginVertical: 8 },
    cropName: { fontWeight: 'bold' },
    detailsCard: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, width: '100%', marginVertical: 15 },
    quantity: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
    price: { backgroundColor: COLORS.primary, color: COLORS.secondary, paddingHorizontal: 5, borderRadius: 4, overflow: 'hidden' },
    quality: { color: COLORS.darkGray },
    variety: { color: COLORS.darkGray },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%'},
    secondaryButton: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, width: '48%', alignItems: 'center' },
    secondaryButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    primaryButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, width: '48%', alignItems: 'center' },
    primaryButtonText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
    findMoreText: { color: COLORS.primary, fontWeight: 'bold', marginTop: 15, textDecorationLine: 'underline' }
});

export default BuyerInterestModal;