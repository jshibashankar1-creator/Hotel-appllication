import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';
import DatePickerModal from './DatePickerModal';

export default function SearchCard({ onSearch, initialSearchState }) {
  const [activeTab, setActiveTab] = useState('Stays');
  const [location, setLocation] = useState('New Digha, West Bengal');

  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000);
  const defaultOut = new Date(today.getTime() + 86400000 * 4);

  const [checkInObj, setCheckInObj] = useState(defaultIn);
  const [checkOutObj, setCheckOutObj] = useState(defaultOut);
  const [formattedCheckIn, setFormattedCheckIn] = useState(
    `${defaultIn.getDate()} ${defaultIn.toLocaleString('en-US', { month: 'short' })}`
  );
  const [formattedCheckOut, setFormattedCheckOut] = useState(
    `${defaultOut.getDate()} ${defaultOut.toLocaleString('en-US', { month: 'short' })}`
  );
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [nightsCount, setNightsCount] = useState(3);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateConfirm = (data) => {
    setCheckInObj(data.checkInDate);
    setCheckOutObj(data.checkOutDate);
    setFormattedCheckIn(data.formattedCheckIn);
    setFormattedCheckOut(data.formattedCheckOut);
    setGuestsCount(data.guestsCount);
    setRoomsCount(data.roomsCount);
    setNightsCount(data.nightsCount);
  };

  const handleSearchPress = () => {
    if (onSearch) {
      onSearch({
        tab: activeTab,
        location,
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        isoCheckIn: checkInObj.toISOString().split('T')[0],
        isoCheckOut: checkOutObj.toISOString().split('T')[0],
        checkInDateObj: checkInObj,
        checkOutDateObj: checkOutObj,
        guestsCount,
        roomsCount,
        nightsCount,
        guestsRooms: `${guestsCount} Guest${guestsCount > 1 ? 's' : ''}, ${roomsCount} Room${roomsCount > 1 ? 's' : ''}`,
      });
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Service Selector Tabs */}
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

      {/* WHERE TO? Field with Location Quick Selector */}
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
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
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

      {/* 3 Columns: Check in, Check out, Guests */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.metaRow}
        onPress={() => setShowDatePicker(true)}
      >
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Check-in</Text>
          <Text style={styles.metaValue}>{formattedCheckIn}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Check-out</Text>
          <Text style={styles.metaValue}>{formattedCheckOut}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={[styles.metaCol, { flex: 1.2 }]}>
          <Text style={styles.metaLabel}>Guests ({nightsCount}N)</Text>
          <View style={styles.guestsRow}>
            <Text style={styles.metaValue} numberOfLines={1}>
              {guestsCount} Guest{guestsCount > 1 ? 's' : ''}
            </Text>
            <Text style={styles.chevronIcon}> 📅</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* SEARCH HOTELS Burgundy Button */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Text style={styles.searchButtonText}>SEARCH HOTELS</Text>
        </TouchableOpacity>
      </View>

      {/* DATE PICKER MODAL */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialCheckIn={checkInObj}
        initialCheckOut={checkOutObj}
        initialGuests={guestsCount}
        initialRooms={roomsCount}
        onConfirm={handleDateConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
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
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: COLORS.burgundyPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  fieldSection: {
    paddingVertical: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldPinIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.8,
  },
  locationInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
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
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickLocPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickLocPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickLocText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickLocTextActive: {
    color: COLORS.goldLight,
  },
  quickLocTextInactive: {
    color: 'rgba(255, 255, 255, 0.7)',
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
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '800',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  buttonRow: {
    marginTop: 16,
  },
  searchButton: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: COLORS.burgundyPill,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
