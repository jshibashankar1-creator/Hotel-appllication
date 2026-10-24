import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { mobileApi } from '../services/api';
import HotelBannerCarousel from '../components/HotelBannerCarousel';

const { width, height } = Dimensions.get('window');

export default function HotelDetailsScreen({ route, navigation }) {
  const hotelParam = route.params?.hotel;
  const hotelId = route.params?.id || route.params?.hotelId || hotelParam?.id || hotelParam?._id;
  const passedDates = route.params?.bookingDates || {};

  const today = new Date();
  const defaultIn = passedDates.checkInDate || new Date(today.getTime() + 86400000);
  const defaultOut = passedDates.checkOutDate || new Date(today.getTime() + 86400000 * 4);

  const getLocalISODate = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [bookingDates] = useState({
    checkInDate: defaultIn,
    checkOutDate: defaultOut,
    formattedCheckIn: passedDates.formattedCheckIn || `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`,
    formattedCheckOut: passedDates.formattedCheckOut || `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`,
    isoCheckIn: passedDates.isoCheckIn || getLocalISODate(defaultIn),
    isoCheckOut: passedDates.isoCheckOut || getLocalISODate(defaultOut),
    guestsCount: passedDates.guestsCount || 2,
    roomsCount: passedDates.roomsCount || 1,
    nightsCount: passedDates.nightsCount || 3,
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [fullHotel, setFullHotel] = useState(hotelParam || null);
  const [loading, setLoading] = useState(!hotelParam && Boolean(hotelId));
  const [fetchError, setFetchError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hotelBanners, setHotelBanners] = useState([]);
  const mainScrollViewRef = useRef(null);
  const roomsSectionY = useRef(0);

  useEffect(() => {
    async function fetchDetails() {
      if (!hotelId) return;
      try {
        setLoading(true);
        setFetchError(null);
        const res = await mobileApi.getHotelDetails(hotelId);
        if (res && res.hotel) {
          setFullHotel(res.hotel);
          if (res.hotel.rooms && res.hotel.rooms.length > 0) {
            setSelectedRoom(res.hotel.rooms[0]);
          }
        } else {
          setFetchError('Hotel details not found');
        }
      } catch (err) {
        console.warn('[HotelDetails] Failed to fetch hotel details:', err.message);
        if (!fullHotel) {
          setFetchError(err.message || 'Failed to load hotel details.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [hotelId]);

  useEffect(() => {
    async function fetchHotelBanners() {
      if (!hotelId) return;
      try {
        // Fetch banners filtered by hotel_id from backend
        const res = await mobileApi.getBanners({ hotel_id: hotelId });
        const list = Array.isArray(res?.banners) ? res.banners : [];
        // Match banner.hotel_id to selected hotel's actual ID and ensure active
        const matched = list.filter(b => 
          b && 
          b.is_active !== false && 
          String(b.hotel_id) === String(hotelId)
        );
        setHotelBanners(matched);
      } catch (err) {
        console.warn('[HotelDetails] Could not load promotional banners:', err.message);
        setHotelBanners([]);
      }
    }
    fetchHotelBanners();
  }, [hotelId]);

  // Ensure a room is selected once hotel data is loaded
  useEffect(() => {
    if (!selectedRoom && fullHotel?.rooms?.length > 0) {
      setSelectedRoom(fullHotel.rooms[0]);
    }
  }, [fullHotel]);

  // Resolve display banners unconditionally at the top level
  const displayBanners = useMemo(() => {
    // 1. Promotional or fallback banners from backend
    if (hotelBanners && hotelBanners.length > 0) {
      return hotelBanners;
    }
    // 2. Fallback to hotel cover image from fullHotel or hotelParam
    const cover = fullHotel?.coverImage || fullHotel?.cover_image || (fullHotel?.images && fullHotel?.images[0]);
    if (cover) {
      return [{
        id: `cover-${hotelId}`,
        hotel_id: hotelId,
        title: fullHotel?.name || 'Exclusive Stay',
        image_url: cover,
        cover_image: cover,
        sort_order: 0,
        is_active: true,
        fallback: true
      }];
    }
    // 3. Empty state (no promotional banners, no cover image)
    return [];
  }, [hotelBanners, fullHotel, hotelId]);

  if (!hotelId) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ fontSize: 50, marginBottom: 16 }}>🏨</Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0B1733', textAlign: 'center', marginBottom: 8 }}>
          Hotel Not Found
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          The requested hotel was not specified or has an invalid identifier.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#8F1239', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Back to Stays</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (fetchError && !fullHotel) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ fontSize: 50, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0B1733', textAlign: 'center', marginBottom: 8 }}>
          Unable to Load Hotel
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          {fetchError}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#8F1239', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Back to Stays</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading && !fullHotel) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#8F1239" />
        <Text style={{ marginTop: 16, color: '#64748b', fontWeight: '600' }}>Loading Hotel Details...</Text>
      </SafeAreaView>
    );
  }

  const roomPricePerNight = selectedRoom?.price || selectedRoom?.price_per_night || fullHotel?.pricePerNight || fullHotel?.starting_price || 0;
  
  const handleProceedToBooking = () => {
    navigation.navigate('BookingReview', {
      hotel: fullHotel,
      selectedRoom: selectedRoom || (fullHotel?.rooms && fullHotel.rooms[0]),
      checkInDate: bookingDates.formattedCheckIn,
      checkOutDate: bookingDates.formattedCheckOut,
      isoCheckIn: bookingDates.isoCheckIn,
      isoCheckOut: bookingDates.isoCheckOut,
      nightsCount: bookingDates.nightsCount,
      guestsCount: bookingDates.guestsCount,
      roomsCount: bookingDates.roomsCount,
      totalPrice: roomPricePerNight * bookingDates.nightsCount,
      bookingDates,
    });
  };

  const displayRooms = fullHotel?.rooms || [];




  const handleBannerPress = (banner) => {
    // Scroll down to the Select Room / Booking section smoothly
    if (mainScrollViewRef.current && roomsSectionY.current > 0) {
      mainScrollViewRef.current.scrollTo({
        y: roomsSectionY.current - 20,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TOP HEADER NAVIGATION BAR */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton} activeOpacity={0.8}>
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {fullHotel?.name || 'Hotel Details'}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={[styles.headerIconButton, { marginRight: 8 }]} 
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerIconText, isFavorite && { color: '#E11D48' }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
            <Text style={styles.headerIconText}>➦</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={mainScrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* DYNAMIC PROMOTIONAL BANNER CAROUSEL (Top of page, before Hotel Name) */}
        <HotelBannerCarousel
          banners={displayBanners}
          onBannerPress={handleBannerPress}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.hotelTitle}>{fullHotel?.name || 'Hotel'}</Text>
          <Text style={styles.locationText}>📍 {fullHotel?.city || 'Location'}{fullHotel?.state ? `, ${fullHotel.state}` : ''}</Text>
          <Text style={styles.ratingText}>⭐ <Text style={{fontWeight:'700'}}>{fullHotel?.rating || '4.8'}</Text> <Text style={{color:'#64748b'}}>({fullHotel?.reviewsCount || '0'} Reviews)</Text></Text>

          {/* TABS */}
          <View style={styles.tabsRow}>
            <TouchableOpacity style={styles.tabActive}>
              <Text style={styles.tabTextActive}>Overview</Text>
              <View style={styles.tabIndicator} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabTextInactive}>Rooms</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabTextInactive}>Amenities</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabTextInactive}>Reviews</Text></TouchableOpacity>
          </View>

          {/* KEY AMENITIES */}
          <Text style={styles.sectionTitle}>KEY AMENITIES</Text>
          <View style={styles.amenitiesRow}>
            <View style={styles.amenityBox}>
              <Text style={styles.amenityIcon}>📶</Text>
              <Text style={styles.amenityBoxText}>Free WiFi</Text>
            </View>
            <View style={styles.amenityBoxActive}>
              <Text style={styles.amenityIconActive}>🏊</Text>
              <Text style={styles.amenityBoxTextActive}>Pool</Text>
            </View>
            <View style={styles.amenityBox}>
              <Text style={styles.amenityIcon}>🏖️</Text>
              <Text style={styles.amenityBoxText}>Beach Access</Text>
            </View>
            <View style={styles.amenityBox}>
              <Text style={styles.amenityIcon}>🌿</Text>
              <Text style={styles.amenityBoxText}>Spa</Text>
            </View>
          </View>

          {/* HOTEL PICKUP SERVICE */}
          <View style={styles.pickupCard}>
            <View style={styles.pickupIconContainer}>
              <Text style={styles.pickupIcon}>🚗</Text>
            </View>
            <View style={styles.pickupContent}>
              <Text style={styles.pickupTitle}>Hotel Pickup Service Available</Text>
              <Text style={styles.pickupDesc}>Direct airport & station pickup in premium AC vehicles with real-time driver tracking</Text>
            </View>
          </View>

          {/* ABOUT HOTEL */}
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutTitle}>About Hotel</Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.showMoreText}>{showFullDescription ? 'Show less' : 'Show more'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutText} numberOfLines={showFullDescription ? undefined : 4}>
            {fullHotel?.description || fullHotel?.about || 'Comfortable stay with modern amenities, prime location, and quality hospitality.'}
          </Text>

          {/* SELECT ROOM */}
          <View onLayout={(e) => { roomsSectionY.current = e.nativeEvent.layout.y; }}>
            <Text style={styles.selectRoomTitle}>Select Room</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            {displayRooms.map((room, idx) => {
              const isSelected = selectedRoom?.id === room.id || selectedRoom?.name === room.name;
              const price = room.price || room.price_per_night || room.pricePerNight || 0;
              const roomImg = (room.photos && room.photos[0]) || room.image || room.cover_image || fullHotel?.cover_image || fullHotel?.coverImage;
              return (
                <TouchableOpacity key={idx} style={[styles.horizontalRoomCard, isSelected && styles.horizontalRoomCardSelected]} onPress={() => setSelectedRoom(room)} activeOpacity={0.9}>
                  <View style={styles.roomImageContainer}>
                    {roomImg ? (
                      <Image source={{ uri: roomImg }} style={styles.horizontalRoomImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.horizontalRoomImage, { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 24 }}>🛏️</Text>
                      </View>
                    )}
                    {isSelected && (
                      <View style={styles.checkIconContainer}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.horizontalRoomDetails}>
                    <Text style={styles.horizontalRoomName} numberOfLines={1}>{room.room_name || room.name}</Text>
                    <Text style={styles.horizontalRoomSubInfo} numberOfLines={1}>{room.bedType || 'King Bed'} • {room.view || 'Sea Balcony'}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'baseline', marginTop: 4}}>
                      <Text style={styles.horizontalRoomPrice}>${price}</Text>
                      <Text style={styles.horizontalRoomPriceUnit}> / night</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* BOTTOM BOOKING BAR */}
      <View style={styles.bottomBar}>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <Text style={styles.totalPrice}>${roomPricePerNight.toLocaleString()}</Text>
            <Text style={styles.roomPriceUnit}> / night</Text>
          </View>
          <Text style={styles.totalLabel}>Includes taxes & fees</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} activeOpacity={0.88} onPress={handleProceedToBooking}>
          <Text style={styles.bookButtonText}>Select Room →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf0f7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topHeaderBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ebf0f7',
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1733',
    textAlign: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  headerIconText: {
    color: '#0B1733',
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 8,
  },
  hotelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1733',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabActive: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabInactive: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabTextActive: {
    color: '#8F1239',
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextInactive: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#8F1239',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amenityBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amenityBoxActive: {
    backgroundColor: '#E0F2FE', // light blue
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amenityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  amenityIconActive: {
    fontSize: 20,
    marginBottom: 4,
    color: '#0284c7', // dark blue text fallback
  },
  amenityBoxText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  amenityBoxTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    textAlign: 'center',
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  roomImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  roomDetails: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1733',
    marginBottom: 4,
  },
  roomSubInfo: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  roomRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#8F1239',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8F1239',
  },
  roomPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1733',
  },
  roomPriceUnit: {
    fontSize: 10,
    color: '#64748b',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  totalLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#8F1239',
  },
  bookButton: {
    backgroundColor: '#8F1239',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#8F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pickupCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2', // light premium background
    borderWidth: 1,
    borderColor: '#E8E0D1',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  pickupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3EAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pickupIcon: {
    fontSize: 20,
  },
  pickupContent: {
    flex: 1,
  },
  pickupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A1D2F',
    marginBottom: 4,
  },
  pickupDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A1D2F',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B58E4A', // premium gold text
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  selectRoomTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A1D2F',
    marginTop: 28,
    marginBottom: 16,
  },
  horizontalRoomCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  horizontalRoomCardSelected: {
    borderColor: '#4A1D2F',
    borderWidth: 1.5,
  },
  roomImageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  horizontalRoomImage: {
    width: '100%',
    height: '100%',
  },
  checkIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  horizontalRoomDetails: {
    padding: 12,
  },
  horizontalRoomName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1733',
    marginBottom: 4,
  },
  horizontalRoomSubInfo: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  horizontalRoomPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4A1D2F',
  },
  horizontalRoomPriceUnit: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
});
