import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';

export default function SearchCard({ onSearch }) {
  const [activeTab, setActiveTab] = useState('Stays');
  const [location, setLocation] = useState('New Digha, West Bengal');
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
        {[
          { id: 'Stays', label: 'Stays', icon: '🏨' },
          { id: 'Flights', label: 'Flights', icon: '✈️' },
          { id: 'Cars', label: 'Cars', icon: '🚗' },
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              style={[styles.tabButton, isSelected ? styles.tabButtonActive : styles.tabButtonInactive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, isSelected ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* WHERE TO? Field with New Digha / Old Digha Quick Selector */}
      <View style={styles.fieldSection}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldPinIcon}>📍</Text>
          <Text style={styles.fieldLabel}>WHERE TO?</Text>
        </View>
        <TextInput
          style={styles.locationInput}
          value={location}
          onChangeText={setLocation}
          placeholder="New Digha or Old Digha"
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.quickLocationsRow}>
          <TouchableOpacity
            style={[
              styles.quickLocPill,
              location.includes('New Digha') ? styles.quickLocPillActive : styles.quickLocPillInactive,
            ]}
            onPress={() => setLocation('New Digha, West Bengal')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.quickLocText,
                location.includes('New Digha') ? styles.quickLocTextActive : styles.quickLocTextInactive,
              ]}
            >
              🏖️ New Digha
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickLocPill,
              location.includes('Old Digha') ? styles.quickLocPillActive : styles.quickLocPillInactive,
            ]}
            onPress={() => setLocation('Old Digha, West Bengal')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.quickLocText,
                location.includes('Old Digha') ? styles.quickLocTextActive : styles.quickLocTextInactive,
              ]}
            >
              🌊 Old Digha
            </Text>
          </TouchableOpacity>
        </View>
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

        <View style={[styles.metaCol, { flex: 1.2 }]}>
          <Text style={styles.metaLabel}>Guests & Rooms</Text>
          <View style={styles.guestsRow}>
            <Text style={styles.metaValue} numberOfLines={1}>
              {guestsRooms}
            </Text>
            <Text style={styles.chevronIcon}> ⌵</Text>
          </View>
        </View>
      </View>

      {/* Search Button & Gold Icon Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Text style={styles.searchButtonText}>Search Hotels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 7,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonInactive: {
    backgroundColor: '#F1F3F6',
  },
  tabIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 12,
  },
  fieldSection: {
    paddingVertical: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  fieldPinIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9AAF',
    letterSpacing: 0.6,
  },
  locationInput: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    paddingVertical: 2,
    paddingHorizontal: 0,
    letterSpacing: 0.1,
  },
  quickLocationsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  quickLocPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickLocPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickLocPillInactive: {
    backgroundColor: '#F0F4F8',
    borderColor: 'transparent',
  },
  quickLocText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickLocTextActive: {
    color: COLORS.goldLight,
  },
  quickLocTextInactive: {
    color: '#2D3748',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E9AAF',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronIcon: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '800',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  searchButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  goldSearchIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  goldSearchIcon: {
    fontSize: 19,
  },
});
