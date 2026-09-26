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
  ActivityIndicator,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme/colors';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';
import HeroSlider from '../components/HeroSlider';
import { mobileApi } from '../services/api';

const { width, height } = Dimensions.get('window');

const DESTINATION_OPTIONS = ['New Digha', 'Old Digha'];

const DEFAULT_DESTINATIONS = [
  { id: '1', city: 'New Digha', label: 'Beachfront & Luxury', image: null },
  { id: '2', city: 'Old Digha', label: 'Heritage & Quiet', image: null },
];

export default function HomeScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);
  const [loading, setLoading] = useState(false);
  // Selected search state
  const [selectedCity, setSelectedCity] = useState('New Digha');
  const [destPickerIdx, setDestPickerIdx] = useState(0);

  // Compute default dates
  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000);
  const defaultOut = new Date(today.getTime() + 86400000 * 4);
  const checkInISO = defaultIn.toISOString().split('T')[0];
  const checkOutISO = defaultOut.toISOString().split('T')[0];
  const formattedCheckIn = `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}, Mon`;
  const formattedCheckOut = `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}, Thu`;

  useEffect(() => {
    fetchLiveHotels();
  }, []);

  async function fetchLiveHotels() {
    try {
      setLoading(true);
      console.log('[HOME] Fetching all hotels from backend...');
      const res = await mobileApi.searchHotels();
      console.log('[HOME] Response:', res?.count, 'hotels');
      if (res && res.hotels && res.hotels.length > 0) {
        const combined = res.hotels.map(h => ({
          ...h,
          coverImage: h.cover_image,
          pricePerNight: h.starting_price || h.price_per_night || 0,
          currency: '₹',
          rating: h.rating || 0,
          reviewsCount: h.reviews_count || 0,
        }));

        const newDighaHotel = combined.find(h => h.city === 'New Digha' && h.coverImage);
        const oldDighaHotel = combined.find(h => h.city === 'Old Digha' && h.coverImage);

        setDestinations([
          { id: '1', city: 'New Digha', label: 'Beautiful Coastal View', image: newDighaHotel ? newDighaHotel.coverImage : null },
          { id: '2', city: 'Old Digha', label: 'Sunset & Serenity', image: oldDighaHotel ? oldDighaHotel.coverImage : null },
        ]);
        setHotels(combined);
      }
    } catch (err) {
      console.error('[HOME] API Error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // Cycle through destination options when user taps WHERE TO?
  const handleCycleDestination = () => {
    const nextIdx = (destPickerIdx + 1) % DESTINATION_OPTIONS.length;
    setDestPickerIdx(nextIdx);
    setSelectedCity(DESTINATION_OPTIONS[nextIdx]);
  };

  // Main search handler: navigate to SearchScreen with real params
  const handleSearch = () => {
    console.log('[SEARCH] Navigating to Search with city:', selectedCity);
    navigation.navigate('Explore', {
      city: selectedCity,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      guests: 2,
      rooms: 1,
    });
  };

  const handleSelectDestination = (destination) => {
    setSelectedCity(destination.city);
    navigation.navigate('Explore', {
      city: destination.city,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      guests: 2,
      rooms: 1,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Hero Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.heroBackground}
      >
        <View style={styles.heroOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.greetingText}>Good Evening 👋</Text>
            <TouchableOpacity style={styles.bellIcon}>
              <Text style={{color: '#fff', fontSize: 18}}>🔔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Find Your{'\n'}Perfect Stay</Text>
          <Text style={styles.locationPin}>📍 New Digha & Old Digha, WB</Text>

          {/* Hero Slider */}
          <HeroSlider 
            data={hotels.filter(h => h.coverImage).slice(0, 5)} 
            navigation={navigation} 
            loading={loading}
          />

          {/* Search Glass Box */}
          <View style={styles.glassBoxContainer}>
            <BlurView intensity={50} tint="light" style={styles.glassBox}>

              {/* TABS */}
              <View style={styles.tabsRow}>
                <TouchableOpacity style={styles.tabActive}>
                  <Text style={styles.tabTextActive}>🏨 Stays</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>✈️ Flights</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>🚗 Cars</Text>
                </TouchableOpacity>
              </View>

              {/* WHERE TO — tapping cycles destination */}
              <TouchableOpacity style={styles.inputBox} onPress={handleCycleDestination}>
                <Text style={styles.inputLabel}>WHERE TO?</Text>
                <Text style={styles.inputValue}>📍 {selectedCity}, West Bengal</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Check-in</Text>
                  <Text style={styles.inputValue}>📅 {formattedCheckIn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.inputBox, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Check-out</Text>
                  <Text style={styles.inputValue}>📅 {formattedCheckOut}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.inputBox}>
                <Text style={styles.inputLabel}>Guests & Rooms</Text>
                <Text style={styles.inputValue}>👤 2 Guests, 1 Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.searchButton}
                activeOpacity={0.88}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>🔍 SEARCH HOTELS</Text>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* White Content Area — Popular Destinations */}
          <View style={styles.whiteContentArea}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={destinations}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <DestinationCard item={item} onPress={handleSelectDestination} />
              )}
            />

            {/* Featured Hotels section */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Featured Stays</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore', { city: selectedCity })}>
                <Text style={styles.viewAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#8F1239" size="large" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={hotels}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <HotelCard
                    hotel={item}
                    onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                  />
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: '#4B5563' }}>No hotels found. Pull to refresh.</Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf0f7',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 27, 58, 0.5)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    marginBottom: 16,
  },
  greetingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bellIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 20,
    lineHeight: 44,
  },
  locationPin: {
    fontSize: 14,
    color: '#f8fafc',
    paddingHorizontal: 20,
    marginTop: 8,
    fontWeight: '500',
  },
  glassBoxContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  glassBox: {
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabActive: {
    flex: 1,
    backgroundColor: '#8F1239',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#8F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabInactive: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextInactive: {
    color: '#0B1733',
    fontWeight: '600',
    fontSize: 13,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1733',
  },
  searchButton: {
    backgroundColor: '#8F1239',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  whiteContentArea: {
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1733',
  },
  viewAllText: {
    color: '#8F1239',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
});
