import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { ACTIVE_USER_PROFILE } from '../data/mockData';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(ACTIVE_USER_PROFILE);

  const menuOptions = [
    { id: '1', title: 'Personal Information', icon: '👤', subtitle: 'Manage names, contact & security' },
    { id: '2', title: 'My Bookings & Stays', icon: '📅', subtitle: 'Digital itineraries & invoices', action: () => navigation.navigate('Bookings') },
    { id: '3', title: 'Saved Luxury Wishlist', icon: '🤍', subtitle: 'Properties saved for later', action: () => navigation.navigate('MainTabs', { screen: 'Wishlist' }) },
    { id: '4', title: 'Payment Methods & Cards', icon: '💳', subtitle: 'Apple Pay, Visa •••• 8821' },
    { id: '5', title: 'Exclusive VIP Offers', icon: '✨', subtitle: 'Special room upgrade certificates', action: () => navigation.navigate('MainTabs', { screen: 'Deals' }) },
    { id: '6', title: '24/7 VIP Concierge Support', icon: '💬', subtitle: 'Live chat & ticket tracking', action: () => navigation.navigate('Support') },
    { id: '7', title: 'App Settings & Preferences', icon: '⚙️', subtitle: 'Currency ($ USD), Dark Mode' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* VIP HEADER PROFILE CARD */}
        <View style={styles.profileHeroCard}>
          <Image
            source={{ uri: profile.avatar }}
            style={styles.avatarImage}
          />
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>

          {/* Membership Tier Badge */}
          <View style={styles.tierBadge}>
            <Text style={styles.tierCrown}>👑</Text>
            <Text style={styles.tierText}>{profile.membershipTier.toUpperCase()}</Text>
          </View>

          {/* Reward Points Box */}
          <View style={styles.pointsBox}>
            <View style={styles.pointsCol}>
              <Text style={styles.pointsLabel}>REWARD BALANCE</Text>
              <Text style={styles.pointsVal}>{profile.rewardPoints}</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsCol}>
              <Text style={styles.pointsLabel}>MEMBER SINCE</Text>
              <Text style={styles.pointsVal}>{profile.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* MENU OPTIONS */}
        <View style={styles.menuSection}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              style={[
                styles.menuItem,
                index === menuOptions.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.action || (() => {})}
            >
              <View style={styles.menuIconCircle}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.logoutText}>Sign Out of HotelHub VIP</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeroCard: {
    backgroundColor: COLORS.primary,
    paddingTop: STATUSBAR_HEIGHT + 16,
    paddingBottom: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: COLORS.gold,
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  tierCrown: {
    fontSize: 12,
    marginRight: 4,
  },
  tierText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySurface,
    borderRadius: 16,
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  pointsCol: {
    flex: 1,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  pointsVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.goldLight,
    marginTop: 3,
  },
  pointsDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
