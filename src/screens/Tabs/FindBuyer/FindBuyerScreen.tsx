import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme/colors';
import { authService } from '../../../services/authService';
import { buildApiUrl } from '../../../config/api';

import MapViewComponent from './components/MapViewComponent';
// Buyer list removed
import FindBuyerInitialModal from './components/FindBuyerInitialModal';
import FindingLoaderModal from './components/FindingLoaderModal';
import BuyerInterestModal from './components/BuyerInterestModal';

// Removed buyer list mock

const FindBuyerScreen = () => {
    // State for the three modals
    const [isInitialModalVisible, setIsInitialModalVisible] = useState(false);
    const [isLoaderModalVisible, setIsLoaderModalVisible] = useState(false);
    const [isInterestModalVisible, setIsInterestModalVisible] = useState(false);
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);
    const [seenBuyerIds, setSeenBuyerIds] = useState<Set<string>>(new Set());
    // Buyer list removed

    useEffect(() => {
        const fetchAllCrops = async () => {
            try {
                const token = authService.getJwt();
                if (!token) return;

                // Fetch user crops
                const resUser = await fetch(buildApiUrl('/user/crops'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const jsonUser = await resUser.json();
                const userCrops = (resUser.ok && jsonUser?.success ? (jsonUser.data.crops || []) : [])
                  .map((c: any) => ({
                      id: c.id || c.name,
                      name: c.name,
                      status: c.status,
                      daysLeft: c.daysLeft,
                      image: c.image, // already filename like tender-coconut.png
                  }));

                // Fetch crop listings (from BookCardModal adds)
                const resListings = await fetch(buildApiUrl('/crop-listings'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const jsonListings = await resListings.json();
                const listingCrops = (resListings.ok && jsonListings?.success ? (jsonListings.data.listings || []) : [])
                  .map((l: any) => ({
                      id: l.id,
                      name: (l.crop_type || '').replace('-', ' ').replace(/\b\w/g, (m: string) => m.toUpperCase()),
                      status: l.is_ready ? 'on' : (l.ready_in_days ? 'days' as const : 'off' as const),
                      daysLeft: l.ready_in_days || undefined,
                      image: `${l.crop_type}.png`,
                  }));

                // Merge and de-duplicate by id
                const merged = [...userCrops, ...listingCrops];
                setCrops(merged);
            } catch {
                setCrops([]);
            }
        };
        fetchAllCrops();
    }, []);

    // Buyer list removed: no prefetch of premium buyers

    // Function to open the first modal
    const handlePresentInitialModal = () => {
        setIsInitialModalVisible(true);
    };

    // Function to close the first modal and open the loader
    const runSearchWithLoader = async () => {
        setTimeout(() => setIsLoaderModalVisible(true), 50);
        const token = authService.getJwt();
        const selected = crops.find(c => c.id === selectedCropId) || crops[0];
        try {
            const body = {
                cropType: (selected?.image || '').replace('.png','').trim().toLowerCase(),
                limit: 10,
            };
            const fetchPromise = fetch(buildApiUrl('/buyers/search'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const minDelay = new Promise(resolve => setTimeout(resolve, 5500));
            const res = await fetchPromise;
            const json = await res.json();
            await minDelay;
            let results = (res.ok && json?.success ? (json.data.buyers || []) : []);
            if (seenBuyerIds.size > 0) {
                results = results.filter((b: any) => b?.id && !seenBuyerIds.has(b.id));
            }
            setSearchResults(results);
            setCurrentBuyerIndex(0);
        } catch {
            setSearchResults([]);
            setCurrentBuyerIndex(0);
        } finally {
            setIsLoaderModalVisible(false);
            setTimeout(() => setIsInterestModalVisible(true), 150);
        }
    };

    const handleSearch = async () => {
        setIsInitialModalVisible(false);
        await runSearchWithLoader();
    };

    // Phenomenal animated intro setup
    const bgShift = useRef(new Animated.Value(0)).current;
    const heroRise = useRef(new Animated.Value(0)).current;
    const heroGlow = useRef(new Animated.Value(0)).current;
    const ctaPulse = useRef(new Animated.Value(0)).current;
    const pressScale = useRef(new Animated.Value(1)).current;
    const ripple = useRef(new Animated.Value(0)).current;
    const sweepRotate = useRef(new Animated.Value(0)).current;
    const arrowNudge = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(Animated.timing(bgShift, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: true })).start();
        Animated.timing(heroRise, { toValue: 1, duration: 700, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(heroGlow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(heroGlow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
            ])
        ).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(ctaPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(ctaPulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
            ])
        ).start();
        Animated.loop(Animated.timing(sweepRotate, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(arrowNudge, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(arrowNudge, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
            ])
        ).start();
    }, []);

    const bgTranslate = bgShift.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
    const glowOpacity = heroGlow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.35] });
    const ctaScale = ctaPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
    const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
    const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
    const sweepSpin = sweepRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const arrowTranslate = arrowNudge.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    const onCtaPressIn = () => {
        Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, friction: 7, tension: 90 }).start();
    };
    const onCtaPressOut = () => {
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }).start();
    };
    const onCtaPress = () => {
        ripple.setValue(0);
        Animated.timing(ripple, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
        setTimeout(() => handlePresentInitialModal(), 180);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.hero}>
                <Animated.View style={[styles.heroBgBlob, { transform: [{ translateX: bgTranslate }] }]} />
                <Animated.View style={[styles.heroBgBlobSecondary, { transform: [{ translateX: Animated.multiply(bgTranslate, -1) }] }]} />
                <Animated.View style={[styles.heroContent, { opacity: heroRise, transform: [{ translateY: heroRise.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}> 
                    <Text style={styles.heroTitle}>Enter a world of better prices</Text>
                    <Text style={styles.heroSubtitle}>We’ll connect your harvest to buyers who value it.</Text>
                    <Animated.View style={[styles.heroGlow, { opacity: glowOpacity }]} />
                </Animated.View>
            </View>

            <MapViewComponent />

            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                <View style={styles.ctaWrap}>
                    <Animated.View style={[styles.ctaRipple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />
                    <View style={styles.portalOuter}>
                        <View style={styles.portalRing} />
                        <Animated.View style={[styles.portalSweep, { transform: [{ rotate: sweepSpin }] }]} />
                        <AnimatedTouchable 
                            style={[styles.portalCore, { transform: [{ scale: pressScale }] }]}
                            onPressIn={onCtaPressIn}
                            onPressOut={onCtaPressOut}
                            onPress={onCtaPress}
                            activeOpacity={0.9}
                        >
                            <Animated.View style={{ transform: [{ translateX: arrowTranslate }] }}>
                                <Ionicons name="arrow-forward" size={28} color={COLORS.secondary} />
                            </Animated.View>
                        </AnimatedTouchable>
                    </View>
                    <Text style={styles.ctaCaption}>Enter</Text>
                </View>
            </Animated.View>
            <View style={styles.helperTextWrap}>
                <Text style={styles.helperText}>Smooth matching • Secure calls • Local and premium buyers</Text>
            </View>

            {/* All modals are rendered here */}
            <FindBuyerInitialModal 
                visible={isInitialModalVisible}
                onClose={() => setIsInitialModalVisible(false)}
                onSearch={handleSearch}
                crops={crops}
                onSelectCrop={(id) => setSelectedCropId(id)}
            />
            <FindingLoaderModal 
                visible={isLoaderModalVisible}
                onClose={() => setIsLoaderModalVisible(false)}
            />
            <BuyerInterestModal 
                visible={isInterestModalVisible}
                onClose={() => setIsInterestModalVisible(false)}
                onFindMore={async () => {
                    // mark current as seen
                    const current = searchResults[currentBuyerIndex];
                    if (current?.id) {
                        setSeenBuyerIds(prev => new Set(prev).add(current.id));
                    }
                    // close current modal and run a new search with loader 5-6s
                    setIsInterestModalVisible(false);
                    await runSearchWithLoader();
                }}
                buyer={searchResults[currentBuyerIndex]}
                cropName={(crops.find(c => c.id === selectedCropId) || crops[0])?.name}
            />
            {/* Buyer detail modal removed with list */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    hero: { height: 150, marginHorizontal: 15, marginTop: 10, marginBottom: 5, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E9F5EE' },
    heroBgBlob: { position: 'absolute', top: -40, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#CFEBDD' },
    heroBgBlobSecondary: { position: 'absolute', top: -20, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#DBF1E6' },
    heroContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    heroGlow: { position: 'absolute', bottom: -6, width: '70%', height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignSelf: 'center' },
    heroTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black },
    heroSubtitle: { fontSize: 13, color: COLORS.darkGray, marginTop: 6, textAlign: 'center' },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginHorizontal: 15,
        marginBottom: 10,
    },
    findBuyerButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 15,
        marginVertical: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaWrap: { position: 'relative', alignItems: 'center', marginHorizontal: 15 },
    ctaRipple: { position: 'absolute', width: 86, height: 86, borderRadius: 43, backgroundColor: COLORS.primary },
    ctaCaption: { color: COLORS.mediumGray, marginTop: 6, fontWeight: '600' },
    portalOuter: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
    portalRing: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: COLORS.primary, opacity: 0.3 },
    portalSweep: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary, opacity: 0.5 },
    portalCore: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    helperTextWrap: { alignItems: 'center', marginTop: 40 },
    helperText: { color: COLORS.mediumGray, fontSize: 12,paddingTop: 10 },
});

export default FindBuyerScreen;