import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';

export default function BookingConfirmationScreen({ route, navigation }) {
  const hotel = route.params?.hotel || {};
  const booking = route.params?.booking || {};

  const handleDownloadTicket = () => {
    navigation.navigate('BookingDetails', { booking, hotel });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background with subtle gradient effect */}
      <View style={styles.bgGradient} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* HEADER SECTION */}
          <View style={styles.headerSection}>
            <View style={styles.checkRing}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>
            <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
            <Text style={styles.confirmedSub}>
              Your stay has been successfully booked.{'\n'}We've sent the details to your email.
            </Text>
          </View>

          {/* DIGITAL PASS CARD */}
          <View style={styles.passContainer}>
            <BlurView intensity={40} tint="light" style={styles.passGlass}>
              <View style={styles.passHeader}>
                <Text style={styles.passTitle}>Digital Pass</Text>
                <TouchableOpacity onPress={handleDownloadTicket}>
                  <Text style={styles.detailLink}>Detail</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passTopRow}>
                {/* Simulated QR Code */}
                <View style={styles.qrCodeBox}>
                  <View style={styles.qrRow}><View style={styles.qrSq}/><View style={styles.qrDot}/><View style={styles.qrSq}/></View>
                  <View style={styles.qrRow}><View style={styles.qrDot}/><View style={styles.qrDot}/><View style={styles.qrDot}/></View>
                  <View style={styles.qrRow}><View style={styles.qrSq}/><View style={styles.qrDot}/><View style={styles.qrSq}/></View>
                </View>

                {/* Hotel Image */}
                <View style={styles.passImageContainer}>
                  <Image 
                    source={{uri: hotel?.coverImage || hotel?.cover_image }} 
                    style={styles.passImage} 
                  />
                </View>
              </View>

              {/* Booking Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Hotel</Text>
                  <Text style={styles.gridValue}>{hotel?.name || 'Digha Beach Luxury Resort'}</Text>
                </View>
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Booking ID</Text>
                  <Text style={styles.gridValue}>#{booking?.booking_id || 'DG89231'}</Text>
                </View>
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Check-in</Text>
                  <Text style={styles.gridValue}>{booking?.formattedCheckIn || '12 Aug 2024, Mon'}</Text>
                </View>
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Check-out</Text>
                  <Text style={styles.gridValue}>{booking?.formattedCheckOut || '15 Aug 2024, Thu'}</Text>
                </View>
                <View style={styles.gridRow}>
                  <Text style={styles.gridLabel}>Guests</Text>
                  <Text style={styles.gridValue}>{booking?.guestsCount || 2} Adults, {booking?.roomsCount || 1} Room</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Amenities */}
              <View style={styles.amenitiesRow}>
                <View style={styles.amenityItem}><Text style={styles.amenityIcon}>📶</Text><Text style={styles.amenityText}>Free WiFi</Text></View>
                <View style={styles.amenityItem}><Text style={styles.amenityIcon}>🏊</Text><Text style={styles.amenityText}>Pool</Text></View>
                <View style={styles.amenityItem}><Text style={styles.amenityIcon}>🏖️</Text><Text style={styles.amenityText}>Beach Access</Text></View>
                <View style={styles.amenityItem}><Text style={styles.amenityIcon}>🍽️</Text><Text style={styles.amenityText}>Restaurant</Text></View>
              </View>
            </BlurView>
          </View>

          {/* ACTION BUTTONS */}
          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.88} onPress={handleDownloadTicket}>
            <Text style={styles.downloadButtonText}>↓ Download E-Ticket</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewBookingsButton} activeOpacity={0.88} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.viewBookingsText}>View My Bookings</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071B3A',
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a1432',
    opacity: 0.8,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  checkRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(39, 245, 138, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27F58A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#27F58A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  checkIcon: {
    color: '#071B3A',
    fontSize: 28,
    fontWeight: '900',
  },
  confirmedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#27F58A',
    marginBottom: 8,
  },
  confirmedSub: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  passContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  passGlass: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  detailLink: {
    color: '#e2e8f0',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  passTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qrCodeBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    justifyContent: 'space-between',
  },
  qrRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qrSq: { width: 18, height: 18, borderWidth: 3, borderColor: '#000' },
  qrDot: { width: 18, height: 18, backgroundColor: '#000' },
  passImageContainer: {
    flex: 1,
    marginLeft: 16,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  passImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsGrid: {
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridLabel: {
    width: 90,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  gridValue: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amenityItem: {
    alignItems: 'center',
  },
  amenityIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  amenityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: '#8F1239',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  viewBookingsButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewBookingsText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
