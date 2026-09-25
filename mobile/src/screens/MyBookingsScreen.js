import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';


export default function MyBookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLiveBookings();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLiveBookings();
    });
    return unsubscribe;
  }, [navigation]);

  async function fetchLiveBookings() {
    try {
      setLoading(true);
      setError(null);
      const res = await mobileApi.getMyBookings();
      if (res && res.bookings && res.bookings.length > 0) {
        setBookings(res.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.log('API Error:', err.message);
      setError('Unable to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return b.booking_status === 'confirmed' || b.booking_status === 'checked_in';
    }
    if (activeTab === 'completed') {
      return b.booking_status === 'checked_out';
    }
    if (activeTab === 'cancelled') {
      return b.booking_status === 'cancelled';
    }
    return true;
  });

  const handleViewDetails = (booking) => {
    navigation.navigate('BookingDetails', { booking });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stays & Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage your luxury reservations</Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bookings List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={{color: COLORS.textDark}}>Loading bookings...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={{color: 'red', textAlign: 'center', marginBottom: 10}}>{error}</Text>
            <TouchableOpacity onPress={fetchLiveBookings} style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No {activeTab} stays found</Text>
            <Text style={styles.emptySub}>
              Browse our world-class hotels to plan your next vacation.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.exploreButtonText}>Explore Destinations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.bookingCard}
                onPress={() => handleViewDetails(item)}
              >
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.hotelTitle}>{item.hotel_name}</Text>
                    <Text style={styles.hotelLocation}>
                      📍 {item.location || `${item.city || 'New York'}, ${item.country || 'USA'}`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      item.booking_status === 'confirmed' ? styles.statusConfirmed :
                      item.booking_status === 'checked_in' ? styles.statusCheckedIn :
                      item.booking_status === 'checked_out' ? styles.statusCompleted :
                      styles.statusCancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>{item.booking_status?.toUpperCase() || 'CONFIRMED'}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.detailsGrid}>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>CHECK-IN</Text>
                    <Text style={styles.gridVal}>{item.check_in_date}</Text>
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>CHECK-OUT</Text>
                    <Text style={styles.gridVal}>{item.check_out_date}</Text>
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>TOTAL PAID</Text>
                    <Text style={styles.gridPrice}>₹{(item.total_amount || 0).toLocaleString()}</Text>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <Text style={styles.codeText}>Code: {item.booking_code || item.id || ''}</Text>
                  <Text style={styles.viewDetailsText}>View Digital Itinerary →</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.gold,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabLabelActive: {
    color: COLORS.primaryDark,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hotelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  hotelLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusCheckedIn: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  statusCompleted: {
    backgroundColor: COLORS.borderLight,
  },
  statusCancelled: {
    backgroundColor: COLORS.dangerBg,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  codeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  viewDetailsText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
