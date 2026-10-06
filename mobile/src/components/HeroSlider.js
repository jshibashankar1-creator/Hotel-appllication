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
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {}}
        style={styles.slideContainer}
        onPressIn={stopAutoSlide}
        onPressOut={startAutoSlide}
      >
        <Image source={{ uri: item.image_url || item.coverImage }} style={styles.image} />
        
        {/* Clean Gradient Overlay */}
        <View style={styles.gradientOverlay} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
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
        <View style={styles.paginationTextContainer}>
          <Text style={styles.paginationText}>{currentIndex + 1}/{data.length}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // clean overlay
  },
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
  paginationTextContainer: {
    position: 'absolute',
    bottom: 25,
    right: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

