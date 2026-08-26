import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';

export default function SearchCard({ onSearch }) {
  const [activeTab, setActiveTab] = useState('Stays');
  const [location, setLocation] = useState('New York, USA');
  const [checkIn, setCheckIn] = useState('12 Aug, Mon');
  const [checkOut, setCheckOut] = useState('15 Aug, Thu');
  const [guestsRooms, setGuestsRooms] = useState('2 Guests, 1 Room');

  const handleSearchPress = () => {
    if (onSearch) {
      onSearch({
        tab: activeTab,
        location,
        checkIn,
        checkOut,
        guestsRooms,
      });
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Tabs */}
      <View style={styles.tabsRow}>
        {['Stays', 'Flights', 'Cars'].map(tab => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabIcon}>
                {tab === 'Stays' ? '🏨 ' : tab === 'Flights' ? '✈️ ' : '🚗 '}
              </Text>
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* WHERE TO? Field */}
      <View style={styles.fieldSection}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldIcon}>📍</Text>
          <Text style={styles.fieldLabel}>Where to?</Text>
        </View>
        <TextInput
          style={styles.locationInput}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter city or destination"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.divider} />

      {/* 3 Columns: Check in, Check out, Guests & Rooms */}
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Check in</Text>
          <Text style={styles.metaValue}>{checkIn}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Check out</Text>
          <Text style={styles.metaValue}>{checkOut}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Guests & Rooms</Text>
          <Text style={styles.metaValue} numberOfLines={1}>{guestsRooms}</Text>
        </View>
      </View>

      {/* Search Button Container */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Text style={styles.searchButtonText}>Search Hotels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.goldSearchIconBtn}
          onPress={handleSearchPress}
        >
          <Text style={styles.goldSearchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  fieldSection: {
    paddingVertical: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  searchButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  goldSearchIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  goldSearchIcon: {
    fontSize: 18,
  },
});
