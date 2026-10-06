import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TabIcon({ name, focused, color, size = 24 }) {
  let iconName;

  if (name === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (name === 'Explore') {
    iconName = focused ? 'search' : 'search-outline';
  } else if (name === 'Bookings') {
    iconName = focused ? 'calendar' : 'calendar-outline';
  } else if (name === 'Deals') {
    iconName = focused ? 'pricetag' : 'pricetag-outline';
  } else if (name === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  } else {
    iconName = 'ellipse-outline';
  }

  return (
    <View style={styles.iconBox}>
      {focused && (
        <View style={[styles.activeBackground, { backgroundColor: color + '1A' }]} />
      )}
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -4,
    right: -4,
    borderRadius: 16,
  },
});
