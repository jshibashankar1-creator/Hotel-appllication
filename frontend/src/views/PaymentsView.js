import { store } from '../services/store.js';

export function renderPaymentsView(container) {
  let payments = store.getPayments();
  let statusFilter = 'all';
  let searchQuery = '';

  function render() {
    const filteredPayments = payments.filter(p => {
      const matchSearch = p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    const totalCollected = payments
      .filter(p => p.status === 'successful')
      .reduce((sum, p) => sum + p.grossAmount, 0);

    container.innerHTML = `
      <!-- Payment Metrics Header -->
      <div class="metrics-grid">
        <div class="metric-card glow-success">
          <div class="metric-header">
            <span class="metric-title">Total Processed Payments</span>
            <div class="metric-icon-box success"><i data-lucide="credit-card"></i></div>
          </div>
          <div class="metric-value">₹${totalCollected.toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span class="metric-trend up"><i data-lucide="shield-check"></i> Gateway Settled</span>
          </div>
        </div>

        <div class="metric-card glow-primary">
          <div class="metric-header">
            <span class="metric-title">Payment Gateways Active</span>
            <div class="metric-icon-box primary"><i data-lucide="zap"></i></div>
          </div>
          <div class="metric-value">UPI / Cards / NetBanking</div>
          <div class="metric-footer">
            <span style="color: var(--success);">100% Uptime (Razorpay & Stripe)</span>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="payment-search-input" placeholder="Search Txn ID, Booking, Customer..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="payment-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Transaction Statuses</option>
            <option value="successful" ${statusFilter === 'successful' ? 'selected' : ''}>Successful (Captured)</option>
            <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending Verification</option>
            <option value="refunded" ${statusFilter === 'refunded' ? 'selected' : ''}>Refunded</option>
          </select>
        </div>
      </div>

      <!-- Payment Transactions Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking ID & Hotel</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Platform Commission</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ` : filteredPayments.map(p => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.9rem;">${p.transactionId}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-family: monospace; color: #fff;">${p.bookingId}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${p.hotelName}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${p.customerName}</div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem;">
                      <i data-lucide="${p.paymentMethod.includes('UPI') ? 'smartphone' : p.paymentMethod.includes('Card') ? 'credit-card' : 'landmark'}" style="width: 14px; height: 14px; color: var(--primary);"></i>
                      <span>${p.paymentMethod}</span>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">₹${p.grossAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--success);">₹${p.commissionAmount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${p.commissionRate}% cut</div>
                  </td>
                  <td>
                    <span class="status-badge ${p.status}">${p.status}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(p.date).toLocaleString()}</div>
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
  }

  function bindEvents() {
    container.querySelector('#payment-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#payment-status-filter')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });
  }

  // Initial render
  render();
}
