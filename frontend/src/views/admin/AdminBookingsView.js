import { api } from '../../services/api.js';

export async function renderAdminBookingsView(container) {
  let bookings = [];
  let searchQuery = '';
  let statusFilter = 'all';

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading bookings...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getAdminBookings();
      bookings = res.bookings;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    const filteredBookings = bookings.filter(b => {
      const matchSearch = b.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.hotel_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.booking_status === statusFilter;
      return matchSearch && matchStatus;
    });

    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
            <input type="text" id="booking-search-input" placeholder="Search by Booking ID, Guest, Hotel..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="booking-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Booking Statuses</option>
            <option value="confirmed" ${statusFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="checked_in" ${statusFilter === 'checked_in' ? 'selected' : ''}>Checked In</option>
            <option value="checked_out" ${statusFilter === 'checked_out' ? 'selected' : ''}>Checked Out</option>
            <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>

      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer & Phone</th>
                <th>Hotel & Room</th>
                <th>Dates & Nights</th>
                <th>Total Paid</th>
                <th>Commission (15%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings.map(b => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${new Date(b.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${b.customer_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${b.customer_phone || b.customer_email}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${b.hotel_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${b.room_name} (${b.guests_count} guests)</div>
                  </td>
                  <td>
                    <div style="font-size: 0.78rem;">${b.check_in_date} to ${b.check_out_date}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.nights} nights</div>
                  </td>
                  <td>
                    <div style="font-weight: 700;">₹${b.total_amount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.7rem; color: var(--status-success);">${b.payment_status}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--status-success);">₹${b.commission_amount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Owner: ₹${b.owner_payout.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span class="status-pill ${b.booking_status}">${b.booking_status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-view-invoice" data-booking-id="${b.id}">
                      <i data-lucide="file-text"></i> Invoice
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="booking-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#booking-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#booking-status-filter')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-view-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-booking-id');
        openInvoiceModal(bId);
      });
    });
  }

  function openInvoiceModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const modalRoot = container.querySelector('#booking-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 600px;">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.72rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">OFFICIAL BOOKING STATEMENT</span>
              <h2 class="modal-title">${booking.booking_code}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 14px; margin-bottom: 16px;">
              <div>
                <h3 style="font-size: 1.05rem;">${booking.hotel_name}</h3>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${booking.room_name} (${booking.guests_count} Guests)</div>
              </div>
              <div style="text-align: right;">
                <span class="status-pill ${booking.booking_status}">${booking.booking_status.replace('_', ' ')}</span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Booked on ${new Date(booking.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <!-- Customer Details -->
            <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 16px;">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Guest Profile</div>
              <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">${booking.customer_name}</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">${booking.customer_email} • ${booking.customer_phone}</div>
            </div>

            <!-- Financial Settlement -->
            <div style="background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px;">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">Itemized Tariff & Commission</div>
              
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Room Base Tariff (${booking.nights} nights):</span>
                <span>₹${booking.base_amount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Government Tax / GST (12%):</span>
                <span>₹${booking.tax_amount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; border-top: 1px solid var(--border-light); padding-top: 8px; margin-bottom: 10px;">
                <span>Total Amount Paid:</span>
                <span>₹${booking.total_amount.toLocaleString('en-IN')}</span>
              </div>

              <div style="background: var(--bg-surface); border: 1px dashed var(--color-accent-border); padding: 10px; border-radius: var(--radius-xs);">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: var(--status-success);">
                  <span>Platform Commission Share (15%):</span>
                  <span>+ ₹${booking.commission_amount.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: var(--color-primary); margin-top: 4px;">
                  <span>Hotel Owner Net Payout (85%):</span>
                  <span>₹${booking.owner_payout.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);
  }

  loadData();
}
