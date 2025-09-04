import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const adWidth = width - 30; // 15 padding on each side

const AdBanner = () => {
  return (
    <View style={styles.container}>
      {/* Replace with your actual ad image URL */}
      <Image
        source={{ uri: 'https://placehold.co/600x300/347928/FFF?text=Ad+Banner' }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: adWidth,
    height: adWidth / 2, // Assuming a 2:1 aspect ratio
  },
});

export default AdBanner;