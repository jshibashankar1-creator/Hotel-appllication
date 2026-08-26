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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.hotelsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: COLORS.primaryDark,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
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
    padding: 12,
    paddingTop: 36,
    backgroundColor: 'rgba(7, 40, 36, 0.75)',
  },
  city: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  country: {
    color: COLORS.goldLight,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
});
