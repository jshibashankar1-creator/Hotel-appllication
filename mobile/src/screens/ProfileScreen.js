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

  // Loyalty Points & Tier details
  const numericPoints = typeof profile.rewardPoints === 'number' ? profile.rewardPoints : 2450;
  const nextTierPoints = 5000;
  const progressRatio = Math.min(1, Math.max(0.15, numericPoints / nextTierPoints));
  const pointsToNext = Math.max(0, nextTierPoints - numericPoints);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* CLEAN TOP BAR */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PURE WHITE MEMBERSHIP PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatarImage}
            />
            <View style={styles.profileInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {profile.name === 'N/A' ? 'Guest Patron' : profile.name}
                </Text>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>
                {profile.email === 'N/A' ? 'guest@hotelhub.com' : profile.email}
              </Text>
              
              {/* Brand Maroon Membership Pill */}
              <View style={styles.tierPill}>
                <Ionicons name="diamond" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.tierPillText}>
                  {profile.membershipTier === 'MEMBER' ? 'GOLD VIP' : `${profile.membershipTier.toUpperCase()} VIP`}
                </Text>
              </View>
            </View>
          </View>

          {/* Clean Loyalty Tier Progress Bar */}
          <View style={styles.loyaltyBox}>
            <View style={styles.loyaltyTopRow}>
              <View>
                <Text style={styles.loyaltyLabel}>LOYALTY BALANCE</Text>
                <Text style={styles.loyaltyPoints}>
                  {numericPoints.toLocaleString()} <Text style={styles.loyaltyPtsSuffix}>Points</Text>
                </Text>
              </View>
              <View style={styles.loyaltyTierRight}>
                <Text style={styles.loyaltyNextLabel}>NEXT LEVEL</Text>
                <Text style={styles.loyaltyNextTier}>Platinum VIP</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>

            <View style={styles.loyaltyFooterRow}>
              <Text style={styles.loyaltySubtext}>
                {pointsToNext.toLocaleString()} points to next tier
              </Text>
              <Text style={styles.memberSinceText}>
                Member since {profile.memberSince === 'N/A' ? '2024' : profile.memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACCOUNT & PREFERENCES</Text>
        </View>

        {/* WHITE SURFACE MENU CONTAINER */}
        <View style={styles.menuContainer}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={item.disabled ? 1 : 0.7}
              style={[
                styles.menuItem,
                index === menuOptions.length - 1 && { borderBottomWidth: 0 },
                item.disabled && { opacity: 0.5 }
              ]}
              disabled={item.disabled}
              onPress={item.action || (() => {})}
            >
              {/* Soft tinted circular icon wrapper */}
              <View style={styles.iconWrapper}>
                <Ionicons name={item.iconName} size={18} color="#8B1538" />
              </View>

              <View style={styles.menuContentCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              {/* Subtle chevron */}
              <Ionicons name="chevron-forward" size={17} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBTLE OUTLINE / SOFT-TINTED RED LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.78}
          onPress={async () => {
            await mobileApi.logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
          <Ionicons name="log-out-outline" size={17} color="#D32F2F" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
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
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT + 8 : 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  topHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // PURE WHITE PROFILE / MEMBERSHIP CARD
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FBF6F0',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 16,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#8B1538',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  tierPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  // CLEAN LOYALTY TIER PROGRESS
  loyaltyBox: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  loyaltyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  loyaltyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  loyaltyPoints: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2,
  },
  loyaltyPtsSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B1538',
  },
  loyaltyTierRight: {
    alignItems: 'flex-end',
  },
  loyaltyNextLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  loyaltyNextTier: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B1538',
    marginTop: 2,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B1538',
    borderRadius: 3,
  },
  loyaltyFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  loyaltySubtext: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  memberSinceText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  // SECTION TITLE
  sectionHeaderRow: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  // WHITE CARD MENU CONTAINER
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5ECE1',
  },
  menuContentCol: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.1,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  // LOGOUT BUTTON
  logoutButton: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFDCE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '700',
  },
  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C757D',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 14,
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingToggleText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  settingStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B1538',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#6C757D',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#8B1538',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
