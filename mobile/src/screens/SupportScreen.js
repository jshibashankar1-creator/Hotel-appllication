import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function SupportScreen({ route, navigation }) {
  const defaultRef = route.params?.bookingRef || '';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Booking Inquiry');
  const [bookingRef, setBookingRef] = useState(defaultRef);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await mobileApi.getMyTickets();
      setTickets(res.tickets || []);
    } catch (err) {
      console.warn('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTicket = async () => {
    if (!subject || !message) {
      alert('Please fill out both Subject and Message.');
      return;
    }
    try {
      setSubmitting(true);
      await mobileApi.createTicket({
        subject,
        category,
        booking_code: bookingRef,
        message
      });
      setSubject('');
      setMessage('');
      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      alert(err.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>24/7 Guest Support</Text>
          <Text style={styles.headerSub}>Concierge and reservation assistance</Text>
        </View>
        <TouchableOpacity
          style={styles.newTicketBtn}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Text style={styles.newTicketBtnText}>{showCreate ? '✕ CLOSE' : '+ NEW TICKET'}</Text>
        </TouchableOpacity>
      </View>

      {/* New Ticket Form Accordion */}
      {showCreate ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>SUBMIT NEW INQUIRY</Text>

          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject (e.g. Early check-in inquiry)"
          />

          <TextInput
            style={styles.input}
            value={bookingRef}
            onChangeText={setBookingRef}
            placeholder="Booking ID (optional)"
          />

          <TextInput
            style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder="How can our support team assist you today?"
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleCreateTicket}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>SEND TO SUPPORT DESK</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Tickets List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Inquiries</Text>
          <Text style={styles.emptySubtitle}>If you need assistance with any reservation, tap "+ NEW TICKET" above.</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketCode}>{item.ticket_code}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                </View>
              </View>

              <Text style={styles.ticketSubject}>{item.subject}</Text>
              {item.booking_code ? (
                <Text style={styles.ticketRef}>Ref: {item.booking_code}</Text>
              ) : null}

              {/* Message Thread Preview */}
              <View style={styles.messagesWrap}>
                {item.messages && item.messages.map((m, i) => (
                  <View
                    key={i}
                    style={[
                      styles.msgBubble,
                      m.sender === 'admin' ? styles.adminMsg : styles.userMsg
                    ]}
                  >
                    <Text style={[styles.msgText, m.sender === 'admin' ? styles.adminText : styles.userText]}>
                      {m.text}
                    </Text>
                    <Text style={styles.msgTime}>{m.sender === 'admin' ? '🛡️ HotelHub Desk' : '👤 You'} • {m.time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  newTicketBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  newTicketBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  formCard: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 16
  },
  formTitle: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textMain,
    marginBottom: 8
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center'
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 11 },
  listContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  ticketCode: { fontSize: 12, fontFamily: 'monospace', fontWeight: '700', color: COLORS.primary },
  statusBadge: { backgroundColor: COLORS.surfaceSecondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', color: COLORS.textSecondary },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  ticketRef: { fontSize: 11, color: COLORS.textMuted, marginVertical: 2 },
  messagesWrap: { marginTop: 10, gap: 6 },
  msgBubble: { padding: 8, borderRadius: 6, maxWidth: '90%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  adminMsg: { alignSelf: 'flex-start', backgroundColor: COLORS.surfaceSecondary, borderWidth: 1, borderColor: COLORS.border },
  msgText: { fontSize: 12 },
  userText: { color: COLORS.white },
  adminText: { color: COLORS.textMain },
  msgTime: { fontSize: 9, opacity: 0.7, marginTop: 2, color: COLORS.textMuted }
});
