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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: COLORS.goldLight,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  roomDesc: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.goldLight,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.goldLight,
  },
});
