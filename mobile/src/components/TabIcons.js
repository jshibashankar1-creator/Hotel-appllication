import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function TabIcon({ name, focused, color, size = 22 }) {
  let glyph = '•';
  let fontSize = 18;

  if (name === 'Home') {
    glyph = '🏠';
    fontSize = 18;
  } else if (name === 'Explore') {
    glyph = '🔍';
    fontSize = 18;
  } else if (name === 'Bookings') {
    glyph = '📅';
    fontSize = 18;
  } else if (name === 'Deals') {
    glyph = '🏷️';
    fontSize = 18;
  } else if (name === 'Profile') {
    glyph = '👤';
    fontSize = 18;
  }

  return (
    <View style={styles.iconBox}>
      <Text style={[styles.iconGlyph, { opacity: focused ? 1 : 0.6, fontSize }]}>
        {glyph}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 28,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlyph: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 5,
    height: 5,
    backgroundColor: '#D6A72C',
    borderRadius: 2.5,
  },
});
