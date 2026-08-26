const rawApiUrl = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.replace(/\/$/, '').endsWith('/api') ? rawApiUrl.replace(/\/$/, '') : `${rawApiUrl.replace(/\/$/, '')}/api`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('hotelhub_auth_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('hotelhub_current_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.currentUser = user;
    if (token) {
      localStorage.setItem('hotelhub_auth_token', token);
      localStorage.setItem('hotelhub_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hotelhub_auth_token');
      localStorage.removeItem('hotelhub_current_user');
    }
  }

  clearSession() {
    this.setSession(null, null);
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.message || `API request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      if (!options.silent) {
        console.error(`API Error on ${endpoint}:`, err.message);
      }
      throw err;
    }
  }

  // --- AUTH ---
  async login(email, password, requiredRole = null) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, requiredRole })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async adminLogin(email, password) {
    return this.login(email, password);
  }

  async hotelAdminLogin(email, password) {
    return this.login(email, password);
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token && data.user && data.user.status === 'active') {
      this.setSession(data.token, data.user);
    }
    return data;
  }

  async adminSetup(name, email, password, phone) {
    const data = await this.request('/auth/admin/setup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async adminCreate(adminData) {
    return this.request('/auth/admin/create', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async getMe() {
    try {
      const data = await this.request('/auth/me');
      this.currentUser = data.user;
      localStorage.setItem('hotelhub_current_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      this.clearSession();
      throw err;
    }
  }

  logout() {
    this.clearSession();
    return this.request('/auth/logout', { method: 'POST' }).catch(() => {});
  }

  // --- ADMIN PROFILE & MANAGEMENT ---
  async getAdminProfile() {
    return this.request('/admin/profile');
  }

  async updateAdminProfile(name, phone) {
    const data = await this.request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone })
    });
    if (data.user) {
      this.currentUser = { ...this.currentUser, ...data.user };
      localStorage.setItem('hotelhub_current_user', JSON.stringify(this.currentUser));
    }
    return data;
  }

  async changeAdminPassword(currentPassword, newPassword) {
    return this.request('/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async getAdminUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  async updateAdminUserStatus(id, status) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async updateAdminUserRole(id, role, permissions) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions })
    });
  }

  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  async getAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  // --- HOTELS ---
  async getHotels(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hotels${query ? `?${query}` : ''}`);
  }

  async getAdminHotels() {
    return this.request('/hotels/admin');
  }

  async getOwnerHotels() {
    return this.request('/hotels/owner');
  }

  async getHotelById(id) {
    return this.request(`/hotels/${id}`);
  }

  async onboardHotel(hotelData) {
    return this.request('/hotels/onboard', {
      method: 'POST',
      body: JSON.stringify(hotelData)
    });
  }

  async updateHotel(id, hotelData) {
    return this.request(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData)
    });
  }

  async updateHotelStatus(id, status) {
    return this.request(`/hotels/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // --- ROOMS ---
  async getRoomsByHotel(hotelId) {
    return this.request(`/rooms/hotel/${hotelId}`);
  }

  async createRoom(roomData) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  async deleteRoom(id) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }

  // --- AVAILABILITY ---
  async getRoomAvailability(roomId, startDate, endDate) {
    return this.request(`/availability/room/${roomId}?startDate=${startDate}&endDate=${endDate}`);
  }

  async toggleBlackoutDate(roomId, date, isBlocked) {
    return this.request('/availability/block', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, date, is_blocked: isBlocked })
    });
  }

  // --- BOOKINGS ---
  async createBooking(bookingData) {
    return this.request('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async getOwnerBookings() {
    return this.request('/bookings/owner');
  }

  async getAdminBookings() {
    return this.request('/bookings/admin');
  }

  async getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  async checkInBooking(id) {
    return this.request(`/bookings/${id}/checkin`, {
      method: 'PUT'
    });
  }

  async checkInGuest(id) {
    return this.checkInBooking(id);
  }

  async checkOutBooking(id) {
    return this.request(`/bookings/${id}/checkout`, {
      method: 'PUT'
    });
  }

  async checkOutGuest(id) {
    return this.checkOutBooking(id);
  }

  async cancelBooking(id, reason) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // --- PAYMENTS & REFUNDS ---
  async getAdminPayments() {
    return this.request('/payments/admin');
  }

  async getAdminRefunds() {
    return this.request('/refunds/admin');
  }

  async processRefund(refundId, status, admin_notes) {
    return this.request(`/refunds/${refundId}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes })
    });
  }

  // --- COMMISSIONS ---
  async getCommissionLedger() {
    return this.request('/commissions/ledger');
  }

  async getOwnerEarnings() {
    return this.request('/commissions/owner-earnings');
  }

  async updateCommissionRate(rate) {
    return this.request('/commissions/rate', {
      method: 'PUT',
      body: JSON.stringify({ rate })
    });
  }

  // --- REVIEWS ---
  async getReviews(hotelId) {
    return this.request(`/reviews/hotel/${hotelId}`);
  }

  async submitReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // --- SUPPORT TICKETS ---
  async getSupportTickets() {
    return this.request('/support/tickets');
  }

  async createSupportTicket(ticketData) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async replySupportTicket(id, text, new_status = null) {
    return this.request(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text, new_status })
    });
  }

  async updateSupportTicketStatus(id, status) {
    return this.request(`/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // --- HOTEL ADMIN API ---
  async getMe() {
    return this.request('/auth/me');
  }

  async getHotelAdminDashboard() {
    return this.request('/hotel-admin/dashboard');
  }

  async getHotelAdminKpis() {
    return this.request('/hotel-admin/dashboard');
  }

  async getHotelAdminHotel() {
    return this.request('/hotel-admin/hotel');
  }

  async getHotelAdminProperty() {
    return this.request('/hotel-admin/property');
  }

  async updateHotelAdminHotel(hotelData) {
    return this.request('/hotel-admin/hotel', {
      method: 'PUT',
      body: JSON.stringify(hotelData)
    });
  }

  async updateHotelAdminProperty(propertyData) {
    return this.request('/hotel-admin/property', {
      method: 'PUT',
      body: JSON.stringify(propertyData)
    });
  }

  async getHotelAdminRooms() {
    return this.request('/hotel-admin/rooms');
  }

  async createHotelAdminRoom(roomData) {
    return this.request('/hotel-admin/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  async updateHotelAdminRoom(id, roomData) {
    return this.request(`/hotel-admin/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  async deleteHotelAdminRoom(id) {
    return this.request(`/hotel-admin/rooms/${id}`, {
      method: 'DELETE'
    });
  }

  async getHotelAdminAvailability() {
    return this.request('/hotel-admin/availability');
  }

  async updateHotelAdminAvailability(data) {
    return this.request('/hotel-admin/availability', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getHotelAdminBookings() {
    return this.request('/hotel-admin/bookings');
  }

  async getHotelAdminCheckIns() {
    return this.request('/hotel-admin/check-ins');
  }

  async hotelAdminCheckIn(bookingId) {
    return this.request('/hotel-admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
  }

  async hotelAdminCheckOut(bookingId) {
    return this.request('/hotel-admin/check-out', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
  }

  async getHotelAdminEarnings() {
    return this.request('/hotel-admin/earnings');
  }

  async getHotelAdminSupport() {
    return this.request('/hotel-admin/support');
  }

  async getHotelAdminProfile() {
    return this.request('/hotel-admin/profile');
  }

  async updateHotelAdminProfile(profileData) {
    return this.request('/hotel-admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // --- OWNER KYC ---
  async getOwnerKYCList() {
    return this.request('/owners/kyc');
  }

  async getOwnersKyc() {
    return this.request('/owners/kyc');
  }

  async updateOwnerKYCStatus(userId, status, reason = null) {
    return this.request(`/owners/${userId}/kyc`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  // --- REPORTS & KPIS ---
  async getAdminKpis() {
    let res;
    try {
      res = await this.request('/reports/admin-kpis');
    } catch (e) {
      try {
        res = await this.request('/admin/kpis');
      } catch (e2) {
        try {
          res = await this.request('/admin/dashboard');
        } catch (e3) {
          res = { success: true, data: {}, kpis: {} };
        }
      }
    }

    const rawKpis = res?.kpis || res?.data || {};
    const totalHotels = rawKpis.total_hotels ?? rawKpis.totalHotels ?? 0;
    const verifiedHotels = rawKpis.verified_hotels ?? rawKpis.verifiedHotels ?? 0;
    const underReviewHotels = rawKpis.pending_hotels ?? rawKpis.underReviewHotels ?? 0;
    const totalBookings = rawKpis.total_bookings ?? rawKpis.totalBookings ?? 0;
    const todayBookings = rawKpis.todays_bookings ?? rawKpis.todayBookings ?? 0;
    const upcomingCheckIns = rawKpis.upcoming_checkins_count ?? rawKpis.upcomingCheckIns ?? 0;
    const grossPlatformVolume = rawKpis.total_gmv ?? rawKpis.grossPlatformVolume ?? 0;
    const netPlatformCommission = rawKpis.platform_revenue ?? rawKpis.netPlatformCommission ?? rawKpis.platformCommission ?? 0;
    const activeInHouseStays = rawKpis.active_in_house_stays ?? rawKpis.checked_in_bookings_count ?? rawKpis.activeInHouseStays ?? 0;
    const upcomingCheckOuts = rawKpis.upcoming_checkouts_count ?? rawKpis.upcomingCheckOuts ?? 0;
    const cancelledRefunded = rawKpis.cancelled_bookings_count ?? rawKpis.cancelledRefunded ?? 0;

    return {
      success: true,
      data: {
        totalHotels,
        verifiedHotels,
        underReviewHotels,
        totalBookings,
        todayBookings,
        upcomingCheckIns,
        grossPlatformVolume,
        netPlatformCommission,
        activeInHouseStays,
        upcomingCheckOuts,
        cancelledRefunded,
        pendingKYC: rawKpis.pending_kyc_count ?? rawKpis.pendingKYC ?? 0,
        pendingRefunds: rawKpis.pending_refunds_count ?? rawKpis.pendingRefunds ?? 0
      },
      kpis: {
        total_hotels: totalHotels,
        verified_hotels: verifiedHotels,
        pending_hotels: underReviewHotels,
        total_bookings: totalBookings,
        todays_bookings: todayBookings,
        total_gmv: grossPlatformVolume,
        platform_revenue: netPlatformCommission,
        active_in_house_stays: activeInHouseStays,
        checked_in_bookings_count: activeInHouseStays,
        upcoming_checkins_count: upcomingCheckIns,
        upcoming_checkouts_count: upcomingCheckOuts,
        cancelled_bookings_count: cancelledRefunded,
        pending_refunds_count: rawKpis.pending_refunds_count ?? rawKpis.pendingRefunds ?? 0,
        pending_kyc_count: rawKpis.pending_kyc_count ?? rawKpis.pendingKYC ?? 0
      }
    };
  }

  async getAdminKPIs() {
    return this.getAdminKpis();
  }

  async getOwnerKPIs() {
    return this.request('/reports/owner-kpis');
  }

  async getOwnerKpis() {
    return this.request('/reports/owner-kpis');
  }

  async getDailyReport() {
    return this.request('/reports/daily');
  }

  async getMonthlyReport() {
    return this.request('/reports/monthly');
  }

  // --- SETTINGS ---
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }
}

export const api = new ApiService();
export const getAdminKpis = () => api.getAdminKpis();
export const getOwnerKpis = () => api.getOwnerKPIs();
export default api;
