import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function DealCard({ deal, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={() => onPress && onPress(deal)}
    >
      <Image source={{ uri: deal.coverImage }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {deal.name}
          </Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{deal.discountPercent}%</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{deal.location}</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{deal.rating}</Text>
            <Text style={styles.reviewsText}>({deal.reviewsCount} reviews)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>${deal.originalPrice}</Text>
            <Text style={styles.discountedPrice}>${deal.discountedPrice}</Text>
            <Text style={styles.nightLabel}> / night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: COLORS.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 6,
  },
  discountBadge: {
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  discountText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: COLORS.gold,
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 2,
  },
  reviewsText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  discountedPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
  nightLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
