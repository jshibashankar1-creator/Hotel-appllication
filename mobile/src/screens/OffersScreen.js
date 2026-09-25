import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import DealCard from '../components/DealCard';


export default function OffersScreen({ navigation }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = num => num.toString().padStart(2, '0');

  const handleSelectDeal = (deal) => {
    navigation.navigate('HotelDetails', {
      hotel: {
        id: deal.id,
        name: deal.name,
        location: deal.location,
        city: deal.city,
        country: deal.country,
        rating: deal.rating,
        reviewsCount: deal.reviewsCount,
        pricePerNight: deal.discountedPrice,
        coverImage: deal.coverImage,
        images: [deal.coverImage],
        currency: deal.currency || '$',
        isTopRated: true,
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
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Exclusive Offers</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Best deals handpicked for your next trip
          </Text>
        </View>

        {/* LARGE PROMOTIONAL SUMMER GETAWAY CARD */}
        <View style={styles.promoCardWrapper}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&auto=format&fit=crop&q=80' }}
            style={styles.promoBackground}
            imageStyle={styles.promoImage}
          >
            <View style={styles.promoOverlay}>
              <Text style={styles.promoTag}>Summer Getaway</Text>
              <Text style={styles.promoDiscount}>Up to 40% OFF</Text>
              <Text style={styles.promoSub}>on Luxury Stays</Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Search', { city: 'Bali' })}
              >
                <Text style={styles.bookNowText}>Book Now</Text>
              </TouchableOpacity>

              {/* Dots Carousel Indicator */}
              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* FLASH DEALS WITH LIVE COUNTDOWN TIMER */}
        <View style={styles.flashDealsHeader}>
          <Text style={styles.flashTitle}>Flash Deals</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Ends in </Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeDigit}>{formatDigits(timeLeft.hours)}</Text>
            </View>
            <Text style={styles.timeColon}> : </Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeDigit}>{formatDigits(timeLeft.minutes)}</Text>
            </View>
            <Text style={styles.timeColon}> : </Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeDigit}>{formatDigits(timeLeft.seconds)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dealsList}>
          {[]}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  viewAllText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  promoCardWrapper: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  promoBackground: {
    width: '100%',
    height: '100%',
  },
  promoImage: {
    resizeMode: 'cover',
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 40, 36, 0.45)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  promoTag: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  promoDiscount: {
    color: COLORS.goldLight,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  promoSub: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookNowText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 16,
  },
  flashDealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 26,
    marginBottom: 14,
  },
  flashTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  timeBox: {
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: 'rgba(214, 167, 44, 0.4)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  timeDigit: {
    color: COLORS.goldLight,
    fontSize: 11,
    fontWeight: '800',
  },
  timeColon: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  dealsList: {
    paddingHorizontal: 20,
  },
});
