import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import HotelCard from '../components/HotelCard';
import FilterModal from '../components/FilterModal';
import DatePickerModal from '../components/DatePickerModal';
import { RECOMMENDED_HOTELS } from '../data/mockData';
import { mobileApi } from '../services/api';

export default function SearchScreen({ route, navigation }) {
  const searchState = route.params?.searchState || {};
  const initialCity = route.params?.city || searchState.location || '';
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [hotels, setHotels] = useState(RECOMMENDED_HOTELS);
  const [favorites, setFavorites] = useState(['htl-digha-luxury-resort']);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState('price_low'); // 'price_low' | 'rating' | 'pool'

  // Booking Date State
  const today = new Date();
  const defaultIn = searchState.checkInDateObj || new Date(today.getTime() + 86400000);
  const defaultOut = searchState.checkOutDateObj || new Date(today.getTime() + 86400000 * 4);

  const [bookingDates, setBookingDates] = useState({
    checkInDate: defaultIn,
    checkOutDate: defaultOut,
    formattedCheckIn: searchState.checkIn || `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`,
    formattedCheckOut: searchState.checkOut || `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`,
    isoCheckIn: defaultIn.toISOString().split('T')[0],
    isoCheckOut: defaultOut.toISOString().split('T')[0],
    guestsCount: searchState.guestsCount || 2,
    roomsCount: searchState.roomsCount || 1,
    nightsCount: searchState.nightsCount || 3,
  });

  const handleDateConfirm = (data) => {
    setBookingDates(data);
  };

  useEffect(() => {
    fetchHotels();
  }, [searchQuery, activeFilters, activeSort]);

  async function fetchHotels() {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.city = searchQuery;
      if (activeFilters.star) params.starCategory = activeFilters.star;

      const res = await mobileApi.searchHotels(params);
      let combined = RECOMMENDED_HOTELS;

      if (res && res.hotels && res.hotels.length > 0) {
        combined = res.hotels.map(h => {
          const matched = RECOMMENDED_HOTELS.find(rh => rh.city.toLowerCase() === (h.city || '').toLowerCase());
          return {
            ...h,
            coverImage: h.cover_image || (matched ? matched.coverImage : RECOMMENDED_HOTELS[0].coverImage),
            images: h.gallery && h.gallery.length > 0 ? h.gallery : (matched ? matched.images : RECOMMENDED_HOTELS[0].images),
            pricePerNight: h.starting_price || (matched ? matched.pricePerNight : 6499),
            currency: '₹',
            rating: h.rating || 4.8,
            reviewsCount: h.reviews_count || 215,
            isTopRated: true,
            rooms: h.rooms || (matched ? matched.rooms : RECOMMENDED_HOTELS[0].rooms),
          };
        });
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        combined = combined.filter(h =>
          (h.name || '').toLowerCase().includes(q) ||
          (h.city || '').toLowerCase().includes(q) ||
          (h.location || '').toLowerCase().includes(q)
        );
      }

      if (activeSort === 'price_low') {
        combined.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
      } else if (activeSort === 'rating') {
        combined.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setHotels(combined.length > 0 ? combined : RECOMMENDED_HOTELS);
    } catch (err) {
      console.log('Search fallback to mock hotels:', err.message);
      setHotels(RECOMMENDED_HOTELS);
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = (hotelId) => {
    if (favorites.includes(hotelId)) {
      setFavorites(favorites.filter(id => id !== hotelId));
    } else {
      setFavorites([...favorites, hotelId]);
    }
  };

  const handleSelectHotel = (hotel) => {
    navigation.navigate('HotelDetails', {
      hotel,
      bookingDates,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        {/* TOP SEARCH SUMMARY BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.searchSummaryPill}
            onPress={() => setDateModalVisible(true)}
          >
            <View style={styles.searchPillLeft}>
              <Text style={styles.calendarIcon}>📅</Text>
              <Text style={styles.searchPillText}>
                {bookingDates.formattedCheckIn} - {bookingDates.formattedCheckOut} ({bookingDates.nightsCount}N), {bookingDates.guestsCount} Guest{bookingDates.guestsCount > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.staysTag}>
              <Text style={styles.staysTagIcon}>✏️</Text>
              <Text style={styles.staysTagText}>Edit</Text>
            </View>
          </TouchableOpacity>

          {/* HORIZONTAL FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterChip, activeSort === 'price_low' && styles.filterChipActive]}
              onPress={() => setActiveSort('price_low')}
            >
              <Text style={styles.chipIcon}>🏷️</Text>
              <Text style={[styles.chipText, activeSort === 'price_low' && styles.chipTextActive]}>
                Price: Low to High
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterChip, activeSort === 'rating' && styles.filterChipActive]}
              onPress={() => setActiveSort('rating')}
            >
              <Text style={styles.chipIcon}>⭐</Text>
              <Text style={[styles.chipText, activeSort === 'rating' && styles.chipTextActive]}>
                5 Star Rating
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.filterChip}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={styles.chipIcon}>🏊</Text>
              <Text style={styles.chipText}>With Pool</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.filterChip}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={styles.chipIcon}>🌐</Text>
              <Text style={styles.chipText}>Free WiFi</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* HOTEL LISTINGS */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.goldLight} />
              <Text style={styles.loaderText}>Searching luxury stays...</Text>
            </View>
          ) : (
            <FlatList
              data={hotels}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <HotelCard
                  hotel={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                  onPress={handleSelectHotel}
                />
              )}
            />
          )}
        </View>
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        currentFilters={activeFilters}
        onApply={filters => setActiveFilters(filters)}
      />

      <DatePickerModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        initialCheckIn={bookingDates.checkInDate}
        initialCheckOut={bookingDates.checkOutDate}
        initialGuests={bookingDates.guestsCount}
        initialRooms={bookingDates.roomsCount}
        onConfirm={handleDateConfirm}
      />
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
  header: {
    backgroundColor: '#160824',
    paddingHorizontal: 16,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 12,
  },
  searchSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  searchPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  staysTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  staysTagIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  staysTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingRight: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: COLORS.burgundyPill,
    borderColor: COLORS.goldLight,
  },
  chipIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  chipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#160824',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});
