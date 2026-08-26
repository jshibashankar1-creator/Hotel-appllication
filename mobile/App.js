import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { COLORS } from './src/theme/colors';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import OffersScreen from './src/screens/OffersScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SupportScreen from './src/screens/SupportScreen';

import HotelDetailsScreen from './src/screens/HotelDetailsScreen';
import RoomDetailsScreen from './src/screens/RoomDetailsScreen';
import BookingReviewScreen from './src/screens/BookingReviewScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import CancellationScreen from './src/screens/CancellationScreen';
import ReviewModalScreen from './src/screens/ReviewModalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#0B3D37',
          borderTopColor: 'rgba(212, 175, 55, 0.25)',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused }) => {
          let icon = '🏨';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Explore') icon = '🔍';
          else if (route.name === 'Bookings') icon = '📅';
          else if (route.name === 'Deals') icon = '🏷️';
          else if (route.name === 'Wishlist') icon = '🤍';
          else if (route.name === 'Profile') icon = '👤';
          return (
            <Text style={{ fontSize: 18, color: focused ? COLORS.gold : COLORS.textMuted }}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Explore" component={SearchScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Deals" component={OffersScreen} options={{ title: 'Deals' }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#072824" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#072824',
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 16,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HotelDetails"
          component={HotelDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoomDetails"
          component={RoomDetailsScreen}
          options={{ title: 'Room Details' }}
        />
        <Stack.Screen
          name="BookingReview"
          component={BookingReviewScreen}
          options={{ title: 'Review Reservation' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Secure Checkout' }}
        />
        <Stack.Screen
          name="BookingConfirmation"
          component={BookingConfirmationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingDetails"
          component={BookingDetailsScreen}
          options={{ title: 'Digital Itinerary' }}
        />
        <Stack.Screen
          name="Cancellation"
          component={CancellationScreen}
          options={{ title: 'Cancel Stay' }}
        />
        <Stack.Screen
          name="ReviewModal"
          component={ReviewModalScreen}
          options={{ title: 'Write Verified Review' }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ title: '24/7 VIP Concierge' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
