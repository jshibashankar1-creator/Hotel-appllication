import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function FilterModal({ visible, onClose, onApply, currentFilters = {} }) {
  const [selectedStar, setSelectedStar] = useState(currentFilters.star || null);
  const [selectedPriceTier, setSelectedPriceTier] = useState(currentFilters.priceTier || 'All');
  const [selectedAmenities, setSelectedAmenities] = useState(currentFilters.amenities || []);
  const [selectedPropertyType, setSelectedPropertyType] = useState(currentFilters.type || 'All');

  const starOptions = [5, 4, 3, 2];
  const priceTiers = [
    { label: 'All', min: 0, max: 5000 },
    { label: 'Under $300', min: 0, max: 300 },
    { label: '$300 - $600', min: 300, max: 600 },
    { label: '$600+', min: 600, max: 5000 },
  ];
  const amenityOptions = ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Fine Dining', 'Fitness Gym', 'Valet Parking', 'Beachfront'];
  const propertyTypes = ['All', 'Luxury Hotel', 'Resort', 'Villa', 'Boutique Stay'];

  const toggleAmenity = (item) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply({
        star: selectedStar,
        priceTier: selectedPriceTier,
        amenities: selectedAmenities,
        type: selectedPropertyType,
      });
    }
    onClose();
  };

  const handleReset = () => {
    setSelectedStar(null);
    setSelectedPriceTier('All');
    setSelectedAmenities([]);
    setSelectedPropertyType('All');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>Filter Stays</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Star Category */}
            <Text style={styles.sectionTitle}>Star Rating</Text>
            <View style={styles.chipsRow}>
              {starOptions.map(star => {
                const isSelected = selectedStar === star;
                return (
                  <TouchableOpacity
                    key={star}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedStar(isSelected ? null : star)}
                  >
                    <Text style={styles.starSymbol}>★ </Text>
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {star} Stars
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Range */}
            <Text style={styles.sectionTitle}>Price Per Night</Text>
            <View style={styles.chipsRow}>
              {priceTiers.map(tier => {
                const isSelected = selectedPriceTier === tier.label;
                return (
                  <TouchableOpacity
                    key={tier.label}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedPriceTier(tier.label)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {tier.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Property Type */}
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.chipsRow}>
              {propertyTypes.map(type => {
                const isSelected = selectedPropertyType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedPropertyType(type)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Amenities */}
            <Text style={styles.sectionTitle}>Popular Amenities</Text>
            <View style={styles.chipsRow}>
              {amenityOptions.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {isSelected ? '✓ ' : ''}{amenity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resetText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  starSymbol: {
    color: COLORS.gold,
    fontSize: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
});
