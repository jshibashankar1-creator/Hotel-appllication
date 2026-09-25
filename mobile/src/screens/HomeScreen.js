import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import SearchCard from '../components/SearchCard';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';

import { mobileApi } from '../services/api';

const { width } = Dimensions.get('window');

const POPULAR_DESTINATIONS = [
  { id: '1', city: 'New Digha', label: 'Beachfront & Luxury', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f6a6?w=600&auto=format&fit=crop&q=80' },
  { id: '2', city: 'Old Digha', label: 'Heritage & Quiet', image: 'https://images.unsplash.com/photo-1582719478250-c89402bb1a0b?w=600&auto=format&fit=crop&q=80' },
];

import DatePickerModal from '../components/DatePickerModal';

export default function HomeScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLiveHotels();
  }, []);

  async function fetchLiveHotels() {
    try {
      setLoading(true);
      setError(null);
      const res = await mobileApi.searchHotels();
      if (res && res.hotels && res.hotels.length > 0) {
        const combined = res.hotels.map(h => {
          return {
            ...h,
            coverImage: h.cover_image,
            images: h.gallery && h.gallery.length > 0 ? h.gallery : [h.cover_image],
            pricePerNight: h.starting_price || h.price_per_night || 0,
            currency: '₹',
            isTopRated: true,
            reviewsCount: h.reviews_count || 0,
            rating: h.rating || 0,
            rooms: h.rooms || [],
          };
        });
        setHotels(combined);
      } else {
        setHotels([]);
      }
    } catch (err) {
      console.log('API Error:', err.message);
      setError('Unable to connect to server. Please check your internet connection or try again.');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000);
  const defaultOut = new Date(today.getTime() + 86400000 * 4);
  const [checkInObj, setCheckInObj] = useState(defaultIn);
  const [checkOutObj, setCheckOutObj] = useState(defaultOut);
  const [formattedCheckIn, setFormattedCheckIn] = useState(`${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`);
  const [formattedCheckOut, setFormattedCheckOut] = useState(`${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`);
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [nightsCount, setNightsCount] = useState(3);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateConfirm = (data) => {
    setCheckInObj(data.checkInDate);
    setCheckOutObj(data.checkOutDate);
    setFormattedCheckIn(data.formattedCheckIn);
    setFormattedCheckOut(data.formattedCheckOut);
    setGuestsCount(data.guestsCount);
    setRoomsCount(data.roomsCount);
    setNightsCount(data.nightsCount);
  };

  const toggleFavorite = (hotelId) => {
    if (favorites.includes(hotelId)) {
      setFavorites(favorites.filter(id => id !== hotelId));
    } else {
      setFavorites([...favorites, hotelId]);
    }
  };

  const handleSearchSubmit = (searchParams) => {
    navigation.navigate('Search', {
      city: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guestsRooms: searchParams.guestsRooms,
      searchState: searchParams,
    });
  };

  const handleSelectHotel = (hotel) => {
    navigation.navigate('HotelDetails', { hotel });
  };

  const handleSelectDestination = (destination) => {
    navigation.navigate('Search', { city: destination.city });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.responsiveWrapper}>
          {/* REDESIGNED TOP HERO HEADER */}
          <View style={styles.heroSection}>
            <View style={styles.topHeaderBar}>
              <TouchableOpacity
                style={styles.searchDateBox}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={styles.searchDateText}>
                  {formattedCheckIn} - {formattedCheckOut}, {guestsCount} Guests
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.staysSelector} activeOpacity={0.8}>
                <Text style={styles.staysText}>Stays ▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Price: Low to High</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>⭐ 5 Star Rating</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>🏊 With Pool</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>📍 Nearby</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* POPULAR DESTINATIONS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { city: '' })}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={POPULAR_DESTINATIONS}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
            renderItem={({ item }) => (
              <DestinationCard item={item} onPress={handleSelectDestination} />
            )}
          />

          {/* RECOMMENDED LUXURY STAYS */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Featured Stays</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { city: '' })}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hotelsList}>
            {loading ? (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>Loading hotels...</Text>
            ) : error ? (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
                <TouchableOpacity onPress={fetchLiveHotels} style={{ backgroundColor: COLORS.goldLight, padding: 10, borderRadius: 5 }}>
                  <Text style={{ color: '#000' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : hotels.length === 0 ? (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>No hotels available</Text>
            ) : (
              hotels.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  isFavorite={favorites.includes(hotel.id)}
                  onToggleFavorite={toggleFavorite}
                  onPress={(h) => {
                    // Update the hotel to include the selected dates for dynamic pricing downstream
                    const hotelWithDates = {
                      ...h,
                      searchDates: {
                        checkIn: formattedCheckIn,
                        checkOut: formattedCheckOut,
                        guestsCount,
                        roomsCount,
                        nightsCount,
                        checkInDateObj: checkInObj,
                        checkOutDateObj: checkOutObj
                      }
                    };
                    handleSelectHotel(hotelWithDates);
                  }}
                />
              ))
            )}
          </View>

          <DatePickerModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            initialCheckIn={checkInObj}
            initialCheckOut={checkOutObj}
            initialGuests={guestsCount}
            initialRooms={roomsCount}
            onConfirm={handleDateConfirm}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#160824',
  },
  container: {
    flex: 1,
    backgroundColor: '#160824',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  heroSection: {
            paddingTop: STATUSBAR_HEIGHT + 14,
            paddingHorizontal: 16,
            paddingBottom: 20,
            backgroundColor: '#160824',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          },
          topHeaderBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          searchDateBox: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 24,
            marginRight: 10,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          calendarIcon: {
            fontSize: 16,
            marginRight: 8,
          },
          searchDateText: {
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: '600',
          },
          staysSelector: {
            backgroundColor: COLORS.burgundyPill,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 24,
          },
          staysText: {
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: '700',
          },
          filterChipsRow: {
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 10,
          },
          filterChip: {
            backgroundColor: 'rgba(37, 12, 35, 0.8)',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
          filterChipText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
          },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.goldLight,
  },
  destinationsList: {
    paddingLeft: 20,
    paddingRight: 6,
  },
  hotelsList: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
});
