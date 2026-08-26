import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [destination, setDestination] = useState('Mumbai');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedHotels();
  }, []);

  async function fetchFeaturedHotels() {
    try {
      setLoading(true);
      const res = await mobileApi.searchHotels();
      setHotels(res.hotels || []);
    } catch (err) {
      console.warn('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    navigation.navigate('Search', { city: destination });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Hero */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brandSubtitle}>EXPLORE INDIA</Text>
              <Text style={styles.brandTitle}>HotelHub</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileInitial}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Card */}
          <View style={styles.searchCard}>
            <Text style={styles.searchPrompt}>Where do you want to stay?</Text>
            
            <View style={styles.searchField}>
              <Text style={styles.fieldLabel}>DESTINATION</Text>
              <TextInput
                style={styles.fieldInput}
                value={destination}
                onChangeText={setDestination}
                placeholder="City (e.g. Mumbai, Jaipur, Goa, Delhi)"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.datesRow}>
              <View style={[styles.searchField, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>CHECK-IN</Text>
                <Text style={styles.fieldValue}>25 Aug 2026</Text>
              </View>
              <View style={[styles.searchField, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldLabel}>CHECK-OUT</Text>
                <Text style={styles.fieldValue}>28 Aug 2026</Text>
              </View>
            </View>

            <View style={styles.searchField}>
              <Text style={styles.fieldLabel}>GUESTS & ROOMS</Text>
              <Text style={styles.fieldValue}>2 Adults • 1 Room</Text>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>SEARCH HOTELS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Destinations Row */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destScroll}>
            {[
              { name: 'Mumbai', tag: 'Luxury & Business' },
              { name: 'Jaipur', tag: 'Heritage Palaces' },
              { name: 'Goa', tag: 'Beachfront Resorts' },
              { name: 'Delhi', tag: 'Boutique Stays' }
            ].map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.destCard, destination === d.name && styles.destCardActive]}
                onPress={() => {
                  setDestination(d.name);
                  navigation.navigate('Search', { city: d.name });
                }}
              >
                <Text style={[styles.destName, destination === d.name && styles.destNameActive]}>{d.name}</Text>
                <Text style={styles.destTag}>{d.tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Luxury Stays</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
          ) : (
            hotels.slice(0, 3).map((h) => (
              <TouchableOpacity
                key={h.id}
                style={styles.hotelCard}
                onPress={() => navigation.navigate('HotelDetails', { hotelId: h.id })}
                activeOpacity={0.9}
              >
                <Image source={{ uri: h.cover_image }} style={styles.hotelImage} />
                <View style={styles.hotelCardContent}>
                  <View style={styles.hotelMetaRow}>
                    <Text style={styles.hotelLocation}>📍 {h.city}, {h.state}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {h.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.hotelTitle} numberOfLines={1}>{h.name}</Text>
                  <Text style={styles.hotelDescription} numberOfLines={2}>{h.description}</Text>
                  <View style={styles.hotelFooterRow}>
                    <View>
                      <Text style={styles.priceLabel}>Starting from</Text>
                      <Text style={styles.priceValue}>₹{h.starting_price.toLocaleString('en-IN')}<Text style={styles.perNight}> / night</Text></Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => navigation.navigate('HotelDetails', { hotelId: h.id })}
                    >
                      <Text style={styles.bookBtnText}>VIEW ROOMS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInitial: { fontSize: 18 },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4
  },
  searchPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 14
  },
  searchField: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  fieldInput: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    padding: 0
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentDark
  },
  destScroll: {
    marginTop: 10
  },
  destCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10
  },
  destCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  destName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain
  },
  destNameActive: {
    color: COLORS.white
  },
  destTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  hotelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2
  },
  hotelImage: {
    width: '100%',
    height: 170,
    backgroundColor: COLORS.border
  },
  hotelCardContent: {
    padding: 16
  },
  hotelMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  hotelLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  ratingBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark
  },
  hotelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4
  },
  hotelDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 12
  },
  hotelFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  perNight: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: 'normal'
  },
  bookBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  bookBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
