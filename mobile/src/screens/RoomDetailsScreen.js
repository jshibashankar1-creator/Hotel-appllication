import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function RoomDetailsScreen({ route, navigation }) {
  const { hotel, room } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: room.photos && room.photos[0] ? room.photos[0] : hotel.cover_image }}
          style={styles.heroImage}
        />

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.roomTypeBadge}>{room.room_type}</Text>
          </View>

          <Text style={styles.roomTitle}>{room.room_name}</Text>
          <Text style={styles.capacityText}>👥 Maximum Capacity: {room.max_guests} Guests</Text>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Room Features & Amenities</Text>
            <View style={styles.featureRow}><Text>🛏️ King Size Premium Mattress</Text></View>
            <View style={styles.featureRow}><Text>🚿 Marble En-Suite Bathroom with Rain Shower</Text></View>
            <View style={styles.featureRow}><Text>📶 Complimentary 1Gbps High-Speed Wi-Fi</Text></View>
            <View style={styles.featureRow}><Text>☕ In-room Espresso Machine & Tea Bar</Text></View>
            <View style={styles.featureRow}><Text>❄️ Smart Climate Control & Air Conditioning</Text></View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Room Overview</Text>
            <Text style={styles.descText}>{room.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Nightly Tariff</Text>
          <Text style={styles.priceValue}>₹{room.price_per_night.toLocaleString('en-IN')}<Text style={styles.gstText}> + 12% GST</Text></Text>
        </View>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookingReview', { hotel, room })}
        >
          <Text style={styles.bookBtnText}>CONTINUE TO BOOK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroImage: { width: '100%', height: 220, backgroundColor: COLORS.border },
  content: { padding: 18, paddingBottom: 100 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hotelName: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  roomTypeBadge: { fontSize: 10, fontWeight: '700', color: COLORS.accentDark, backgroundColor: COLORS.accentLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roomTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 4 },
  capacityText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  cardSection: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, marginBottom: 10 },
  featureRow: { paddingVertical: 4 },
  descText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 8 },
  priceLabel: { fontSize: 9, color: COLORS.textMuted, textTransform: 'uppercase' },
  priceValue: { fontSize: 17, fontWeight: '800', color: COLORS.textMain },
  gstText: { fontSize: 10, color: COLORS.textMuted, fontWeight: 'normal' },
  bookBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  bookBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }
});
