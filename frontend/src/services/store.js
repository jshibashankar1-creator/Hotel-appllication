import {
  INITIAL_OWNERS,
  INITIAL_HOTELS,
  INITIAL_BOOKINGS,
  INITIAL_REFUNDS,
  INITIAL_TICKETS,
  INITIAL_DAILY_INCOME,
  INITIAL_MONTHLY_INCOME,
  INITIAL_SETTINGS
} from '../data/mockData.js';

const STORAGE_KEYS = {
  OWNERS: 'hh_admin_owners_v1',
  HOTELS: 'hh_admin_hotels_v1',
  BOOKINGS: 'hh_admin_bookings_v1',
  REFUNDS: 'hh_admin_refunds_v1',
  TICKETS: 'hh_admin_tickets_v1',
  DAILY_INCOME: 'hh_admin_daily_income_v1',
  MONTHLY_INCOME: 'hh_admin_monthly_income_v1',
  SETTINGS: 'hh_admin_settings_v1'
};

class StoreService {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.OWNERS)) {
      localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(INITIAL_OWNERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOTELS)) {
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(INITIAL_HOTELS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFUNDS)) {
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_INCOME)) {
      localStorage.setItem(STORAGE_KEYS.DAILY_INCOME, JSON.stringify(INITIAL_DAILY_INCOME));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MONTHLY_INCOME)) {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_INCOME, JSON.stringify(INITIAL_MONTHLY_INCOME));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((callback) => callback());
  }

  // --- OWNERS (KYC) ---
  getOwners() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNERS) || '[]');
  }

  getOwner(id) {
    return this.getOwners().find(o => o.id === id);
  }

  verifyOwner(id, status, reason = '') {
    const owners = this.getOwners();
    const index = owners.findIndex(o => o.id === id);
    if (index !== -1) {
      owners[index].verificationStatus = status;
      if (status === 'verified') {
        owners[index].verifiedAt = new Date().toISOString();
        owners[index].rejectionReason = null;
        owners[index].documents = owners[index].documents.map(d => ({ ...d, verified: true }));
        // Also activate their hotels if approved
        const hotels = this.getHotels();
        hotels.forEach(h => {
          if (h.ownerId === id && h.status === 'under_review') {
            h.status = 'active';
          }
        });
        localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
      } else if (status === 'rejected') {
        owners[index].rejectionReason = reason;
        owners[index].verifiedAt = null;
      }
      localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(owners));
      this.notify();
      return owners[index];
    }
    return null;
  }

  // --- HOTELS ---
  getHotels() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]');
  }

  getHotel(id) {
    return this.getHotels().find(h => h.id === id);
  }

  addHotel(hotelData) {
    const hotels = this.getHotels();
    const newId = `HTL-${String(hotels.length + 1).padStart(3, '0')}`;
    const newHotel = {
      id: newId,
      rating: 5.0,
      reviewsCount: 0,
      status: 'active',
      featured: false,
      gallery: [hotelData.coverImage],
      ...hotelData
    };
    hotels.unshift(newHotel);
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    this.notify();
    return newHotel;
  }

  updateHotel(id, updates) {
    const hotels = this.getHotels();
    const index = hotels.findIndex(h => h.id === id);
    if (index !== -1) {
      hotels[index] = { ...hotels[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
      this.notify();
      return hotels[index];
    }
    return null;
  }

  setHotelStatus(id, status) {
    return this.updateHotel(id, { status });
  }

  // --- BOOKINGS ---
  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  getBooking(bookingId) {
    return this.getBookings().find(b => b.bookingId === bookingId);
  }

  updateBookingStatus(bookingId, newStatus) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.bookingId === bookingId);
    if (index !== -1) {
      bookings[index].bookingStatus = newStatus;
      if (newStatus === 'cancelled') {
        bookings[index].paymentStatus = 'refunded';
      }
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      this.notify();
      return bookings[index];
    }
    return null;
  }

  // --- PAYMENTS & COMMISSIONS ---
  getPayments() {
    return this.getBookings().map(b => ({
      transactionId: b.transactionId,
      bookingId: b.bookingId,
      customerName: b.customerName,
      hotelName: b.hotelName,
      grossAmount: b.totalAmount,
      commissionRate: b.commissionRate,
      commissionAmount: b.commissionAmount,
      ownerPayoutAmount: b.ownerPayoutAmount,
      paymentMethod: b.paymentMethod,
      status: b.paymentStatus,
      date: b.createdAt
    }));
  }

  // --- REFUNDS ---
  getRefunds() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REFUNDS) || '[]');
  }

  processRefund(refundId, status, notes = '') {
    const refunds = this.getRefunds();
    const index = refunds.findIndex(r => r.refundId === refundId);
    if (index !== -1) {
      refunds[index].status = status;
      refunds[index].processedAt = new Date().toISOString();
      refunds[index].adminNotes = notes;
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));

      // Link with booking if approved
      if (status === 'approved') {
        const bookingId = refunds[index].bookingId;
        const bookings = this.getBookings();
        const bIdx = bookings.findIndex(b => b.bookingId === bookingId);
        if (bIdx !== -1) {
          bookings[bIdx].bookingStatus = 'cancelled';
          bookings[bIdx].paymentStatus = 'refunded';
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        }
      }

      this.notify();
      return refunds[index];
    }
    return null;
  }

  // --- CUSTOMER SUPPORT ---
  getTickets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
  }

  addTicketReply(ticketId, text, newStatus = null) {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.ticketId === ticketId);
    if (index !== -1) {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      tickets[index].messages.push({
        sender: 'admin',
        text: text,
        time: timeStr
      });

      if (newStatus) {
        tickets[index].status = newStatus;
      }
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
      this.notify();
      return tickets[index];
    }
    return null;
  }

  // --- FINANCIAL REPORTS ---
  getDailyIncome() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_INCOME) || '[]');
  }

  getMonthlyIncome() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MONTHLY_INCOME) || '[]');
  }

  // --- APP & PLATFORM SETTINGS ---
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_SETTINGS));
  }

  updateSettings(updates) {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- EXECUTIVE DASHBOARD METRICS ---
  getKPIs() {
    const bookings = this.getBookings();
    const hotels = this.getHotels();
    const owners = this.getOwners();
    const refunds = this.getRefunds();
    const tickets = this.getTickets();

    const totalGMV = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalCommission = bookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const activeHotels = hotels.filter(h => h.status === 'active').length;
    const pendingKYC = owners.filter(o => o.verificationStatus === 'pending').length;
    const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    return {
      totalGMV,
      totalCommission,
      totalBookings: bookings.length,
      activeHotels,
      totalHotels: hotels.length,
      pendingKYC,
      pendingRefunds,
      openTickets
    };
  }

  // --- EXPORT TO CSV ---
  exportToCSV(type = 'bookings') {
    let headers = [];
    let rows = [];
    let filename = `hotel_admin_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'bookings') {
      const bookings = this.getBookings();
      headers = ['Booking ID', 'Hotel Name', 'Customer Name', 'Check-In', 'Check-Out', 'Total Amount (INR)', 'Commission (INR)', 'Status'];
      rows = bookings.map(b => [
        b.bookingId,
        `"${b.hotelName.replace(/"/g, '""')}"`,
        `"${b.customerName}"`,
        b.checkInDate,
        b.checkOutDate,
        b.totalAmount,
        b.commissionAmount,
        b.bookingStatus
      ]);
    } else if (type === 'daily_income') {
      const daily = this.getDailyIncome();
      headers = ['Date', 'Bookings Count', 'Gross Revenue (INR)', 'Commission Earned (INR)', 'Owner Payout (INR)', 'Refunds (INR)'];
      rows = daily.map(d => [d.date, d.bookingsCount, d.grossAmount, d.commissionEarned, d.ownerPayout, d.refunds]);
    } else if (type === 'monthly_income') {
      const monthly = this.getMonthlyIncome();
      headers = ['Month', 'Total Bookings', 'Gross Revenue (INR)', 'Commission Earned (INR)', 'Owner Payout (INR)', 'Refunds (INR)'];
      rows = monthly.map(m => [m.month, m.bookingsCount, m.grossAmount, m.commissionEarned, m.ownerPayout, m.refunds]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- RESET DEMO DATA ---
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(INITIAL_OWNERS));
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(INITIAL_HOTELS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    localStorage.setItem(STORAGE_KEYS.DAILY_INCOME, JSON.stringify(INITIAL_DAILY_INCOME));
    localStorage.setItem(STORAGE_KEYS.MONTHLY_INCOME, JSON.stringify(INITIAL_MONTHLY_INCOME));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    this.notify();
  }
}

export const store = new StoreService();
