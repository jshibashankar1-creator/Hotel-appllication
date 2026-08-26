import { api } from '../../services/api.js';

export async function renderAdminRefundsView(container) {
  let refunds = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading refund requests...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getAdminRefunds();
      refunds = res.refunds;
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
                <th>Refund Code</th>
                <th>Booking & Hotel</th>
                <th>Customer & Reason</th>
                <th>Paid Amount</th>
                <th>Policy Fee (10%)</th>
                <th>Refund Credit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${refunds.map(r => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${r.refund_code}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-family: monospace;">${r.booking_code}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${r.hotel_name}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${r.customer_name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      "${r.reason}"
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 0.82rem;">₹${r.booking_amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.78rem; color: var(--status-danger);">- ₹${r.fee_amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--status-success); font-size: 0.95rem;">₹${r.refund_amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span class="status-pill ${r.status}">${r.status}</span>
                  </td>
                  <td>
                    ${r.status === 'pending' ? `
                      <button class="btn btn-primary btn-sm btn-process-refund" data-refund-id="${r.id}">
                        Process Refund
                      </button>
                    ` : `
                      <span style="font-size: 0.72rem; color: var(--text-muted);">Processed</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="refund-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelectorAll('.btn-process-refund').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-refund-id');
        openRefundModal(rId);
      });
    });
  }

  function openRefundModal(refundId) {
    const refund = refunds.find(r => r.id === refundId);
    if (!refund) return;

    const modalRoot = container.querySelector('#refund-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 580px;">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.7rem; font-family: monospace; color: var(--status-danger); font-weight: 700;">REFUND CLAIM</span>
              <h2 class="modal-title">${refund.refund_code} (${refund.booking_code})</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 14px;">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Customer Reason</div>
              <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 4px;">"${refund.reason}"</div>
            </div>

            <div style="background: var(--bg-surface-secondary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Paid Booking Tariff:</span>
                <span>₹${refund.booking_amount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px; color: var(--status-danger);">
                <span>Cancellation Fee (10% Policy):</span>
                <span>- ₹${refund.fee_amount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; color: var(--status-success); border-top: 1px solid var(--border-light); padding-top: 6px;">
                <span>Net Refund to Customer Bank:</span>
                <span>₹${refund.refund_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Administrator Note</label>
              <textarea class="form-textarea" id="refund-admin-notes" placeholder="Enter refund processing reference or justification..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-close-action">Cancel</button>
            <button class="btn btn-danger" id="modal-reject-refund">Reject Refund</button>
            <button class="btn btn-success" id="modal-approve-refund">Approve & Credit Refund</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#modal-approve-refund')?.addEventListener('click', async () => {
      const notes = modalRoot.querySelector('#refund-admin-notes').value || 'Approved under cancellation policy.';
      await api.processRefund(refundId, 'approved', notes);
      window.showToast(`Refund of ₹${refund.refund_amount.toLocaleString('en-IN')} approved successfully.`, 'success');
      closeModal();
      loadData();
    });

    modalRoot.querySelector('#modal-reject-refund')?.addEventListener('click', async () => {
      const notes = modalRoot.querySelector('#refund-admin-notes').value || 'Refund rejected.';
      await api.processRefund(refundId, 'rejected', notes);
      window.showToast(`Refund rejected.`, 'error');
      closeModal();
      loadData();
    });
  }

  loadData();
}
