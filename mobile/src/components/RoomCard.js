import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function RoomCard({ room, isSelected = false, onSelect }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect && onSelect(room)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.bedIcon}>🛏️</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.roomDesc} numberOfLines={1}>
          {room.description || room.type || 'Ocean view king, ocean view room'}
        </Text>
      </View>

      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#FAF7EE',
    borderColor: COLORS.burgundyPill || '#7D143D',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bedIcon: {
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
  },
  roomName: {
    color: '#160824',
    fontSize: 14,
    fontWeight: '800',
  },
  roomDesc: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.burgundyPill || '#7D143D',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.burgundyPill || '#7D143D',
  },
});
