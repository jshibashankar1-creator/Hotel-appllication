import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function CancellationScreen({ route, navigation }) {
  const { booking } = route.params;
  const [reason, setReason] = useState('Change of travel schedule');
  const [submitting, setSubmitting] = useState(false);

  const feeAmount = Math.round(booking.total_amount * 0.10);
  const refundAmount = booking.total_amount - feeAmount;

  const handleCancelBooking = async () => {
    try {
      setSubmitting(true);
      await mobileApi.cancelBooking(booking.id, reason);
      navigation.navigate('Bookings');
    } catch (err) {
      alert(err.message || 'Failed to submit cancellation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Warning Banner */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Cancellation & Refund Policy</Text>
          <Text style={styles.warningText}>
            You are requesting cancellation for booking <Text style={{ fontWeight: '700' }}>{booking.booking_code}</Text> at {booking.hotel_name}.
          </Text>
        </View>

        {/* Refund Calculation Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>REFUND ESTIMATE (CREDITED IN 24-48 HRS)</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Amount Paid:</Text>
            <Text style={styles.val}>₹{booking.total_amount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: COLORS.danger }]}>Policy Cancellation Fee (10%):</Text>
            <Text style={[styles.val, { color: COLORS.danger }]}>- ₹{feeAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Estimated Net Refund:</Text>
            <Text style={styles.totalVal}>₹{refundAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>REASON FOR CANCELLATION</Text>
          
          {['Change of travel schedule', 'Found alternative accommodation', 'Medical / Personal emergency', 'Flight / Train cancelled'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonOption, reason === r && styles.reasonOptionActive]}
              onPress={() => setReason(r)}
            >
              <Text style={[styles.reasonText, reason === r && styles.reasonTextActive]}>
                {reason === r ? '◉ ' : '○ '} {r}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.customInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Or type specific reason..."
          />
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, submitting && styles.btnDisabled]}
          onPress={handleCancelBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.confirmBtnText}>CONFIRM CANCELLATION & REQUEST REFUND</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  warningCard: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: COLORS.warning, marginBottom: 4 },
  warningText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 12, color: COLORS.textMuted },
  val: { fontSize: 12, fontWeight: '600', color: COLORS.textMain },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6, paddingTop: 8 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  totalVal: { fontSize: 16, fontWeight: '800', color: COLORS.success },
  reasonOption: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  reasonOptionActive: { backgroundColor: COLORS.surfaceSecondary, borderRadius: 4 },
  reasonText: { fontSize: 13, color: COLORS.textSecondary },
  reasonTextActive: { color: COLORS.primary, fontWeight: '700' },
  customInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 12
  },
  confirmBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  btnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }
});
