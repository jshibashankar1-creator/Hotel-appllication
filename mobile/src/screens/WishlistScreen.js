import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import HotelCard from '../components/HotelCard';


export default function WishlistScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const savedHotels = [];

  const toggleFavorite = (hotelId) => {
    setFavorites(favorites.filter(id => id !== hotelId));
  };

  const handleSelectHotel = (hotel) => {
    navigation.navigate('HotelDetails', { hotel });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Luxury Stays</Text>
        <Text style={styles.subtitle}>
          {savedHotels.length} {savedHotels.length === 1 ? 'property' : 'properties'} saved for your next trip
        </Text>
      </View>

      {/* List */}
      <View style={styles.content}>
        {savedHotels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🤍</Text>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptyText}>
              Explore our hand-curated luxury hotels and save your favorites here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.exploreBtnText}>Explore Luxury Hotels</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedHotels}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <HotelCard
                hotel={item}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                onPress={handleSelectHotel}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primaryDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
