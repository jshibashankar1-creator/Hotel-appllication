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
} from 'react-native';
import { COLORS } from '../theme/colors';
import { RECOMMENDED_HOTELS } from '../data/mockData';

export default function BookingConfirmationScreen({ route, navigation }) {
  const hotel = route.params?.hotel || RECOMMENDED_HOTELS[0];
  const booking = route.params?.booking || {
    booking_code: 'BK-DGH-8921',
    hotel_name: hotel.name || 'Digha Beach Luxury Resort',
    location: hotel.location || 'New Digha, WB',
    check_in_date: '12 Aug, 2026',
    check_out_date: '15 Aug, 2026',
    guests_count: 2,
    rooms_count: 1,
    total_amount: 62160,
  };

  const handleDownloadTicket = () => {
    navigation.navigate('BookingDetails', { booking, hotel });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* GLOWING GREEN CHECKMARK & CONFIRMED TITLE */}
          <View style={styles.headerSection}>
            <View style={styles.outerGlowRing}>
              <View style={styles.successCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>

            <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
          </View>

          {/* DIGITAL PASS TICKET CARD WITH CUTOUT NOTCHES */}
          <View style={styles.passCardWrapper}>
            {/* Cutout Notches */}
            <View style={styles.leftCutout} />
            <View style={styles.rightCutout} />

            {/* Pass Header */}
            <View style={styles.passHeader}>
              <Text style={styles.passTitle}>Digital Pass</Text>
              <TouchableOpacity onPress={handleDownloadTicket}>
                <Text style={styles.detailLink}>Detail</Text>
              </TouchableOpacity>
            </View>

            {/* Dashed Line */}
            <View style={styles.dashedDivider} />

            {/* Crisp QR Code Vector Mock */}
            <View style={styles.qrSection}>
              <View style={styles.qrCodeBox}>
                <View style={styles.qrRow}>
                  <View style={styles.qrSquareLarge} />
                  <View style={styles.qrPatternCols} />
                  <View style={styles.qrSquareLarge} />
                </View>
                <View style={styles.qrRowMid}>
                  <View style={styles.qrPatternLines} />
                </View>
                <View style={styles.qrRow}>
                  <View style={styles.qrSquareLarge} />
                  <View style={styles.qrPatternCols} />
                  <View style={styles.qrSquareSmall} />
                </View>
              </View>
            </View>

            {/* Booking Details Section */}
            <View style={styles.passMetaSection}>
              <Text style={styles.metaLabel}>Booking Details</Text>
              <Text style={styles.hotelNameText}>
                {booking.hotel_name || hotel.name || 'Digha Beach Luxury Resort'}
              </Text>

              <View style={styles.datesRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.dateTitle}>Check-in 📅</Text>
                  <Text style={styles.dateVal}>{booking.check_in_date || '12 Aug, 2026'}</Text>
                </View>

                <View style={styles.dateColRight}>
                  <Text style={styles.dateTitle}>Check-out 👤</Text>
                  <Text style={styles.dateVal}>{booking.check_out_date || '15 Aug, 2026'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* DOWNLOAD E-TICKET BURGUNDY BUTTON */}
          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.88}
            onPress={handleDownloadTicket}
          >
            <Text style={styles.downloadButtonText}>Download E-Ticket</Text>
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
    backgroundColor: '#160824',
  },
  container: {
    flex: 1,
    backgroundColor: '#160824',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  outerGlowRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    marginBottom: 16,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  confirmedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 0.3,
  },
  passCardWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  leftCutout: {
    position: 'absolute',
    left: -14,
    top: 50,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#160824',
    zIndex: 10,
  },
  rightCutout: {
    position: 'absolute',
    right: -14,
    top: 50,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#160824',
    zIndex: 10,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  passTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  detailLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  qrCodeBox: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrSquareLarge: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  qrSquareSmall: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  qrPatternCols: {
    width: 40,
    height: 12,
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  qrRowMid: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  qrPatternLines: {
    width: 110,
    height: 24,
    backgroundColor: '#111827',
    borderRadius: 4,
  },
  passMetaSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  hotelNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
  },
  dateColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  dateVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  downloadButton: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: COLORS.burgundyPill,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    paddingTop: STATUSBAR_HEIGHT + 12,
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    color: COLORS.textDark,
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  confettiRow: {
    height: 30,
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    fontSize: 18,
    opacity: 0.8,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  hotelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelThumb: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: COLORS.borderLight,
  },
  hotelDetails: {
    flex: 1,
    marginLeft: 14,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  hotelLocation: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  bookingCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionsSection: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
  },
  primaryGoldButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryTealButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButtonIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
