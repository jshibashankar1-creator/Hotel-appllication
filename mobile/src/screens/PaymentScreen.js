import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { hotel, room, bookingData } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('UPI (Google Pay)');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePayNow = async () => {
    try {
      setProcessing(true);
      setErrorMessage(null);

      // Call Backend API to atomically lock room & create booking
      const res = await mobileApi.createBooking({
        ...bookingData,
        payment_method: selectedMethod
      });

      // Navigate to confirmation with generated booking
      navigation.replace('BookingConfirmation', {
        hotel,
        room,
        booking: res.booking
      });
    } catch (err) {
      setErrorMessage(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Amount Banner */}
        <View style={styles.amountBanner}>
          <Text style={styles.bannerLabel}>PAYABLE AMOUNT</Text>
          <Text style={styles.bannerValue}>₹{bookingData.total_amount.toLocaleString('en-IN')}</Text>
          <Text style={styles.bannerSub}>{hotel.name} • {bookingData.nights} Nights</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* Payment Methods */}
        <Text style={styles.sectionHeading}>Select Payment Method</Text>

        {[
          { id: 'UPI (Google Pay)', title: 'Google Pay / PhonePe UPI', desc: 'Fast & Secure instant UPI bank transfer' },
          { id: 'Credit Card (Visa/Mastercard)', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay & Amex supported' },
          { id: 'Net Banking (HDFC/ICICI)', title: 'Net Banking', desc: 'Direct secure net banking across 50+ banks' }
        ].map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
            onPress={() => setSelectedMethod(method.id)}
            disabled={processing}
          >
            <View style={styles.radioOuter}>
              {selectedMethod === method.id ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDesc}>{method.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Security Badge */}
        <View style={styles.secureBadge}>
          <Text style={styles.secureText}>🔒 256-Bit SSL Encrypted End-to-End Payment Gateway</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayNow}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.payButtonText}>PAY ₹{bookingData.total_amount.toLocaleString('en-IN')} SECURELY</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18 },
  amountBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  bannerLabel: { fontSize: 10, color: COLORS.accent, fontWeight: '700', letterSpacing: 1 },
  bannerValue: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginVertical: 4 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    gap: 12
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceSecondary
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary
  },
  methodTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  methodDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  secureBadge: {
    alignItems: 'center',
    marginVertical: 18
  },
  secureText: { fontSize: 11, color: COLORS.textMuted },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }
});
