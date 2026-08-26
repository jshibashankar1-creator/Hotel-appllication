import { api } from '../../services/api.js';

export async function renderOwnerEarningsView(container) {
  let earnings = null;

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading owner earnings ledger...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      earnings = await api.getOwnerEarnings();
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Gross Booking Volume</span>
            <div class="metric-icon-box gold"><i data-lucide="wallet"></i></div>
          </div>
          <div class="metric-value">₹${earnings.total_gross.toLocaleString('en-IN')}</div>
          <div class="metric-footer"><span>Total guest charges</span></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Platform Fee Deducted (15%)</span>
            <div class="metric-icon-box"><i data-lucide="percent"></i></div>
          </div>
          <div class="metric-value" style="color: var(--status-warning);">- ₹${earnings.total_commission_deducted.toLocaleString('en-IN')}</div>
          <div class="metric-footer"><span>Service & gateway charge</span></div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Net Owner Disbursements</span>
            <div class="metric-icon-box success"><i data-lucide="coins"></i></div>
          </div>
          <div class="metric-value" style="color: var(--status-success);">₹${earnings.total_net_earnings.toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span style="color: var(--status-success); font-weight: 600;">₹${earnings.completed_earnings.toLocaleString('en-IN')} Settled</span>
            <span>• ₹${earnings.pending_earnings.toLocaleString('en-IN')} Pending</span>
          </div>
        </div>
      </div>

      <!-- Itemized Traceable Breakdown -->
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 16px 20px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Itemized Earnings Breakdown per Booking</h2>
            <p>Every payout is 100% traceable to a confirmed customer reservation</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Guest Name</th>
                <th>Stay Dates</th>
                <th>Gross Paid</th>
                <th>Platform Commission (15%)</th>
                <th>Net Owner Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${earnings.earnings_breakdown.map(b => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${b.booking_code}</span></td>
                  <td><div style="font-weight: 600;">${b.guest_name}</div></td>
                  <td>${b.check_in_date} to ${b.check_out_date}</td>
                  <td>₹${b.gross_amount.toLocaleString('en-IN')}</td>
                  <td style="color: var(--status-warning);">- ₹${b.platform_cut.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 700; color: var(--status-success);">₹${b.net_payout.toLocaleString('en-IN')}</td>
                  <td><span class="status-pill ${b.status}">${b.status.replace('_', ' ')}</span></td>
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
