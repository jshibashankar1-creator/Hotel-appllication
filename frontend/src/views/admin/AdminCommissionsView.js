import { api } from '../../services/api.js';

export async function renderAdminCommissionsView(container) {
  let ledgerData = null;

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading commission ledger...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      ledgerData = await api.getCommissionLedger();
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <!-- Top Overview Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Platform Commission</span>
            <div class="metric-icon-box success"><i data-lucide="badge-percent"></i></div>
          </div>
          <div class="metric-value" style="color: var(--status-success);">₹${ledgerData.total_commission.toLocaleString('en-IN')}</div>
          <div class="metric-footer"><span>Retained platform earnings</span></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Owner Payouts</span>
            <div class="metric-icon-box gold"><i data-lucide="coins"></i></div>
          </div>
          <div class="metric-value">₹${ledgerData.total_owner_payout.toLocaleString('en-IN')}</div>
          <div class="metric-footer"><span>Distributed to hotel owners</span></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Global Commission Rate</span>
            <div class="metric-icon-box"><i data-lucide="sliders"></i></div>
          </div>
          <div class="metric-value">${ledgerData.platform_take_rate}%</div>
          <div class="metric-footer"><span>Configurable default cut</span></div>
        </div>
      </div>

      <!-- Commission Controls & Rate Engine -->
      <div class="panel-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Commission Policy Rules</h2>
            <p>Configure default platform service take-rate for all incoming bookings</p>
          </div>
        </div>

        <div style="max-width: 520px;">
          <div class="form-group">
            <label class="form-label">Platform Take-Rate Percentage (%)</label>
            <div style="display: flex; gap: 10px;">
              <input type="number" class="form-input" id="input-commission-rate" value="${ledgerData.platform_take_rate}" min="1" max="50" step="1">
              <button class="btn btn-primary" id="btn-save-commission-rate">Update Rate</button>
            </div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted);">
            All future customer bookings created across Customer Mobile App will automatically compute commission based on this configured rate.
          </p>
        </div>
      </div>

      <!-- Commission Audit Ledger Table -->
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 16px 20px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Platform Commission Audit Ledger</h2>
            <p>Traceable itemized booking fee breakdowns</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel Entity</th>
                <th>Guest</th>
                <th>Gross Total</th>
                <th>Take Rate</th>
                <th>Platform Cut</th>
                <th>Owner Net Share</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerData.ledger.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td><div style="font-weight: 600;">${b.hotel_name}</div></td>
                  <td>${b.customer_name}</td>
                  <td style="font-weight: 700;">₹${b.total_amount.toLocaleString('en-IN')}</td>
                  <td><span style="font-weight: 600; color: var(--status-warning);">${b.commission_rate}%</span></td>
                  <td style="font-weight: 700; color: var(--status-success);">+ ₹${b.commission_amount.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 600;">₹${b.owner_payout.toLocaleString('en-IN')}</td>
                  <td><span class="status-pill ${b.payment_status}">${b.payment_status}</span></td>
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
    container.querySelector('#btn-save-commission-rate')?.addEventListener('click', async () => {
      const rate = Number(container.querySelector('#input-commission-rate').value);
      try {
        await api.updateCommissionRate(rate);
        window.showToast(`Platform Commission Rate set to ${rate}%.`, 'success');
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  loadData();
}
