import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { COLORS } from '../theme/colors';
import HotelCard from '../components/HotelCard';
import FilterModal from '../components/FilterModal';
import { RECOMMENDED_HOTELS, FLASH_DEALS } from '../data/mockData';
import { mobileApi } from '../services/api';

export default function SearchScreen({ route, navigation }) {
  const initialCity = route.params?.city || '';
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [hotels, setHotels] = useState(RECOMMENDED_HOTELS);
  const [favorites, setFavorites] = useState(['htl-plaza-ny']);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState('popular'); // 'popular' | 'price_low' | 'rating'

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
            pricePerNight: h.starting_price || (matched ? matched.pricePerNight : 350),
            currency: '$',
            rating: h.rating || 4.8,
            reviewsCount: h.reviews_count || 120,
            isTopRated: true,
            rooms: h.rooms || (matched ? matched.rooms : RECOMMENDED_HOTELS[0].rooms),
          };
        });
      }

      // Filter by city / search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        combined = combined.filter(h =>
          (h.name || '').toLowerCase().includes(q) ||
          (h.city || '').toLowerCase().includes(q) ||
          (h.location || '').toLowerCase().includes(q)
        );
      }

      // Filter by price tier
      if (activeFilters.priceTier && activeFilters.priceTier !== 'All') {
        if (activeFilters.priceTier === 'Under $300') {
          combined = combined.filter(h => (h.pricePerNight || 350) < 300);
        } else if (activeFilters.priceTier === '$300 - $600') {
          combined = combined.filter(h => (h.pricePerNight || 350) >= 300 && (h.pricePerNight || 350) <= 600);
        } else if (activeFilters.priceTier === '$600+') {
          combined = combined.filter(h => (h.pricePerNight || 350) > 600);
        }
      }

      // Sort
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
    navigation.navigate('HotelDetails', { hotel });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072824" />
      
      {/* TOP SEARCH BAR */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>📍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search destination, hotel or city..."
            placeholderTextColor={COLORS.textMuted}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter & Sort Bar */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, Object.keys(activeFilters).length > 0 && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterBtnIcon}>⚙️</Text>
            <Text style={[styles.filterBtnText, Object.keys(activeFilters).length > 0 && styles.filterBtnTextActive]}>
              Filters {Object.keys(activeFilters).length > 0 ? `(${Object.keys(activeFilters).length})` : ''}
            </Text>
          </TouchableOpacity>

          <View style={styles.sortPills}>
            <TouchableOpacity
              style={[styles.sortPill, activeSort === 'popular' && styles.sortPillActive]}
              onPress={() => setActiveSort('popular')}
            >
              <Text style={[styles.sortPillText, activeSort === 'popular' && styles.sortPillTextActive]}>
                Popular
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, activeSort === 'rating' && styles.sortPillActive]}
              onPress={() => setActiveSort('rating')}
            >
              <Text style={[styles.sortPillText, activeSort === 'rating' && styles.sortPillTextActive]}>
                Top Rated
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, activeSort === 'price_low' && styles.sortPillActive]}
              onPress={() => setActiveSort('price_low')}
            >
              <Text style={[styles.sortPillText, activeSort === 'price_low' && styles.sortPillTextActive]}>
                Best Price
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* RESULTS LIST */}
      <View style={styles.content}>
        <View style={styles.resultsCountRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={{ fontWeight: '800', color: COLORS.primary }}>{hotels.length}</Text> Luxury Properties
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loaderText}>Finding perfect luxury stays...</Text>
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

      {/* Filter Sheet Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        currentFilters={activeFilters}
        onApply={filters => setActiveFilters(filters)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#072824',
  },
  header: {
    backgroundColor: '#072824',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4942',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterButtonActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldBg,
  },
  filterBtnIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  filterBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: COLORS.gold,
  },
  sortPills: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortPillActive: {
    backgroundColor: COLORS.gold,
  },
  sortPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultsCountRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCountText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
