import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function HotelDetailsScreen({ route, navigation }) {
  const { hotelId } = route.params;
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [hotelId]);

  async function fetchDetails() {
    try {
      setLoading(true);
      const res = await mobileApi.getHotelDetails(hotelId);
      setHotel(res.hotel);
    } catch (err) {
      console.warn('Error fetching hotel details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !hotel) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const rooms = hotel.rooms || [];
  const reviews = hotel.reviews || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Cover Image */}
        <Image source={{ uri: hotel.cover_image }} style={styles.heroImage} />

        <View style={styles.bodyContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.hotelCategory}>{hotel.hotel_type || 'Luxury Resort'} • ★ {hotel.star_category} Star</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {hotel.rating} ({hotel.reviews_count || 0})</Text>
            </View>
          </View>

          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.hotelAddress}>📍 {hotel.address}, {hotel.city}, {hotel.state}</Text>

          {/* Amenities Chips */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionHeading}>Hotel Amenities</Text>
            <View style={styles.amenitiesWrap}>
              {hotel.amenities && hotel.amenities.map((a, i) => (
                <View key={i} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>✓ {a}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeading}>About the Property</Text>
            <Text style={styles.descText}>{hotel.description}</Text>
          </View>

          {/* Available Rooms Section */}
          <View style={styles.roomsSection}>
            <Text style={styles.sectionHeading}>Select Your Room</Text>
            {rooms.length === 0 ? (
              <Text style={styles.noRoomsText}>No rooms available at this time.</Text>
            ) : (
              rooms.map((r) => (
                <View key={r.id} style={styles.roomCard}>
                  <Image
                    source={{ uri: r.photos && r.photos[0] ? r.photos[0] : hotel.cover_image }}
                    style={styles.roomImage}
                  />
                  <View style={styles.roomContent}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.roomName}>{r.room_name}</Text>
                      <Text style={styles.roomTypeBadge}>{r.room_type}</Text>
                    </View>

                    <Text style={styles.roomSpecs}>👥 Fits up to {r.max_guests} Guests • King Bed</Text>
                    <Text style={styles.roomDesc} numberOfLines={2}>{r.description}</Text>

                    <View style={styles.roomFooter}>
                      <View>
                        <Text style={styles.priceTag}>₹{r.price_per_night.toLocaleString('en-IN')}</Text>
                        <Text style={styles.nightSub}>per night + 12% GST</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookRoomBtn}
                        onPress={() => navigation.navigate('RoomDetails', { hotel, room: r })}
                      >
                        <Text style={styles.bookRoomText}>BOOK ROOM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Guest Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionHeading}>Verified Guest Reviews ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>Be the first to review after your stay!</Text>
            ) : (
              reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.reviewerName}>{rev.customer_name}</Text>
                    <Text style={styles.reviewRating}>★ {rev.rating}/5</Text>
                  </View>
                  <Text style={styles.reviewComment}>"{rev.comment}"</Text>
                  <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.border
  },
  bodyContent: {
    padding: 18
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  hotelCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark,
    textTransform: 'uppercase'
  },
  ratingBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentDark
  },
  hotelName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4
  },
  hotelAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 10
  },
  amenitiesSection: {
    marginBottom: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  amenityChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  amenityText: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '500'
  },
  descSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19
  },
  roomsSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14
  },
  noRoomsText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  roomCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: 'hidden'
  },
  roomImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.border
  },
  roomContent: {
    padding: 14
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain
  },
  roomTypeBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentDark,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  roomSpecs: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 6
  },
  roomDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 12
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  nightSub: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  bookRoomBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  bookRoomText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    marginBottom: 20
  },
  noReviewsText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentDark
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 6
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textMuted
  }
});
