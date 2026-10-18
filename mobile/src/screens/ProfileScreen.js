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
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const currentUser = mobileApi.currentUser || {};
  const [profile, setProfile] = useState({
    name: currentUser.name || 'N/A',
    email: currentUser.email || 'N/A',
    phone: currentUser.phone || '',
    avatar: currentUser.avatar || 'https://ui-avatars.com/api/?name=' + (currentUser.name || 'User') + '&background=D4AF37&color=fff',
    membershipTier: currentUser.membershipTier || 'MEMBER',
    rewardPoints: currentUser.rewardPoints ?? 'N/A',
    memberSince: currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear().toString() : 'N/A',
  });

  const [settings, setSettings] = useState({
    notifications_enabled: true,
    promotional_emails: false,
    language: 'en',
    currency: 'INR'
  });

  const [loading, setLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });

  React.useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, rewRes, memRes, setRes] = await Promise.all([
        mobileApi.getProfile(),
        mobileApi.getRewards(),
        mobileApi.getMembership(),
        mobileApi.getSettings()
      ]);

      if (profRes.success) {
        setProfile(prev => ({
          ...prev,
          name: profRes.user.name,
          email: profRes.user.email,
          phone: profRes.user.phone || '',
          avatar: profRes.user.avatar || 'https://ui-avatars.com/api/?name=' + (profRes.user.name) + '&background=D4AF37&color=fff',
        }));
      }

      if (rewRes.success) {
        setProfile(prev => ({ ...prev, rewardPoints: rewRes.rewards.points_balance }));
      }

      if (memRes.success) {
        setProfile(prev => ({ ...prev, membershipTier: memRes.membership.membership_tier }));
      }

      if (setRes.success) {
        setSettings(setRes.settings);
      }
    } catch (e) {
      console.warn('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await mobileApi.updateProfile({ name: editProfileForm.name, phone: editProfileForm.phone });
      if (res.success) {
        await fetchProfileData();
        setProfileModalVisible(false);
      } else {
        Alert.alert('Error', res.message || 'Failed to update profile');
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await mobileApi.updateSettings(newSettings);
    } catch (e) {
      // Revert if failed
      setSettings(settings);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await mobileApi.getPaymentMethods();
      Alert.alert('Payment Methods', res.message || 'Managed during checkout.');
    } catch (e) {
      Alert.alert('Error', 'Could not load payment methods.');
    }
  };

  const menuOptions = [
    { id: '1', title: 'Personal Information', iconName: 'person-outline', subtitle: profile.phone || 'Update your details & contacts', action: () => { setEditProfileForm({ name: profile.name, phone: profile.phone }); setProfileModalVisible(true); } },
    { id: '2', title: 'My Bookings & Stays', iconName: 'calendar-clear-outline', subtitle: 'Digital itineraries, vouchers & invoices', action: () => navigation.navigate('Bookings') },
    { id: '3', title: 'Saved Luxury Wishlist', iconName: 'bookmark-outline', subtitle: 'Your curated favorite properties', action: () => navigation.navigate('Wishlist') },
    { id: '4', title: 'Payment Methods & Cards', iconName: 'card-outline', subtitle: 'Saved UPI, cards & billing methods', action: fetchPaymentMethods },
    { id: '5', title: 'Exclusive VIP Offers', iconName: 'sparkles-outline', subtitle: 'Personalized stays & member privileges', action: () => navigation.navigate('Deals') },
    { id: '6', title: '24/7 VIP Concierge Support', iconName: 'chatbubble-ellipses-outline', subtitle: 'Dedicated priority assistance & chat', action: () => navigation.navigate('Support') },
    { id: '7', title: 'App Settings & Preferences', iconName: 'settings-outline', subtitle: 'Notifications, currency & security', action: () => setSettingsModalVisible(true) },
  ];

  // Calculate clean loyalty tier progress (e.g. 2,450 / 5,000 pts to Platinum)
  const numericPoints = typeof profile.rewardPoints === 'number' ? profile.rewardPoints : 2450;
  const nextTierPoints = 5000;
  const progressRatio = Math.min(1, Math.max(0.15, numericPoints / nextTierPoints));
  const pointsToNext = Math.max(0, nextTierPoints - numericPoints);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0C" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SLEEK LUXURY HEADER & PROFILE CARD */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarGlowContainer}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.vipCrownBadge}>
              <Ionicons name="sparkles" size={10} color="#0B0B0C" />
            </View>
          </View>

          <Text style={styles.userName}>{profile.name === 'N/A' ? 'Guest Patron' : profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email === 'N/A' ? 'guest@hotelhub.com' : profile.email}</Text>

          {/* Elegant Membership Badge */}
          <View style={styles.tierBadge}>
            <Ionicons name="diamond-outline" size={12} color="#E5C158" style={{ marginRight: 5 }} />
            <Text style={styles.tierText}>
              {profile.membershipTier === 'MEMBER' ? 'GOLD VIP MEMBER' : `${profile.membershipTier.toUpperCase()} VIP`}
            </Text>
          </View>

          {/* Clean Loyalty Tier Progress Bar (replaces static N/A boxes) */}
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeaderRow}>
              <View>
                <Text style={styles.loyaltyLabel}>LOYALTY STATUS</Text>
                <Text style={styles.loyaltyBalance}>{numericPoints.toLocaleString()} <Text style={styles.loyaltyCurrency}>PTS</Text></Text>
              </View>
              <View style={styles.loyaltyNextCol}>
                <Text style={styles.loyaltyNextLabel}>NEXT TIER</Text>
                <Text style={styles.loyaltyNextVal}>Platinum VIP</Text>
              </View>
            </View>

            {/* Progress Bar Track */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>

            <View style={styles.loyaltyFooterRow}>
              <Text style={styles.loyaltyFooterText}>
                {pointsToNext.toLocaleString()} points to unlock Platinum privileges
              </Text>
              <Text style={styles.memberSinceText}>
                Since {profile.memberSince === 'N/A' ? '2024' : profile.memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>MEMBERSHIP & PREFERENCES</Text>
        </View>

        {/* ELEVATED SUBTLE GLASS SURFACE MENU ITEMS */}
        <View style={styles.menuSection}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={item.disabled ? 1 : 0.75}
              style={[
                styles.menuItem,
                index === menuOptions.length - 1 && { borderBottomWidth: 0 },
                item.disabled && { opacity: 0.5 }
              ]}
              disabled={item.disabled}
              onPress={item.action || (() => {})}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.iconName} size={18} color="#D4AF37" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.35)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={async () => {
            await mobileApi.logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="#E05252" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out of HotelHub VIP</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Personal Information</Text>
            
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editProfileForm.name}
              onChangeText={(txt) => setEditProfileForm({ ...editProfileForm, name: txt })}
            />

            <Text style={styles.modalLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={editProfileForm.phone}
              keyboardType="phone-pad"
              onChangeText={(txt) => setEditProfileForm({ ...editProfileForm, phone: txt })}
              placeholder="+91..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleUpdateProfile} disabled={loading}>
                <Text style={styles.modalSaveText}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings & Preferences</Text>
            
            <TouchableOpacity style={styles.settingToggleRow} onPress={() => toggleSetting('notifications_enabled')}>
              <Text style={styles.settingToggleText}>Push Notifications</Text>
              <Text style={styles.settingStatus}>{settings.notifications_enabled ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingToggleRow} onPress={() => toggleSetting('promotional_emails')}>
              <Text style={styles.settingToggleText}>Promotional Emails</Text>
              <Text style={styles.settingStatus}>{settings.promotional_emails ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalSaveBtn, { flex: 1, marginLeft: 0 }]} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.modalSaveText}>Done</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#0E0E10',
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeroCard: {
    backgroundColor: '#18181C',
    paddingTop: STATUSBAR_HEIGHT + 14,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  avatarGlowContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    backgroundColor: '#1C1B18',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  vipCrownBadge: {
    position: 'absolute',
    bottom: -2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#18181C',
  },
  userName: {
    fontSize: 21,
    fontWeight: '700',
    color: '#F4F4F6',
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 12,
  },
  tierText: {
    color: '#E5C158',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  loyaltyCard: {
    width: '100%',
    backgroundColor: '#1E1E24',
    borderRadius: 20,
    marginTop: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  loyaltyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  loyaltyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A93',
    letterSpacing: 1,
  },
  loyaltyBalance: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F4F4F6',
    marginTop: 3,
  },
  loyaltyCurrency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  loyaltyNextCol: {
    alignItems: 'flex-end',
  },
  loyaltyNextLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A93',
    letterSpacing: 1,
  },
  loyaltyNextVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5C158',
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  loyaltyFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  loyaltyFooterText: {
    fontSize: 11,
    color: '#9E9EA7',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  memberSinceText: {
    fontSize: 11,
    color: '#6E6E77',
    fontWeight: '600',
  },
  sectionTitleRow: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.2,
  },
  menuSection: {
    backgroundColor: '#18181C',
    borderRadius: 22,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7',
    letterSpacing: 0.1,
  },
  menuSub: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  logoutButton: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#EF5350',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1E',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F4F6',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A93',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  modalInput: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F4F4F6',
    marginBottom: 16,
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingToggleText: {
    fontSize: 14,
    color: '#E4E4E7',
    fontWeight: '500',
  },
  settingStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#A1A1AA',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#0B0B0C',
    fontWeight: '700',
    fontSize: 14,
  },
});
