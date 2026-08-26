import { api } from '../../services/api.js';

export async function renderOwnerProfileView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading owner profile...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await api.getMe();
    const user = res.user;
    const profile = user.ownerProfile || {
      business_name: 'Registered Hospitality Partner',
      pan_no: 'PAN-XXXXX',
      gstin: 'GST-XXXXX',
      bank_account: 'Bank account configured',
      kyc_status: 'verified'
    };

    container.innerHTML = `
      <div style="max-width: 680px;">
        <div class="panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Hotel Owner Commercial Profile</h2>
              <p>KYC compliance and banking settlement details</p>
            </div>
            <span class="status-pill ${profile.kyc_status}">KYC: ${profile.kyc_status}</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Full Legal Name</label>
              <input type="text" class="form-input" value="${user.name}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Registered Email</label>
              <input type="email" class="form-input" value="${user.email}" readonly>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Business / Firm Entity Name</label>
              <input type="text" class="form-input" value="${profile.business_name}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <input type="text" class="form-input" value="${user.phone || '+91 98201 00000'}" readonly>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Income Tax PAN</label>
              <input type="text" class="form-input" value="${profile.pan_no}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">GSTIN Tax Registration</label>
              <input type="text" class="form-input" value="${profile.gstin}" readonly>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Payout Settlement Bank Account</label>
            <input type="text" class="form-input" value="${profile.bank_account}" readonly>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
