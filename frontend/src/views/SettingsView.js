import { store } from '../services/store.js';

export function renderSettingsView(container) {
  let settings = store.getSettings();

  function render() {
    container.innerHTML = `
      <div style="max-width: 840px;">
        <!-- App Ecosystem Control Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>App & System Ecosystem Controls</h2>
              <p>Configure live operational state for Customer Web/Android App & Hotel Owner Panel</p>
            </div>
          </div>

          <form id="settings-form">
            <div class="form-grid" style="margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Platform Name</label>
                <input type="text" class="form-input" id="setting-app-name" value="${settings.appName}" required>
              </div>

              <div class="form-group">
                <label class="form-label">Default Currency & Symbol</label>
                <input type="text" class="form-input" value="${settings.currency} (${settings.currencySymbol})" disabled style="opacity: 0.7;">
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Customer & Owner App Operational Mode</label>
                <select class="form-select" id="setting-app-mode">
                  <option value="live" ${settings.appMode === 'live' ? 'selected' : ''}>🟢 Live (Customer Bookings Enabled)</option>
                  <option value="maintenance" ${settings.appMode === 'maintenance' ? 'selected' : ''}>🔴 Maintenance Mode (App Temporarily Locked)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Payment Gateway Mode (Razorpay / UPI)</label>
                <select class="form-select" id="setting-gateway-mode">
                  <option value="production" ${settings.paymentGatewayMode === 'production' ? 'selected' : ''}>⚡ Production (Live Money Collection)</option>
                  <option value="test" ${settings.paymentGatewayMode === 'test' ? 'selected' : ''}>🧪 Sandbox / Test Mode</option>
                </select>
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Cancellation Refund Window (Hours before check-in)</label>
                <input type="number" class="form-input" id="setting-cancel-hours" value="${settings.cancellationWindowHours}" min="1" max="72">
              </div>

              <div class="form-group">
                <label class="form-label">Standard Cancellation Processing Fee (%)</label>
                <input type="number" class="form-input" id="setting-cancel-fee" value="${settings.standardCancellationFeePct}" min="0" max="50">
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 24px;">
              <div class="form-group">
                <label class="form-label">Helpdesk Support Email</label>
                <input type="email" class="form-input" id="setting-support-email" value="${settings.supportEmail}">
              </div>

              <div class="form-group">
                <label class="form-label">Helpdesk Toll-Free Contact</label>
                <input type="text" class="form-input" id="setting-support-phone" value="${settings.supportPhone}">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 18px;">
              <button type="submit" class="btn btn-primary">
                <i data-lucide="save"></i> Save Platform Configurations
              </button>
            </div>
          </form>
        </div>

        <!-- Data Management & Diagnostics Card -->
        <div class="dashboard-card" style="border-color: rgba(239, 68, 68, 0.3);">
          <div class="card-header">
            <div class="card-title-group">
              <h2 style="color: var(--danger);">Demo Data & System Reset</h2>
              <p>Reseed all mock hotels, KYC owners, bookings, payments, and support logs</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 520px;">
              Restore the initial pristine state with fully populated data across Mumbai, Jaipur, Goa, and Delhi properties.
            </p>
            <button class="btn btn-danger" id="btn-reset-data">
              <i data-lucide="refresh-cw"></i> Reset Demo Database
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updates = {
        appName: container.querySelector('#setting-app-name').value,
        appMode: container.querySelector('#setting-app-mode').value,
        paymentGatewayMode: container.querySelector('#setting-gateway-mode').value,
        cancellationWindowHours: Number(container.querySelector('#setting-cancel-hours').value),
        standardCancellationFeePct: Number(container.querySelector('#setting-cancel-fee').value),
        supportEmail: container.querySelector('#setting-support-email').value,
        supportPhone: container.querySelector('#setting-support-phone').value
      };

      store.updateSettings(updates);
      settings = store.getSettings();
      window.showToast('Platform configurations updated successfully!', 'success');
      
      // Update header system indicator
      const indicator = document.querySelector('.system-status-indicator');
      if (indicator) {
        if (updates.appMode === 'live') {
          indicator.innerHTML = '<span class="status-dot"></span> System Live';
          indicator.style.color = 'var(--success)';
          indicator.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        } else {
          indicator.innerHTML = '<span class="status-dot" style="background: var(--danger); box-shadow: 0 0 8px var(--danger);"></span> Maintenance Mode';
          indicator.style.color = 'var(--danger)';
          indicator.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
      }
    });

    container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reseed all sample database records?')) {
        store.resetToDefaults();
        window.showToast('Demo dataset reseeded to factory defaults.', 'info');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    });
  }

  // Initial render
  render();
}
