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
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.image }} style={styles.image} />
        {isSelected && (
          <View style={styles.selectedCheckBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.roomType} numberOfLines={1}>
          {room.type || 'Luxury Suite'}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            ${room.price}
          </Text>
          <Text style={styles.unit}> / night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 85,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  infoContainer: {
    padding: 10,
  },
  roomName: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  roomType: {
    color: COLORS.textBody,
    fontSize: 10,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  price: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  priceSelected: {
    color: COLORS.primaryDark,
  },
  unit: {
    color: COLORS.textBody,
    fontSize: 10,
  },
});
