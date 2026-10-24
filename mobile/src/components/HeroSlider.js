import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40; // 20 padding on each side
const BANNER_HEIGHT = 220;

export default function HeroSlider({ data, navigation, loading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, data]);

  const startAutoSlide = () => {
    stopAutoSlide();
    if (!data || data.length <= 1) return;

    timerRef.current = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 4500); // 4.5 seconds auto-slide
  };

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    if (index !== currentIndex && index >= 0 && index < data.length) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={[styles.slideContainer, { backgroundColor: '#cbd5e1', width: BANNER_WIDTH }]} />
        </View>
      </View>
    );
  }

  // Filter for active banners and sort by sort_order
  const validBanners = Array.isArray(data)
    ? data
        .filter(item => item && item.is_active !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  if (validBanners.length === 0) {
    return null;
  }

  const renderItem = ({ item, index }) => {
    const hotel = item.hotel || {};
    const hotelId = item.hotel_id || hotel.id || hotel._id || item.id;
    const bannerKey = item.id || `banner-${index}`;
    const rawImageUrl = item.image_url || item.cover_image || item.coverImage || hotel.cover_image;
    const imageUrl = failedImages[bannerKey] ? null : rawImageUrl;
    const title = item.title || hotel.name || 'Featured Luxury Stay';
    const city = hotel.city || item.city || '';
    const rating = hotel.rating || item.rating || 0;
    const reviewsCount = hotel.reviews_count || hotel.reviewsCount || item.reviewsCount || 0;
    const price = hotel.starting_price || hotel.price_per_night || hotel.pricePerNight || item.pricePerNight || 0;
    const desc = item.subtitle || hotel.description || item.description || '';

    const handlePress = () => {
      if (!hotelId) {
        console.warn('[HeroSlider] Cannot navigate: missing hotel ID for banner', item);
        return;
      }
      navigation.navigate('HotelDetails', {
        id: hotelId,
        hotel: Object.keys(hotel).length > 0 ? hotel : (item.name ? item : null),
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.slideContainer}
        onPressIn={stopAutoSlide}
        onPressOut={startAutoSlide}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => {
              console.warn('[HeroSlider] Image failed to load for banner:', bannerKey, imageUrl);
              setFailedImages(prev => ({ ...prev, [bannerKey]: true }));
            }}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: '#0B1733', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 40 }}>🏨</Text>
          </View>
        )}
        <View style={styles.gradientOverlay} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            {city ? (
              <View style={styles.locationBadge}>
                <Text style={styles.locationText}>📍 {city}</Text>
              </View>
            ) : <View />}
            {rating > 0 ? (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingIcon}>★</Text>
                <Text style={styles.ratingText}>
                  {rating} <Text style={styles.reviewCount}>({reviewsCount})</Text>
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {desc ? (
              <Text style={styles.subtitle} numberOfLines={1}>{desc}</Text>
            ) : null}
          </View>

          {price > 0 ? (
            <BlurView intensity={30} tint="light" style={styles.glassmorphismBar}>
              <View>
                <Text style={styles.priceLabel}>Starting from</Text>
                <Text style={styles.priceText}>₹{price} <Text style={styles.perNight}>/ night</Text></Text>
              </View>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handlePress}
              >
                <Text style={styles.ctaText}>View Details</Text>
              </TouchableOpacity>
            </BlurView>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handlePress}
              >
                <Text style={styles.ctaText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={validBanners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
        snapToInterval={BANNER_WIDTH + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
      {validBanners.length > 1 && (
        <View style={styles.paginationRow}>
          <View style={styles.dotsContainer}>
            {validBanners.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationText}>
              {currentIndex + 1}/{validBanners.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  slideContainer: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#0B1733',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)', // dark overlay for readability
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  ratingIcon: {
    color: '#f59e0b',
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B1733',
  },
  reviewCount: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
  },
  mainInfo: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  glassmorphismBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  perNight: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  ctaButton: {
    backgroundColor: '#D4AF37', // Gold visual language
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaText: {
    color: '#0B1733',
    fontSize: 13,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#D4AF37',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

