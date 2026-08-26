import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';

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

import { TabIcon } from './src/components/TabIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4A1738',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E1DA',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          return (
            <TabIcon
              name={route.name}
              focused={focused}
              color={color}
              size={size}
            />
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
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A0E20',
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

const styles = StyleSheet.create({
  tabIconContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(74, 23, 56, 0.08)',
  },
});
