import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../theme/colors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePickerModal({
  visible,
  onClose,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialRooms = 1,
  onConfirm,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Default dates if not provided: tomorrow and 3 days later
  const defaultIn = initialCheckIn ? new Date(initialCheckIn) : new Date(today.getTime() + 86400000);
  const defaultOut = initialCheckOut ? new Date(initialCheckOut) : new Date(today.getTime() + 86400000 * 4);

  const [currentYear, setCurrentYear] = useState(defaultIn.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(defaultIn.getMonth());

  const [startDate, setStartDate] = useState(defaultIn);
  const [endDate, setEndDate] = useState(defaultOut);
  const [selectingState, setSelectingState] = useState('start'); // 'start' or 'end'

  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const handleDatePress = (dayNum) => {
    const selected = new Date(currentYear, currentMonth, dayNum);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) return; // Prevent selecting past dates

    if (selectingState === 'start' || selected < startDate) {
      setStartDate(selected);
      // Automatically set end date to next day if invalid
      const nextDay = new Date(selected);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay);
      setSelectingState('end');
    } else {
      if (isSameDay(selected, startDate)) return;
      setEndDate(selected);
      setSelectingState('start');
    }
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const diff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const formatDateShort = (d) => {
    if (!d) return '';
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  };

  const handleApply = () => {
    const nights = calculateNights();
    if (onConfirm) {
      onConfirm({
        checkInDate: startDate,
        checkOutDate: endDate,
        formattedCheckIn: formatDateShort(startDate),
        formattedCheckOut: formatDateShort(endDate),
        guestsCount: guests,
        roomsCount: rooms,
        nightsCount: nights,
        isoCheckIn: startDate.toISOString().split('T')[0],
        isoCheckOut: endDate.toISOString().split('T')[0],
      });
    }
    if (onClose) onClose();
  };

  // Render Calendar Grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarCells = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonth, day);
    cellDate.setHours(0, 0, 0, 0);

    const isPast = cellDate < today;
    const isStart = isSameDay(cellDate, startDate);
    const isEnd = isSameDay(cellDate, endDate);
    const inRange = isInRange(cellDate);

    calendarCells.push(
      <TouchableOpacity
        key={`day-${day}`}
        activeOpacity={0.7}
        disabled={isPast}
        style={[
          styles.dayCell,
          inRange && styles.dayInRange,
          isStart && styles.dayStart,
          isEnd && styles.dayEnd,
        ]}
        onPress={() => handleDatePress(day)}
      >
        <Text
          style={[
            styles.dayText,
            isPast && styles.dayTextPast,
            (isStart || isEnd) && styles.dayTextSelected,
            inRange && styles.dayTextInRange,
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Dates & Guests</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Range Selection Status Pill */}
            <View style={styles.statusPill}>
              <TouchableOpacity
                style={[styles.statusItem, selectingState === 'start' && styles.statusActive]}
                onPress={() => setSelectingState('start')}
              >
                <Text style={styles.statusLabel}>CHECK-IN</Text>
                <Text style={styles.statusVal}>{formatDateShort(startDate)}</Text>
              </TouchableOpacity>

              <View style={styles.nightsBadge}>
                <Text style={styles.nightsText}>{calculateNights()} N</Text>
              </View>

              <TouchableOpacity
                style={[styles.statusItem, selectingState === 'end' && styles.statusActive]}
                onPress={() => setSelectingState('end')}
              >
                <Text style={styles.statusLabel}>CHECK-OUT</Text>
                <Text style={styles.statusVal}>{formatDateShort(endDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Controls */}
            <View style={styles.monthHeader}>
              <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                <Text style={styles.navBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays Header */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={styles.weekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>{calendarCells}</View>

            {/* Guests & Rooms Selectors */}
            <View style={styles.countersSection}>
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Guests</Text>
                  <Text style={styles.counterSub}>Adults & Children</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setGuests(Math.max(1, guests - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterVal}>{guests}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setGuests(Math.min(10, guests + 1))}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Rooms</Text>
                  <Text style={styles.counterSub}>Standard / Suite</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setRooms(Math.max(1, rooms - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterVal}>{rooms}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setRooms(Math.min(5, rooms + 1))}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Confirm Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.88} onPress={handleApply}>
              <Text style={styles.applyBtnText}>
                CONFIRM {calculateNights()} NIGHT{calculateNights() > 1 ? 'S' : ''} STAY
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#160824',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  statusPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 6,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusActive: {
    backgroundColor: COLORS.burgundyPill,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  nightsBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nightsText: {
    color: '#160824',
    fontSize: 11,
    fontWeight: '900',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayInRange: {
    backgroundColor: 'rgba(90, 18, 43, 0.5)',
  },
  dayStart: {
    backgroundColor: COLORS.burgundyPill,
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
  },
  dayEnd: {
    backgroundColor: COLORS.burgundyPill,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayTextPast: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  dayTextSelected: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dayTextInRange: {
    color: COLORS.goldLight,
  },
  countersSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    gap: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  counterSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.burgundyPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  counterVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyBtn: {
    backgroundColor: COLORS.burgundyPill,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
