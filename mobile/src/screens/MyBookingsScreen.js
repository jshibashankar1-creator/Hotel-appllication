import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function MyBookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await mobileApi.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.warn('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter((b) => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
          <Text style={styles.emptySubtitle}>When you book a stay, it will appear right here.</Text>
          {activeTab === 'upcoming' ? (
            <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.exploreBtnText}>EXPLORE LUXURY HOTELS</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookingCard}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.bookingCode}>{item.booking_code}</Text>
                <View style={[
                  styles.statusBadge,
                  item.booking_status === 'confirmed' ? styles.badgeSuccess :
                  item.booking_status === 'checked_in' ? styles.badgeInfo :
                  item.booking_status === 'checked_out' ? styles.badgeMuted : styles.badgeDanger
                ]}>
                  <Text style={styles.statusText}>{item.booking_status.replace('_', ' ')}</Text>
                </View>
              </View>

              <Text style={styles.hotelTitle}>{item.hotel_name}</Text>
              <Text style={styles.roomSubtitle}>{item.room_name} • {item.guests_count} Guests</Text>

              <View style={styles.datesRow}>
                <View>
                  <Text style={styles.dateLabel}>CHECK-IN</Text>
                  <Text style={styles.dateVal}>{item.check_in_date}</Text>
                </View>
                <View>
                  <Text style={styles.dateLabel}>CHECK-OUT</Text>
                  <Text style={styles.dateVal}>{item.check_out_date}</Text>
                </View>
                <View>
                  <Text style={styles.dateLabel}>TOTAL PAID</Text>
                  <Text style={styles.totalVal}>₹{item.total_amount.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>View Digital Itinerary →</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  listContent: { padding: 16 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 30
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 18 },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6
  },
  exploreBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  bookingCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: COLORS.primary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeSuccess: { backgroundColor: COLORS.successBg },
  badgeInfo: { backgroundColor: COLORS.infoBg },
  badgeMuted: { backgroundColor: COLORS.surfaceSecondary },
  badgeDanger: { backgroundColor: COLORS.dangerBg },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: COLORS.textMain },
  hotelTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  roomSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, marginBottom: 12 },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  dateLabel: { fontSize: 8, fontWeight: '700', color: COLORS.textMuted },
  dateVal: { fontSize: 12, fontWeight: '700', color: COLORS.textMain, marginTop: 2 },
  totalVal: { fontSize: 13, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    alignItems: 'flex-end'
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark
  }
});
