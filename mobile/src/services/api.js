import { Platform } from 'react-native';

const CANDIDATE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  'http://localhost:5000/api',
  'http://10.0.2.2:5000/api',
  'http://192.168.1.2:5000/api',
].filter(Boolean);

let activeBaseUrl = CANDIDATE_URLS[0] || 'http://10.0.2.2:5000/api';

class MobileApiService {
  constructor() {
    this.token = null;
    this.currentUser = null;
    this.authListeners = [];
  }

  onAuthChange(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notifyAuthChange() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser, this.token); } catch (_) {}
    });
  }

  setToken(token, user) {
    this.token = token;
    this.currentUser = user;
    this.notifyAuthChange();
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    this.notifyAuthChange();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Try active base url first, then fallback through candidate URLs if needed
    const urlsToTry = [activeBaseUrl, ...CANDIDATE_URLS.filter(u => u !== activeBaseUrl)];
    let lastError = null;

    for (const baseUrl of urlsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'API request failed');
        }

        // Remember working URL
        activeBaseUrl = baseUrl;
        return data;
      } catch (err) {
        lastError = err;
        // Continue loop to try next candidate
      }
    }

    console.warn(`[Mobile API] Error on ${endpoint}:`, lastError?.message);
    throw lastError || new Error('Network error: Backend unreachable');
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

  async getHotelPickupSettings(hotelId) {
    return this.request(`/hotels/${hotelId}/pickup-settings`);
  }

  // --- BOOKING & PAYMENTS ---
  async createBooking(payload) {
    return this.request('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getBookingPickup(bookingId) {
    return this.request(`/pickups/${bookingId}`);
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
}

export const mobileApi = new MobileApiService();
