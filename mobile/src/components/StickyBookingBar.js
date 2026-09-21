import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StickyBookingBar({ price = 18500, currency = '₹', buttonLabel = 'Select Room & Book', onBookPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.priceSection}>
        <Text style={styles.totalLabel}>
          Total per night: <Text style={styles.priceValue}>{currency}{price.toLocaleString()}</Text>
        </Text>
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
    backgroundColor: 'rgba(28, 9, 27, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  priceSection: {
    marginBottom: 10,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  bookButton: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: COLORS.burgundyPill,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
