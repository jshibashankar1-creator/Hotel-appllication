import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

const BANNER_HEIGHT = 220;
const AUTOPLAY_INTERVAL = 4000; // 4 seconds auto-slide
const RESUME_DELAY = 2000; // 2 seconds resume delay after manual interaction

export default function HeroSlider({ data, navigation, loading }) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  const flatListRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const currentIndexRef = useRef(0);

  // Sync ref with state
  currentIndexRef.current = currentIndex;

  // Responsive slide width: exactly matches the carousel viewport width
  // Default to window width minus 40px (20px horizontal padding on left & right)
  const containerWidth = measuredWidth > 0 ? measuredWidth : Math.max(Math.round(windowWidth - 40), 260);

  // Filter for active banners and sort by sort_order
  const validBanners = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item && item.is_active !== false)
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  }, [data]);

  // Clean stop of all timers
  const stopTimers = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  // Programmatic scroll to specific slide with offset
  const goToSlide = useCallback((index, animated = true) => {
    if (!flatListRef.current || index < 0 || index >= validBanners.length) return;
    try {
      flatListRef.current.scrollToOffset({
        offset: index * containerWidth,
        animated,
      });
      currentIndexRef.current = index;
      setCurrentIndex(index);
    } catch (e) {
      console.warn('[HeroSlider] Scroll error:', e.message);
    }
  }, [containerWidth, validBanners.length]);

  // Start 4-second auto-slide interval with loop
  const startAutoPlay = useCallback(() => {
    stopTimers();
    if (validBanners.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      if (isInteractingRef.current) return;
      const count = validBanners.length;
      if (count <= 1) return;
      // Loop continuously: last banner slides back to first banner
      const nextIndex = (currentIndexRef.current + 1) % count;
      goToSlide(nextIndex, true);
    }, AUTOPLAY_INTERVAL);
  }, [validBanners.length, stopTimers, goToSlide]);

  // Resume autoplay 2 seconds after manual interaction stops
  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      startAutoPlay();
    }, RESUME_DELAY);
  }, [startAutoPlay]);

  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    stopTimers();
  }, [stopTimers]);

  const handleInteractionEnd = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  // Lifecycle: handle banners update and unmount cleanup
  useEffect(() => {
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    startAutoPlay();
    return () => {
      stopTimers();
    };
  }, [validBanners.length, startAutoPlay, stopTimers]);

  // Dynamic layout measurement to ensure 100% viewport match across screen sizes
  const handleLayout = (event) => {
    const layoutWidth = Math.round(event.nativeEvent.layout.width);
    if (layoutWidth > 0 && Math.abs(layoutWidth - measuredWidth) > 1) {
      setMeasuredWidth(layoutWidth);
    }
  };

  // Scroll position synchronization for dots and index
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    if (containerWidth > 0) {
      const index = Math.round(scrollPosition / containerWidth);
      if (index >= 0 && index < validBanners.length && index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        setCurrentIndex(index);
      }
    }
  };

  const handleMomentumScrollEnd = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    if (containerWidth > 0) {
      const index = Math.round(scrollPosition / containerWidth);
      if (index >= 0 && index < validBanners.length) {
        currentIndexRef.current = index;
        setCurrentIndex(index);
      }
    }
    handleInteractionEnd();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.carouselViewport, { width: containerWidth }]}>
          <View style={[styles.slideContainer, { backgroundColor: '#cbd5e1', width: containerWidth }]} />
        </View>
      </View>
    );
  }

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
        hotelId: hotelId,
        hotel: Object.keys(hotel).length > 0 ? hotel : (item.name ? item : null),
      });
    };

    return (
      <View style={[styles.slideWrapper, { width: containerWidth }]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handlePress}
          style={styles.slideContainer}
          onPressIn={handleInteractionStart}
          onPressOut={handleInteractionEnd}
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
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>View Details</Text>
                </TouchableOpacity>
              </BlurView>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handlePress}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.carouselViewport, { width: containerWidth }]}
        onLayout={handleLayout}
      >
        <FlatList
          ref={flatListRef}
          data={validBanners}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item.id || item._id || index)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleInteractionStart}
          onScrollEndDrag={handleInteractionEnd}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          snapToInterval={containerWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          contentContainerStyle={styles.flatListContent}
          style={{ width: containerWidth }}
        />
      </View>

      {validBanners.length > 1 && (
        <View style={[styles.paginationRow, { width: containerWidth }]}>
          <View style={styles.dotsContainer}>
            {validBanners.map((_, i) => (
              <TouchableOpacity
                key={`dot-${i}`}
                onPress={() => goToSlide(i, true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <View
                  style={[
                    styles.dot,
                    i === currentIndex ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  carouselViewport: {
    height: BANNER_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { overflowX: 'hidden' } : {}),
  },
  flatListContent: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  slideWrapper: {
    height: BANNER_HEIGHT,
    padding: 0,
    margin: 0,
  },
  slideContainer: {
    width: '100%',
    height: BANNER_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
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
    paddingHorizontal: 8,
    marginTop: 10,
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
