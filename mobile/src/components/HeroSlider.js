import React, { useState, useEffect, useRef, useMemo } from 'react';
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
const AUTOPLAY_INTERVAL = 4500; // 4.5 seconds auto-slide
const RESUME_DELAY = 2000; // 2 seconds resume delay after manual interaction

export default function HeroSlider({ data, navigation, loading }) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  // Parse and filter initial items
  const initialItems = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item && item.is_active !== false)
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  }, []);

  const [items, setItems] = useState(initialItems);

  const flatListRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const itemsRef = useRef(items);
  const containerWidthRef = useRef(260);

  // Sync itemsRef with state
  itemsRef.current = items;
  currentIndexRef.current = currentIndex;

  // Responsive slide width: exactly matches the carousel viewport width
  const containerWidth = measuredWidth > 0 ? measuredWidth : Math.max(Math.round(windowWidth - 40), 260);
  containerWidthRef.current = containerWidth;

  // Programmatic scroll to specific slide
  const goToSlide = (index, animated = true) => {
    const list = itemsRef.current;
    if (!flatListRef.current || !list || list.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, list.length - 1));
    const width = containerWidthRef.current;
    try {
      flatListRef.current.scrollToOffset({
        offset: safeIndex * width,
        animated,
      });
      currentIndexRef.current = safeIndex;
      setCurrentIndex(safeIndex);
    } catch (e) {
      console.warn('[HeroSlider] Scroll error:', e.message);
    }
  };

  // Synchronize data updates, preserve current slide if hotel exists, retain last valid list on failure
  useEffect(() => {
    if (!Array.isArray(data)) return;
    const filtered = data
      .filter(item => item && item.is_active !== false)
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

    if (filtered.length > 0) {
      const prevItems = itemsRef.current;
      const currentItem = prevItems[currentIndexRef.current];
      const currentHotelId = currentItem
        ? (currentItem.hotel_id || currentItem.id || (currentItem.hotel && currentItem.hotel.id))
        : null;

      let nextIndex = 0;
      if (currentHotelId) {
        const foundIdx = filtered.findIndex(
          b => (b.hotel_id || b.id || (b.hotel && b.hotel.id)) === currentHotelId
        );
        if (foundIdx >= 0) {
          nextIndex = foundIdx;
        } else {
          nextIndex = Math.min(currentIndexRef.current, filtered.length - 1);
        }
      }

      setItems(filtered);
      itemsRef.current = filtered;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      if (nextIndex > 0 && flatListRef.current) {
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToOffset({
              offset: nextIndex * containerWidthRef.current,
              animated: false,
            });
          } catch (err) {}
        }, 50);
      }
    }
    // If incoming data is empty (e.g. failed API), retain previous valid items
  }, [data]);

  // One single managed timer created on mount, cleaned up on unmount
  useEffect(() => {
    autoPlayTimerRef.current = setInterval(() => {
      if (isInteractingRef.current) return;
      const list = itemsRef.current;
      if (!list || list.length <= 1) return;

      const next = (currentIndexRef.current + 1) % list.length;
      goToSlide(next, true);
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, []);

  // Pause autoplay while user interacts, resume after 2 seconds
  const handleInteractionStart = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const handleInteractionEnd = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, RESUME_DELAY);
  };

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
    const width = containerWidthRef.current;
    const list = itemsRef.current;
    if (width > 0 && list && list.length > 0) {
      const index = Math.round(scrollPosition / width);
      if (index >= 0 && index < list.length && index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        setCurrentIndex(index);
      }
    }
  };

  const handleMomentumScrollEnd = (event) => {
    handleScroll(event);
    handleInteractionEnd();
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.carouselViewport, { width: containerWidth }]}>
          <View style={[styles.slideContainer, { backgroundColor: '#cbd5e1', width: containerWidth }]} />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
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
          data={items}
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

      {items.length > 1 && (
        <View style={styles.paginationRow}>
          {items.map((_, i) => (
            <TouchableOpacity
              key={`dot-${i}`}
              onPress={() => {
                handleInteractionStart();
                goToSlide(i, true);
                handleInteractionEnd();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${i + 1}`}
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
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#D4AF37',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
