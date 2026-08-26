import { api } from '../../services/api.js';

export async function renderOwnerDashboardView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading hotel dashboard...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const [dashRes, bookingsRes, hotelRes] = await Promise.all([
      api.getHotelAdminDashboard().catch(() => ({})),
      api.getHotelAdminBookings().catch(() => api.getOwnerBookings().catch(() => ({}))),
      api.getHotelAdminHotel().catch(() => api.getOwnerHotels().catch(() => ({})))
    ]);

    const kpis = dashRes?.kpis || dashRes?.data || {
      total_rooms: 0,
      available_rooms: 0,
      occupied_rooms: 0,
      upcoming_checkins_count: 0,
      todays_arrivals: 0,
      todays_departures: 0,
      hotel_revenue: 0
    };
    const bookings = bookingsRes?.bookings || [];
    const hotel = dashRes?.hotel || hotelRes?.hotel || (hotelRes?.hotels ? hotelRes.hotels[0] : null) || {};

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.check_in_date === todayStr && b.booking_status === 'confirmed');
    const todayDepartures = bookings.filter(b => b.check_out_date === todayStr && b.booking_status === 'checked_in');
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const netEarnings = bookings.reduce((sum, b) => sum + (b.owner_payout || Math.round(b.total_amount * 0.85)), 0);

    container.innerHTML = `
      <!-- Top Metrics Overview -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Available Rooms</span>
            <div class="metric-icon-box success"><i data-lucide="bed-double"></i></div>
          </div>
          <div class="metric-value">${kpis.available_rooms ?? kpis.total_rooms ?? 0} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">/ ${kpis.total_rooms ?? 0}</span></div>
          <div class="metric-footer">
            <span>${kpis.occupied_rooms ?? 0} Currently Occupied</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Today's Arrivals</span>
            <div class="metric-icon-box gold"><i data-lucide="user-check"></i></div>
          </div>
          <div class="metric-value">${kpis.upcoming_checkins_count ?? todayArrivals.length}</div>
          <div class="metric-footer">
            <a href="#/hotel-admin/check-in" style="color: var(--color-accent-dark); font-weight: 600;">Open Check-In Desk →</a>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Today's Check-Outs</span>
            <div class="metric-icon-box info"><i data-lucide="user-minus"></i></div>
          </div>
          <div class="metric-value">${todayDepartures.length}</div>
          <div class="metric-footer">
            <a href="#/hotel-admin/check-out" style="color: var(--color-primary); font-weight: 600;">Open Check-Out Desk →</a>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Hotel Net Earnings</span>
            <div class="metric-icon-box gold"><i data-lucide="wallet"></i></div>
          </div>
          <div class="metric-value">₹${netEarnings.toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span>85% Net Share (After 15% Platform Cut)</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Hubs -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 22px;">
        <a href="#/owner/check-in" class="panel-card" style="margin-bottom: 0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s ease;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
            <i data-lucide="log-in" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Guest Check-In</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Verify Booking ID & Check-in</div>
          </div>
        </a>

        <a href="#/owner/check-out" class="panel-card" style="margin-bottom: 0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s ease;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
            <i data-lucide="log-out" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Guest Check-Out</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Settle bill & release room</div>
          </div>
        </a>

        <a href="#/owner/availability" class="panel-card" style="margin-bottom: 0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s ease;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
            <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Live Availability</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Manage room blocks & dates</div>
          </div>
        </a>

        <a href="#/owner/earnings" class="panel-card" style="margin-bottom: 0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s ease;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
            <i data-lucide="wallet" style="width: 20px; height: 20px;"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Payout Ledger</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">View net disbursements</div>
          </div>
        </a>
      </div>

      <!-- Upcoming Bookings Table -->
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 16px 20px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Hotel Guest Bookings</h2>
            <p>Arrivals and in-house guests for your properties</p>
          </div>
          <a href="#/owner/bookings" class="btn btn-secondary btn-sm">All Bookings</a>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Details</th>
                <th>Room Type</th>
                <th>Check-In Date</th>
                <th>Check-Out Date</th>
                <th>Gross Paid</th>
                <th>Owner Net Share</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No bookings found for your property yet.</td></tr>
              ` : bookings.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${b.customer_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.customer_phone || b.customer_email}</div>
                  </td>
                  <td>${b.room_name} (${b.guests_count} Guests)</td>
                  <td><strong style="color: var(--color-primary);">${b.check_in_date}</strong></td>
                  <td>${b.check_out_date} (${b.nights}n)</td>
                  <td>₹${b.total_amount.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 700; color: var(--status-success);">₹${b.owner_payout.toLocaleString('en-IN')}</td>
                  <td><span class="status-pill ${b.booking_status}">${b.booking_status.replace('_', ' ')}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
