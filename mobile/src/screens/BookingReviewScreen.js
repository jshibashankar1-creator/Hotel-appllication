import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { RECOMMENDED_HOTELS, ACTIVE_USER_PROFILE } from '../data/mockData';

export default function BookingReviewScreen({ route, navigation }) {
  const hotel = route.params?.hotel || RECOMMENDED_HOTELS[0];
  const room = route.params?.selectedRoom || route.params?.room || (hotel.rooms && hotel.rooms[0]) || {
    id: 'rm-deluxe',
    name: 'Deluxe Room',
    price: 350,
  };

  const [checkIn, setCheckIn] = useState(route.params?.checkInDate || '2026-08-28');
  const [checkOut, setCheckOut] = useState(route.params?.checkOutDate || '2026-08-31');
  const [guestName, setGuestName] = useState(ACTIVE_USER_PROFILE.name);
  const [guestEmail, setGuestEmail] = useState(ACTIVE_USER_PROFILE.email);
  const [guestPhone, setGuestPhone] = useState(ACTIVE_USER_PROFILE.phone);
  const [guestsCount, setGuestsCount] = useState(2);

  const nights = route.params?.nightsCount || 3;
  const roomRate = room.price || room.price_per_night || 350;
  const baseAmount = roomRate * nights;
  const taxesAndFees = Math.round(baseAmount * 0.12);
  const totalAmount = baseAmount + taxesAndFees;

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
        tax_amount: taxesAndFees,
        total_amount: totalAmount,
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072824" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HOTEL SUMMARY BANNER */}
        <View style={styles.hotelCard}>
          <Image
            source={{ uri: hotel.coverImage || hotel.cover_image || RECOMMENDED_HOTELS[0].coverImage }}
            style={styles.hotelImage}
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.roomName}>{room.name || room.room_name || 'Deluxe King Suite'}</Text>
            <Text style={styles.locationText}>📍 {hotel.city || 'New York'}, {hotel.country || 'USA'}</Text>
          </View>
        </View>

        {/* DATES & RESERVATION SPECS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Reservation Schedule</Text>
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>CHECK-IN</Text>
              <Text style={styles.gridValue}>Fri, 28 Aug 2026</Text>
              <Text style={styles.gridSub}>From 3:00 PM</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>CHECK-OUT</Text>
              <Text style={styles.gridValue}>Mon, 31 Aug 2026</Text>
              <Text style={styles.gridSub}>Until 12:00 PM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Total Duration</Text>
            <Text style={styles.rowValue}>{nights} Nights</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Guests & Rooms</Text>
            <Text style={styles.rowValue}>{guestsCount} Adults, 1 Room</Text>
          </View>
        </View>

        {/* GUEST CONTACT DETAILS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Primary Guest Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS (FOR CONFIRMATION)</Text>
            <TextInput
              style={styles.textInput}
              value={guestEmail}
              onChangeText={setGuestEmail}
              placeholder="Email address"
              keyboardType="email-address"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONTACT PHONE</Text>
            <TextInput
              style={styles.textInput}
              value={guestPhone}
              onChangeText={setGuestPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>${roomRate} x {nights} nights</Text>
            <Text style={styles.rowValue}>${baseAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Taxes & Luxury Resort Fees (12%)</Text>
            <Text style={styles.rowValue}>${taxesAndFees.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>${totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* PROCEED BUTTON */}
        <TouchableOpacity
          style={styles.proceedButton}
          activeOpacity={0.88}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.proceedButtonText}>Proceed to Secure Payment →</Text>
        </TouchableOpacity>
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
  hotelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.borderLight,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  roomName: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '700',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 14,
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
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  gridSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
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
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  proceedButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
