import { api } from '../../services/api.js';

export async function renderAdminPaymentsView(container) {
  let payments = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading payment transactions...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getAdminPayments();
      payments = res.payments;
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
                <th>Transaction ID</th>
                <th>Booking Ref & Hotel</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Gateway Reference</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--color-primary); font-size: 0.85rem;">${p.transaction_id}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-family: monospace;">${p.booking_code}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${p.hotel_name}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${p.customer_name}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.8rem;">${p.payment_method}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-size: 0.92rem;">₹${p.amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.72rem; font-family: monospace; color: var(--text-muted);">${p.gateway_reference}</span>
                  </td>
                  <td>
                    <span class="status-pill ${p.status}">${p.status}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(p.created_at).toLocaleString()}</div>
                  </td>
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
