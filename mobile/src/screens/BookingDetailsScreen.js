import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function BookingDetailsScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  async function fetchBooking() {
    try {
      setLoading(true);
      const res = await mobileApi.getBookingDetails(bookingId);
      setBooking(res.booking);
    } catch (err) {
      console.warn('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isCancellable = booking.booking_status === 'confirmed';
  const isCompleted = booking.booking_status === 'checked_out';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Status Header */}
        <View style={styles.codeHeader}>
          <Text style={styles.codeLabel}>BOOKING CONFIRMATION CODE</Text>
          <Text style={styles.codeVal}>{booking.booking_code}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{booking.booking_status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {/* Hotel & Stay Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>HOTEL & STAY DETAILS</Text>
          <Text style={styles.hotelTitle}>{booking.hotel_name}</Text>
          <Text style={styles.roomSubtitle}>{booking.room_name} ({booking.guests_count} Guests)</Text>

          <View style={styles.datesGrid}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-IN</Text>
              <Text style={styles.dateVal}>{booking.check_in_date}</Text>
              <Text style={styles.timeVal}>02:00 PM</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-OUT</Text>
              <Text style={styles.dateVal}>{booking.check_out_date}</Text>
              <Text style={styles.timeVal}>11:00 AM</Text>
            </View>
          </View>
        </View>

        {/* Financial Receipt */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PAYMENT RECEIPT</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Nights Stayed:</Text>
            <Text style={styles.val}>{booking.nights} Nights</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Room Tariff Base:</Text>
            <Text style={styles.val}>₹{booking.base_amount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Taxes & GST (12%):</Text>
            <Text style={styles.val}>₹{booking.tax_amount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount Paid:</Text>
            <Text style={styles.totalVal}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Actions for Customer */}
        {isCompleted ? (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('ReviewModal', { booking })}
          >
            <Text style={styles.reviewBtnText}>★ WRITE A REVIEW FOR THIS STAY</Text>
          </TouchableOpacity>
        ) : null}

        {isCancellable ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.navigate('Cancellation', { booking })}
          >
            <Text style={styles.cancelBtnText}>REQUEST BOOKING CANCELLATION</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => navigation.navigate('Support', { bookingRef: booking.booking_code })}
        >
          <Text style={styles.supportBtnText}>💬 NEED HELP WITH THIS STAY?</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  codeHeader: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16
  },
  codeLabel: { fontSize: 9, fontWeight: '700', color: COLORS.accent, letterSpacing: 1 },
  codeVal: { fontSize: 22, fontWeight: '900', color: COLORS.white, letterSpacing: 2, marginVertical: 4 },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4
  },
  statusPillText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 8 },
  hotelTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  roomSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, marginBottom: 12 },
  datesGrid: { flexDirection: 'row', backgroundColor: COLORS.surfaceSecondary, borderRadius: 6, padding: 10 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 8, fontWeight: '700', color: COLORS.textMuted },
  dateVal: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  timeVal: { fontSize: 10, color: COLORS.textMuted },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 12, color: COLORS.textMuted },
  val: { fontSize: 12, fontWeight: '600', color: COLORS.textMain },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6, paddingTop: 8 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  totalVal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  reviewBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  reviewBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  cancelBtn: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  cancelBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  supportBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  supportBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 11 }
});
