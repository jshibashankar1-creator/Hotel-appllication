import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import HotelCard from '../components/HotelCard';
import { mobileApi } from '../services/api';

export default function SearchScreen({ route, navigation }) {
  // Read city from route params (sent by HomeScreen SEARCH HOTELS button)
  const paramCity = route.params?.city || '';
  const paramCheckIn = route.params?.checkIn || '';
  const paramCheckOut = route.params?.checkOut || '';
  const paramGuests = route.params?.guests || 2;

  // Display label in header
  const displayCity = paramCity || 'All Hotels';

  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSort, setActiveSort] = useState('price_low');

  // Format dates for display
  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
  };

  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000);
  const defaultOut = new Date(today.getTime() + 86400000 * 4);
  const formattedCheckIn = paramCheckIn
    ? formatDate(paramCheckIn)
    : `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`;
  const formattedCheckOut = paramCheckOut
    ? formatDate(paramCheckOut)
    : `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`;

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API params — backend accepts: city, minPrice, maxPrice, starCategory, search
      const params = {};
      if (paramCity) {
        params.city = paramCity; // e.g. "New Digha" or "Old Digha"
      }

      console.log('[SEARCH] Fetching hotels with params:', JSON.stringify(params));
      const res = await mobileApi.searchHotels(params);
      console.log('[SEARCH] Response count:', res?.count);

      let combined = [];
      if (res && res.hotels && res.hotels.length > 0) {
        combined = res.hotels.map(h => ({
          ...h,
          // Normalize field names for HotelCard
          coverImage: h.cover_image,
          pricePerNight: h.starting_price || h.price_per_night || 0,
          currency: '₹',
          rating: h.rating || 0,
          reviewsCount: h.reviews_count || 0,
        }));
      }

      // Sort
      if (activeSort === 'price_low') {
        combined.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
      } else if (activeSort === 'price_high') {
        combined.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
      } else if (activeSort === 'rating') {
        combined.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setHotels(combined);
    } catch (err) {
      console.error('[SEARCH] API Error:', err.message);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [paramCity, activeSort]);

  // Re-fetch whenever city or sort changes
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const toggleFavorite = (hotelId) => {
    setFavorites(prev =>
      prev.includes(hotelId) ? prev.filter(id => id !== hotelId) : [...prev, hotelId]
    );
  };

  const handleSelectHotel = (hotel) => {
    navigation.navigate('HotelDetails', { hotel });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071B3A" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{color: '#fff', fontSize: 24}}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{displayCity || 'Search Results'}</Text>
            <Text style={styles.headerSubtitle}>
              {formattedCheckIn} - {formattedCheckOut} • {paramGuests} Guests
            </Text>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <Text style={{color: '#fff', fontSize: 20}}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Sort/Filter pills */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity
              style={activeSort === 'price_low' ? styles.filterPillActive : styles.filterPill}
              onPress={() => setActiveSort('price_low')}
            >
              <Text style={activeSort === 'price_low' ? styles.filterPillTextActive : styles.filterPillText}>
                ↑↓ Price: Low to High
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={activeSort === 'price_high' ? styles.filterPillActive : styles.filterPill}
              onPress={() => setActiveSort('price_high')}
            >
              <Text style={activeSort === 'price_high' ? styles.filterPillTextActive : styles.filterPillText}>
                ↑↓ Price: High to Low
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={activeSort === 'rating' ? styles.filterPillActive : styles.filterPill}
              onPress={() => setActiveSort('rating')}
            >
              <Text style={activeSort === 'rating' ? styles.filterPillTextActive : styles.filterPillText}>
                ⭐ Top Rated
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>🏊 With Pool</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>🏖️ Near Beach</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.centeredState}>
            <ActivityIndicator color="#8F1239" size="large" />
            <Text style={styles.stateText}>Finding hotels...</Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.centeredState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHotels}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {!loading && !error && (
          <FlatList
            data={hotels}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <HotelCard
                hotel={item}
                onPress={handleSelectHotel}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}
            ListEmptyComponent={
              <View style={styles.centeredState}>
                <Text style={styles.emptyIcon}>🏨</Text>
                <Text style={styles.stateText}>No hotels found</Text>
                <Text style={styles.stateSubText}>
                  {paramCity ? `No results for "${paramCity}"` : 'Try a different search'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf0f7',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#071B3A',
    paddingBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#A0B0C0',
    fontSize: 12,
    fontWeight: '500',
  },
  searchIcon: {
    padding: 8,
  },
  filtersContainer: {
    marginTop: -16,
    marginBottom: 10,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterPillActive: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#8F1239',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterPillText: {
    color: '#0B1733',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#8F1239',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stateText: {
    color: '#0B1733',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  stateSubText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8F1239',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
