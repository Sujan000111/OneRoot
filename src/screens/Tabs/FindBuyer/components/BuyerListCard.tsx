import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../theme/colors';

type BuyerLite = {
  id: string;
  name: string;
  profileimage?: string;
  taluk?: string;
  district?: string;
};

interface BuyerListCardProps {
  buyer: BuyerLite;
  onPress: (buyer: any) => void;
}

const BuyerListCard: React.FC<BuyerListCardProps> = ({ buyer, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(buyer)}>
      <Image source={{ uri: buyer.profileimage || `https://i.pravatar.cc/150?u=${buyer.id}` }} style={styles.avatar} />
      <View style={styles.details}>
        <Text style={styles.name}>{buyer.name || 'Buyer'}</Text>
        <Text style={styles.location}>{buyer.taluk || ''}{buyer.district ? `, ${buyer.district}` : ''}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  location: { fontSize: 14, color: COLORS.darkGray, marginTop: 4 },
});

export default BuyerListCard;
