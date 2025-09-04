import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';

// --- (Props remain the same, adding 'index' for animation) ---
interface BuyerListItemProps {
  isNew: boolean;
  name: string;
  location: string;
  lastActive: string;
  avatarUri?: string;
  index: number; // Add index prop for staggered animation
}

// --- (Helper functions remain the same) ---
const getInitial = (fullName: string) => {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

const isValidUri = (uri?: string) => {
  if (!uri) return false;
  return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:');
};


// --- (Redesigned and Animated Component) ---
const BuyerListItemComponent: React.FC<BuyerListItemProps> = ({ isNew, name, location, lastActive, avatarUri, index }) => {
  const showImage = isValidUri(avatarUri);

  // --- Animation ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
    }).start();
  }, [fadeAnim, slideAnim, index]);


  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        {showImage ? (
          <Image source={{ uri: avatarUri as string }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{getInitial(name)}</Text>
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {isNew && (
        <View style={styles.newTag}>
          <Ionicons name="flame" size={12} color={COLORS.secondary} />
          <Text style={styles.newText}>New</Text>
        </View>
      )}
    </Animated.View>
  );
};

// --- (New and Improved Styles) ---
const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.secondary,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden', // Ensures the newTag doesn't overflow the rounded corners
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
    },
    avatarFallback: {
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: 'bold',
    },
    details: {
        flex: 1,
        marginLeft: 15,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginRight: 6,
    },
    location: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    callButton: {
        backgroundColor: COLORS.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    newTag: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: COLORS.error,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderTopLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    newText: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    // The 'lastActive' text was removed from the design to make it cleaner, 
    // but the prop is still available if you wish to add it back.
});

export default React.memo(BuyerListItemComponent);