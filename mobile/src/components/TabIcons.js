import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

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
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons 
        name={iconName} 
        size={size} 
        color={color || (focused ? (COLORS.burgundyPill || '#8F1239') : '#8C9BB0')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(143, 18, 57, 0.12)',
  },
});

