import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { hotel, room, booking } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 28 }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your reservation has been verified and registered with {hotel.name}.</Text>
        </View>

        {/* Unique Booking Code Badge */}
        <View style={styles.bookingCodeCard}>
          <Text style={styles.codeLabel}>OFFICIAL BOOKING ID</Text>
          <Text style={styles.codeValue}>{booking.booking_code}</Text>
          <Text style={styles.codeNote}>Please present this Booking ID during check-in</Text>
        </View>

        {/* Stay Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionHeader}>STAY ITINERARY</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hotel Property:</Text>
            <Text style={styles.infoVal}>{hotel.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Room Category:</Text>
            <Text style={styles.infoVal}>{room.room_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Check-In Date:</Text>
            <Text style={styles.infoVal}>{booking.check_in_date} (02:00 PM)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Check-Out Date:</Text>
            <Text style={styles.infoVal}>{booking.check_out_date} (11:00 AM)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guest Name:</Text>
            <Text style={styles.infoVal}>{booking.customer_name}</Text>
          </View>

          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4 }]}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalVal}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action CTAs */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Bookings')}
        >
          <Text style={styles.primaryBtnText}>VIEW MY BOOKINGS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryBtnText}>BACK TO HOME</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, alignItems: 'center' },
  successHeader: { alignItems: 'center', marginVertical: 14 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.successBg,
    borderWidth: 2,
    borderColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
  successSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  bookingCodeCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginVertical: 14
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  codeValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary, letterSpacing: 2, marginVertical: 4 },
  codeNote: { fontSize: 11, color: COLORS.textSecondary },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20
  },
  sectionHeader: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 12, color: COLORS.textMuted },
  infoVal: { fontSize: 12, fontWeight: '700', color: COLORS.textMain, maxWidth: '60%', textAlign: 'right' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  totalVal: { fontSize: 16, fontWeight: '800', color: COLORS.success },
  primaryBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  secondaryBtn: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryBtnText: { color: COLORS.textMain, fontWeight: '700', fontSize: 12 }
});
