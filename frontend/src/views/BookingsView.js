import { store } from '../services/store.js';

export function renderBookingsView(container) {
  let bookings = store.getBookings();
  let statusFilter = 'all';
  let searchQuery = '';
  let hotelFilter = 'all';

  function render() {
    const hotels = store.getHotels();
    const filteredBookings = bookings.filter(b => {
      const matchSearch = b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
      const matchHotel = hotelFilter === 'all' || b.hotelId === hotelFilter;
      return matchSearch && matchStatus && matchHotel;
    });

    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="booking-search-input" placeholder="Search by Booking ID, Guest, Hotel..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="booking-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Booking Statuses</option>
            <option value="confirmed" ${statusFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="checked-in" ${statusFilter === 'checked-in' ? 'selected' : ''}>Checked In</option>
            <option value="checked-out" ${statusFilter === 'checked-out' ? 'selected' : ''}>Checked Out</option>
            <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>

          <select class="select-filter" id="booking-hotel-filter">
            <option value="all" ${hotelFilter === 'all' ? 'selected' : ''}>All Hotels</option>
            ${hotels.map(h => `<option value="${h.id}" ${hotelFilter === h.id ? 'selected' : ''}>${h.name}</option>`).join('')}
          </select>
        </div>

        <div class="filter-group">
          <button class="btn btn-secondary" id="btn-export-bookings">
            <i data-lucide="download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest & Contact</th>
                <th>Hotel & Room</th>
                <th>Dates & Nights</th>
                <th>Total Paid</th>
                <th>Commission (15%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No bookings found matching your search.
                  </td>
                </tr>
              ` : filteredBookings.map(b => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.95rem;">${b.bookingId}</span>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${new Date(b.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${b.customerName}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${b.customerEmail}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${b.customerPhone}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${b.hotelName}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${b.roomType} (${b.guests} Guests)</div>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem; font-weight: 600;">${b.checkInDate}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">to ${b.checkOutDate} (${b.nights} ${b.nights === 1 ? 'night' : 'nights'})</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">₹${b.totalAmount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.paymentMethod}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--success);">₹${b.commissionAmount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Owner: ₹${b.ownerPayoutAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span class="status-badge ${b.bookingStatus}">${b.bookingStatus}</span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-inspect-booking" data-booking-id="${b.bookingId}">
                      <i data-lucide="file-text"></i> Invoice
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Booking Detail Modal Root -->
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

    container.querySelector('#booking-hotel-filter')?.addEventListener('change', (e) => {
      hotelFilter = e.target.value;
      render();
    });

    container.querySelector('#btn-export-bookings')?.addEventListener('click', () => {
      store.exportToCSV('bookings');
      window.showToast('Bookings report exported to CSV.', 'info');
    });

    container.querySelectorAll('.btn-inspect-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-booking-id');
        openBookingModal(bId);
      });
    });
  }

  function openBookingModal(bookingId) {
    const booking = store.getBooking(bookingId);
    if (!booking) return;

    const modalRoot = container.querySelector('#booking-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="booking-detail-modal">
        <div class="modal-container" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.75rem; font-family: monospace; color: var(--primary); font-weight: 700;">OFFICIAL BOOKING INVOICE</div>
              <h2 class="modal-title">Booking ${booking.bookingId}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body" id="invoice-printable">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
              <div>
                <h3 style="color: #fff; font-size: 1.1rem;">${booking.hotelName}</h3>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Room: ${booking.roomType} (${booking.rooms} Room, ${booking.guests} Guests)</div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Txn Ref: ${booking.transactionId}</div>
              </div>
              <div style="text-align: right;">
                <span class="status-badge ${booking.bookingStatus}">${booking.bookingStatus}</span>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Created: ${new Date(booking.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <!-- Customer Details Box -->
            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
              <h4 style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Guest Details</h4>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div style="font-weight: 700; color: #fff;">${booking.customerName}</div>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">${booking.customerEmail}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 600; color: #fff;">${booking.customerPhone}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Payment: ${booking.paymentMethod}</div>
                </div>
              </div>
            </div>

            <!-- Stay Schedule -->
            <div class="form-grid" style="margin-bottom: 20px;">
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Check-In Date</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-top: 4px;">${booking.checkInDate}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Standard check-in: 02:00 PM</div>
              </div>
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Check-Out Date</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-top: 4px;">${booking.checkOutDate}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Standard check-out: 11:00 AM (${booking.nights} nights)</div>
              </div>
            </div>

            <!-- Financial Settlement Ledger -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px;">Financial Ledger & Commission Split</h4>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.88rem;">
                <span style="color: var(--text-secondary);">Room Base Tariff (${booking.nights} nights)</span>
                <span style="color: var(--text-main);">₹${booking.baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.88rem;">
                <span style="color: var(--text-secondary);">GST / Government Taxes (12%)</span>
                <span style="color: var(--text-main);">₹${booking.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 8px;">
                <span style="color: #fff;">Gross Total Paid by Customer</span>
                <span style="color: #fff;">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div style="background: rgba(99, 102, 241, 0.1); border: 1px dashed rgba(99, 102, 241, 0.3); border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: var(--primary);">
                  <span>Platform Commission Share (${booking.commissionRate}%)</span>
                  <span>+ ₹${booking.commissionAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: var(--success); margin-top: 4px;">
                  <span>Hotel Owner Net Payout (85%)</span>
                  <span>₹${booking.ownerPayoutAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.82rem; color: var(--text-secondary);">
              Admin Operational Status:
            </span>
            <select class="select-filter" id="modal-update-status" style="font-size: 0.8rem; padding: 6px 10px;">
              <option value="confirmed" ${booking.bookingStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="checked-in" ${booking.bookingStatus === 'checked-in' ? 'selected' : ''}>Checked In</option>
              <option value="checked-out" ${booking.bookingStatus === 'checked-out' ? 'selected' : ''}>Checked Out</option>
              <option value="cancelled" ${booking.bookingStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-primary btn-sm" id="modal-save-status">Update Status</button>
            <button class="btn btn-secondary btn-sm" id="modal-close-action">Close</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => {
      modalRoot.innerHTML = '';
    };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#modal-save-status')?.addEventListener('click', () => {
      const newStatus = modalRoot.querySelector('#modal-update-status').value;
      store.updateBookingStatus(bookingId, newStatus);
      bookings = store.getBookings();
      window.showToast(`Booking ${bookingId} status updated to ${newStatus.toUpperCase()}`, 'success');
      closeModal();
      render();
    });
  }

  // Initial render
  render();
}
