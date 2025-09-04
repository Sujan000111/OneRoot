import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../../theme/colors';
import { CallsApi } from '../../../../services/api';

export interface CallItem {
  id: string;
  name: string;
  details: string;
  type: 'missed' | 'outgoing';
  timestamp: string;
  avatar: string;
  duration?: string;
}

interface CallListItemProps {
  item: CallItem;
}

const CallListItem: React.FC<CallListItemProps> = ({ item }) => {
  const isMissed = item.type === 'missed';

  const onPressCall = useCallback(async () => {
    try {
      const phone = item.name?.match(/\+?\d[\d\s-]{6,}/)?.[0] || item.name || '';
      // Log dialed call
      const created = await CallsApi.createCall({
        calleePhone: phone,
        direction: 'outgoing',
        status: 'dialed',
        startedAt: new Date().toISOString(),
        context: { source: 'CallListItem' },
      });

      // Dial using OS handler
      const telUrl = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) await Linking.openURL(telUrl);

      // Optionally update later with duration (requires native call state). Skipped here.
    } catch (e) {
      // swallow
    }
  }, [item.name]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detailsText}>{item.details}</Text>
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons
            name={isMissed ? 'call-missed' : 'arrow-top-right'}
            size={16}
            color={isMissed ? COLORS.error : COLORS.success}
          />
          <Text style={[styles.statusText, { color: isMissed ? COLORS.error : COLORS.success }]}>
            {isMissed ? 'Missed Call' : 'Outgoing'}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={onPressCall}>
        {item.duration && <Text style={styles.duration}>{item.duration}</Text>}
        <Ionicons name="call" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    color: COLORS.mediumGray,
    marginLeft: 8,
    fontSize: 14,
  },
  callButton: {
    backgroundColor: '#E7F2E5', // Light green background for the call icon
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: -18,
    color: COLORS.mediumGray,
    fontSize: 12,
  },
});

export default CallListItem;