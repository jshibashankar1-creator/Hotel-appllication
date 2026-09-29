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
    { id: '1', title: 'Personal Information', icon: '👤', subtitle: profile.phone || 'Update your details', action: () => { setEditProfileForm({ name: profile.name, phone: profile.phone }); setProfileModalVisible(true); } },
    { id: '2', title: 'My Bookings & Stays', icon: '📅', subtitle: 'Digital itineraries & invoices', action: () => navigation.navigate('Bookings') },
    { id: '3', title: 'Saved Luxury Wishlist', icon: '🤍', subtitle: 'Your favorite hotels', action: () => navigation.navigate('Wishlist') },
    { id: '4', title: 'Payment Methods & Cards', icon: '💳', subtitle: 'Managed securely during checkout', action: fetchPaymentMethods },
    { id: '5', title: 'Exclusive VIP Offers', icon: '✨', subtitle: 'Personalized deals', action: () => navigation.navigate('Deals') },
    { id: '6', title: '24/7 VIP Concierge Support', icon: '💬', subtitle: 'Live chat & ticket tracking', action: () => navigation.navigate('Support') },
    { id: '7', title: 'App Settings & Preferences', icon: '⚙️', subtitle: 'Notifications, Language & More', action: () => setSettingsModalVisible(true) },
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
              activeOpacity={item.disabled ? 1 : 0.88}
              style={[
                styles.menuItem,
                index === menuOptions.length - 1 && { borderBottomWidth: 0 },
                item.disabled && { opacity: 0.5 }
              ]}
              disabled={item.disabled}
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

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.88}
          onPress={async () => {
            await mobileApi.logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
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
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingToggleText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  settingStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 15,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
