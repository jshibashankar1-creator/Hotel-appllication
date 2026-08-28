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
    id: 'BKG-DIGH-01',
    booking_code: 'BK-DGH-8921',
    hotel_name: 'Hotel Sea Hawk New Digha',
    location: 'Sea Beach Road, New Digha, West Bengal',
    check_in_date: '12 Aug, Mon',
    check_out_date: '15 Aug, Thu',
    guests_count: 2,
    rooms_count: 1,
    room_name: 'Deluxe Sea Facing Room',
    total_amount: 3500,
    booking_status: 'confirmed',
    payment_status: 'paid',
  };

  const isCancellable = currentBooking.booking_status === 'confirmed';
  const isCompleted = currentBooking.booking_status === 'checked_out';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
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

        {/* PICKUP SERVICE DETAILS & TRACKER (If requested) */}
        {currentBooking.pickup && currentBooking.pickup.required ? (
          <View style={styles.sectionCard}>
            <View style={styles.pickupHeaderFlex}>
              <View>
                <Text style={styles.sectionTitle}>🚗 PICKUP SERVICE</Text>
                <Text style={styles.pickupSubHeader}>
                  {currentBooking.pickup.type === 'airport' ? 'Airport Transfer' : currentBooking.pickup.type === 'railway' ? 'Railway Station Transfer' : currentBooking.pickup.type === 'bus' ? 'Bus Depot Transfer' : 'Direct Custom Transfer'}
                </Text>
              </View>
              <View style={styles.pickupStatusPill}>
                <Text style={styles.pickupStatusPillText}>
                  {(currentBooking.pickup.status || 'CONFIRMED').replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* STATUS PROGRESSION STEPPER */}
            <View style={styles.statusStepper}>
              {[
                { key: 'requested', label: 'Requested' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'assigned', label: 'Assigned' },
                { key: 'driver_on_way', label: 'On Way' },
                { key: 'arrived', label: 'Arrived' },
                { key: 'completed', label: 'Completed' },
              ].map((step, idx) => {
                const statusOrder = ['requested', 'confirmed', 'assigned', 'driver_on_way', 'arrived', 'completed'];
                const currentIdx = statusOrder.indexOf(currentBooking.pickup.status || 'confirmed');
                const isPassed = currentIdx >= idx;
                const isCurrent = currentBooking.pickup.status === step.key;

                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View style={[styles.stepCircle, isPassed && styles.stepCirclePassed, isCurrent && styles.stepCircleCurrent]}>
                      <Text style={[styles.stepCircleNum, isPassed && styles.stepCircleNumPassed]}>
                        {isPassed ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepItemLabel, isPassed && styles.stepItemLabelPassed]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* LOCATION & TIME */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>
                {currentBooking.pickup.location_name || 'Designated Pickup Location'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoText}>
                {currentBooking.pickup.pickup_time || '10:30 AM'} • {currentBooking.pickup.pickup_date || currentBooking.check_in_date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🚘</Text>
              <Text style={styles.infoText}>
                {currentBooking.pickup.vehicle_name || 'Executive Sedan'} ({currentBooking.pickup.passengers || 2} Passengers)
              </Text>
            </View>

            {currentBooking.pickup.flight_number ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>✈️</Text>
                <Text style={styles.infoText}>Flight: {currentBooking.pickup.flight_number}</Text>
              </View>
            ) : null}

            {currentBooking.pickup.train_number ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚆</Text>
                <Text style={styles.infoText}>Train: {currentBooking.pickup.train_number}</Text>
              </View>
            ) : null}

            {currentBooking.pickup.bus_number ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚌</Text>
                <Text style={styles.infoText}>Bus: {currentBooking.pickup.bus_number}</Text>
              </View>
            ) : null}

            {/* ASSIGNED DRIVER DETAILS (If assigned) */}
            {currentBooking.pickup.driver && currentBooking.pickup.driver.name ? (
              <View style={styles.driverCard}>
                <View style={styles.driverHeader}>
                  <Text style={styles.driverAvatar}>👤</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.driverName}>{currentBooking.pickup.driver.name}</Text>
                    <Text style={styles.driverVehicle}>
                      {currentBooking.pickup.driver.vehicle} {currentBooking.pickup.driver.vehicle_number ? `(${currentBooking.pickup.driver.vehicle_number})` : ''}
                    </Text>
                  </View>
                  {currentBooking.pickup.driver.phone ? (
                    <View style={styles.driverPhoneBox}>
                      <Text style={styles.driverPhoneText}>📞 {currentBooking.pickup.driver.phone}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Pickup Fare</Text>
              <Text style={[styles.rowVal, { color: COLORS.goldDark, fontWeight: '800' }]}>
                ₹{(currentBooking.pickup.pickup_charge || 800).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : null}

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
    backgroundColor: COLORS.primaryDark,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primarySurface,
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
  pickupHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pickupSubHeader: {
    fontSize: 12,
    color: COLORS.goldDark,
    fontWeight: '700',
    marginTop: 2,
  },
  pickupStatusPill: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pickupStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.goldDark,
  },
  statusStepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 14,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCirclePassed: {
    backgroundColor: COLORS.gold,
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  stepCircleNum: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  stepCircleNumPassed: {
    color: COLORS.white,
  },
  stepItemLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  stepItemLabelPassed: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
  infoIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  driverCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    fontSize: 22,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  driverVehicle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  driverPhoneBox: {
    backgroundColor: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  driverPhoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
