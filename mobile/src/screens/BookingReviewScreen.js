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
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
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

  // 2-Option FREE Pickup Preference State ('pickup' | 'none')
  const [pickupPreference, setPickupPreference] = useState('pickup');

  const nights = route.params?.nightsCount || 3;
  const roomRate = room.price || room.price_per_night || 350;
  const baseAmount = roomRate * nights;
  const taxesAndFees = Math.round(baseAmount * 0.12);
  const pickupCharge = 0; // Pickup is 100% FREE
  const totalAmount = baseAmount + taxesAndFees; // Pickup adds ₹0

  const handleProceedToPayment = () => {
    const isPickupRequired = pickupPreference === 'pickup';

    const pickupPayload = isPickupRequired ? {
      required: true,
      pickup_required: true,
      pickup_charge: 0,
      pickup_service: 'FREE',
      service: 'FREE',
      location_name: 'Station to Hotel',
      pickup_date: checkIn,
      pickup_time: '10:30 AM',
      status: 'confirmed'
    } : {
      required: false,
      pickup_required: false,
      pickup_charge: 0,
      service: 'NOT_REQUIRED'
    };

    navigation.navigate('Payment', {
      hotel,
      room,
      bookingData: {
        hotel_id: hotel.id || 'HTL-001',
        room_id: room.id || 'RM-101',
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
        pickup: pickupPayload
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A0E20" />
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HOTEL & ROOM SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.hotelTitle}>{hotel.name}</Text>
          <Text style={styles.hotelLoc}>📍 {hotel.location || hotel.city || 'New Digha, India'}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.roomRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{room.name || room.room_name || 'Executive Room'}</Text>
              <Text style={styles.roomDates}>
                📅 {checkIn} → {checkOut} ({nights} Nights)
              </Text>
            </View>
            <Text style={styles.roomPrice}>₹{baseAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* GUEST DETAILS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PRIMARY GUEST DETAILS</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Guest full name"
            />
          </View>
          
          <View style={styles.gridRow}>
            <View style={[styles.gridCol, { marginRight: 8 }]}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                value={guestEmail}
                onChangeText={setGuestEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.gridCol, { marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                value={guestPhone}
                onChangeText={setGuestPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* ================================================================ */}
        {/* FREE PICKUP SERVICE SECTION — PIXEL MATCH TO REFERENCE IMAGE     */}
        {/* ================================================================ */}
        
        {/* 1. Need Pickup Banner Card */}
        <View style={styles.pickupBannerCard}>
          <View style={styles.bannerIconCircle}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11M5 11H19M5 11V17C5 17.6 5.4 18 6 18H7C7.6 18 8 17.6 8 17V16H16V17C16 17.6 16.4 18 17 18H18C18.6 18 19 17.6 19 17V11M7.5 13.5H7.51M16.5 13.5H16.51"
                stroke="#7A1235"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="7.5" cy="13.5" r="1.2" fill="#7A1235" />
              <Circle cx="16.5" cy="13.5" r="1.2" fill="#7A1235" />
            </Svg>
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Need Pickup?</Text>
            <Text style={styles.bannerSubtitle}>
              We’ll arrange your pickup from the station to the hotel. It’s completely{' '}
              <Text style={styles.bannerFreeHighlight}>free!</Text>
            </Text>
          </View>
        </View>

        {/* 2. Select an option Section */}
        <View style={styles.pickupOptionSection}>
          <Text style={styles.optionSectionTitle}>Select an option</Text>

          {/* Option 1: Pickup (FREE) */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              pickupPreference === 'pickup' && styles.optionCardSelected,
            ]}
            onPress={() => setPickupPreference('pickup')}
            activeOpacity={0.85}
          >
            <View style={styles.radioOuter}>
              {pickupPreference === 'pickup' ? (
                <View style={styles.radioInner} />
              ) : null}
            </View>

            <View style={[styles.optionIconCircle, { backgroundColor: '#F9EBEF' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11M5 11H19M5 11V17C5 17.6 5.4 18 6 18H7C7.6 18 8 17.6 8 17V16H16V17C16 17.6 16.4 18 17 18H18C18.6 18 19 17.6 19 17V11"
                  stroke="#7A1235"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <Circle cx="7.5" cy="13.5" r="1.1" fill="#7A1235" />
                <Circle cx="16.5" cy="13.5" r="1.1" fill="#7A1235" />
              </Svg>
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Pickup</Text>
              <Text style={styles.optionSubtitle}>We’ll pick you up from the station</Text>
            </View>

            <View style={styles.freeBadgePill}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: No Pickup (FREE) */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              pickupPreference === 'none' && styles.optionCardSelected,
            ]}
            onPress={() => setPickupPreference('none')}
            activeOpacity={0.85}
          >
            <View style={styles.radioOuter}>
              {pickupPreference === 'none' ? (
                <View style={styles.radioInner} />
              ) : null}
            </View>

            <View style={[styles.optionIconCircle, { backgroundColor: '#F0F0F2' }]}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                  stroke="#555555"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="9" r="2.5" fill="#555555" />
              </Svg>
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>No Pickup</Text>
              <Text style={styles.optionSubtitle}>I don’t need pickup service</Text>
            </View>

            <View style={styles.freeBadgePill}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Info Note */}
          <View style={styles.infoNoteRow}>
            <Text style={styles.infoIcon}>ⓘ</Text>
            <Text style={styles.infoText}>You can change this later in your booking.</Text>
          </View>
        </View>

        {/* PRICE SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PRICE SUMMARY</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Room Tariff ({nights} nights)</Text>
            <Text style={styles.priceVal}>₹{baseAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & GST (12%)</Text>
            <Text style={styles.priceVal}>₹{taxesAndFees.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              🚗 Pickup Service ({pickupPreference === 'pickup' ? 'Station Transfer' : 'Not Required'})
            </Text>
            <Text style={[styles.priceVal, { color: '#2E7D32', fontWeight: '800' }]}>
              {pickupPreference === 'pickup' ? 'FREE (₹0)' : '₹0'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* PROCEED TO PAYMENT BUTTON */}
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.88}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.payBtnText}>
            Proceed to Secure Payment →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A0E20',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7A1235',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  hotelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  hotelLoc: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  roomDates: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  roomPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7A1235',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCol: {
    flex: 1,
  },

  // ==========================================================================
  // FREE PICKUP SERVICE STYLES (MATCHING REFERENCE IMAGE)
  // ==========================================================================
  pickupBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9EBEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7A1235',
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  bannerFreeHighlight: {
    fontWeight: '800',
    color: '#7A1235',
  },

  // Select an option Section
  pickupOptionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#ECECEC',
  },
  optionCardSelected: {
    borderColor: '#7A1235',
    backgroundColor: '#FDFAFA',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#7A1235',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7A1235',
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  freeBadgePill: {
    backgroundColor: '#5B1230',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 14,
    color: '#777777',
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#777777',
  },

  // Price Summary
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666666',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7A1235',
  },
  payBtn: {
    backgroundColor: '#D4A72C',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#B08820',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3D0E1C',
    letterSpacing: 0.4,
  },
});
