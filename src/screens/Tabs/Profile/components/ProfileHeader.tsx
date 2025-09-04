import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { COLORS } from '../../../../theme/colors';

const ProfileHeader = ({ slideAnim, name, avatarUri }: { slideAnim: any; name?: string; avatarUri?: string }) => {
  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <Image
        source={avatarUri ? { uri: avatarUri } : { uri: 'https://i.pravatar.cc/150?u=user' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{name || '—'}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 15,
  },
});

export default ProfileHeader;