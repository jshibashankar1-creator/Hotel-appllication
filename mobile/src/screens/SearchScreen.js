import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function SearchScreen({ route, navigation }) {
  const initialCity = route.params?.city || '';
  const [city, setCity] = useState(initialCity);
  const [starCategory, setStarCategory] = useState('all');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, [city, starCategory]);

  async function fetchHotels() {
    try {
      setLoading(true);
      const params = {};
      if (city) params.city = city;
      if (starCategory !== 'all') params.starCategory = starCategory;
      const res = await mobileApi.searchHotels(params);
      setHotels(res.hotels || []);
    } catch (err) {
      console.warn('Search hotels error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search Filter Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Text style={{ marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={city}
            onChangeText={setCity}
            placeholder="Filter by city (e.g. Mumbai, Goa, Jaipur)"
            placeholderTextColor={COLORS.textMuted}
          />
          {city ? (
            <TouchableOpacity onPress={() => setCity('')}>
              <Text style={{ color: COLORS.textMuted }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Star Rating Pills */}
        <View style={styles.pillsRow}>
          {['all', '5', '4'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, starCategory === s && styles.pillActive]}
              onPress={() => setStarCategory(s)}
            >
              <Text style={[styles.pillText, starCategory === s && styles.pillTextActive]}>
                {s === 'all' ? 'All Ratings' : `★ ${s} Star`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : hotels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Hotels Found</Text>
          <Text style={styles.emptySubtitle}>Try changing your search destination or filters.</Text>
        </View>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.hotelCard}
              onPress={() => navigation.navigate('HotelDetails', { hotelId: item.id })}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.cover_image }} style={styles.hotelImage} />
              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.hotelLocation}>📍 {item.city}, {item.state}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {item.rating}</Text>
                  </View>
                </View>

                <Text style={styles.hotelTitle}>{item.name}</Text>
                <Text style={styles.hotelType}>{item.hotel_type || 'Luxury Resort'}</Text>

                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.priceValue}>₹{item.starting_price.toLocaleString('en-IN')}<Text style={styles.perNight}> / night</Text></Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => navigation.navigate('HotelDetails', { hotelId: item.id })}
                  >
                    <Text style={styles.selectBtnText}>SELECT ROOM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBarContainer: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    padding: 0
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  pillTextActive: {
    color: COLORS.white
  },
  listContainer: {
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  hotelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden'
  },
  hotelImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.border
  },
  cardContent: {
    padding: 14
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  hotelLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  ratingBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark
  },
  hotelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2
  },
  hotelType: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  },
  priceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain
  },
  perNight: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: 'normal'
  },
  selectBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  selectBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});
