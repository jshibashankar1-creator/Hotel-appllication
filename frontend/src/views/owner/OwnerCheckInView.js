import { api } from '../../services/api.js';

export async function renderOwnerCheckInView(container) {
  let bookings = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading arrivals...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getOwnerBookings();
      bookings = res.bookings.filter(b => b.booking_status === 'confirmed');
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <!-- Fast Check-In Search Widget -->
      <div class="panel-card" style="max-width: 620px; margin-bottom: 24px;">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Front Desk Guest Check-In</h2>
            <p>Enter 9-digit Booking Reference or Guest Name to locate reservation</p>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <input type="text" class="form-input" id="checkin-search-id" placeholder="e.g. HTL-94021 or Aarav Sharma">
          <button class="btn btn-primary" id="btn-find-booking">Search Reservation</button>
        </div>
      </div>

      <!-- Confirmed Arrivals Queue -->
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 16px 20px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Pending Guest Arrivals (${bookings.length})</h2>
            <p>Confirmed reservations scheduled for check-in</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Name & Phone</th>
                <th>Room Reserved</th>
                <th>Check-In Date</th>
                <th>Nights & Guests</th>
                <th>Total Paid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">No pending guest arrivals for check-in.</td></tr>
              ` : bookings.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${b.customer_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.customer_phone || b.customer_email}</div>
                  </td>
                  <td>${b.room_name}</td>
                  <td><strong style="color: var(--color-primary);">${b.check_in_date}</strong></td>
                  <td>${b.nights} nights (${b.guests_count} guests)</td>
                  <td style="font-weight: 700;">₹${b.total_amount.toLocaleString('en-IN')}</td>
                  <td>
                    <button class="btn btn-success btn-sm btn-confirm-checkin" data-booking-id="${b.id}" data-guest-name="${b.customer_name}">
                      <i data-lucide="check-circle-2"></i> Complete Check-In
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
    container.querySelectorAll('.btn-confirm-checkin').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bId = btn.getAttribute('data-booking-id');
        const guest = btn.getAttribute('data-guest-name');
        try {
          await api.checkInGuest(bId);
          window.showToast(`Guest ${guest} checked in successfully!`, 'success');
          loadData();
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      });
    });

    container.querySelector('#btn-find-booking')?.addEventListener('click', () => {
      const q = container.querySelector('#checkin-search-id').value.trim().toLowerCase();
      if (!q) return;
      const found = bookings.filter(b => b.booking_code.toLowerCase().includes(q) || b.customer_name.toLowerCase().includes(q));
      if (found.length === 0) {
        window.showToast('No reservation matching that reference was found.', 'error');
      } else {
        window.showToast(`Found reservation for ${found[0].customer_name}!`, 'info');
      }
    });
  }

  loadData();
}
