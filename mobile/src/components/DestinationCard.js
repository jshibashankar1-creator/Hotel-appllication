import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function DestinationCard({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => onPress && onPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.gradientOverlay}>
        <Text style={styles.city}>{item.city}</Text>
        <Text style={styles.country}>{item.country}</Text>
        <Text style={styles.hotelsCount}>{item.hotelsCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 135,
    height: 175,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  city: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  country: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  hotelsCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.95,
  },
});
