import React, { useState, useEffect } from 'react';
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
import { mobileApi } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function HotelDetailsScreen({ route, navigation }) {
  const hotel = route.params?.hotel;
  const passedDates = route.params?.bookingDates || {};

  const today = new Date();
  const defaultIn = passedDates.checkInDate || new Date(today.getTime() + 86400000);
  const defaultOut = passedDates.checkOutDate || new Date(today.getTime() + 86400000 * 4);

  const [bookingDates] = useState({
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

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [fullHotel, setFullHotel] = useState(hotel);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!hotel?.id) return;
      try {
        setLoading(true);
        const res = await mobileApi.getHotelDetails(hotel.id);
        if (res && res.hotel) {
          setFullHotel(res.hotel);
          if (res.hotel.rooms && res.hotel.rooms.length > 0) {
            setSelectedRoom(res.hotel.rooms[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch hotel details:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [hotel?.id]);

  const heroImage = fullHotel?.coverImage || fullHotel?.cover_image || (fullHotel?.images && fullHotel?.images[0]);
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

  const dummyRooms = [
    {
      id: 'r1',
      name: 'Ocean View King',
      capacity: '2 Adults',
      bedType: 'King Bed',
      view: 'Ocean View',
      price: 18500,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'r2',
      name: 'Poolside Suite',
      capacity: '2 Adults',
      bedType: 'King Bed',
      view: 'Pool View',
      price: 14200,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d5773342b?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const displayRooms = fullHotel?.rooms?.length > 0 ? fullHotel.rooms : dummyRooms;
  if (!selectedRoom && displayRooms.length > 0) {
    setSelectedRoom(displayRooms[0]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO IMAGE */}
        <View style={styles.heroImageWrapper}>
          <Image source={{ uri: heroImage || 'https://images.unsplash.com/photo-1582719478250-c89402bb6a06?auto=format&fit=crop&w=800&q=80' }} style={styles.heroImage} />
          
          <View style={styles.topOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={[styles.iconButton, {marginRight: 10}]}>
                <Text style={styles.iconText}>♡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconText}>➦</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>1/12</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.hotelTitle}>{fullHotel?.name || 'Digha Beach Luxury Resort'}</Text>
          <Text style={styles.locationText}>📍 {fullHotel?.city || 'New Digha'}, WB</Text>
          <Text style={styles.ratingText}>⭐ <Text style={{fontWeight:'700'}}>{fullHotel?.rating || '4.8'}</Text> <Text style={{color:'#64748b'}}>({fullHotel?.reviewsCount || '215'} Reviews)</Text></Text>

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

          {/* ROOM TYPE SELECTION */}
          <Text style={styles.sectionTitle}>ROOM TYPE SELECTION</Text>
          
          {displayRooms.map((room, idx) => {
            const isSelected = selectedRoom?.id === room.id || selectedRoom?.name === room.name;
            const price = room.price || room.price_per_night || room.pricePerNight || 0;
            return (
              <TouchableOpacity key={idx} style={styles.roomCard} onPress={() => setSelectedRoom(room)} activeOpacity={0.9}>
                <Image source={{uri: room.image || room.cover_image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200&q=80'}} style={styles.roomImage} />
                <View style={styles.roomDetails}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomSubInfo}>👤 {room.capacity || '2 Adults'} • 🛏️ {room.bedType || 'King Bed'}</Text>
                  <Text style={styles.roomSubInfo}>🌅 {room.view || 'Great View'}</Text>
                </View>
                <View style={styles.roomRight}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.roomPrice}>₹{price.toLocaleString()}</Text>
                  <Text style={styles.roomPriceUnit}>/ night</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTTOM BOOKING BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total per night:</Text>
          <Text style={styles.totalPrice}>₹{roomPricePerNight.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} activeOpacity={0.88} onPress={handleProceedToBooking}>
          <Text style={styles.bookButtonText}>Select Room & Book</Text>
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
  heroImageWrapper: {
    width: width,
    height: height * 0.35,
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  contentContainer: {
    padding: 20,
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
});
