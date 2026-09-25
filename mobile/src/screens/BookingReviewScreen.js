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
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function BookingReviewScreen({ route, navigation }) {
  const hotel = route.params?.hotel;
  const room = route.params?.selectedRoom || route.params?.room || (hotel?.rooms && hotel?.rooms[0]);

  const checkIn = route.params?.checkInDate || route.params?.formattedCheckIn || '2026-09-22';
  const checkOut = route.params?.checkOutDate || route.params?.formattedCheckOut || '2026-09-25';
  const isoCheckIn = route.params?.isoCheckIn || '2026-09-22';
  const isoCheckOut = route.params?.isoCheckOut || '2026-09-25';
  const guestsCount = route.params?.guestsCount || 2;
  const roomsCount = route.params?.roomsCount || 1;
  const nights = route.params?.nightsCount || 3;

  const currentUser = mobileApi.currentUser || {};
  const [guestName, setGuestName] = useState(currentUser.name || '');
  const [guestEmail, setGuestEmail] = useState(currentUser.email || '');
  const [guestPhone, setGuestPhone] = useState(currentUser.phone || '');

  const roomRate = room?.price || room?.price_per_night || 0;
  const baseAmount = roomRate * nights;
  const taxesAndFees = Math.round(baseAmount * 0.12);
  const totalAmount = baseAmount + taxesAndFees;

  const handleProceedToPayment = () => {
    const paymentState = {
      hotel,
      room,
      bookingData: {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in_date: isoCheckIn,
        check_out_date: isoCheckOut,
        formattedCheckIn: checkIn,
        formattedCheckOut: checkOut,
        nights,
        guests_count: guestsCount,
        rooms_count: roomsCount,
        customer_name: guestName,
        customer_email: guestEmail,
        customer_phone: guestPhone,
        base_amount: baseAmount,
        tax_amount: taxesAndFees,
        total_amount: totalAmount,
      }
    };

    if (!mobileApi.token) {
      navigation.navigate('Login', { 
        returnTo: 'Payment', 
        bookingState: paymentState 
      });
    } else {
      navigation.navigate('Payment', paymentState);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        {/* Background Split */}
        <View style={styles.topBackground} />
        <View style={styles.bottomBackground} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HOTEL SUMMARY BANNER */}
          <View style={styles.hotelCard}>
            <Image
              source={{ uri: hotel?.coverImage || hotel?.cover_image || (hotel?.images && hotel?.images[0]) }}
              style={styles.hotelImage}
            />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{hotel?.name}</Text>
              <Text style={styles.roomName}>{room?.name || room?.room_name || ''}</Text>
              <Text style={styles.locationText}>📍 {hotel?.city || 'City'}, {hotel?.state || ''}</Text>
            </View>
          </View>

          {/* DATES & RESERVATION SPECS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Reservation Schedule</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>CHECK-IN</Text>
                <Text style={styles.gridValue}>{checkIn}</Text>
                <Text style={styles.gridSub}>From 2:00 PM</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>CHECK-OUT</Text>
                <Text style={styles.gridValue}>{checkOut}</Text>
                <Text style={styles.gridSub}>Until 11:00 AM</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Total Duration</Text>
              <Text style={styles.rowValue}>{nights} Night{nights > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Guests & Rooms</Text>
              <Text style={styles.rowValue}>{guestsCount} Guest{guestsCount > 1 ? 's' : ''}, {roomsCount} Room{roomsCount > 1 ? 's' : ''}</Text>
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                value={guestEmail}
                onChangeText={setGuestEmail}
                placeholder="Email address"
                keyboardType="email-address"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>
          </View>

          {/* PRICE BREAKDOWN */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Price Summary</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>₹{roomRate.toLocaleString()} x {nights} nights</Text>
              <Text style={styles.rowValue}>₹{baseAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Taxes & GST (12%)</Text>
              <Text style={styles.rowValue}>₹{taxesAndFees.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* PROCEED BUTTON */}
          <TouchableOpacity
            style={styles.proceedButton}
            activeOpacity={0.88}
            onPress={handleProceedToPayment}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#160824',
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: '#160824',
  },
  bottomBackground: {
    position: 'absolute',
    top: 380,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F6F8',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 40,
  },
  hotelCard: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  hotelImage: {
    width: 75,
    height: 75,
    borderRadius: 14,
    backgroundColor: '#160824',
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roomName: {
    fontSize: 13,
    color: COLORS.goldLight,
    fontWeight: '700',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
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
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  gridSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.75)',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  proceedButton: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
