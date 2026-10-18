import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function FoodCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.9}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.vegBadge, { borderColor: item.isVegetarian ? '#22c55e' : '#ef4444' }]}>
            <View style={[styles.vegDot, { backgroundColor: item.isVegetarian ? '#22c55e' : '#ef4444' }]} />
          </View>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>₹ {item.price}</Text>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>⭐ {item.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  placeholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1733',
    flex: 1,
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  category: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8F1239',
  },
  ratingBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1733',
  },
});
