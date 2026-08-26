import { store } from '../services/store.js';

export function renderCommissionView(container) {
  let settings = store.getSettings();
  let bookings = store.getBookings();

  function render() {
    const totalPlatformEarned = bookings.reduce((acc, b) => acc + (b.commissionAmount || 0), 0);
    const totalOwnerPayouts = bookings.reduce((acc, b) => acc + (b.ownerPayoutAmount || 0), 0);
    const totalGross = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    container.innerHTML = `
      <!-- Commission Stats Cards -->
      <div class="metrics-grid">
        <div class="metric-card glow-success">
          <div class="metric-header">
            <span class="metric-title">Total Platform Commission</span>
            <div class="metric-icon-box success"><i data-lucide="badge-percent"></i></div>
          </div>
          <div class="metric-value">₹${totalPlatformEarned.toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span class="metric-trend up"><i data-lucide="check"></i> Retained Net Income</span>
          </div>
        </div>

        <div class="metric-card glow-primary">
          <div class="metric-header">
            <span class="metric-title">Total Owner Disbursements</span>
            <div class="metric-icon-box primary"><i data-lucide="coins"></i></div>
          </div>
          <div class="metric-value">₹${totalOwnerPayouts.toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span style="color: var(--text-secondary);">Distributed to verified owners</span>
          </div>
        </div>

        <div class="metric-card glow-warning">
          <div class="metric-header">
            <span class="metric-title">Global Platform Take-Rate</span>
            <div class="metric-icon-box warning"><i data-lucide="sliders"></i></div>
          </div>
          <div class="metric-value">${settings.platformCommissionRate}%</div>
          <div class="metric-footer">
            <span style="color: var(--warning); font-weight: 600;">Configurable Global Fee</span>
          </div>
        </div>
      </div>

      <!-- Commission Engine & Live Simulator -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
        <!-- Global Rate Settings -->
        <div class="dashboard-card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Platform Commission Policy</h2>
              <p>Configure default platform service cut for all customer bookings</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>Default Commission Rate (%)</span>
              <strong style="color: var(--primary); font-size: 1.1rem;" id="rate-display">${settings.platformCommissionRate}%</strong>
            </label>
            <input type="range" id="commission-slider" min="5" max="30" step="0.5" value="${settings.platformCommissionRate}" style="width: 100%; accent-color: var(--primary); height: 8px; border-radius: 4px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
              <span>5% (Competitive)</span>
              <span>15% (Standard)</span>
              <span>30% (Premium)</span>
            </div>
          </div>

          <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
            <i data-lucide="info" style="width: 16px; height: 16px; display: inline; color: var(--primary); margin-right: 4px;"></i>
            Changes to the commission rate are applied dynamically to all subsequent booking calculations across the platform.
          </div>

          <button class="btn btn-primary" id="btn-save-rate" style="width: 100%;">
            <i data-lucide="save"></i> Update Platform Take-Rate
          </button>
        </div>

        <!-- Interactive Calculator Simulator -->
        <div class="dashboard-card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Live Booking Split Simulator</h2>
              <p>Simulate pricing breakdowns in real-time</p>
            </div>
          </div>

          <div class="form-grid" style="margin-bottom: 14px;">
            <div>
              <label class="form-label">Room Tariff / Night (₹)</label>
              <input type="number" class="form-input" id="sim-tariff" value="8500" min="500" step="500">
            </div>
            <div>
              <label class="form-label">Number of Nights</label>
              <input type="number" class="form-input" id="sim-nights" value="3" min="1" max="30">
            </div>
          </div>

          <div class="commission-box">
            <div class="calc-formula-display">
              <div class="calc-step">
                <div class="calc-step-label">Gross Total (with Tax)</div>
                <div class="calc-step-value indigo" id="sim-gross">₹28,560</div>
              </div>
              <div style="color: var(--text-muted); font-size: 1.2rem; font-weight: bold;">=</div>
              <div class="calc-step">
                <div class="calc-step-label">Platform Share (${settings.platformCommissionRate}%)</div>
                <div class="calc-step-value green" id="sim-commission">₹4,284</div>
              </div>
              <div style="color: var(--text-muted); font-size: 1.2rem; font-weight: bold;">+</div>
              <div class="calc-step">
                <div class="calc-step-label">Owner Payout</div>
                <div class="calc-step-value gold" id="sim-payout">₹24,276</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Commission Audit Ledger Table -->
      <div class="dashboard-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Commission Calculation Ledger</h2>
            <p>Auditable itemized breakdown of platform earnings per booking</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-export-commission-csv">
            <i data-lucide="download"></i> Export Ledger CSV
          </button>
        </div>

        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Hotel Entity</th>
                <th>Gross Total</th>
                <th>Take Rate</th>
                <th>Platform Commission</th>
                <th>Owner Net Share</th>
                <th>Settlement</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary);">${b.bookingId}</span>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.paymentMethod}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #fff;">${b.hotelName}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${b.customerName}</div>
                  </td>
                  <td style="font-weight: 700; color: #fff;">₹${b.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span style="font-weight: 600; color: var(--warning);">${b.commissionRate}%</span>
                  </td>
                  <td style="font-weight: 700; color: var(--success); font-size: 0.95rem;">
                    + ₹${b.commissionAmount.toLocaleString('en-IN')}
                  </td>
                  <td style="font-weight: 600; color: var(--text-main);">
                    ₹${b.ownerPayoutAmount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span class="status-badge ${b.paymentStatus === 'successful' ? 'verified' : b.paymentStatus}">${b.paymentStatus === 'successful' ? 'Settled' : b.paymentStatus}</span>
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
    updateSimulator();
  }

  function updateSimulator() {
    const tariff = Number(container.querySelector('#sim-tariff')?.value || 8500);
    const nights = Number(container.querySelector('#sim-nights')?.value || 3);
    const rate = Number(container.querySelector('#commission-slider')?.value || settings.platformCommissionRate);

    const baseAmount = tariff * nights;
    const taxAmount = baseAmount * 0.12; // 12% GST
    const grossTotal = baseAmount + taxAmount;
    const commission = grossTotal * (rate / 100);
    const payout = grossTotal - commission;

    const simGross = container.querySelector('#sim-gross');
    const simCommission = container.querySelector('#sim-commission');
    const simPayout = container.querySelector('#sim-payout');

    if (simGross) simGross.textContent = `₹${Math.round(grossTotal).toLocaleString('en-IN')}`;
    if (simCommission) simCommission.textContent = `₹${Math.round(commission).toLocaleString('en-IN')}`;
    if (simPayout) simPayout.textContent = `₹${Math.round(payout).toLocaleString('en-IN')}`;
  }

  function bindEvents() {
    const slider = container.querySelector('#commission-slider');
    const display = container.querySelector('#rate-display');

    slider?.addEventListener('input', (e) => {
      display.textContent = `${e.target.value}%`;
      updateSimulator();
    });

    container.querySelector('#sim-tariff')?.addEventListener('input', updateSimulator);
    container.querySelector('#sim-nights')?.addEventListener('input', updateSimulator);

    container.querySelector('#btn-save-rate')?.addEventListener('click', () => {
      const newRate = Number(slider.value);
      store.updateSettings({ platformCommissionRate: newRate });
      settings = store.getSettings();
      window.showToast(`Platform Commission Rate set to ${newRate}% globally.`, 'success');
      render();
    });

    container.querySelector('#btn-export-commission-csv')?.addEventListener('click', () => {
      store.exportToCSV('bookings');
      window.showToast('Commission ledger exported to CSV.', 'info');
    });
  }

  // Initial render
  render();
}
