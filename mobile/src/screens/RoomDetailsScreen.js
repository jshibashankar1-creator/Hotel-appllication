import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { RECOMMENDED_HOTELS } from '../data/mockData';

export default function RoomDetailsScreen({ route, navigation }) {
  const hotel = route.params?.hotel || RECOMMENDED_HOTELS[0];
  const room = route.params?.room || (hotel.rooms && hotel.rooms[0]) || {
    name: 'Deluxe Ocean Suite',
    type: 'Suite',
    price: 350,
    max_guests: 3,
    image: RECOMMENDED_HOTELS[0].coverImage,
  };

  const roomPrice = room.price || room.price_per_night || 350;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072824" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: room.image || (room.photos && room.photos[0]) || hotel.coverImage || hotel.cover_image }}
          style={styles.heroImage}
        />

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.roomTypeBadge}>
              <Text style={styles.roomTypeBadgeText}>{room.type || room.room_type || 'Luxury Suite'}</Text>
            </View>
          </View>

          <Text style={styles.roomTitle}>{room.name || room.room_name || 'Deluxe Room'}</Text>
          <Text style={styles.capacityText}>👥 Maximum Capacity: {room.max_guests || 2} Guests</Text>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Room Features & Amenities</Text>
            <View style={styles.featureRow}><Text style={styles.featureText}>🛏️ King Size Signature Mattress</Text></View>
            <View style={styles.featureRow}><Text style={styles.featureText}>🚿 Marble En-Suite Bathroom & Rain Shower</Text></View>
            <View style={styles.featureRow}><Text style={styles.featureText}>📶 Complimentary 1Gbps High-Speed Wi-Fi</Text></View>
            <View style={styles.featureRow}><Text style={styles.featureText}>☕ In-Room Espresso Machine & Artisan Bar</Text></View>
            <View style={styles.featureRow}><Text style={styles.featureText}>❄️ Smart Climate Control & Air Purification</Text></View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Room Overview</Text>
            <Text style={styles.descText}>
              {room.description || 'Designed with bespoke Italian furnishings, rich textures, and panoramic skyline views, this expansive room delivers supreme comfort, tranquil soundproofing, and intuitive digital controls.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Nightly Rate</Text>
          <Text style={styles.priceValue}>
            ${roomPrice.toLocaleString()}
            <Text style={styles.gstText}> + taxes</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('BookingReview', { hotel, selectedRoom: room })}
        >
          <Text style={styles.bookBtnText}>Select Room →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#072824',
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  roomTypeBadge: {
    backgroundColor: '#0E4942',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roomTypeBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 4,
  },
  capacityText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  cardSection: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  featureRow: {
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textBody,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textBody,
  },
  bottomBar: {
    backgroundColor: '#0B3D37',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  gstText: {
    fontSize: 11,
    color: COLORS.goldLight,
  },
  bookBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  bookBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
