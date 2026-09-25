import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function DestinationCard({ item, onPress }) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.imageContainer}>
        {item.image && !imageError ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.image} 
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: '#e2e8f0' }]} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || item.city}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.label || 'Beautiful Destination'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 155,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 110,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    color: '#0B1733',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '400',
  }
});
