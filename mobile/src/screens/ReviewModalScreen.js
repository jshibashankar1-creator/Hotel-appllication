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

export default function ReviewModalScreen({ route, navigation }) {
  const { booking } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Exceptional stay, world-class hospitality and pristine rooms.');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      await mobileApi.submitReview({
        hotel_id: booking.hotel_id,
        booking_id: booking.id,
        rating,
        comment
      });
      alert('Thank you! Your verified review has been published.');
      navigation.goBack();
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.hotelTitle}>{booking.hotel_name}</Text>
          <Text style={styles.roomSubtitle}>Stay from {booking.check_in_date} to {booking.check_out_date}</Text>
        </View>

        {/* Star Rating Picker */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>RATE YOUR OVERALL EXPERIENCE</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Text style={[styles.starIcon, star <= rating && styles.starIconActive]}>★</Text>
                <Text style={styles.starLabel}>{star}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Feedback */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DETAILED FEEDBACK</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            multiline
            placeholder="Share details of staff service, cleanliness, dining..."
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>PUBLISH VERIFIED REVIEW</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  header: { alignItems: 'center', marginVertical: 14 },
  hotelTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
  roomSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  starBtn: { alignItems: 'center' },
  starIcon: { fontSize: 32, color: COLORS.border },
  starIconActive: { color: COLORS.accent },
  starLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },
  commentInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    color: COLORS.textMain,
    minHeight: 90,
    textAlignVertical: 'top'
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }
});
