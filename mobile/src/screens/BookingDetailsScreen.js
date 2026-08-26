import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';
import { RECOMMENDED_HOTELS } from '../data/mockData';

export default function BookingDetailsScreen({ route, navigation }) {
  const initialBooking = route.params?.booking;
  const bookingId = route.params?.bookingId || initialBooking?.id;
  const [booking, setBooking] = useState(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);

  useEffect(() => {
    if (bookingId && !initialBooking) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  async function fetchBookingDetails() {
    try {
      setLoading(true);
      const res = await mobileApi.getBookingDetails(bookingId);
      if (res && res.booking) {
        setBooking(res.booking);
      }
    } catch (err) {
      console.log('Using local booking itinerary:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentBooking = booking || {
    id: 'BKG-PLAZA-01',
    booking_code: 'BK-PLZ-8921',
    hotel_name: 'The Plaza Hotel',
    location: '5th Avenue, Manhattan, New York, USA',
    check_in_date: '12 Aug, Mon',
    check_out_date: '15 Aug, Thu',
    guests_count: 2,
    rooms_count: 1,
    room_name: 'Deluxe Room',
    total_amount: 1050,
    booking_status: 'confirmed',
    payment_status: 'paid',
  };

  const isCancellable = currentBooking.booking_status === 'confirmed';
  const isCompleted = currentBooking.booking_status === 'checked_out';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072824" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP PASS CARD WITH QR MOCK */}
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <View>
              <Text style={styles.passBrand}>HOTELHUB VIP PASS</Text>
              <Text style={styles.passCode}>{currentBooking.booking_code || 'BK-PLZ-8921'}</Text>
            </View>
            <View style={styles.passBadge}>
              <Text style={styles.passBadgeText}>
                {currentBooking.booking_status?.toUpperCase() || 'CONFIRMED'}
              </Text>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <Text style={styles.qrIcon}>📱</Text>
              <Text style={styles.qrSubText}>Scan at Front Desk for Express Check-in</Text>
            </View>
          </View>
        </View>

        {/* PROPERTY & RESERVATION DETAILS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Itinerary</Text>
          <Text style={styles.hotelTitle}>{currentBooking.hotel_name}</Text>
          <Text style={styles.hotelLocation}>📍 {currentBooking.location || 'New York, USA'}</Text>

          <View style={styles.divider} />

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>CHECK-IN</Text>
              <Text style={styles.gridVal}>{currentBooking.check_in_date}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>CHECK-OUT</Text>
              <Text style={styles.gridVal}>{currentBooking.check_out_date}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Room Category</Text>
            <Text style={styles.rowVal}>{currentBooking.room_name || 'Deluxe King Suite'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Guests</Text>
            <Text style={styles.rowVal}>{currentBooking.guests_count || 2} Adults</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Payment Status</Text>
            <Text style={[styles.rowVal, { color: COLORS.success, fontWeight: '800' }]}>
              {currentBooking.payment_status?.toUpperCase() || 'PAID'}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsGroup}>
          {isCompleted && (
            <TouchableOpacity
              style={styles.reviewButton}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('ReviewModal', { booking: currentBooking })}
            >
              <Text style={styles.reviewBtnText}>Write Verified Review ★</Text>
            </TouchableOpacity>
          )}

          {isCancellable && (
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Cancellation', { booking: currentBooking })}
            >
              <Text style={styles.cancelBtnText}>Cancel Reservation & Request Refund</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.supportButton}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.supportBtnText}>Contact 24/7 Concierge Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#072824',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  passCard: {
    backgroundColor: '#0B3D37',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 0.8,
  },
  passCode: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 2,
  },
  passBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  passBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  qrContainer: {
    marginTop: 18,
    backgroundColor: '#0E4942',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  qrBox: {
    alignItems: 'center',
  },
  qrIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  qrSubText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hotelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  hotelLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  gridRow: {
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textBody,
  },
  rowVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  actionsGroup: {
    gap: 12,
  },
  reviewButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  supportButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  supportBtnText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
