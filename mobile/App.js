import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { COLORS } from './src/theme/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
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
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: isDark ? '#E9D5A8' : (COLORS.burgundyPill || '#8F1239'),
        tabBarInactiveTintColor: isDark ? '#8A94A6' : '#8C9BB0',
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={85}
            style={[
              StyleSheet.absoluteFill,
              {
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                borderBottomLeftRadius: 22,
                borderBottomRightRadius: 22,
                overflow: 'hidden',
              }
            ]}
          />
        ),
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(15, 17, 21, 0.85)' : 'rgba(255, 255, 255, 0.90)',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(42, 48, 58, 0.9)' : 'rgba(255, 255, 255, 1)',
          borderLeftWidth: 1,
          borderLeftColor: isDark ? 'rgba(42, 48, 58, 0.9)' : 'rgba(255, 255, 255, 1)',
          borderRightWidth: 1,
          borderRightColor: isDark ? 'rgba(42, 48, 58, 0.9)' : 'rgba(255, 255, 255, 1)',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(42, 48, 58, 0.9)' : 'rgba(255, 255, 255, 1)',
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 12,
          left: 12,
          right: 12,
          height: Platform.OS === 'ios' ? 74 : 64,
          paddingBottom: Platform.OS === 'ios' ? 14 : 4,
          paddingTop: 6,
          elevation: isDark ? 24 : 12,
          shadowColor: isDark ? theme.shadow : '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.35 : 0.1,
          shadowRadius: 16,
          maxWidth: 720,
          alignSelf: 'center',
          overflow: 'hidden',
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
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Explore" component={SearchScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Deals" component={OffersScreen} options={{ title: 'Deals' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const linking = {
  prefixes: ['/', 'hotelhub://'],
  config: {
    initialRouteName: 'MainTabs',
    screens: {
      Login: 'login',
      Register: 'signup',
      MainTabs: {
        path: '',
        screens: {
          Home: '',
          Explore: 'explore',
          Bookings: 'bookings',
          Deals: 'deals',
          Profile: 'profile'
        }
      },
      HotelDetails: 'hotel/:id',
      RoomDetails: 'room/:id',
      BookingReview: 'review',
      Payment: 'payment',
      BookingConfirmation: 'confirmation',
      BookingDetails: 'booking-details/:id',
      Cancellation: 'cancellation',
      ReviewModal: 'write-review',
      Support: 'support',
      Wishlist: 'wishlist'
    }
  }
};

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#0F1115' : '#FFFFFF'} />
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? theme.primaryDark : '#4A0E20',
          },
          headerTintColor: isDark ? theme.textPrimary : COLORS.white,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 16,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
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
        <Stack.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{ title: 'Saved Luxury Stays' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
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
