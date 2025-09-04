import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, Animated ,TouchableOpacity, FlatList, Easing } from 'react-native';
import { COLORS } from '../../../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

// --- (Helper function remains the same) ---
const getImageSource = (img?: string | any) => {
    if (!img) return null;
    if (typeof img === 'number') return img;
    // ... (rest of the function is unchanged)
    if (typeof img === 'string') {
        const map: Record<string, any> = {
            'tender-coconut.png': require('../../../../assets/images/tender-coconut.png'),
            'dry-coconut.png': require('../../../../assets/images/dry-coconut.png'),
            'turmeric.png': require('../../../../assets/images/turmeric.png'),
            'banana.png': require('../../../../assets/images/banana.png'),
            'sunflower.png': require('../../../../assets/images/sunflower.png'),
            'maize.png': require('../../../../assets/images/maize.png'),
        };
        return map[img] || null;
    }
    return null;
};


// --- (Redesigned Crop Selection Card) ---
const CropCard = ({ name, status, daysLeft, image, onPress, isSelected }: { name: string; status: 'on' | 'off' | 'days'; daysLeft?: number; image?: string | any; onPress?: () => void, isSelected: boolean }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: isSelected ? 1.05 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isSelected]);
    
    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.cropCardWrapper]}>
            <TouchableOpacity 
                style={[styles.cropCard, isSelected && styles.cropCardSelected]} 
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={[styles.statusBadge, status === 'on' ? styles.statusOn : styles.statusOff]}>
                    <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                </View>
                <Image source={getImageSource(image)!} style={styles.cropImage} />
                <Text style={styles.cropName}>{name}</Text>
                {status === 'days' && (
                    <Text style={styles.daysLeft}>{daysLeft || 0} Days to Sell</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};


// --- (Redesigned Main Modal) ---
interface FindBuyerInitialModalProps {
    visible: boolean;
    onClose: () => void;
    onSearch: () => void;
    crops?: Array<{ id: string; name: string; status: 'on' | 'off' | 'days'; daysLeft?: number; image?: string | any }>
    onSelectCrop?: (id: string) => void;
}

const FindBuyerInitialModal: React.FC<FindBuyerInitialModalProps> = ({ visible, onClose, onSearch, crops = [], onSelectCrop }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (visible && crops.length > 0) {
            const firstCropId = crops[0].id;
            setSelectedId(firstCropId);
            if (onSelectCrop) onSelectCrop(firstCropId);
        } else {
            setSelectedId(null);
        }
    }, [visible, crops]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalContainer}>
                    <Animated.View style={[styles.handle, { opacity: 1 }]} />
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>Let's Find Buyers for You!</Text>
                        <Text style={styles.subtitle}>Select for which crop you want a Buyer</Text>
                        
                        <View style={styles.cropListContainer}>
                            {crops.length > 0 ? (
                                <FlatList
                                    horizontal
                                    data={crops}
                                    keyExtractor={(item) => item.id}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20 }}
                                    renderItem={({ item }) => (
                                        <CropCard 
                                            name={item.name}
                                            status={item.status}
                                            daysLeft={item.daysLeft}
                                            image={item.image}
                                            isSelected={selectedId === item.id}
                                            onPress={() => {
                                                setSelectedId(item.id);
                                                if (onSelectCrop) onSelectCrop(item.id);
                                            }} 
                                        />
                                    )}
                                />
                            ) : (
                                <View style={styles.emptyStateContainer}>
                                    <Ionicons name="leaf-outline" size={40} color={COLORS.mediumGray} />
                                    <Text style={styles.infoText}>No crops are ready for harvest</Text>
                                    <Text style={styles.infoSubtext}>Mark a crop as ready to find buyers</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                                <Text style={styles.secondaryButtonText}>Another Crop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton} onPress={onSearch}>
                                <Text style={styles.primaryButtonText}>Search Buyers</Text>
                                <Ionicons name="arrow-forward" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};


// --- (New and Improved Styles) ---
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: { 
        backgroundColor: COLORS.background, 
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40, // Space for home indicator
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    contentContainer: { 
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: COLORS.primary,
        marginTop: 10,
    },
    subtitle: { 
        fontSize: 16, 
        color: COLORS.darkGray, 
        marginTop: 8, 
        textAlign: 'center',
        marginBottom: 20,
    },
    cropListContainer: {
        height: 150, // Fixed height for the scroll area
        width: '100%',
        justifyContent: 'center',
    },
    cropCardWrapper: {
        marginHorizontal: 8,
    },
    cropCard: {
        width: 100,
        height: 120,
        borderRadius: 16,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    cropCardSelected: {
        borderColor: COLORS.primary,
    },
    statusBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusOn: { backgroundColor: COLORS.success },
    statusOff: { backgroundColor: COLORS.error },
    statusText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    cropImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    cropName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    daysLeft: {
        fontSize: 10,
        color: COLORS.darkGray,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 16,
        color: COLORS.mediumGray,
        fontWeight: '500',
        marginTop: 10,
    },
    infoSubtext: {
        fontSize: 14,
        color: COLORS.mediumGray,
        marginTop: 4,
    },
    buttonContainer: { 
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    secondaryButton: { 
        borderWidth: 1.5, 
        borderColor: COLORS.primary, 
        borderRadius: 12, 
        paddingVertical: 15, 
        width: '48%', 
        alignItems: 'center' 
    },
    secondaryButtonText: { 
        color: COLORS.primary, 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    primaryButton: { 
        backgroundColor: COLORS.primary, 
        borderRadius: 12, 
        paddingVertical: 15, 
        width: '48%', 
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    primaryButtonText: { 
        color: COLORS.secondary, 
        fontWeight: 'bold', 
        fontSize: 16,
        marginRight: 8,
    },
});

export default FindBuyerInitialModal;