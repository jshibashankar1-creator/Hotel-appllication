import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function HotelCard({ hotel, onPress, onToggleFavorite, isFavorite = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={() => onPress && onPress(hotel)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hotel.coverImage || hotel.cover_image || (hotel.images && hotel.images[0]) }}
          style={styles.image}
        />
        
        {/* Top Rated Badge */}
        {hotel.isTopRated !== false && (
          <View style={styles.topRatedBadge}>
            <Text style={styles.topRatedText}>Top Rated</Text>
          </View>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite && onToggleFavorite(hotel.id)}
        >
          <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteActive]}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {hotel.name}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {hotel.city || hotel.location}, {hotel.country || 'USA'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingValue}>{hotel.rating || '4.8'}</Text>
            <Text style={styles.reviewsCount}>
              ({(hotel.reviewsCount || hotel.reviews_count || 120).toLocaleString()} reviews)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>
              ${hotel.pricePerNight || hotel.starting_price || (hotel.rooms && hotel.rooms[0]?.price_per_night) || 350}
            </Text>
            <Text style={styles.priceUnit}> / night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: COLORS.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRatedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: COLORS.gold,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  topRatedText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteActive: {
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.1,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: COLORS.gold,
    fontSize: 14,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 4,
  },
  reviewsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
