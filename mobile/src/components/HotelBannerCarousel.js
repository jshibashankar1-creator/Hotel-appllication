import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');
// Top hero banner sizing: responsive on mobile, max 540 on tablet/web
const CAROUSEL_WIDTH = Math.min(width - 32, 540);
const CAROUSEL_HEIGHT = Math.min(Math.round(CAROUSEL_WIDTH * 0.52), 210);

export default function HotelBannerCarousel({ banners, onBannerPress }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  // Filter only active banners and sort by sort_order
  const validBanners = Array.isArray(banners)
    ? banners
        .filter(b => b && b.is_active !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, validBanners.length]);

  const startAutoSlide = () => {
    stopAutoSlide();
    if (validBanners.length <= 1) return;

    timerRef.current = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= validBanners.length) {
        nextIndex = 0;
      }
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 4500);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CAROUSEL_WIDTH);
    if (index !== currentIndex && index >= 0 && index < validBanners.length) {
      setCurrentIndex(index);
    }
  };

  if (validBanners.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.emptyHeroCard]}>
          <Text style={styles.emptyIcon}>🏨</Text>
          <Text style={styles.emptyTitle}>Welcome to our property</Text>
          <Text style={styles.emptySubtitle}>Explore rooms and amenities below</Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const bannerKey = item.id || `promo-banner-${index}`;
    const rawImageUrl = item.image_url || item.cover_image;
    const isImageFailed = failedImages[bannerKey];
    const bannerTitle = item.title && item.title.trim() ? item.title.trim() : null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onBannerPress && onBannerPress(item)}
        style={styles.card}
      >
        {rawImageUrl && !isImageFailed ? (
          <Image
            source={{ uri: rawImageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => {
              setFailedImages(prev => ({ ...prev, [bannerKey]: true }));
            }}
          />
        ) : (
          <View style={styles.fallbackBackground}>
            <Text style={styles.fallbackIcon}>✨</Text>
          </View>
        )}

        {/* Gradient dark overlay for text contrast */}
        <View style={styles.overlay} />

        {/* Badge & Title Content */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, item.fallback && styles.fallbackBadge]}>
            <Text style={styles.badgeText}>
              {item.fallback ? 'FEATURED STAY' : 'SPECIAL OFFER'}
            </Text>
          </View>
          {validBanners.length > 1 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                {index + 1}/{validBanners.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contentBottom}>
          {bannerTitle ? (
            <Text style={styles.title} numberOfLines={2}>
              {bannerTitle}
            </Text>
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {item.fallback ? 'Exclusive Stay' : 'Exclusive Hotel Offer'}
            </Text>
          )}
          <View style={styles.actionRow}>
            <Text style={styles.actionText}>
              {item.fallback ? 'Explore Rooms' : 'View Offer'}
            </Text>
            <Text style={styles.actionArrow}>→</Text>
          </View>
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
        keyExtractor={(item, index) => item.id || `promo-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
        snapToInterval={CAROUSEL_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ alignItems: 'center' }}
      />

      {/* Pagination Dots */}
      {validBanners.length > 1 && (
        <View style={styles.paginationDots}>
          {validBanners.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                i === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 6,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  fallbackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    fontSize: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  badge: {
    backgroundColor: '#8F1239',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fallbackBadge: {
    backgroundColor: '#0F766E', // Refined teal for featured hotel overview
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  emptyHeroCard: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  counterBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  counterBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  contentBottom: {
    zIndex: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  actionArrow: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '800',
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#8F1239',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
