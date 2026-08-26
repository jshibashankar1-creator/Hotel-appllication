import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [email, setEmail] = useState('aarav.sharma@gmail.com');
  const [name, setName] = useState('Aarav Sharma');
  const [phone, setPhone] = useState('+91 98200 11928');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* User Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>★ PRIVILEGE MEMBER</Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACCOUNT INFORMATION</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.val}>{name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.val}>{email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.val}>{phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>App Role:</Text>
            <Text style={styles.val}>Customer</Text>
          </View>
        </View>

        {/* Quick Menu */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PREFERENCES & HELP</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.menuText}>🏨 My Past & Active Stays</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Support')}>
            <Text style={styles.menuText}>🎧 24/7 Guest Concierge Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            alert('Signed out successfully.');
          }}
        >
          <Text style={styles.logoutBtnText}>SIGN OUT OF CUSTOMER ACCOUNT</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 24,
    marginBottom: 16
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  userName: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  memberBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 10
  },
  memberBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.accent, letterSpacing: 0.5 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 12, color: COLORS.textMuted },
  val: { fontSize: 12, fontWeight: '600', color: COLORS.textMain },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  menuText: { fontSize: 13, fontWeight: '600', color: COLORS.textMain },
  menuArrow: { fontSize: 18, color: COLORS.textMuted },
  logoutBtn: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },
  logoutBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 11, letterSpacing: 0.5 }
});
