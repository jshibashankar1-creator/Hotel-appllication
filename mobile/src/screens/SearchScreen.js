import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import HotelCard from '../components/HotelCard';
import { mobileApi } from '../services/api';

export default function SearchScreen({ route, navigation }) {
  const searchState = route.params?.searchState || {};
  const initialCity = route.params?.city || searchState.location || 'New Digha, West Bengal';
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState('price_low');

  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000);
  const defaultOut = new Date(today.getTime() + 86400000 * 4);
  const formattedCheckIn = `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`;
  const formattedCheckOut = `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`;

  useEffect(() => {
    fetchHotels();
  }, [searchQuery, activeSort]);

  async function fetchHotels() {
    try {
      setLoading(true);
      const params = {};
      // use simple substring matching for demo if real api requires it
      if (searchQuery && searchQuery.includes('Digha')) {
        params.city = searchQuery.includes('New Digha') ? 'New Digha' : 'Old Digha';
      }

      const res = await mobileApi.searchHotels(params);
      let combined = [];

      if (res && res.hotels && res.hotels.length > 0) {
        combined = res.hotels.map(h => ({
          ...h,
          coverImage: h.cover_image,
          pricePerNight: h.starting_price || h.price_per_night || 0,
          currency: '₹',
          rating: h.rating || 0,
          reviewsCount: h.reviews_count || 0,
        }));
      }

      if (activeSort === 'price_low') {
        combined.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
      } else if (activeSort === 'rating') {
        combined.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setHotels(combined);
    } catch (err) {
      console.log('API Error:', err.message);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071B3A" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{color: '#fff', fontSize: 24}}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{initialCity || 'Search Results'}</Text>
            <Text style={styles.headerSubtitle}>{formattedCheckIn} - {formattedCheckOut} • 2 Guests</Text>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <Text style={{color: '#fff', fontSize: 20}}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={styles.filterPillActive}>
              <Text style={styles.filterPillTextActive}>↑↓ Price: Low to High</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>⭐ 5 Star Rating</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>🏊 With Pool</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>🏖️ Near Beach</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterPillText}>✅ Free Cancellation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* List */}
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
            !loading ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#4B5563' }}>No hotels found for your search.</Text>
              </View>
            ) : null
          }
        />
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
});
