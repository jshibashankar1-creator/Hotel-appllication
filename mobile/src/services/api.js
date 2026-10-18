import { Platform } from 'react-native';

const LAN_API_URL = 'http://192.168.1.2:5000/api';
const EMULATOR_API_URL = 'http://10.0.2.2:5000/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

const DEFAULT_URL = 'https://hotel-appllication.onrender.com/api';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

class MobileApiService {
  constructor() {
    this.token = null;
    this.currentUser = null;
  }

  setToken(token, user) {
    this.token = token;
    this.currentUser = user;
  }

  async logout() {
    try {
      if (this.token) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      console.warn('[Mobile API] Logout API error:', e.message);
    } finally {
      this.token = null;
      this.currentUser = null;
    }
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Mobile API error');
      }
      return data;
    } catch (err) {
      console.warn(`[Mobile API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- AUTH ---
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, requiredRole: 'customer' })
    });
    this.setToken(data.token, data.user);
    return data;
  }

  async register(name, email, password, phone) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role: 'customer' })
    });
    this.setToken(data.token, data.user);
    return data;
  }

  // --- HOTELS ---
  async searchHotels(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hotels?${query}`);
  }

  async getHotelDetails(id) {
    return this.request(`/hotels/${id}`);
  }

  // --- BOOKING & PAYMENTS ---
  async createRazorpayOrder(payload) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async verifyRazorpayPayment(payload) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createBooking(payload) {
    return this.request('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async getBookingDetails(id) {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id, reason) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // --- REVIEWS ---
  async submitReview(payload) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- SUPPORT ---
  async getMyTickets() {
    return this.request('/support/tickets');
  }

  async createTicket(payload) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async replyTicket(id, text) {
    return this.request(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  // ============================================================================
  // CUSTOMER PROFILE & SETTINGS
  // ============================================================================
  async getProfile() {
    const res = await this.request('/auth/profile');
    if (res.user) {
      this.currentUser = { ...this.currentUser, ...res.user };
    }
    return res;
  }

  async updateProfile(data) {
    const res = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.user) {
      this.currentUser = { ...this.currentUser, ...res.user };
    }
    return res;
  }

  async getSettings() {
    return this.request('/auth/settings');
  }

  async updateSettings(data) {
    return this.request('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ============================================================================
  // WISHLIST, OFFERS, REWARDS, MEMBERSHIP, PAYMENT METHODS
  // ============================================================================
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addWishlist(hotelId) {
    return this.request(`/wishlist/${hotelId}`, { method: 'POST' });
  }

  async removeWishlist(hotelId) {
    return this.request(`/wishlist/${hotelId}`, { method: 'DELETE' });
  }

  async getOffers() {
    return this.request('/offers');
  }

  async getRewards() {
    return this.request('/rewards');
  }

  async getMembership() {
    return this.request('/membership');
  }

  async getPaymentMethods() {
    return this.request('/payment-methods');
  }

  // --- FOOD & BANNERS ---
  async getFoodItems() {
    return this.request('/food');
  }

  async getBanners() {
    return this.request('/banners');
  }
}

export const mobileApi = new MobileApiService();
