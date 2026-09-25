import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function HotelCard({ hotel, onPress, onToggleFavorite, isFavorite = false }) {
  const [imageError, setImageError] = useState(false);
  const currency = hotel.currency || '₹';
  const price = hotel.pricePerNight || hotel.starting_price || (hotel.rooms && hotel.rooms[0]?.price_per_night) || 0;
  
  const coverUri = hotel.coverImage || hotel.cover_image || (hotel.images && hotel.images[0]) || (hotel.gallery && hotel.gallery[0]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={() => onPress && onPress(hotel)}
    >
      <View style={styles.imageContainer}>
        {coverUri && !imageError ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
        )}
        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(hotel.id)}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.hotelName} numberOfLines={1}>
          {hotel.name}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.ratingScore}>{hotel.rating || '4.8'}</Text>
          <Text style={styles.reviewsCount}>
            ({(hotel.reviewsCount || hotel.reviews_count || 215)} Reviews)
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>{currency}{price.toLocaleString()}</Text>
          <Text style={styles.priceUnit}> / night</Text>
        </View>

        <Text style={styles.amenitiesText} numberOfLines={1}>
          📶 Free WiFi | Pool | Spa
        </Text>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.bookButton}
          onPress={() => onPress && onPress(hotel)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: 125,
    height: 115,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 12,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#160824',
    letterSpacing: 0.1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#160824',
    marginRight: 4,
  },
  reviewsCount: {
    fontSize: 11,
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#160824',
  },
  priceUnit: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  amenitiesText: {
    fontSize: 11,
    color: '#666666',
    marginTop: 3,
  },
  bookButton: {
    backgroundColor: '#7D143D', // Burgundy
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
