import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
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
    hotel_name: hotel.name || 'Hotel Sea Hawk New Digha',
    location: hotel.location || 'New Digha, West Bengal',
    check_in_date: '12 Aug, Mon',
    check_out_date: '15 Aug, Thu',
    guests_count: 2,
    rooms_count: 1,
    total_amount: 3500,
  };

  const handleViewDetails = () => {
    navigation.navigate('BookingDetails', { booking, hotel });
  };

  const handleExploreNearby = () => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#072824" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Back Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Ambient Confetti / Star Particles */}
        <View style={styles.confettiRow}>
          <Text style={[styles.confetti, { top: 10, left: 40 }]}>✨</Text>
          <Text style={[styles.confetti, { top: 30, right: 50 }]}>🎉</Text>
          <Text style={[styles.confetti, { top: 70, left: 80 }]}>⭐</Text>
          <Text style={[styles.confetti, { top: 60, right: 90 }]}>✨</Text>
        </View>

        {/* SUCCESS ICON & HEADLINE */}
        <View style={styles.headerSection}>
          <View style={styles.successCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your stay at {hotel.name || 'The Plaza Hotel'} is confirmed.{'\n'}We've sent the details to your email.
          </Text>
        </View>

        {/* BOOKING SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.hotelInfoRow}>
            <Image
              source={{ uri: hotel.coverImage || hotel.cover_image || RECOMMENDED_HOTELS[0].coverImage }}
              style={styles.hotelThumb}
            />
            <View style={styles.hotelDetails}>
              <Text style={styles.hotelName} numberOfLines={1}>
                {hotel.name || 'The Plaza Hotel'}
              </Text>
              <Text style={styles.hotelLocation}>
                {hotel.city || 'New York'}, {hotel.country || 'USA'}
              </Text>
              
              <View style={styles.badgeRow}>
                <Text style={styles.bookingCodeText}>Booking ID: {booking.booking_code || 'BK-PLZ-8921'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Dates & Guests */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>
              {booking.check_in_date || '12 Aug, Mon'} — {booking.check_out_date || '15 Aug, Thu'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>
              {booking.guests_count || 2} Guests, {booking.rooms_count || 1} Room
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Total Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>${(booking.total_amount || 1050).toLocaleString()}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryGoldButton}
            activeOpacity={0.88}
            onPress={handleViewDetails}
          >
            <Text style={styles.primaryButtonText}>View Booking Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryTealButton}
            activeOpacity={0.88}
            onPress={handleExploreNearby}
          >
            <Text style={styles.secondaryButtonIcon}>📍</Text>
            <Text style={styles.secondaryButtonText}>Explore Nearby Hotels</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
