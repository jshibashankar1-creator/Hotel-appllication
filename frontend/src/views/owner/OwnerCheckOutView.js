import { api } from '../../services/api.js';

export async function renderOwnerCheckOutView(container) {
  let inHouseStays = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading in-house guests...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getOwnerBookings();
      inHouseStays = res.bookings.filter(b => b.booking_status === 'checked_in');
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
            <h2>Active In-House Stays (${inHouseStays.length})</h2>
            <p>Guests currently occupying hotel rooms</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Name</th>
                <th>Room Type</th>
                <th>Check-In Date</th>
                <th>Scheduled Departure</th>
                <th>Total Paid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${inHouseStays.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">No active in-house guests currently staying.</td></tr>
              ` : inHouseStays.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${b.customer_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.customer_phone || b.customer_email}</div>
                  </td>
                  <td>${b.room_name}</td>
                  <td>${b.check_in_date}</td>
                  <td><strong style="color: var(--status-warning);">${b.check_out_date}</strong></td>
                  <td style="font-weight: 700;">₹${b.total_amount.toLocaleString('en-IN')}</td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-confirm-checkout" data-booking-id="${b.id}" data-guest-name="${b.customer_name}">
                      <i data-lucide="log-out"></i> Complete Check-Out
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelectorAll('.btn-confirm-checkout').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bId = btn.getAttribute('data-booking-id');
        const guest = btn.getAttribute('data-guest-name');
        try {
          await api.checkOutGuest(bId);
          window.showToast(`Guest ${guest} checked out. Room released to inventory!`, 'success');
          loadData();
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      });
    });
  }

  loadData();
}
