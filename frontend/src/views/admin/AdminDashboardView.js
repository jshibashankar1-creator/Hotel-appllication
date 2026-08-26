import { api } from '../../services/api.js';

function formatDateRange(checkIn, checkOut, nights) {
  if (!checkIn || !checkOut) return '—';
  try {
    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    if (isNaN(dIn.getTime()) || isNaN(dOut.getTime())) {
      return `${checkIn} → ${checkOut}`;
    }
    const formattedIn = dIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedOut = dOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const nightText = nights ? ` • ${nights} ${nights === 1 ? 'night' : 'nights'}` : '';
    return `${formattedIn} → ${formattedOut}${nightText}`;
  } catch (e) {
    return `${checkIn} → ${checkOut}`;
  }
}

export async function renderAdminDashboardView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 48px 20px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 12px; color: var(--text-muted); font-size: 0.85rem;">Loading live platform metrics...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const [kpisRes, bookingsRes, refundsRes, kycRes, supportRes] = await Promise.all([
      api.getAdminKpis(),
      api.getAdminBookings(),
      api.getAdminRefunds(),
      api.getOwnersKyc(),
      api.getSupportTickets()
    ]);

    const kpis = kpisRes?.kpis || kpisRes?.data || {
      total_hotels: 0,
      verified_hotels: 0,
      pending_hotels: 0,
      total_bookings: 0,
      todays_bookings: 0,
      upcoming_checkins_count: 0,
      checked_in_bookings_count: 0,
      upcoming_checkouts_count: 0,
      cancelled_bookings_count: 0,
      total_gmv: 0,
      platform_revenue: 0,
      pending_refunds_count: 0,
      pending_kyc_count: 0
    };

    const bookings = (bookingsRes?.bookings || []).slice(0, 6);
    const pendingRefunds = (refundsRes?.refunds || []).filter(r => r.status === 'pending');
    const pendingKyc = (kycRes?.owners || []).filter(o => o.kyc_status === 'pending');
    const openTickets = (supportRes?.tickets || []).filter(t => t.status === 'open' || t.status === 'in_progress');

    container.innerHTML = `
      <!-- 1. TOP 4-COLUMN KPI CARDS (Desktop: 4 cols, Tablet: 2 cols, Mobile: 1 col) -->
      <div class="metrics-grid">
        <!-- TOTAL HOTELS -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Hotels</span>
            <div class="metric-icon-box"><i data-lucide="building-2"></i></div>
          </div>
          <div class="metric-value">${kpis.total_hotels || 0}</div>
          <div class="metric-footer">
            <span style="color: var(--status-success); font-weight: 600;">${kpis.verified_hotels || 0} Verified</span>
            <span>• ${kpis.pending_hotels || 0} Under Review</span>
          </div>
        </div>

        <!-- TOTAL BOOKINGS -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Bookings</span>
            <div class="metric-icon-box"><i data-lucide="calendar-check"></i></div>
          </div>
          <div class="metric-value">${kpis.total_bookings || 0}</div>
          <div class="metric-footer">
            <span style="color: var(--color-accent-dark); font-weight: 600;">${kpis.todays_bookings || 0} Today</span>
            <span>• ${kpis.upcoming_checkins_count || 0} Incoming Check-ins</span>
          </div>
        </div>

        <!-- GROSS PLATFORM VOLUME -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Gross Platform Volume</span>
            <div class="metric-icon-box gold"><i data-lucide="wallet"></i></div>
          </div>
          <div class="metric-value">₹${(kpis.total_gmv || 0).toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span>Total bookings processed</span>
          </div>
        </div>

        <!-- NET PLATFORM COMMISSION -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Net Platform Commission</span>
            <div class="metric-icon-box success"><i data-lucide="badge-percent"></i></div>
          </div>
          <div class="metric-value" style="color: var(--status-success);">₹${(kpis.platform_revenue || 0).toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span style="color: var(--status-success); font-weight: 600;">15% Platform Take-Rate</span>
          </div>
        </div>
      </div>

      <!-- 2. OPERATIONAL BOOKING OVERVIEW (5 COMPACT METRICS) -->
      <div class="ops-overview-card">
        <div class="ops-header">
          <div>
            <h2>Operational Booking Overview</h2>
            <p>Real-time reservation turnover and guest movement across platform hotels</p>
          </div>
        </div>

        <div class="ops-metrics-grid">
          <div class="ops-item">
            <div class="ops-item-label">Today's Bookings</div>
            <div class="ops-item-value">${kpis.todays_bookings || 0}</div>
          </div>
          <div class="ops-item">
            <div class="ops-item-label">Upcoming Check-Ins</div>
            <div class="ops-item-value" style="color: var(--status-info);">${kpis.upcoming_checkins_count || 0}</div>
          </div>
          <div class="ops-item">
            <div class="ops-item-label">Active In-House Stays</div>
            <div class="ops-item-value" style="color: var(--status-success);">${kpis.checked_in_bookings_count || 0}</div>
          </div>
          <div class="ops-item">
            <div class="ops-item-label">Upcoming Check-Outs</div>
            <div class="ops-item-value" style="color: var(--status-warning);">${kpis.upcoming_checkouts_count || 0}</div>
          </div>
          <div class="ops-item ops-item-full">
            <div class="ops-item-label">Cancelled / Refunded</div>
            <div class="ops-item-value" style="color: var(--status-danger);">${kpis.cancelled_bookings_count || 0}</div>
          </div>
        </div>
      </div>

      <!-- 3. MAIN SECTION: RECENT BOOKINGS & PRIORITY ACTION DESK (2fr 1fr Grid) -->
      <div class="dashboard-main-grid">
        <!-- Recent Bookings Container -->
        <div class="panel-card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Recent Platform Reservations</h2>
              <p>Live stream of incoming guest reservations from Customer Mobile App</p>
            </div>
            <a href="#/admin/bookings" class="btn btn-secondary btn-sm">
              <span>View All Bookings</span>
              <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </a>
          </div>

          <!-- DESKTOP VIEW: COMMERCIAL TABLE (Visible > 768px) -->
          <div class="desktop-booking-table-container">
            <div class="table-responsive">
              <table class="commercial-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Hotel Property</th>
                    <th>Stay Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookings.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px 16px;">
                        No reservations found on the platform yet.
                      </td>
                    </tr>
                  ` : bookings.map(b => `
                    <tr>
                      <td>
                        <span class="code-pill">${b.booking_code || 'BKG-000'}</span>
                      </td>
                      <td>
                        <div style="font-weight: 600; color: var(--text-main);">${b.customer_name || b.guest_name || 'Guest User'}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${b.customer_phone || b.customer_email || '—'}</div>
                      </td>
                      <td>
                        <div style="font-weight: 600; color: var(--text-main);">${b.hotel_name || 'Grand Horizon Hotel'}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${b.room_name || 'Deluxe Room'} (${b.guests_count || 2} Guests)</div>
                      </td>
                      <td>
                        <div style="font-size: 0.76rem; color: var(--text-main); font-weight: 500;">
                          ${formatDateRange(b.check_in_date, b.check_out_date, b.nights)}
                        </div>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: var(--text-main);">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
                        <div style="font-size: 0.72rem; color: var(--status-success);">Cut: ₹${(b.commission_amount || Math.round((b.total_amount || 0) * 0.15)).toLocaleString('en-IN')}</div>
                      </td>
                      <td>
                        <span class="status-pill ${b.booking_status || 'confirmed'}">
                          ${(b.booking_status || 'confirmed').replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- MOBILE VIEW: COMPACT BOOKING CARDS (Visible <= 768px) -->
          <div class="mobile-booking-cards-container">
            ${bookings.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 24px 12px; background: var(--bg-surface-secondary); border-radius: var(--radius-sm);">
                No reservations found on the platform yet.
              </div>
            ` : bookings.map(b => `
              <div class="mobile-booking-card">
                <div class="mb-card-header">
                  <span class="code-pill">${b.booking_code || 'BKG-000'}</span>
                  <span class="status-pill ${b.booking_status || 'confirmed'}">
                    ${(b.booking_status || 'confirmed').replace('_', ' ')}
                  </span>
                </div>
                <div class="mb-card-guest">
                  <div class="mb-guest-name">${b.customer_name || b.guest_name || 'Guest User'}</div>
                  <div class="mb-guest-contact">${b.customer_phone || b.customer_email || '—'}</div>
                </div>
                <div class="mb-card-hotel">
                  <div class="mb-hotel-name">${b.hotel_name || 'Grand Horizon Hotel'}</div>
                  <div class="mb-room-type">${b.room_name || 'Deluxe Room'} • ${b.guests_count || 2} Guests</div>
                </div>
                <div class="mb-card-dates">
                  <i data-lucide="calendar" style="width: 14px; height: 14px; color: var(--color-accent-dark); flex-shrink: 0;"></i>
                  <span>${formatDateRange(b.check_in_date, b.check_out_date, b.nights)}</span>
                </div>
                <div class="mb-card-footer">
                  <div class="mb-amount">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
                  <div class="mb-cut">Platform Cut: ₹${(b.commission_amount || Math.round((b.total_amount || 0) * 0.15)).toLocaleString('en-IN')}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Priority Admin Action Queue -->
        <div class="panel-card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Priority Action Desk</h2>
              <p>Operational queues requiring administrative clearance</p>
            </div>
          </div>

          <div class="priority-action-list">
            <!-- Pending KYC Alert -->
            <div class="action-card">
              <div class="action-card-header">
                <span class="action-card-title" style="color: var(--color-primary);">
                  <i data-lucide="shield-check" style="width: 16px; height: 16px; color: var(--color-accent-dark);"></i>
                  <span>Owner KYC Submissions</span>
                </span>
                <span class="nav-badge gold">${pendingKyc.length} Pending</span>
              </div>
              <p class="action-card-desc">
                ${pendingKyc.length > 0 
                  ? `${pendingKyc.length} hotel partner KYC compliance dossiers awaiting verification.` 
                  : 'All hotel partner KYC dossiers have been reviewed and verified.'}
              </p>
              <a href="#/admin/owners" class="btn btn-primary btn-sm" style="width: 100%;">
                <span>Review KYC Queue</span>
                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
              </a>
            </div>

            <!-- Pending Refunds Alert -->
            <div class="action-card">
              <div class="action-card-header">
                <span class="action-card-title" style="color: var(--status-danger);">
                  <i data-lucide="credit-card" style="width: 16px; height: 16px; color: var(--status-danger);"></i>
                  <span>Pending Guest Refunds</span>
                </span>
                <span class="nav-badge danger">${pendingRefunds.length} Pending</span>
              </div>
              <p class="action-card-desc">
                ${pendingRefunds.length > 0 
                  ? `${pendingRefunds.length} cancellation claim${pendingRefunds.length > 1 ? 's' : ''} total ₹${pendingRefunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0).toLocaleString('en-IN')} requiring payout approval.` 
                  : 'All guest cancellation refund claims have been cleared.'}
              </p>
              <a href="#/admin/refunds" class="btn btn-danger btn-sm" style="width: 100%;">
                <span>Process Refund Queue</span>
                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
              </a>
            </div>

            <!-- Open Support Tickets -->
            <div class="action-card">
              <div class="action-card-header">
                <span class="action-card-title" style="color: var(--status-info);">
                  <i data-lucide="headphones" style="width: 16px; height: 16px; color: var(--status-info);"></i>
                  <span>Open Support Tickets</span>
                </span>
                <span class="nav-badge info">${openTickets.length} Open</span>
              </div>
              <p class="action-card-desc">
                ${openTickets.length > 0 
                  ? `Ticket ${openTickets[0].ticket_code || 'TCK-001'}: "${openTickets[0].subject || 'Guest inquiry'}" awaiting administrative resolution.` 
                  : 'No unresolved guest or hotel partner support inquiries.'}
              </p>
              <a href="#/admin/support" class="btn btn-secondary btn-sm" style="width: 100%;">
                <span>Open Support Desk</span>
                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Admin Dashboard render error:', err);
    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); padding: 36px 24px; border-radius: var(--radius-md); text-align: center; margin: 24px auto; max-width: 600px; box-shadow: var(--shadow-sm);">
        <i data-lucide="alert-circle" style="width: 40px; height: 40px; color: var(--status-danger); margin-bottom: 12px;"></i>
        <h3 style="color: var(--text-main); margin-bottom: 8px; font-family: var(--font-heading);">Unable to load dashboard statistics</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">
          ${err.message || 'Please check your connection and verify that the backend server is running.'}
        </p>
        <button class="btn btn-primary btn-sm" onclick="location.reload()">
          <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
          <span>Retry Loading</span>
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
