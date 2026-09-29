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

  if (!data || data.length === 0) {
    return null;
  }

  const renderItem = ({ item }) => {
    const rating = item.rating || 0;
    const reviewCount = item.reviewsCount || item.reviews_count || 0;
    const price = item.pricePerNight || item.starting_price || 0;
    const desc = item.description || item.about;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('HotelDetails', { hotel: item, hotelId: item._id || item.id })}
        style={styles.slideContainer}
        onPressIn={stopAutoSlide}
        onPressOut={startAutoSlide}
      >
        <Image source={{ uri: item.coverImage }} style={styles.image} />
        
        {/* Dark Gradient Overlay for readability */}
        <View style={styles.gradientOverlay} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {item.city || item.location}</Text>
            </View>
            {rating > 0 && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingIcon}>★</Text>
                <Text style={styles.ratingText}>
                  {rating} <Text style={styles.reviewCount}>({reviewCount})</Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.title} numberOfLines={1}>{item.name || item.hotel_name}</Text>
            {desc ? (
              <Text style={styles.subtitle} numberOfLines={1}>{desc}</Text>
            ) : null}
          </View>

          <BlurView intensity={30} tint="light" style={styles.glassmorphismBar}>
            <View>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceText}>₹{price} <Text style={styles.perNight}>/ night</Text></Text>
            </View>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('HotelDetails', { hotel: item, hotelId: item._id || item.id })}
            >
              <Text style={styles.ctaText}>View Details</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
        snapToInterval={BANNER_WIDTH + 16} // Width + marginRight
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
      {data.length > 1 && (
        <View style={styles.pagination}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
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
    backgroundColor: 'rgba(7, 27, 58, 0.4)', 
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#8F1239',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(143, 18, 57, 0.3)',
  },
});

