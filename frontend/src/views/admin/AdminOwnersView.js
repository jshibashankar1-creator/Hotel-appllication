import { api } from '../../services/api.js';

export async function renderAdminOwnersView(container) {
  let owners = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading owner KYC applications...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getOwnersKyc();
      owners = res.owners;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Owner Name & ID</th>
                <th>Business Entity & PAN</th>
                <th>Bank Payout Details</th>
                <th>Hotels Count</th>
                <th>KYC Status</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${owners.map(o => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">${o.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${o.email}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${o.phone}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${o.business_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">PAN: <strong>${o.pan_no}</strong> • GST: <strong>${o.gstin}</strong></div>
                  </td>
                  <td>
                    <div style="font-size: 0.78rem; color: var(--text-main);">${o.bank_account}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${o.address}</div>
                  </td>
                  <td>
                    <span style="font-weight: 600;">${o.hotels_count} properties</span>
                  </td>
                  <td>
                    <span class="status-pill ${o.kyc_status}">${o.kyc_status}</span>
                    ${o.rejection_reason ? `<div style="font-size: 0.68rem; color: var(--status-danger); margin-top: 2px;">${o.rejection_reason}</div>` : ''}
                  </td>
                  <td>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${new Date(o.submitted_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-inspect-owner" data-owner-id="${o.user_id}">
                      <i data-lucide="shield"></i> Inspect KYC
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="owner-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelectorAll('.btn-inspect-owner').forEach(btn => {
      btn.addEventListener('click', () => {
        const oId = btn.getAttribute('data-owner-id');
        openOwnerModal(oId);
      });
    });
  }

  function openOwnerModal(userId) {
    const owner = owners.find(o => o.user_id === userId);
    if (!owner) return;

    const modalRoot = container.querySelector('#owner-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.7rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">KYC DOCUMENT INSPECTOR</span>
              <h2 class="modal-title">${owner.name} (${owner.business_name})</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div class="form-grid" style="margin-bottom: 16px;">
              <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Legal Entity Details</div>
                <div style="font-weight: 600; margin-top: 4px;">Reg No: ${owner.business_reg_no}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">PAN: ${owner.pan_no}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">GSTIN: ${owner.gstin}</div>
              </div>
              <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Bank Payout Settlement Account</div>
                <div style="font-weight: 600; color: var(--status-success); margin-top: 4px;">${owner.bank_account}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Address: ${owner.address}</div>
              </div>
            </div>

            <div id="reject-box" style="display: none; background: var(--status-danger-bg); border: 1px solid var(--status-danger-border); padding: 12px; border-radius: var(--radius-sm); margin-top: 14px;">
              <label class="form-label" style="color: var(--status-danger);">Reason for Rejection (Sent to owner)</label>
              <textarea class="form-textarea" id="reject-reason" placeholder="State reason (e.g. Invalid PAN, expired trade certificate)..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            <button class="btn btn-danger" id="modal-reject-btn">Reject KYC</button>
            <button class="btn btn-success" id="modal-approve-btn">Approve & Verify</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#modal-approve-btn')?.addEventListener('click', async () => {
      await api.updateOwnerKyc(userId, 'verified');
      window.showToast(`Owner ${owner.name} verified successfully! Associated hotel is now active.`, 'success');
      closeModal();
      loadData();
    });

    modalRoot.querySelector('#modal-reject-btn')?.addEventListener('click', async () => {
      const rejectBox = modalRoot.querySelector('#reject-box');
      if (rejectBox.style.display === 'none') {
        rejectBox.style.display = 'block';
        modalRoot.querySelector('#modal-reject-btn').textContent = 'Confirm Rejection';
      } else {
        const reason = modalRoot.querySelector('#reject-reason').value || 'Documentation incomplete.';
        await api.updateOwnerKyc(userId, 'rejected', reason);
        window.showToast(`KYC application for ${owner.name} rejected.`, 'error');
        closeModal();
        loadData();
      }
    });
  }

  loadData();
}
