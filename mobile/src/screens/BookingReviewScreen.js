import React, { useState, useEffect } from 'react';
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
import { mobileApi } from '../services/api';

const DEFAULT_LOCATIONS = [
  { id: 'loc-ccu', name: 'Netaji Subhash Chandra Bose Int\'l Airport (CCU)', type: 'airport', address: 'Jessore Rd, Kolkata' },
  { id: 'loc-dgh-stn', name: 'New Digha Railway Station', type: 'railway', address: 'Station Rd, New Digha' },
  { id: 'loc-dgh-bus', name: 'Digha Central Bus Stand', type: 'bus', address: 'State Highway 57, Digha' },
];

const DEFAULT_VEHICLES = [
  { id: 'veh-sedan', name: 'Executive Sedan', type: 'Sedan', capacity: 4, price: 800 },
  { id: 'veh-suv', name: 'Premium Luxury SUV', type: 'SUV', capacity: 6, price: 1200 },
  { id: 'veh-tempo', name: 'Group Tempo Traveller', type: 'Tempo Traveller', capacity: 12, price: 2000 },
];

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

  // Pickup Service State
  const [pickupType, setPickupType] = useState('none'); // 'none', 'airport', 'railway', 'bus', 'other'
  const [pickupLocations, setPickupLocations] = useState(DEFAULT_LOCATIONS);
  const [pickupVehicles, setPickupVehicles] = useState(DEFAULT_VEHICLES);
  const [selectedLocationId, setSelectedLocationId] = useState(DEFAULT_LOCATIONS[1].id);
  const [customLocationName, setCustomLocationName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(DEFAULT_VEHICLES[0].id);
  const [pickupDate, setPickupDate] = useState(route.params?.checkInDate || '2026-08-28');
  const [pickupTime, setPickupTime] = useState('10:30 AM');
  const [passengersCount, setPassengersCount] = useState(2);
  const [flightNumber, setFlightNumber] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [pickupEnabled, setPickupEnabled] = useState(true);

  const nights = route.params?.nightsCount || 3;
  const roomRate = room.price || room.price_per_night || 350;
  const baseAmount = roomRate * nights;
  const taxesAndFees = Math.round(baseAmount * 0.12);

  // Load Hotel Pickup Configuration dynamically
  useEffect(() => {
    async function loadHotelPickupConfig() {
      try {
        if (hotel.id) {
          const res = await mobileApi.getHotelPickupSettings(hotel.id);
          if (res && res.success) {
            if (res.pickup_service_enabled !== undefined) {
              setPickupEnabled(res.pickup_service_enabled);
            }
            if (Array.isArray(res.locations) && res.locations.length > 0) {
              setPickupLocations(res.locations);
              setSelectedLocationId(res.locations[0].id);
            }
            if (Array.isArray(res.vehicles) && res.vehicles.length > 0) {
              setPickupVehicles(res.vehicles);
              setSelectedVehicleId(res.vehicles[0].id);
            }
          }
        }
      } catch (err) {
        console.log('Using default hotel pickup config:', err.message);
      }
    }
    loadHotelPickupConfig();
  }, [hotel.id]);

  const selectedVehicle = pickupVehicles.find(v => v.id === selectedVehicleId) || pickupVehicles[0] || DEFAULT_VEHICLES[0];
  const selectedLocation = pickupLocations.find(l => l.id === selectedLocationId) || pickupLocations[0];

  const pickupCharge = pickupType !== 'none' ? (selectedVehicle?.price || 800) : 0;
  const totalAmount = baseAmount + taxesAndFees + pickupCharge;

  // Filter locations by selected pickup type
  const filteredLocations = pickupLocations.filter(loc => {
    if (pickupType === 'airport') return loc.type === 'airport';
    if (pickupType === 'railway') return loc.type === 'railway';
    if (pickupType === 'bus') return loc.type === 'bus';
    return true;
  });

  const handleProceedToPayment = () => {
    const isPickupRequired = pickupType !== 'none';
    const locationDisplayName = pickupType === 'other'
      ? (customLocationName.trim() || 'Custom Pickup Address')
      : (selectedLocation?.name || 'Hotel Designated Point');

    const pickupPayload = isPickupRequired ? {
      required: true,
      type: pickupType,
      location_id: selectedLocation?.id || null,
      location_name: locationDisplayName,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      passengers: passengersCount,
      vehicle_id: selectedVehicle?.id,
      vehicle_name: selectedVehicle?.name,
      pickup_charge: pickupCharge,
      flight_number: flightNumber.trim(),
      train_number: trainNumber.trim(),
      bus_number: busNumber.trim(),
      special_instructions: specialInstructions.trim()
    } : { required: false, pickup_charge: 0 };

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
        pickup: pickupPayload
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
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
            <Text style={styles.locationText}>📍 {hotel.city || 'New Digha'}, {hotel.country || 'India'}</Text>
          </View>
        </View>

        {/* DATES & RESERVATION SPECS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Reservation Schedule</Text>
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>CHECK-IN</Text>
              <Text style={styles.gridValue}>{checkIn}</Text>
              <Text style={styles.gridSub}>From 12:00 PM</Text>
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

        {/* ============================================================ */}
        {/* OPTIONAL PICKUP SERVICE SECTION */}
        {/* ============================================================ */}
        {pickupEnabled && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>🚗 PICKUP SERVICE (OPTIONAL)</Text>
                <Text style={styles.sectionSubtitle}>Seamless transfers direct to the hotel lobby</Text>
              </View>
            </View>

            {/* PICKUP TYPE SELECTOR */}
            <View style={styles.pickupTypeGrid}>
              {[
                { id: 'none', label: 'No Pickup', icon: '🚫' },
                { id: 'airport', label: 'Airport', icon: '✈️' },
                { id: 'railway', label: 'Railway Stn', icon: '🚆' },
                { id: 'bus', label: 'Bus Stand', icon: '🚌' },
                { id: 'other', label: 'Other Loc', icon: '📍' },
              ].map(opt => {
                const isSelected = pickupType === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    style={[styles.typePill, isSelected && styles.typePillActive]}
                    onPress={() => setPickupType(opt.id)}
                  >
                    <Text style={styles.typeIcon}>{opt.icon}</Text>
                    <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* EXPANDED PICKUP FORM (When active) */}
            {pickupType !== 'none' && (
              <View style={styles.pickupExpandedBox}>
                {/* LOCATION SELECTOR */}
                {pickupType === 'other' ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CUSTOM PICKUP ADDRESS</Text>
                    <TextInput
                      style={styles.textInput}
                      value={customLocationName}
                      onChangeText={setCustomLocationName}
                      placeholder="Enter pickup address or landmark"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                ) : (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>SELECT PICKUP POINT</Text>
                    <View style={styles.locationList}>
                      {(filteredLocations.length > 0 ? filteredLocations : pickupLocations).map(loc => {
                        const isSelected = selectedLocationId === loc.id;
                        return (
                          <TouchableOpacity
                            key={loc.id}
                            style={[styles.locationOption, isSelected && styles.locationOptionActive]}
                            onPress={() => setSelectedLocationId(loc.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.locationIcon}>📍</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.locationName, isSelected && styles.locationNameActive]}>
                                {loc.name}
                              </Text>
                              {loc.address ? (
                                <Text style={styles.locationAddr}>{loc.address}</Text>
                              ) : null}
                            </View>
                            <View style={[styles.radioDot, isSelected && styles.radioDotActive]} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* DATE & TIME */}
                <View style={styles.gridRow}>
                  <View style={[styles.gridCol, { marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>PICKUP DATE</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pickupDate}
                      onChangeText={setPickupDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                  <View style={[styles.gridCol, { marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>PICKUP TIME</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pickupTime}
                      onChangeText={setPickupTime}
                      placeholder="e.g. 10:30 AM"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>

                {/* VEHICLE SELECTION */}
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>SELECT VEHICLE TYPE</Text>
                  <View style={styles.vehicleList}>
                    {pickupVehicles.map(veh => {
                      const isSelected = selectedVehicleId === veh.id;
                      return (
                        <TouchableOpacity
                          key={veh.id}
                          style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
                          onPress={() => setSelectedVehicleId(veh.id)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.vehicleHeader}>
                            <Text style={styles.vehicleIcon}>
                              {veh.type?.toLowerCase().includes('suv') ? '🚙' : veh.type?.toLowerCase().includes('tempo') ? '🚐' : '🚘'}
                            </Text>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={[styles.vehicleName, isSelected && styles.vehicleNameActive]}>
                                {veh.name}
                              </Text>
                              <Text style={styles.vehicleCapacity}>
                                Max {veh.capacity} Passengers
                              </Text>
                            </View>
                            <View style={styles.vehiclePriceBox}>
                              <Text style={styles.vehiclePrice}>₹{veh.price}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* PASSENGERS COUNT STEPPER */}
                <View style={[styles.rowBetween, { marginTop: 14 }]}>
                  <View>
                    <Text style={styles.rowLabel}>Number of Passengers</Text>
                    <Text style={styles.gridSub}>Max capacity: {selectedVehicle.capacity} pax</Text>
                  </View>
                  <View style={styles.stepperBox}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepVal}>{passengersCount}</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setPassengersCount(Math.min(selectedVehicle.capacity, passengersCount + 1))}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* OPTIONAL FLIGHT / TRAIN / BUS / INSTRUCTIONS */}
                {pickupType === 'airport' && (
                  <View style={[styles.inputGroup, { marginTop: 12 }]}>
                    <Text style={styles.inputLabel}>FLIGHT NUMBER (OPTIONAL)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={flightNumber}
                      onChangeText={setFlightNumber}
                      placeholder="e.g. 6E-204"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                )}

                {pickupType === 'railway' && (
                  <View style={[styles.inputGroup, { marginTop: 12 }]}>
                    <Text style={styles.inputLabel}>TRAIN NUMBER / NAME (OPTIONAL)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={trainNumber}
                      onChangeText={setTrainNumber}
                      placeholder="e.g. 12857 Tamralipta Express"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                )}

                {pickupType === 'bus' && (
                  <View style={[styles.inputGroup, { marginTop: 12 }]}>
                    <Text style={styles.inputLabel}>BUS OPERATOR / TICKET (OPTIONAL)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={busNumber}
                      onChangeText={setBusNumber}
                      placeholder="e.g. SBSTC AC Volvo"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                )}

                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={specialInstructions}
                    onChangeText={setSpecialInstructions}
                    placeholder="e.g. Need baby seat, extra luggage assistance"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* PRICE BREAKDOWN */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Room Tariff ({nights} nights)</Text>
            <Text style={styles.rowValue}>₹{baseAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Taxes & GST (12%)</Text>
            <Text style={styles.rowValue}>₹{taxesAndFees.toLocaleString()}</Text>
          </View>

          {pickupType !== 'none' && (
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: COLORS.goldDark, fontWeight: '700' }]}>
                🚗 Pickup Service ({selectedVehicle.name})
              </Text>
              <Text style={[styles.rowValue, { color: COLORS.goldDark }]}>
                + ₹{pickupCharge.toLocaleString()}
              </Text>
            </View>
          )}

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
          <Text style={styles.proceedButtonText}>Proceed to Secure Payment →</Text>
        </TouchableOpacity>
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
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
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
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
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
  // Pickup Type Pills
  pickupTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  typePillActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FAF7EE',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textBody,
  },
  typeTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  pickupExpandedBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 6,
  },
  locationList: {
    gap: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  locationOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF9',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  locationNameActive: {
    color: COLORS.primaryDark,
  },
  locationAddr: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
  },
  radioDotActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  vehicleList: {
    gap: 8,
  },
  vehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  vehicleCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FAF7EE',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 22,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  vehicleNameActive: {
    color: COLORS.primaryDark,
  },
  vehicleCapacity: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  vehiclePriceBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  vehiclePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.goldDark,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stepVal: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
