import { api } from '../../services/api.js';

export async function renderAdminCustomersView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading customer accounts...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const bookingsRes = await api.getAdminBookings();
    const bookings = bookingsRes.bookings;

    // Aggregate customers from bookings
    const custMap = {};
    bookings.forEach(b => {
      if (!custMap[b.customer_email]) {
        custMap[b.customer_email] = {
          name: b.customer_name,
          email: b.customer_email,
          phone: b.customer_phone,
          bookings_count: 0,
          total_spent: 0,
          last_booking_date: b.created_at
        };
      }
      custMap[b.customer_email].bookings_count += 1;
      custMap[b.customer_email].total_spent += b.total_amount || 0;
    });

    const customers = Object.values(custMap);

    container.innerHTML = `
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Contact Phone</th>
                <th>Total Bookings</th>
                <th>Lifetime Spend</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td><div style="font-weight: 700;">${c.name}</div></td>
                  <td>${c.email}</td>
                  <td>${c.phone || 'N/A'}</td>
                  <td><span style="font-weight: 600;">${c.bookings_count} bookings</span></td>
                  <td style="font-weight: 700; color: var(--color-primary);">₹${c.total_spent.toLocaleString('en-IN')}</td>
                  <td><div style="font-size: 0.78rem; color: var(--text-secondary);">${new Date(c.last_booking_date).toLocaleDateString()}</div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
