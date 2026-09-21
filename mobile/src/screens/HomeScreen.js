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
import { POPULAR_DESTINATIONS, RECOMMENDED_HOTELS } from '../data/mockData';
import { mobileApi } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [hotels, setHotels] = useState(RECOMMENDED_HOTELS);
  const [favorites, setFavorites] = useState(['htl-digha-luxury-resort']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLiveHotels();
  }, []);

  async function fetchLiveHotels() {
    try {
      setLoading(true);
      const res = await mobileApi.searchHotels();
      if (res && res.hotels && res.hotels.length > 0) {
        const combined = res.hotels.map(h => {
          const matched = RECOMMENDED_HOTELS.find(rh => rh.city.toLowerCase() === (h.city || '').toLowerCase());
          return {
            ...h,
            coverImage: h.cover_image || (matched ? matched.coverImage : RECOMMENDED_HOTELS[0].coverImage),
            images: h.gallery && h.gallery.length > 0 ? h.gallery : (matched ? matched.images : RECOMMENDED_HOTELS[0].images),
            pricePerNight: h.starting_price || (matched ? matched.pricePerNight : 6499),
            currency: '₹',
            isTopRated: true,
            reviewsCount: h.reviews_count || 215,
            rating: h.rating || 4.8,
            rooms: h.rooms || (matched ? matched.rooms : RECOMMENDED_HOTELS[0].rooms),
          };
        });
        setHotels(combined.length >= 3 ? combined : RECOMMENDED_HOTELS);
      }
    } catch (err) {
      console.log('Using local luxury mock hotels dataset:', err.message);
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

  const handleSearchSubmit = (searchParams) => {
    navigation.navigate('Search', {
      city: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guestsRooms: searchParams.guestsRooms,
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
          {/* TOP HERO HEADER */}
          <View style={styles.heroSection}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.topIconText}>👤</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => navigation.navigate('Support')}
                activeOpacity={0.8}
              >
                <Text style={styles.topIconText}>🔔</Text>
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Find Your Perfect Stay</Text>
              <Text style={styles.heroSubtitle}>New Digha & Old Digha, WB</Text>
            </View>

            {/* SEARCH CARD */}
            <View style={styles.searchCardWrapper}>
              <SearchCard onSearch={handleSearchSubmit} />
            </View>
          </View>

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
            {hotels.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={favorites.includes(hotel.id)}
                onToggleFavorite={toggleFavorite}
                onPress={handleSelectHotel}
              />
            ))}
          </View>
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
    paddingBottom: 10,
    backgroundColor: '#160824',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.gold,
  },
  heroTextContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  searchCardWrapper: {
    marginTop: 6,
    marginBottom: 10,
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
