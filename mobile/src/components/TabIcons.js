import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function TabIcon({ name, focused, color, size = 22 }) {
  let glyph = '•';
  let fontSize = 18;

  if (name === 'Home') {
    glyph = focused ? '🏠' : '⌂';
    fontSize = 20;
  } else if (name === 'Explore') {
    glyph = '🔍';
    fontSize = 18;
  } else if (name === 'Bookings') {
    glyph = '📅';
    fontSize = 18;
  } else if (name === 'Deals') {
    glyph = '🏷️';
    fontSize = 18;
  } else if (name === 'Wishlist') {
    glyph = '♡';
    fontSize = 19;
  } else if (name === 'Profile') {
    glyph = '👤';
    fontSize = 18;
  }

  return (
    <View style={styles.iconBox}>
      <Text style={[styles.iconGlyph, { color: color, fontSize }]}>
        {glyph}
      </Text>
      {focused && <View style={styles.activeUnderline} />}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlyph: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -2,
    width: 12,
    height: 2.5,
    backgroundColor: '#D6A72C', // Champagne Gold
    borderRadius: 1.25,
  },
});
