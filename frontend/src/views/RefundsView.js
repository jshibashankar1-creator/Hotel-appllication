import { store } from '../services/store.js';

export function renderRefundsView(container) {
  let refunds = store.getRefunds();
  let statusFilter = 'all';
  let searchQuery = '';

  function render() {
    const filteredRefunds = refunds.filter(r => {
      const matchSearch = r.refundId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });

    const pendingCount = refunds.filter(r => r.status === 'pending').length;

    container.innerHTML = `
      <!-- Refund Alert Banner -->
      <div style="background: linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(17, 24, 39, 0.8) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; background: rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--danger);">
            <i data-lucide="rotate-ccw" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="color: #fff; font-size: 1.05rem;">Customer Cancellation & Refund Oversight</h3>
            <p style="color: var(--text-secondary); font-size: 0.82rem;">Review cancellation penalty deductions and approve payment refunds back to original bank accounts.</p>
          </div>
        </div>
        <div>
          <span style="background: var(--danger-light); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 14px; border-radius: var(--radius-full); font-weight: 700; font-size: 0.82rem;">
            ${pendingCount} Pending Refund Requests
          </span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="refund-search-input" placeholder="Search Refund ID, Booking, Customer..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="refund-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Refund Statuses</option>
            <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending Review (${pendingCount})</option>
            <option value="approved" ${statusFilter === 'approved' ? 'selected' : ''}>Approved & Credited</option>
            <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
      </div>

      <!-- Refunds Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Booking Ref & Hotel</th>
                <th>Customer & Reason</th>
                <th>Paid Amount</th>
                <th>Fee Deduction</th>
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRefunds.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No refund requests found.
                  </td>
                </tr>
              ` : filteredRefunds.map(r => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.9rem;">${r.refundId}</span>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${new Date(r.requestedAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-family: monospace; color: #fff;">${r.bookingId}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${r.hotelName}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${r.customerName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      Reason: ${r.reason}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-secondary);">₹${r.bookingAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.82rem; color: var(--danger); font-weight: 600;">- ₹${r.cancellationFee.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--success); font-size: 1rem;">₹${r.refundAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span class="status-badge ${r.status}">${r.status}</span>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-process-refund" data-refund-id="${r.refundId}">
                      <i data-lucide="sliders-horizontal"></i> Process
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Refund Modal Root -->
      <div id="refund-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#refund-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#refund-status-filter')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-process-refund').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-refund-id');
        openRefundModal(rId);
      });
    });
  }

  function openRefundModal(refundId) {
    const refund = store.getRefunds().find(r => r.refundId === refundId);
    if (!refund) return;

    const modalRoot = container.querySelector('#refund-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="process-refund-modal">
        <div class="modal-container" style="max-width: 620px;">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.75rem; font-family: monospace; color: var(--danger); font-weight: 700;">REFUND CASE • ${refund.refundId}</div>
              <h2 class="modal-title">Booking ${refund.bookingId} Refund Request</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <!-- Customer & Hotel Context -->
            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Customer</div>
                  <div style="font-weight: 700; color: #fff;">${refund.customerName}</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">${refund.customerEmail}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Hotel Property</div>
                  <div style="font-weight: 600; color: #fff;">${refund.hotelName}</div>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">Requested: ${new Date(refund.requestedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <!-- Customer Reason -->
            <div style="margin-bottom: 18px;">
              <label class="form-label">Customer's Cancellation Reason</label>
              <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-md); font-size: 0.88rem; color: var(--text-main);">
                "${refund.reason}"
              </div>
            </div>

            <!-- Financial Calculation -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
              <h4 style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">Refund Policy Settlement Calculation</h4>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
                <span style="color: var(--text-secondary);">Original Paid Amount:</span>
                <span style="color: #fff; font-weight: 600;">₹${refund.bookingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.88rem;">
                <span style="color: var(--danger);">Cancellation Fee (10% Policy):</span>
                <span style="color: var(--danger); font-weight: 600;">- ₹${refund.cancellationFee.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 8px;">
                <span style="color: var(--success);">Net Refund Credit to Customer:</span>
                <span style="color: var(--success);">₹${refund.refundAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <!-- Admin Note Input -->
            <div class="form-group">
              <label class="form-label">Admin Processing Note (Recorded in Audit Trail)</label>
              <textarea class="form-textarea" id="admin-refund-notes" placeholder="Enter reason or reference for approval/rejection...">${refund.adminNotes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.82rem; color: var(--text-secondary);">
              Current: <span class="status-badge ${refund.status}">${refund.status}</span>
            </span>
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            <button class="btn btn-danger" id="modal-reject-refund"><i data-lucide="x-circle"></i> Reject Refund</button>
            <button class="btn btn-success" id="modal-approve-refund"><i data-lucide="check-circle-2"></i> Approve & Payout Refund</button>
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

    modalRoot.querySelector('#modal-approve-refund')?.addEventListener('click', () => {
      const notes = modalRoot.querySelector('#admin-refund-notes').value || 'Refund approved under cancellation policy.';
      store.processRefund(refundId, 'approved', notes);
      refunds = store.getRefunds();
      window.showToast(`Refund ₹${refund.refundAmount.toLocaleString('en-IN')} processed successfully for ${refund.customerName}.`, 'success');
      closeModal();
      render();
    });

    modalRoot.querySelector('#modal-reject-refund')?.addEventListener('click', () => {
      const notes = modalRoot.querySelector('#admin-refund-notes').value || 'Refund rejected as per terms.';
      store.processRefund(refundId, 'rejected', notes);
      refunds = store.getRefunds();
      window.showToast(`Refund request ${refundId} rejected.`, 'error');
      closeModal();
      render();
    });
  }

  // Initial render
  render();
}
