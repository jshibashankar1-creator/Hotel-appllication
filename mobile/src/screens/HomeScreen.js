import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
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
  const [favorites, setFavorites] = useState(['htl-plaza-ny', 'htl-burj-dubai']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLiveHotels();
  }, []);

  async function fetchLiveHotels() {
    try {
      setLoading(true);
      const res = await mobileApi.searchHotels();
      if (res && res.hotels && res.hotels.length > 0) {
        // Merge with our rich image mock details
        const combined = res.hotels.map(h => {
          const matched = RECOMMENDED_HOTELS.find(rh => rh.city.toLowerCase() === (h.city || '').toLowerCase());
          return {
            ...h,
            coverImage: h.cover_image || (matched ? matched.coverImage : RECOMMENDED_HOTELS[0].coverImage),
            images: h.gallery && h.gallery.length > 0 ? h.gallery : (matched ? matched.images : RECOMMENDED_HOTELS[0].images),
            pricePerNight: h.starting_price || (matched ? matched.pricePerNight : 350),
            currency: '$',
            isTopRated: true,
            reviewsCount: h.reviews_count || 120,
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
      <StatusBar barStyle="light-content" backgroundColor="#2D0812" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SECTION + SEARCH CARD combined so banner goes behind card */}
        <View style={styles.heroWrapper}>
          {/* Full-height banner image covering hero + card area */}
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80' }}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            {/* Dark overlay for contrast */}
            <View style={styles.heroOverlay} />

            {/* Top Bar: Hamburger & Notification */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.topIconText}>☰</Text>
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

            {/* Hero Headlines */}
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Find Your{'\n'}Perfect Stay</Text>
              <Text style={styles.heroSubtitle}>New Digha & Old Digha, WB</Text>
            </View>

            {/* SEARCH CARD floats inside banner image */}
            <View style={styles.searchCardWrapper}>
              <SearchCard onSearch={handleSearchSubmit} />
            </View>
          </ImageBackground>
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

        {/* RECOMMENDED FOR YOU */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2D0812',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroWrapper: {
    width: width,
    backgroundColor: '#2D0812',
    overflow: 'hidden',
  },
  heroBackground: {
    width: width,
    justifyContent: 'space-between',
    paddingTop: STATUSBAR_HEIGHT + 14,
    paddingHorizontal: 20,
    paddingBottom: 0,
    minHeight: 350 + STATUSBAR_HEIGHT,
  },
  heroBackgroundImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 8, 18, 0.42)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    marginTop: 4,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(45, 8, 18, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topIconText: {
    fontSize: 18,
    color: COLORS.white,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  heroTextContainer: {
    zIndex: 10,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 38,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.goldLight,
    marginTop: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  searchCardWrapper: {
    marginTop: 18,
    zIndex: 20,
    width: '100%',
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
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
