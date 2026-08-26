import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function BookingReviewScreen({ route, navigation }) {
  const { hotel, room } = route.params;

  const [checkIn, setCheckIn] = useState('2026-08-25');
  const [checkOut, setCheckOut] = useState('2026-08-28');
  const [guestName, setGuestName] = useState('Aarav Sharma');
  const [guestEmail, setGuestEmail] = useState('aarav.sharma@gmail.com');
  const [guestPhone, setGuestPhone] = useState('+91 98200 11928');
  const [guestsCount, setGuestsCount] = useState(2);

  const nights = 3;
  const baseAmount = room.price_per_night * nights;
  const taxAmount = Math.round(baseAmount * 0.12);
  const totalAmount = baseAmount + taxAmount;

  const handleProceedToPayment = () => {
    navigation.navigate('Payment', {
      hotel,
      room,
      bookingData: {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        nights,
        guests_count: guestsCount,
        customer_name: guestName,
        customer_email: guestEmail,
        customer_phone: guestPhone,
        base_amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hotel & Room Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>RESERVATION DETAILS</Text>
          <Text style={styles.hotelTitle}>{hotel.name}</Text>
          <Text style={styles.roomSubtitle}>{room.room_name} ({room.room_type})</Text>
          <Text style={styles.addressText}>📍 {hotel.address}, {hotel.city}</Text>

          <View style={styles.datesGrid}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-IN</Text>
              <Text style={styles.dateVal}>{checkIn}</Text>
              <Text style={styles.timeVal}>02:00 PM</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-OUT</Text>
              <Text style={styles.dateVal}>{checkOut}</Text>
              <Text style={styles.timeVal}>11:00 AM</Text>
            </View>
          </View>
        </View>

        {/* Primary Guest Contact Form */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PRIMARY GUEST CONTACT</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Legal Name</Text>
            <TextInput
              style={styles.input}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Guest full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (For Booking Confirmation)</Text>
            <TextInput
              style={styles.input}
              value={guestEmail}
              onChangeText={setGuestEmail}
              keyboardType="email-address"
              placeholder="guest@example.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone Number</Text>
            <TextInput
              style={styles.input}
              value={guestPhone}
              onChangeText={setGuestPhone}
              keyboardType="phone-pad"
              placeholder="+91 98000 00000"
            />
          </View>
        </View>

        {/* Itemized Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PRICE SUMMARY</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceItem}>Room Tariff (₹{room.price_per_night.toLocaleString('en-IN')} × {nights} nights)</Text>
            <Text style={styles.priceVal}>₹{baseAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceItem}>Government GST Taxes (12%)</Text>
            <Text style={styles.priceVal}>₹{taxAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.totalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.policyNotice}>
            <Text style={styles.policyText}>
              🛡️ Free cancellation up to 24 hours before check-in. Standard 10% fee applies for late cancellations under platform policy.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.proceedBtn} onPress={handleProceedToPayment}>
          <Text style={styles.proceedBtnText}>PROCEED TO ONLINE PAYMENT →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentDark,
    letterSpacing: 1,
    marginBottom: 8
  },
  hotelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain
  },
  roomSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 12
  },
  datesGrid: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    padding: 10
  },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },
  dateVal: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  timeVal: { fontSize: 10, color: COLORS.textMuted },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textMain
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  priceItem: { fontSize: 13, color: COLORS.textSecondary },
  priceVal: { fontSize: 13, fontWeight: '600', color: COLORS.textMain },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 6,
    paddingTop: 10
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  totalVal: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  policyNotice: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 6,
    padding: 10,
    marginTop: 12
  },
  policyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15
  },
  proceedBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
  },
  proceedBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5
  }
});
