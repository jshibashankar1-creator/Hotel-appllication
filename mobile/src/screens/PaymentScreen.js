import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { hotel, room, bookingData } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('UPI Instant Transfer');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const paymentOptions = [
    { id: 'upi', name: 'UPI Instant Transfer', icon: '⚡', desc: 'GPay, PhonePe, Paytm' },
    { id: 'card', name: 'Credit / Debit Card', icon: '💳', desc: 'Visa, MasterCard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All Major Indian Banks' },
    { id: 'concierge', name: 'Pay at Hotel (Check-in)', icon: '🏨', desc: 'Card/Cash verified on arrival' },
  ];

  const handlePayNow = async () => {
    try {
      setProcessing(true);
      setErrorMessage(null);

      let createdBooking = null;

      try {
        const res = await mobileApi.createBooking({
          ...bookingData,
          payment_method: selectedMethod,
        });
        if (res && res.booking) {
          createdBooking = res.booking;
        }
      } catch (e) {
        console.log('Backend API booking note:', e.message);
      }

      if (!createdBooking) {
        throw new Error('Failed to create booking. Backend returned empty response.');
      }

      navigation.replace('BookingConfirmation', {
        hotel,
        room,
        booking: createdBooking,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* TOTAL PAYABLE HERO CARD */}
          <View style={styles.payableCard}>
            <Text style={styles.payableLabel}>TOTAL AMOUNT DUE</Text>
            <Text style={styles.payableAmount}>₹{bookingData.total_amount.toLocaleString()}</Text>
            <Text style={styles.payableSub}>
              {hotel.name} • {bookingData.nights} Nights
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* PAYMENT METHODS */}
          <Text style={styles.sectionHeading}>Select Payment Method</Text>

          <View style={styles.methodsList}>
            {paymentOptions.map(option => {
              const isSelected = selectedMethod === option.name;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.88}
                  style={[styles.methodCard, isSelected && styles.methodCardActive]}
                  onPress={() => setSelectedMethod(option.name)}
                >
                  <View style={styles.methodIconBox}>
                    <Text style={styles.methodEmoji}>{option.icon}</Text>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{option.name}</Text>
                    <Text style={styles.methodDesc}>{option.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SECURITY BADGE */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              256-Bit SSL Encrypted PCI-DSS VIP Payment Gateway
            </Text>
          </View>

          {/* PAY NOW BUTTON */}
          <TouchableOpacity
            style={styles.payButton}
            activeOpacity={0.88}
            onPress={handlePayNow}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>
                Authorize & Pay ₹{bookingData.total_amount.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#160824',
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#160824',
  },
  container: {
    flex: 1,
    backgroundColor: '#160824',
  },
  scrollContent: {
    padding: 16,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 40,
  },
  payableCard: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  payableLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.goldLight,
    letterSpacing: 1.2,
  },
  payableAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  payableSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  methodsList: {
    gap: 10,
  },
  methodCard: {
    backgroundColor: 'rgba(37, 12, 35, 0.85)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  methodCardActive: {
    borderColor: COLORS.goldLight,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodEmoji: {
    fontSize: 20,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  methodDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.goldLight,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.goldLight,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
