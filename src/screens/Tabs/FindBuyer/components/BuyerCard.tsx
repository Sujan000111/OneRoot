import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const BuyerCard = ({ name, distance }) => (
    <View style={styles.card}>
        <Image source={{ uri: `https://i.pravatar.cc/150?u=${name}` }} style={styles.avatar} />
        <View style={styles.details}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.distance}>{distance} from your farm</Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
    </View>
);

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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    details: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    distance: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    callButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 20,
    },
});

export default BuyerCard;