import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import RoomCard from '../components/RoomCard';
import StickyBookingBar from '../components/StickyBookingBar';
import DatePickerModal from '../components/DatePickerModal';
import { RECOMMENDED_HOTELS } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function HotelDetailsScreen({ route, navigation }) {
  const hotel = route.params?.hotel || RECOMMENDED_HOTELS[0];
  const passedDates = route.params?.bookingDates || {};

  const today = new Date();
  const defaultIn = passedDates.checkInDate || new Date(today.getTime() + 86400000);
  const defaultOut = passedDates.checkOutDate || new Date(today.getTime() + 86400000 * 4);

  const [bookingDates, setBookingDates] = useState({
    checkInDate: defaultIn,
    checkOutDate: defaultOut,
    formattedCheckIn: passedDates.formattedCheckIn || `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`,
    formattedCheckOut: passedDates.formattedCheckOut || `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`,
    isoCheckIn: passedDates.isoCheckIn || defaultIn.toISOString().split('T')[0],
    isoCheckOut: passedDates.isoCheckOut || defaultOut.toISOString().split('T')[0],
    guestsCount: passedDates.guestsCount || 2,
    roomsCount: passedDates.roomsCount || 1,
    nightsCount: passedDates.nightsCount || 3,
  });

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(hotel.isFavorite || false);
  const [selectedRoom, setSelectedRoom] = useState(
    hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : RECOMMENDED_HOTELS[0].rooms[0]
  );

  const heroImage = hotel.coverImage || hotel.cover_image || (hotel.images && hotel.images[0]) || RECOMMENDED_HOTELS[0].coverImage;
  const roomPricePerNight = selectedRoom?.price || selectedRoom?.price_per_night || hotel.pricePerNight || 6499;
  const calculatedTotalPrice = roomPricePerNight * bookingDates.nightsCount;

  const handleProceedToBooking = () => {
    navigation.navigate('BookingReview', {
      hotel,
      selectedRoom: selectedRoom || (hotel.rooms && hotel.rooms[0]),
      checkInDate: bookingDates.formattedCheckIn,
      checkOutDate: bookingDates.formattedCheckOut,
      isoCheckIn: bookingDates.isoCheckIn,
      isoCheckOut: bookingDates.isoCheckOut,
      nightsCount: bookingDates.nightsCount,
      guestsCount: bookingDates.guestsCount,
      roomsCount: bookingDates.roomsCount,
      totalPrice: calculatedTotalPrice,
      bookingDates,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HERO IMAGE CONTAINER */}
          <View style={styles.heroImageWrapper}>
            <Image source={{ uri: heroImage }} style={styles.heroImage} />

            <View style={styles.topHeaderBar}>
              <TouchableOpacity
                style={styles.backCircle}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backCircle}
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.8}
              >
                <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HOTEL HEADLINE & SUBTEXT */}
          <View style={styles.titleSection}>
            <Text style={styles.hotelTitle}>
              {hotel.name || 'Digha Beach Luxury Resort'}
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.locationText}>
                {hotel.city || 'New Digha'}, {hotel.state || 'WB'}
              </Text>
              <Text style={styles.ratingDot}>•</Text>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingScore}>{hotel.rating || '4.8'}</Text>
              <Text style={styles.reviewsCount}>({(hotel.reviewsCount || hotel.reviews_count || 215)} Reviews)</Text>
            </View>
          </View>

          {/* DYNAMIC BOOKING DATES BAR */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dateBarCard}
            onPress={() => setDateModalVisible(true)}
          >
            <View style={styles.dateBarLeft}>
              <Text style={styles.dateBarIcon}>📅</Text>
              <View>
                <Text style={styles.dateBarTitle}>
                  {bookingDates.formattedCheckIn} – {bookingDates.formattedCheckOut} ({bookingDates.nightsCount} Night{bookingDates.nightsCount > 1 ? 's' : ''})
                </Text>
                <Text style={styles.dateBarSub}>
                  {bookingDates.guestsCount} Guest{bookingDates.guestsCount > 1 ? 's' : ''} • {bookingDates.roomsCount} Room{bookingDates.roomsCount > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.changeDatesBtn}>
              <Text style={styles.changeDatesText}>Change</Text>
            </View>
          </TouchableOpacity>

          {/* KEY AMENITIES CARD */}
          <View style={styles.amenitiesCardContainer}>
            <Text style={styles.cardHeaderTitle}>KEY AMENITIES</Text>

            <View style={styles.amenitiesGrid}>
              <View style={styles.amenityBox}>
                <Text style={styles.amenityIcon}>📶</Text>
                <Text style={styles.amenityLabel}>Free WiFi</Text>
              </View>

              <View style={styles.amenityBox}>
                <Text style={styles.amenityIcon}>🏊</Text>
                <Text style={styles.amenityLabel}>Pool</Text>
              </View>

              <View style={styles.amenityBox}>
                <Text style={styles.amenityIcon}>🏖️</Text>
                <Text style={styles.amenityLabel}>Beach Access</Text>
              </View>

              <View style={styles.amenityBox}>
                <Text style={styles.amenityIcon}>💆</Text>
                <Text style={styles.amenityLabel}>Spa</Text>
              </View>
            </View>
          </View>

          {/* ROOM TYPE SELECTION CARD */}
          <View style={styles.roomCardContainer}>
            <Text style={styles.cardHeaderTitle}>ROOM TYPE SELECTION</Text>
            <Text style={styles.selectRoomSub}>Select a Room:</Text>

            <View style={styles.roomsList}>
              {(hotel.rooms || RECOMMENDED_HOTELS[0].rooms).map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoom?.id === room.id}
                  onSelect={r => setSelectedRoom(r)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* STICKY BOTTOM BAR */}
        <StickyBookingBar
          price={calculatedTotalPrice}
          currency={hotel.currency || '₹'}
          buttonLabel={`Book ${bookingDates.nightsCount} Night${bookingDates.nightsCount > 1 ? 's' : ''}`}
          onBookPress={handleProceedToBooking}
        />

        {/* DATE PICKER MODAL */}
        <DatePickerModal
          visible={dateModalVisible}
          onClose={() => setDateModalVisible(false)}
          initialCheckIn={bookingDates.checkInDate}
          initialCheckOut={bookingDates.checkOutDate}
          initialGuests={bookingDates.guestsCount}
          initialRooms={bookingDates.roomsCount}
          onConfirm={data => setBookingDates(data)}
        />
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#160824',
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#160824',
  },
  container: {
    flex: 1,
    backgroundColor: '#160824',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroImageWrapper: {
    height: 240,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: STATUSBAR_HEIGHT + 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#160824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  favIcon: {
    fontSize: 14,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  hotelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  ratingDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 6,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingScore: {
    color: COLORS.goldLight,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
  reviewsCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  amenitiesCardContainer: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 14,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  amenityBox: {
    alignItems: 'center',
    width: 70,
  },
  amenityIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  amenityLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomCardContainer: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectRoomSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  roomsList: {
    gap: 10,
  },
  dateBarCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateBarIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateBarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateBarSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  changeDatesBtn: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  changeDatesText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
