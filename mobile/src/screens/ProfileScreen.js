import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { ACTIVE_USER_PROFILE } from '../data/mockData';
import { mobileApi } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(mobileApi.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('aarav.sharma@gmail.com');
  const [password, setPassword] = useState('Password@123');
  const [phone, setPhone] = useState('+91 98200 11928');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    // Check initial user from service
    const existing = mobileApi.getCurrentUser();
    if (existing) {
      setCurrentUser(existing);
    } else {
      // Auto-authenticate with default seed customer on first load
      autoLoginDefault();
    }

    const unsubscribe = mobileApi.onAuthChange((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  async function autoLoginDefault() {
    try {
      setLoading(true);
      const res = await mobileApi.login('aarav.sharma@gmail.com', 'Password@123');
      if (res && res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.log('Using local guest state until manual login:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit() {
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      if (authMode === 'login') {
        const res = await mobileApi.login(email.trim(), password.trim());
        setCurrentUser(res.user);
        setAuthSuccess(`Welcome back, ${res.user.name || 'Member'}!`);
        setTimeout(() => {
          setAuthModalVisible(false);
          setAuthSuccess('');
        }, 1200);
      } else {
        const res = await mobileApi.register(
          name.trim(),
          email.trim(),
          password.trim(),
          phone.trim()
        );
        setCurrentUser(res.user);
        setAuthSuccess(`Account created successfully! Welcome, ${res.user.name}!`);
        setTimeout(() => {
          setAuthModalVisible(false);
          setAuthSuccess('');
        }, 1200);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your VIP account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            mobileApi.logout();
            setCurrentUser(null);
          },
        },
      ]
    );
  }

  const profileDisplay = currentUser ? {
    name: currentUser.name || 'Aarav Sharma',
    email: currentUser.email || 'aarav.sharma@gmail.com',
    phone: currentUser.phone || '+91 98200 11928',
    avatar: ACTIVE_USER_PROFILE.avatar,
    membershipTier: currentUser.membership_tier || 'Emerald VIP',
    rewardPoints: '14,850 pts',
    memberSince: 'May 2026',
  } : {
    name: 'Guest Traveler',
    email: 'Sign in to access VIP bookings & perks',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    membershipTier: 'Explorer',
    rewardPoints: '0 pts',
    memberSince: '2026',
  };

  const menuOptions = [
    { id: '1', title: 'Personal Information', icon: '👤', subtitle: profileDisplay.phone || 'Manage name, contact & security' },
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
            source={{ uri: profileDisplay.avatar }}
            style={styles.avatarImage}
          />
          <Text style={styles.userName}>{profileDisplay.name}</Text>
          <Text style={styles.userEmail}>{profileDisplay.email}</Text>

          {/* Membership Tier Badge */}
          <View style={styles.tierBadge}>
            <Text style={styles.tierCrown}>👑</Text>
            <Text style={styles.tierText}>{profileDisplay.membershipTier.toUpperCase()}</Text>
          </View>

          {/* Reward Points Box */}
          <View style={styles.pointsBox}>
            <View style={styles.pointsCol}>
              <Text style={styles.pointsLabel}>REWARD BALANCE</Text>
              <Text style={styles.pointsVal}>{profileDisplay.rewardPoints}</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsCol}>
              <Text style={styles.pointsLabel}>MEMBER SINCE</Text>
              <Text style={styles.pointsVal}>{profileDisplay.memberSince}</Text>
            </View>
          </View>

          {/* AUTH ACTION BUTTON IN HEADER */}
          {!currentUser ? (
            <TouchableOpacity
              style={styles.headerSignInBtn}
              activeOpacity={0.88}
              onPress={() => {
                setAuthMode('login');
                setAuthModalVisible(true);
              }}
            >
              <Text style={styles.headerSignInText}>Sign In / Register for VIP Access →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.headerSwitchBtn}
              activeOpacity={0.88}
              onPress={() => {
                setAuthMode('login');
                setAuthModalVisible(true);
              }}
            >
              <Text style={styles.headerSwitchText}>🔄 Switch Account / Re-authenticate</Text>
            </TouchableOpacity>
          )}
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

        {/* LOGOUT / SIGN IN BUTTON */}
        {currentUser ? (
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.88}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sign Out of HotelHub VIP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={0.88}
            onPress={() => {
              setAuthMode('login');
              setAuthModalVisible(true);
            }}
          >
            <Text style={styles.signInText}>Sign In to HotelHub Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* REAL AUTH MODAL (LOGIN & SIGNUP) */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Luxury Account'}
                </Text>
                <Text style={styles.modalSub}>
                  {authMode === 'login'
                    ? 'Sign in to access reservations & concierge'
                    : 'Register for exclusive rates & pickup transfer'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAuthModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Auth Mode Toggle Tabs */}
            <View style={styles.tabToggleRow}>
              <TouchableOpacity
                style={[styles.tabToggleBtn, authMode === 'login' && styles.tabToggleBtnActive]}
                onPress={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
              >
                <Text style={[styles.tabToggleText, authMode === 'login' && styles.tabToggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabToggleBtn, authMode === 'register' && styles.tabToggleBtnActive]}
                onPress={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccess('');
                }}
              >
                <Text style={[styles.tabToggleText, authMode === 'register' && styles.tabToggleTextActive]}>
                  Sign Up (New)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Alerts */}
            {authError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {authError}</Text>
              </View>
            ) : null}

            {authSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ {authSuccess}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Field (for Register) */}
              {authMode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Shibashankar Jana"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. client@hotelhub.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Phone Field (for Register) */}
              {authMode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CONTACT PHONE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98000 00000"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {/* Quick Demo Accounts */}
              {authMode === 'login' && (
                <View style={styles.quickDemoSection}>
                  <Text style={styles.quickDemoTitle}>Quick Demo Sign In:</Text>
                  <View style={styles.quickDemoRow}>
                    <TouchableOpacity
                      style={styles.demoChip}
                      onPress={() => {
                        setEmail('aarav.sharma@gmail.com');
                        setPassword('Password@123');
                      }}
                    >
                      <Text style={styles.demoChipText}>👤 Aarav (Customer)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoChip}
                      onPress={() => {
                        setEmail('meera.iyer@outlook.com');
                        setPassword('Password@123');
                      }}
                    >
                      <Text style={styles.demoChipText}>👤 Meera (Customer)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.88}
                onPress={handleAuthSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {authMode === 'login' ? 'Sign In to Account →' : 'Create Account & Continue →'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerSignInBtn: {
    marginTop: 16,
    backgroundColor: COLORS.gold,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  headerSignInText: {
    color: '#2D0812',
    fontSize: 12,
    fontWeight: '800',
  },
  headerSwitchBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  headerSwitchText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
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
  signInButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  signInText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    maxWidth: 260,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabToggleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabToggleTextActive: {
    color: COLORS.primary,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  successBannerText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickDemoSection: {
    marginVertical: 8,
  },
  quickDemoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  quickDemoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    backgroundColor: '#F3E8EE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2C7D4',
  },
  demoChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
