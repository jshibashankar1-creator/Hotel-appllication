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
  FlatList,
} from 'react-native';
import { COLORS } from '../theme/colors';
import RoomCard from '../components/RoomCard';
import StickyBookingBar from '../components/StickyBookingBar';
import { RECOMMENDED_HOTELS } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function HotelDetailsScreen({ route, navigation }) {
  const hotel = route.params?.hotel || RECOMMENDED_HOTELS[0];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(hotel.isFavorite || false);
  const [selectedRoom, setSelectedRoom] = useState(
    hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : RECOMMENDED_HOTELS[0].rooms[0]
  );
  const [expandedAbout, setExpandedAbout] = useState(false);

  const imagesList = hotel.images && hotel.images.length > 0
    ? hotel.images
    : [hotel.coverImage || hotel.cover_image || RECOMMENDED_HOTELS[0].coverImage];

  const handleScroll = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeImageIndex && slide >= 0 && slide < imagesList.length) {
      setActiveImageIndex(slide);
    }
  };

  const handleProceedToBooking = () => {
    navigation.navigate('BookingReview', {
      hotel,
      selectedRoom: selectedRoom || (hotel.rooms && hotel.rooms[0]),
      checkInDate: '2026-08-28',
      checkOutDate: '2026-08-31',
      nightsCount: 3,
      guestsCount: 2,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B3D37" />
      
      {/* Scrollable Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP IMAGE CAROUSEL WITH OVERLAYS */}
        <View style={styles.carouselWrapper}>
          <FlatList
            data={imagesList}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carouselImage} />
            )}
          />

          {/* Top Bar Floating Buttons */}
          <View style={styles.carouselTopBar}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.iconText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.rightIconsRow}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.8}
              >
                <Text style={styles.iconText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconCircle, { marginLeft: 10 }]}
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <Text style={styles.iconText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Counter Badge */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              📷 {activeImageIndex + 1}/{imagesList.length}
            </Text>
          </View>
        </View>

        {/* LUXURY DEEP EMERALD DETAIL CARD */}
        <View style={styles.detailsPanel}>
          {/* Header Title & Luxury Collection Badge */}
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={styles.hotelTitle}>{hotel.name}</Text>
              
              <View style={styles.ratingRow}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.ratingScore}>{hotel.rating || '4.8'}</Text>
                <Text style={styles.reviewsText}>
                  ({(hotel.reviewsCount || hotel.reviews_count || 1248).toLocaleString()} reviews)
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.locationPin}>📍</Text>
                <Text style={styles.locationText} numberOfLines={2}>
                  {hotel.location || `${hotel.address || '5th Avenue, Manhattan'}, ${hotel.city || 'New York'}, ${hotel.country || 'USA'}`}
                </Text>
              </View>
              
              <Text style={styles.distanceText}>
                {hotel.distance || '2.4 km from city center'}
              </Text>
            </View>

            {/* Gold Luxury Emblem Badge */}
            <View style={styles.luxuryEmblemBadge}>
              <Text style={styles.emblemCrown}>👑</Text>
              <Text style={styles.emblemTextTop}>LUXURY</Text>
              <Text style={styles.emblemTextSub}>COLLECTION</Text>
            </View>
          </View>

          {/* AMENITIES ROW */}
          <View style={styles.amenitiesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { name: 'Free WiFi', icon: '📶' },
                { name: 'Swimming Pool', icon: '🏊‍♂️' },
                { name: 'Spa & Wellness', icon: '💆‍♀️' },
                { name: 'Restaurant', icon: '🍽️' },
                { name: 'Fitness Gym', icon: '🏋️‍♂️' },
                { name: 'Valet Parking', icon: '🚗' },
              ].map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  <View style={styles.amenityIconCircle}>
                    <Text style={styles.amenityEmoji}>{amenity.icon}</Text>
                  </View>
                  <Text style={styles.amenityName} numberOfLines={1}>{amenity.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionDivider} />

          {/* ABOUT HOTEL */}
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>About Hotel</Text>
              <TouchableOpacity onPress={() => setExpandedAbout(!expandedAbout)}>
                <Text style={styles.viewMoreText}>{expandedAbout ? 'Show less' : 'View more >'}</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={styles.aboutDescription}
              numberOfLines={expandedAbout ? undefined : 3}
            >
              {hotel.description || 'Experience timeless elegance and world-class hospitality at The Plaza Hotel. Overlooking Central Park, this iconic landmark offers unparalleled luxury in the heart of Manhattan with Michelin-starred dining and dedicated personal concierge service.'}
            </Text>
          </View>

          <View style={styles.sectionDivider} />

          {/* SELECT ROOM */}
          <View style={styles.roomSelectSection}>
            <Text style={styles.sectionHeading}>Select Room</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomsList}
            >
              {(hotel.rooms || RECOMMENDED_HOTELS[0].rooms).map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoom?.id === room.id}
                  onSelect={r => setSelectedRoom(r)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* STICKY RESERVATION FOOTER BAR */}
      <StickyBookingBar
        price={selectedRoom?.price || hotel.pricePerNight || 350}
        currency={hotel.currency || '$'}
        buttonLabel="Select Room →"
        onBookPress={handleProceedToBooking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B3D37',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  carouselWrapper: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: COLORS.primaryDark,
  },
  carouselImage: {
    width: width,
    height: 320,
    resizeMode: 'cover',
  },
  carouselTopBar: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 40, 36, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  iconText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(7, 40, 36, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsPanel: {
    backgroundColor: '#0B3D37',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    minHeight: 500,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    paddingRight: 10,
  },
  hotelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  starIcon: {
    color: COLORS.gold,
    fontSize: 16,
    marginRight: 4,
  },
  ratingScore: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  reviewsText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationPin: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
    flex: 1,
  },
  distanceText: {
    color: COLORS.goldLight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  luxuryEmblemBadge: {
    backgroundColor: '#0E4942',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  emblemCrown: {
    fontSize: 18,
    marginBottom: 2,
  },
  emblemTextTop: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emblemTextSub: {
    color: COLORS.goldLight,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amenitiesSection: {
    marginTop: 20,
  },
  amenityItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 68,
  },
  amenityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0E4942',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  amenityEmoji: {
    fontSize: 20,
  },
  amenityName: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 18,
  },
  aboutSection: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  viewMoreText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  aboutDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  roomSelectSection: {
    marginTop: 4,
  },
  roomsList: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});
