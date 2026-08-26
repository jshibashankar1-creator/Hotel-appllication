import { api } from '../../services/api.js';

export async function renderOwnerBookingsView(container) {
  let bookings = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading bookings for your hotel...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getOwnerBookings();
      bookings = res.bookings;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 16px 20px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Hotel Guest Reservations (${bookings.length})</h2>
            <p>All active, confirmed, and past bookings for your registered hotel</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name & Phone</th>
                <th>Room Type</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Gross Paid</th>
                <th>Owner Net Share (85%)</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No bookings for your properties yet.</td></tr>
              ` : bookings.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${b.customer_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.customer_phone || b.customer_email}</div>
                  </td>
                  <td>${b.room_name} (${b.guests_count} Guests)</td>
                  <td><strong>${b.check_in_date}</strong></td>
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
  }

  loadData();
}
