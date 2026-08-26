import { store } from '../services/store.js';
import confetti from 'canvas-confetti';

export function renderOwnerVerificationView(container) {
  let owners = store.getOwners();
  let statusFilter = 'all';
  let searchQuery = '';

  function render() {
    const filteredOwners = owners.filter(o => {
      const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.panNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.verificationStatus === statusFilter;
      return matchSearch && matchStatus;
    });

    const pendingCount = owners.filter(o => o.verificationStatus === 'pending').length;

    container.innerHTML = `
      <!-- KYC Alert Header -->
      <div style="background: linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(17, 24, 39, 0.8) 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-lg); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; background: rgba(245, 158, 11, 0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--warning);">
            <i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="color: #fff; font-size: 1.05rem;">Hotel Owner Compliance & KYC Verification</h3>
            <p style="color: var(--text-secondary); font-size: 0.82rem;">Review legal tax identities, hotel trade permits, and bank verification before enabling listings.</p>
          </div>
        </div>
        <div>
          <span style="background: var(--warning-light); color: var(--warning); border: 1px solid rgba(245,158,11,0.3); padding: 6px 14px; border-radius: var(--radius-full); font-weight: 700; font-size: 0.82rem;">
            ${pendingCount} Pending Verifications
          </span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="owner-search-input" placeholder="Search owner, company, PAN..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="owner-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Verification Statuses</option>
            <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending Review (${pendingCount})</option>
            <option value="verified" ${statusFilter === 'verified' ? 'selected' : ''}>Verified / Approved</option>
            <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>Rejected / Incomplete</option>
          </select>
        </div>
      </div>

      <!-- Owners Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Owner ID & Contact</th>
                <th>Business Entity & PAN</th>
                <th>Bank Account</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOwners.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No hotel owners match the current filter criteria.
                  </td>
                </tr>
              ` : filteredOwners.map(o => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${o.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${o.email}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${o.phone}</div>
                    <div style="font-size: 0.72rem; font-family: monospace; color: var(--primary); margin-top: 2px;">${o.id}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${o.businessName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">PAN: <strong style="color: var(--text-main);">${o.panNo}</strong></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">GSTIN: <strong style="color: var(--text-main);">${o.gstin}</strong></div>
                  </td>
                  <td>
                    <div style="font-size: 0.82rem; color: var(--text-main);">${o.bankAccount}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${o.address}</div>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${o.documents.map(d => `
                        <span style="font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px; color: ${d.verified ? 'var(--success)' : 'var(--warning)'};">
                          <i data-lucide="${d.verified ? 'check-circle' : 'file-text'}" style="width: 12px; height: 12px;"></i>
                          ${d.type}
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <span class="status-badge ${o.verificationStatus}">${o.verificationStatus}</span>
                    ${o.rejectionReason ? `
                      <div style="font-size: 0.7rem; color: var(--danger); margin-top: 4px; max-width: 180px;">
                        ${o.rejectionReason}
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-inspect-owner" data-owner-id="${o.id}">
                      <i data-lucide="shield"></i> Inspect KYC
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Owner Modal Container -->
      <div id="owner-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    const searchInput = container.querySelector('#owner-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    const statusSelect = container.querySelector('#owner-status-filter');
    statusSelect?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-inspect-owner').forEach(btn => {
      btn.addEventListener('click', () => {
        const ownerId = btn.getAttribute('data-owner-id');
        openOwnerModal(ownerId);
      });
    });
  }

  function openOwnerModal(ownerId) {
    const owner = store.getOwner(ownerId);
    if (!owner) return;

    const modalRoot = container.querySelector('#owner-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="owner-inspect-modal">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.75rem; font-family: monospace; color: var(--primary); font-weight: 700;">KYC INSPECTOR • ${owner.id}</span>
              <h2 class="modal-title">${owner.name} (${owner.businessName})</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Contact & Identity</div>
                <div style="font-size: 0.88rem; font-weight: 600; color: #fff; margin-top: 4px;">${owner.email}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${owner.phone}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Reg: ${owner.businessRegNo}</div>
              </div>

              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Payout Bank Account</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--success); margin-top: 4px;">${owner.bankAccount}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">Address: ${owner.address}</div>
              </div>
            </div>

            <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px;">Submitted Legal Documents & Compliance</h4>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              <div class="kyc-doc-card">
                <div class="kyc-doc-info">
                  <div class="kyc-doc-icon"><i data-lucide="file-check"></i></div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.88rem; color: #fff;">Income Tax PAN Card</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Doc ID: ${owner.panNo} • NSDL Verified</div>
                  </div>
                </div>
                <span class="status-badge verified">Verified</span>
              </div>

              <div class="kyc-doc-card">
                <div class="kyc-doc-info">
                  <div class="kyc-doc-icon"><i data-lucide="landmark"></i></div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.88rem; color: #fff;">GSTIN Registration Certificate</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Doc ID: ${owner.gstin} • Active Taxpayer</div>
                  </div>
                </div>
                <span class="status-badge verified">Verified</span>
              </div>

              ${owner.documents.map(d => `
                <div class="kyc-doc-card">
                  <div class="kyc-doc-info">
                    <div class="kyc-doc-icon"><i data-lucide="file-text"></i></div>
                    <div>
                      <div style="font-weight: 600; font-size: 0.88rem; color: #fff;">${d.type}</div>
                      <div style="font-size: 0.75rem; color: var(--text-secondary);">Reg No: ${d.number}</div>
                    </div>
                  </div>
                  <span class="status-badge ${d.verified ? 'verified' : 'pending'}">${d.verified ? 'Verified' : 'Pending'}</span>
                </div>
              `).join('')}
            </div>

            <!-- Rejection Reason input (visible if rejecting) -->
            <div id="reject-reason-box" style="display: none; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 14px; margin-top: 14px;">
              <label class="form-label" style="color: var(--danger);">Rejection Explanation (Sent to Owner Email/App)</label>
              <textarea class="form-textarea" id="reject-reason-text" placeholder="State why the documents were rejected (e.g. Expired Trade License, Name mismatch on PAN)..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            <button class="btn btn-danger" id="modal-reject-btn"><i data-lucide="x-circle"></i> Reject Application</button>
            <button class="btn btn-success" id="modal-verify-btn"><i data-lucide="check-circle-2"></i> Approve & Verify Owner</button>
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

    // Verify Action
    modalRoot.querySelector('#modal-verify-btn')?.addEventListener('click', () => {
      store.verifyOwner(ownerId, 'verified');
      owners = store.getOwners();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      window.showToast(`Owner ${owner.name} is now VERIFIED! Associated hotels are live.`, 'success');
      closeModal();
      render();
    });

    // Reject Action
    modalRoot.querySelector('#modal-reject-btn')?.addEventListener('click', () => {
      const reasonBox = modalRoot.querySelector('#reject-reason-box');
      if (reasonBox.style.display === 'none') {
        reasonBox.style.display = 'block';
        modalRoot.querySelector('#modal-reject-btn').innerHTML = '<i data-lucide="alert-triangle"></i> Confirm Rejection';
        if (window.lucide) window.lucide.createIcons();
      } else {
        const reasonText = modalRoot.querySelector('#reject-reason-text').value.trim() || 'Incomplete or unverified documentation submitted.';
        store.verifyOwner(ownerId, 'rejected', reasonText);
        owners = store.getOwners();
        window.showToast(`Application for ${owner.name} rejected.`, 'error');
        closeModal();
        render();
      }
    });
  }

  // Initial render
  render();
}
