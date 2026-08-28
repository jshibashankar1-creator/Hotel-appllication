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
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { hotel, room, bookingData } = route.params;
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Official Razorpay Checkout WebView State
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Financial Breakdown calculations
  const nights = bookingData.nights || 3;
  const roomPricePerNight = room.price || room.price_per_night || 8500;
  const roomCharges = roomPricePerNight * nights;
  const gstCharges = Math.round(roomCharges * 0.12);
  const pickupFare = 0; // Pickup is 100% FREE
  const discountAmount = 0;
  const totalAmount = roomCharges + gstCharges - discountAmount;

  // 1. Customer taps "PAY NOW" -> Creates Real Razorpay Test Order & Opens Official Checkout
  const handlePayNow = async () => {
    if (processing || verifying) return;

    try {
      setProcessing(true);
      setErrorMessage(null);

      // Create authentic Razorpay Order on server
      const orderPayload = {
        hotel_id: hotel.id || hotel._id || 'HTL-001',
        room_id: room.id || room._id || 'RM-101',
        check_in_date: bookingData.check_in_date || '2026-09-20',
        check_out_date: bookingData.check_out_date || '2026-09-23',
        guests_count: bookingData.guests_count || 2,
        pickup: bookingData.pickup || { required: false }
      };

      const orderRes = await mobileApi.createPaymentOrder(orderPayload);

      if (!orderRes || !orderRes.success || !orderRes.order_id) {
        throw new Error(orderRes?.message || 'Failed to create Razorpay payment order.');
      }

      setRazorpayOrder(orderRes);
      setShowRazorpayCheckout(true);
    } catch (err) {
      setErrorMessage(err.message || 'Payment initiation failed. Please check network and retry.');
    } finally {
      setProcessing(false);
    }
  };

  // 2. Handle Message from Official Razorpay Checkout WebView
  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📡 Razorpay Official Checkout message:', data.event);

      if (data.event === 'SUCCESS') {
        setShowRazorpayCheckout(false);
        setVerifying(true);

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;

        // Send to backend for cryptographic HMAC-SHA256 signature verification
        const verifyRes = await mobileApi.verifyPayment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          hotel_id: hotel.id || 'HTL-001',
          room_id: room.id || 'RM-101',
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          guests_count: bookingData.guests_count || 2,
          customer_name: bookingData.customer_name,
          customer_email: bookingData.customer_email,
          customer_phone: bookingData.customer_phone,
          payment_method: 'Razorpay Official Checkout',
          pickup: razorpayOrder?.pickup || bookingData.pickup
        });

        if (!verifyRes || !verifyRes.success || !verifyRes.booking) {
          throw new Error(verifyRes?.message || 'Server signature verification rejected payment.');
        }

        // Navigate to confirmed booking screen
        navigation.replace('BookingConfirmation', {
          hotel,
          room,
          booking: verifyRes.booking,
          payment: verifyRes.payment
        });
      } else if (data.event === 'CANCELLED') {
        setShowRazorpayCheckout(false);
        setErrorMessage('Payment cancelled by customer. No amount was deducted.');
      } else if (data.event === 'FAILED') {
        setShowRazorpayCheckout(false);
        setErrorMessage(data.error?.description || 'Razorpay payment was declined by issuing bank simulator.');
      }
    } catch (err) {
      setShowRazorpayCheckout(false);
      setErrorMessage(err.message || 'Payment processing error.');
    } finally {
      setVerifying(false);
    }
  };

  // Generate Official Razorpay Standard Checkout HTML
  const getRazorpayCheckoutHtml = () => {
    if (!razorpayOrder) return '<html><body>Loading Razorpay...</body></html>';

    const keyId = razorpayOrder.key_id || 'rzp_test_TS38Ger2YMCfWh';
    const amountPaise = razorpayOrder.amount_paise || (totalAmount * 100);
    const orderId = razorpayOrder.order_id;
    const customerName = bookingData.customer_name || 'Aarav Sharma';
    const customerEmail = bookingData.customer_email || 'aarav.sharma@gmail.com';
    const customerPhone = bookingData.customer_phone || '+919820011928';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Razorpay Official Checkout</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            background-color: #0D1117;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #FFFFFF;
          }
          .loader-box {
            text-align: center;
            padding: 24px;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(212, 175, 55, 0.2);
            border-top: 4px solid #D4AF37;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .title { font-size: 16px; font-weight: 700; color: #D4AF37; margin-bottom: 6px; }
          .sub { font-size: 12px; color: #8B949E; }
          .btn-cancel {
            margin-top: 24px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFF;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="loader-box">
          <div class="spinner"></div>
          <div class="title">Opening Official Razorpay Checkout...</div>
          <div class="sub">Order ID: ${orderId}</div>
          <button class="btn-cancel" onclick="cancelPayment()">Cancel Payment</button>
        </div>

        <script>
          function cancelPayment() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'CANCELLED' }));
            }
          }

          var options = {
            "key": "${keyId}",
            "amount": "${amountPaise}",
            "currency": "INR",
            "name": "HotelHub Enterprise",
            "description": "${hotel.name || 'Luxury Hotel Booking'}",
            "image": "https://cdn.razorpay.com/static/assets/logo/rzp.png",
            "order_id": "${orderId}",
            "prefill": {
              "name": "${customerName}",
              "email": "${customerEmail}",
              "contact": "${customerPhone}"
            },
            "theme": {
              "color": "#4A1738"
            },
            "modal": {
              "backdropclose": false,
              "escape": false,
              "handleback": true,
              "ondismiss": function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'CANCELLED' }));
                }
              }
            },
            "handler": function (response) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: 'SUCCESS',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }));
              }
            }
          };

          var rzp = new Razorpay(options);

          rzp.on('payment.failed', function (response) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: 'FAILED',
                error: response.error
              }));
            }
          });

          window.onload = function() {
            try {
              rzp.open();
            } catch (err) {
              console.error('Error opening Razorpay checkout:', err);
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER BADGE */}
        <View style={styles.gatewayHeaderBadge}>
          <Text style={styles.gatewayBadgeText}>⚡ OFFICIAL RAZORPAY TEST GATEWAY</Text>
        </View>

        {/* BOOKING SUMMARY HERO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>BOOKING SUMMARY</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Hotel</Text>
            <Text style={styles.summaryValue}>{hotel.name}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Room</Text>
            <Text style={styles.summaryValue}>{room.name || room.room_name || 'Luxury Suite'}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Stay Dates</Text>
            <Text style={styles.summaryValue}>{bookingData.check_in_date} → {bookingData.check_out_date} ({nights} Nights)</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{bookingData.guests_count || 2} Adults</Text>
          </View>
        </View>

        {/* PRICE BREAKDOWN CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PRICE BREAKDOWN</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Room Charges ({nights} Nights)</Text>
            <Text style={styles.summaryValue}>₹{roomCharges.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Goods & Services Tax (GST 12%)</Text>
            <Text style={styles.summaryValue}>₹{gstCharges.toLocaleString('en-IN')}</Text>
          </View>

          {bookingData.pickup?.required ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                🚗 Pickup Transfer (Station to Hotel)
              </Text>
              <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>FREE (₹0)</Text>
            </View>
          ) : (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pickup Transfer</Text>
              <Text style={[styles.summaryValue, { color: COLORS.textMuted }]}>Not Selected (₹0)</Text>
            </View>
          )}

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Promotional Discount</Text>
            <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>-₹0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
              <Text style={styles.totalSub}>All taxes & hotel charges included</Text>
            </View>
            <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* ERROR BOX */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* SECURITY ASSURANCE */}
        <View style={styles.securityBadge}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Secured by Razorpay • 256-Bit SSL Encryption • PCI-DSS Level 1
          </Text>
        </View>

        {/* PAY NOW BUTTON */}
        <TouchableOpacity
          style={[styles.payButton, (processing || verifying) && { opacity: 0.7 }]}
          activeOpacity={0.88}
          onPress={handlePayNow}
          disabled={processing || verifying}
        >
          {processing ? (
            <ActivityIndicator color={COLORS.primaryDark} />
          ) : (
            <Text style={styles.payButtonText}>
              PAY NOW • ₹{totalAmount.toLocaleString('en-IN')} →
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* OFFICIAL RAZORPAY CHECKOUT WEBVIEW MODAL */}
      <Modal
        visible={showRazorpayCheckout}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowRazorpayCheckout(false);
          setErrorMessage('Payment was cancelled.');
        }}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
          
          {/* Top Bar with Cancel Option */}
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>RAZORPAY SECURE CHECKOUT</Text>
            <TouchableOpacity
              onPress={() => {
                setShowRazorpayCheckout(false);
                setErrorMessage('Payment cancelled by customer.');
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Official Razorpay Checkout Engine */}
          <WebView
            source={{ html: getRazorpayCheckoutHtml() }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.loadingText}>Initializing Razorpay Secure Modal...</Text>
              </View>
            )}
            style={styles.webView}
          />
        </SafeAreaView>
      </Modal>

      {/* VERIFYING OVERLAY */}
      {verifying ? (
        <View style={styles.verifyingOverlay}>
          <View style={styles.verifyingCard}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.verifyingTitle}>Verifying Payment...</Text>
            <Text style={styles.verifyingSub}>Cryptographically validating HMAC signature with Razorpay server</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

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
    padding: 16,
    paddingBottom: 40,
  },
  gatewayHeaderBadge: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 14,
  },
  gatewayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.6,
  },
  totalSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // WebView Modal Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  webViewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
  },

  // Verifying Overlay
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  verifyingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  verifyingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 14,
  },
  verifyingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
