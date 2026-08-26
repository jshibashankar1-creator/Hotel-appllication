import { api } from '../../services/api.js';

export async function renderAdminSettingsView(container) {
  let settings = null;

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading settings...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getSettings();
      settings = res.settings;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div style="max-width: 720px;">
        <div class="panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Platform & App Configurations</h2>
              <p>Global operating parameters for Customer Mobile App & Hotel Owner Panel</p>
            </div>
          </div>

          <form id="settings-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Customer App Mode</label>
                <select class="form-select" id="setting-app-mode">
                  <option value="live" ${settings.app_mode === 'live' ? 'selected' : ''}>🟢 Live (Customer Bookings Enabled)</option>
                  <option value="maintenance" ${settings.app_mode === 'maintenance' ? 'selected' : ''}>🔴 Maintenance Mode (App Locked)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Payment Gateway Mode</label>
                <select class="form-select" id="setting-payment-mode">
                  <option value="production" ${settings.payment_mode === 'production' ? 'selected' : ''}>⚡ Production (Live Gateway)</option>
                  <option value="test" ${settings.payment_mode === 'test' ? 'selected' : ''}>🧪 Sandbox / Test Mode</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Default Platform Commission Take-Rate (%)</label>
                <input type="number" class="form-input" id="setting-commission-rate" value="${settings.commission_rate}" min="1" max="50">
              </div>

              <div class="form-group">
                <label class="form-label">Standard Cancellation Processing Fee (%)</label>
                <input type="number" class="form-input" id="setting-cancel-fee" value="${settings.cancel_fee_pct}" min="0" max="50">
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Helpdesk Support Email</label>
                <input type="email" class="form-input" id="setting-support-email" value="${settings.support_email}">
              </div>

              <div class="form-group">
                <label class="form-label">Helpdesk Support Phone</label>
                <input type="text" class="form-input" id="setting-support-phone" value="${settings.support_phone}">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
              <button type="submit" class="btn btn-primary" id="btn-save-settings">
                <i data-lucide="save"></i> Save Platform Configurations
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updates = {
        app_mode: container.querySelector('#setting-app-mode').value,
        payment_mode: container.querySelector('#setting-payment-mode').value,
        commission_rate: Number(container.querySelector('#setting-commission-rate').value),
        cancel_fee_pct: Number(container.querySelector('#setting-cancel-fee').value),
        support_email: container.querySelector('#setting-support-email').value,
        support_phone: container.querySelector('#setting-support-phone').value
      };

      try {
        await api.updateSettings(updates);
        window.showToast('Platform configurations saved successfully.', 'success');
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  loadData();
}
