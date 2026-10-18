import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function FoodDetailsModal({ visible, onClose, food }) {
  if (!food) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {food.image ? (
            <Image source={{ uri: food.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{food.name}</Text>
              <View style={[styles.vegBadge, { borderColor: food.isVegetarian ? '#22c55e' : '#ef4444' }]}>
                <View style={[styles.vegDot, { backgroundColor: food.isVegetarian ? '#22c55e' : '#ef4444' }]} />
              </View>
            </View>
            
            <Text style={styles.category}>{food.category}</Text>
            
            <Text style={styles.price}>₹ {food.price}</Text>

            {food.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{food.description}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={[styles.statusText, { color: food.isAvailable ? '#22c55e' : '#ef4444' }]}>
                {food.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <Text style={styles.descriptionText}>
                Ordering functionality is currently not supported by the backend. Please contact the hotel front desk to place your order.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  image: {
    width: width,
    height: width * 0.75,
  },
  placeholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1733',
    flex: 1,
  },
  vegBadge: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  category: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8F1239',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1733',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
