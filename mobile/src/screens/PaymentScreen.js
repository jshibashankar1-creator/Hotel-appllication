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

      // 1. Create Razorpay TEST Order via Backend
      const orderPayload = {
        hotel_id: bookingData.hotel_id,
        room_id: bookingData.room_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        rooms_count: bookingData.rooms_count || 1,
        guests_count: bookingData.guests_count,
        pickup: bookingData.pickup
      };

      const orderRes = await mobileApi.createRazorpayOrder(orderPayload);
      
      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Failed to initialize payment gateway.');
      }

      // 2. Open Razorpay Checkout (Web implementation)
      if (Platform.OS === 'web') {
        await new Promise((resolve, reject) => {
          if (window.Razorpay) return resolve();
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
          document.body.appendChild(script);
        });

        const options = {
          key: orderRes.key_id, // Safely using public key returned by backend
          amount: orderRes.amount_paise,
          currency: orderRes.currency,
          name: 'HotelHub',
          description: `Booking for ${orderRes.hotel.name}`,
          order_id: orderRes.order_id,
          handler: async function (response) {
            try {
              setProcessing(true);
              
              // 3. Backend Signature Verification & Atomic Booking
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                hotel_id: bookingData.hotel_id,
                room_id: bookingData.room_id,
                check_in_date: bookingData.check_in_date,
                check_out_date: bookingData.check_out_date,
                rooms_count: bookingData.rooms_count || 1,
                guests_count: bookingData.guests_count,
                customer_name: bookingData.customer_name,
                customer_email: bookingData.customer_email,
                customer_phone: bookingData.customer_phone,
                payment_method: selectedMethod,
                pickup: bookingData.pickup
              };
              
              const verifyRes = await mobileApi.verifyRazorpayPayment(verifyPayload);
              if (verifyRes && verifyRes.success) {
                // 4. Booking Confirmation
                navigation.replace('BookingConfirmation', {
                  hotel,
                  room,
                  booking: verifyRes.booking,
                });
              } else {
                setErrorMessage('Payment verification failed on server.');
                setProcessing(false);
              }
            } catch (verErr) {
              setErrorMessage(verErr.message || 'Payment verification error.');
              setProcessing(false);
            }
          },
          prefill: {
            name: bookingData.customer_name || 'Guest User',
            email: bookingData.customer_email || 'guest@hotelhub.com',
            contact: bookingData.customer_phone || '+919999999999'
          },
          theme: {
            color: '#8F1239'
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          setErrorMessage(response.error.description || 'Payment failed.');
          setProcessing(false);
        });
        rzp.open();
      } else {
        const RazorpayCheckout = require('react-native-razorpay').default;
        const options = {
          description: `Booking for ${orderRes.hotel.name}`,
          image: orderRes.hotel.coverImage || 'https://via.placeholder.com/150',
          currency: orderRes.currency,
          key: orderRes.key_id, // Safely using public key returned by backend
          amount: orderRes.amount_paise,
          name: 'HotelHub',
          order_id: orderRes.order_id,
          prefill: {
            email: bookingData.customer_email || 'guest@hotelhub.com',
            contact: bookingData.customer_phone || '+919999999999',
            name: bookingData.customer_name || 'Guest User'
          },
          theme: { color: '#8F1239' }
        };

        RazorpayCheckout.open(options).then(async (response) => {
          try {
            setProcessing(true);
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              hotel_id: bookingData.hotel_id,
              room_id: bookingData.room_id,
              check_in_date: bookingData.check_in_date,
              check_out_date: bookingData.check_out_date,
              rooms_count: bookingData.rooms_count || 1,
              guests_count: bookingData.guests_count,
              customer_name: bookingData.customer_name,
              customer_email: bookingData.customer_email,
              customer_phone: bookingData.customer_phone,
              payment_method: selectedMethod,
              pickup: bookingData.pickup
            };
            
            const verifyRes = await mobileApi.verifyRazorpayPayment(verifyPayload);
            if (verifyRes && verifyRes.success) {
              navigation.replace('BookingConfirmation', {
                hotel,
                room,
                booking: verifyRes.booking,
              });
            } else {
              setErrorMessage('Payment verification failed on server.');
              setProcessing(false);
            }
          } catch (verErr) {
            setErrorMessage(verErr.message || 'Payment verification error.');
            setProcessing(false);
          }
        }).catch((error) => {
          setErrorMessage(error.description || error.message || 'Payment failed or cancelled.');
          setProcessing(false);
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment initialization error. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      
      <View style={styles.responsiveWrapper}>
        <View style={styles.topBackground} />
        <View style={styles.bottomBackground} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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

          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              256-Bit SSL Encrypted PCI-DSS VIP Payment Gateway
            </Text>
          </View>

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
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: '#160824',
  },
  bottomBackground: {
    position: 'absolute',
    top: 380,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F6F8',
  },
  container: {
    flex: 1,
    zIndex: 1,
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

