import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StickyBookingBar({ price = 350, currency = '$', buttonLabel = 'Select Room →', onBookPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.currency}>{currency}</Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.perNight}> / night</Text>
        </View>
        <Text style={styles.taxInfo}>Includes taxes & fees</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.bookButton}
        onPress={onBookPress}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  price: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  perNight: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '500',
  },
  taxInfo: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
