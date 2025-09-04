import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated, Easing } from 'react-native';
import { COLORS } from '../../../../theme/colors';

interface FindingLoaderModalProps {
    visible: boolean;
    onClose: () => void;
}

const FindingLoaderModal: React.FC<FindingLoaderModalProps> = ({ visible, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(119); // 1:59 in seconds
    const [progress, setProgress] = useState(0);
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;
    const pulse3 = useRef(new Animated.Value(0)).current;
    const spinner = useRef(new Animated.Value(0)).current;
    const shimmer = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;

        // Reset timer and progress when modal opens
        setTimeLeft(119);
        setProgress(0);

        // Animate header slide/opacity
        Animated.timing(headerAnim, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

        // Pulsing radar waves
        const makePulse = (val: Animated.Value, delay: number) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(val, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
            ])
          );
        const p1 = makePulse(pulse1, 0); const p2 = makePulse(pulse2, 400); const p3 = makePulse(pulse3, 800);
        p1.start(); p2.start(); p3.start();

        // Spinner
        Animated.loop(Animated.timing(spinner, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })).start();

        // Shimmer over map placeholder
        Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })).start();

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        const progressTimer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(progressTimer);
                    return 100;
                }
                return prevProgress + (100 / 119); // Distribute progress over 119 seconds
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(progressTimer);
            pulse1.stopAnimation(); pulse2.stopAnimation(); pulse3.stopAnimation();
            spinner.stopAnimation(); shimmer.stopAnimation();
        };
    }, [visible]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalBackground} onPress={() => {}}>
                    <View style={styles.contentContainer}>
                        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }] }]}>
                            <Text style={styles.title}>Finding the best buyers near you…</Text>
                            <Animated.View style={[styles.spinner, { transform: [{ rotate: spinner.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] }) }] }]} />
                        </Animated.View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.timerText}>It will take {formatTime(timeLeft)}</Text>
                        <View style={styles.mapContainer}>
                            <View style={styles.mapPlaceholder}>
                                <Animated.View style={[styles.shimmer, { opacity: shimmer.interpolate({ inputRange: [0,1], outputRange: [0.18, 0.5] }) , transform: [{ translateX: shimmer.interpolate({ inputRange: [0,1], outputRange: [-120, 120] }) }]}]} />
                                <View style={styles.radarCenter}>
                                    <Animated.View style={[styles.pulse, { transform: [
                                        { scale: pulse1.interpolate({ inputRange: [0,1], outputRange: [0.3, 1.6] }) }
                                    ], opacity: pulse1.interpolate({ inputRange: [0,1], outputRange: [0.6, 0] }) }]} />
                                    <Animated.View style={[styles.pulse, { transform: [
                                        { scale: pulse2.interpolate({ inputRange: [0,1], outputRange: [0.3, 1.6] }) }
                                    ], opacity: pulse2.interpolate({ inputRange: [0,1], outputRange: [0.6, 0] }) }]} />
                                    <Animated.View style={[styles.pulse, { transform: [
                                        { scale: pulse3.interpolate({ inputRange: [0,1], outputRange: [0.3, 1.6] }) }
                                    ], opacity: pulse3.interpolate({ inputRange: [0,1], outputRange: [0.6, 0] }) }]} />
                                    <View style={styles.pin} />
                                </View>
                            </View>
                        </View>
                    </View>
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
        minHeight: '50%',
    },
    contentContainer: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
    spinner: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.primary, borderTopColor: 'transparent' },
    progressBar: { height: 8, backgroundColor: COLORS.lightGray, borderRadius: 4, marginVertical: 10 },
    progressFill: { 
        height: '100%', 
        backgroundColor: COLORS.primary, 
        borderRadius: 4,
    },
    timerText: { color: COLORS.mediumGray, textAlign: 'right' },
    mapContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', marginTop: 15 },
    mapPlaceholder: { 
        flex: 1, 
        backgroundColor: COLORS.lightGray, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 12,
        position: 'relative'
    },
    shimmer: { position: 'absolute', top: 0, bottom: 0, width: 160, backgroundColor: '#fff' },
    radarCenter: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
    pulse: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.primary },
    pin: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.secondary, borderWidth: 3, borderColor: COLORS.primary },
    mapPlaceholderText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    mapPlaceholderSubtext: { 
        fontSize: 12, 
        color: COLORS.mediumGray,
    },
});

export default FindingLoaderModal;