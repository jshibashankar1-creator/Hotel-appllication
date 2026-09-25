import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

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
          <View style={[styles.image, { backgroundColor: '#e2e8f0' }]} />
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {hotel.rating || '4.8'}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite && onToggleFavorite(hotel.id)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.rowBetween}>
          <View style={{flex: 1}}>
            <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
            <Text style={styles.locationText}>📍 {hotel.city}, WB</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.priceAmount}>{currency}{price.toLocaleString()}</Text>
            <Text style={styles.priceUnit}>/ night</Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.amenitiesRow}>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🏊</Text>
              <Text style={styles.amenityText}>Pool</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>📶</Text>
              <Text style={styles.amenityText}>WiFi</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🏖️</Text>
              <Text style={styles.amenityText}>Beach</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🍽️</Text>
              <Text style={styles.amenityText}>Rest</Text>
            </View>
          </View>
          
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.bookButton}
            onPress={() => onPress && onPress(hotel)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 14,
  },
  detailsContainer: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1733',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#8F1239',
  },
  priceUnit: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  amenitiesRow: {
    flexDirection: 'row',
  },
  amenityItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  amenityIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  amenityText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#8F1239',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#8F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
