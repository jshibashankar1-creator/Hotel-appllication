import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Precise Vector Outline Icons Matching Reference Image
function TabIconSvg({ name, color, size = 26 }) {
  if (name === 'Home') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Chimney */}
        <Path d="M20 6V9" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* House Outline */}
        <Path
          d="M4 12.5L14 3.5L24 12.5V23C24 23.8 23.3 24.5 22.5 24.5H5.5C4.7 24.5 4 23.8 4 23V12.5Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* 4-Pane Window */}
        <Rect x="8.5" y="14" width="4" height="3.5" rx="0.5" fill={color} />
        <Rect x="15.5" y="14" width="4" height="3.5" rx="0.5" fill={color} />
        <Rect x="8.5" y="19" width="4" height="3.5" rx="0.5" fill={color} />
        <Rect x="15.5" y="19" width="4" height="3.5" rx="0.5" fill={color} />
      </Svg>
    );
  }

  if (name === 'Explore') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Magnifying Glass Lens */}
        <Circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth="2.2" />
        {/* Handle */}
        <Path d="M17.5 17.5L24.5 24.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'Bookings') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Calendar Body */}
        <Rect
          x="3.5"
          y="5.5"
          width="21"
          height="19"
          rx="3.5"
          stroke={color}
          strokeWidth="2"
        />
        {/* Top Binder Loops */}
        <Path d="M8 3V6.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M20 3V6.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Horizontal Divider Line */}
        <Path d="M3.5 11H24.5" stroke={color} strokeWidth="1.8" />
        {/* 6 Grid Dots */}
        <Circle cx="8" cy="15" r="1.1" fill={color} />
        <Circle cx="14" cy="15" r="1.1" fill={color} />
        <Circle cx="20" cy="15" r="1.1" fill={color} />
        <Circle cx="8" cy="19.5" r="1.1" fill={color} />
        <Circle cx="14" cy="19.5" r="1.1" fill={color} />
        <Circle cx="20" cy="19.5" r="1.1" fill={color} />
      </Svg>
    );
  }

  if (name === 'Deals') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Price Tag Outline */}
        <Path
          d="M8.5 4.5H13.5C14.2 4.5 14.9 4.8 15.4 5.3L23.7 13.6C24.8 14.7 24.8 16.4 23.7 17.5L17.5 23.7C16.4 24.8 14.7 24.8 13.6 23.7L5.3 15.4C4.8 14.9 4.5 14.2 4.5 13.5V8.5C4.5 6.3 6.3 4.5 8.5 4.5Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Hole */}
        <Circle cx="9.5" cy="9.5" r="1.8" stroke={color} strokeWidth="1.6" />
        {/* String Loop */}
        <Path d="M8 8.5C6.5 7 7 5.5 8.5 5.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'Wishlist') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Heart Outline */}
        <Path
          d="M14 23.8C13.5 23.3 4.5 15.8 4.5 9.8C4.5 6.2 7.1 3.5 10.6 3.5C12.5 3.5 14 4.5 14.7 5.7C15.4 4.5 16.9 3.5 18.8 3.5C22.3 3.5 24.9 6.2 24.9 9.8C24.9 15.8 15.9 23.3 15.4 23.8L14.7 24.5L14 23.8Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'Profile') {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Head Circle */}
        <Circle cx="14" cy="8.5" r="4.5" stroke={color} strokeWidth="2" />
        {/* Shoulder Arc */}
        <Path
          d="M5 23.5C5 18.5 9 16.5 14 16.5C19 16.5 23 18.5 23 23.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return null;
}

export default function CustomBottomTabBar({ state, descriptors, navigation }) {
  const activeWine = '#7A1235';
  const inactiveGray = '#555555';
  const goldAccent = '#D4A72C';

  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View style={styles.floatingContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const iconColor = isFocused ? activeWine : inactiveGray;
          const textColor = isFocused ? activeWine : inactiveGray;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.75}
              style={styles.tabItem}
            >
              {/* Vector Outline Icon */}
              <View style={styles.iconWrapper}>
                <TabIconSvg name={route.name} color={iconColor} size={25} />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: textColor,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>

              {/* Active Gold Underline Indicator */}
              <View style={styles.underlineContainer}>
                {isFocused ? (
                  <View style={[styles.goldUnderline, { backgroundColor: goldAccent }]} />
                ) : (
                  <View style={styles.goldUnderlinePlaceholder} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  floatingContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
    // Soft drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
    textAlign: 'center',
    marginBottom: 3,
  },
  underlineContainer: {
    height: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  goldUnderline: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  goldUnderlinePlaceholder: {
    width: 24,
    height: 3,
    backgroundColor: 'transparent',
  },
});
