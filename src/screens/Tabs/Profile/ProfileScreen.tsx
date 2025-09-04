import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Animated, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { buildApiUrl } from '../../../config/api';
import { authService } from '../../../services/authService';

import ProfileHeader from './components/ProfileHeader';
import InfoRow from './components/InfoRow';
import MenuButton from './components/MenuButton';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  // Animation values
  const headerSlideAnim = useRef(new Animated.Value(-200)).current;
  const itemFadeAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  // Trigger animations on screen load
  useEffect(() => {
    Animated.sequence([
      // Animate header sliding down
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Animate menu items fading in one by one
      Animated.stagger(100, 
        itemFadeAnims.map(anim => Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }))
      )
    ]).start();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = authService.getJwt();
        if (!token) return;
        const res = await fetch(buildApiUrl('/user/profile'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json?.success) {
          setProfile(json.data.profile);
        } else {
          console.log('Profile fetch failed:', json?.message);
        }
      } catch (e: any) {
        console.log('Profile fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader 
        slideAnim={headerSlideAnim} 
        name={profile?.name || '—'} 
        avatarUri={profile?.profileimage || undefined}
      />
      
      <View style={styles.content}>
        {/* User Info Section */}
        <Animated.View style={{ opacity: itemFadeAnims[0] }}>
            <InfoRow icon="call-outline" label="Phone Number" value={profile?.mobilenumber || '—'} />
        </Animated.View>
        <Animated.View style={{ opacity: itemFadeAnims[1] }}>
            <InfoRow 
              icon="location-outline" 
              label="Address" 
              value={[profile?.village, profile?.taluk, profile?.district, profile?.state, profile?.pincode]
                .filter(Boolean).join(', ') || '—'} 
            />
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Menu Options Section */}
        <Animated.View style={{ opacity: itemFadeAnims[2] }}>
            <MenuButton icon="language-outline" label="Change Language" onPress={() => {}} />
        </Animated.View>
        <Animated.View style={{ opacity: itemFadeAnims[3] }}>
            <MenuButton icon="log-out-outline" label="Log Out" onPress={() => {}} isDestructive />
        </Animated.View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerText}>Help Us Improve</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  spacer: {
      height: 20,
  },
  footer: {
      padding: 20,
      alignItems: 'center',
  },
  footerText: {
      color: COLORS.mediumGray,
      fontSize: 14,
      textDecorationLine: 'underline',
  }
});

export default ProfileScreen;