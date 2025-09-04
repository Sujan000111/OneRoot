import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { COLORS } from '../../../../theme/colors';

const MapViewComponent = () => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Animated.View style={[styles.mapShimmer, { opacity: shimmer.interpolate({ inputRange: [0,1], outputRange: [0.15, 0.4] }), transform: [{ translateX: shimmer.interpolate({ inputRange: [0,1], outputRange: [-140, 140] }) }] }]} />
        <Animated.View style={[styles.pulseDot, { transform: [{ translateY: float.interpolate({ inputRange: [0,1], outputRange: [0, -6] }) }] }]} />
        <Text style={styles.mapTitle}>Map View</Text>
        <Text style={styles.mapSubtitle}>Location: Udupi, Karnataka</Text>
        <Text style={styles.mapInfo}>(Map integration coming soon)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 15,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden'
  },
  mapShimmer: { position: 'absolute', top: 0, bottom: 0, width: 180, backgroundColor: '#fff' },
  pulseDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, top: '50%' },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  mapInfo: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
});

export default MapViewComponent;