import { api } from '../../services/api.js';

export async function renderAdminReportsView(container) {
  let activeTab = 'daily'; // 'daily' or 'monthly'
  let dailyData = [];
  let monthlyData = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading financial statements...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const [dRes, mRes] = await Promise.all([api.getDailyReport(), api.getMonthlyReport()]);
      dailyData = dRes.daily_report;
      monthlyData = mRes.monthly_report;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <div style="background: var(--bg-surface-secondary); padding: 3px; border-radius: var(--radius-sm); display: flex;">
            <button class="btn btn-sm ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}" id="tab-daily">
              Daily Financial Report
            </button>
            <button class="btn btn-sm ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}" id="tab-monthly">
              Monthly Financial Report
            </button>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-export-csv">
          <i data-lucide="download"></i> Export ${activeTab.toUpperCase()} CSV
        </button>
      </div>

      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>${activeTab === 'daily' ? 'Date' : 'Month'}</th>
                <th>Total Bookings</th>
                <th>Gross Volume (INR)</th>
                <th>Platform Commission (15%)</th>
                <th>Owner Net Disbursements</th>
                <th>Refunds Deducted</th>
              </tr>
            </thead>
            <tbody>
              ${activeTab === 'daily' ? dailyData.map(d => `
                <tr>
                  <td><strong>${d.date}</strong></td>
                  <td>${d.bookings_count} bookings</td>
                  <td style="font-weight: 700;">₹${d.gross_amount.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 700; color: var(--status-success);">+ ₹${d.commission_earned.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 600;">₹${d.owner_payout.toLocaleString('en-IN')}</td>
                  <td style="color: ${d.refunds_amount > 0 ? 'var(--status-danger)' : 'var(--text-muted)'};">
                    ${d.refunds_amount > 0 ? `- ₹${d.refunds_amount.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                </tr>
              `).join('') : monthlyData.map(m => `
                <tr>
                  <td><strong>${m.month}</strong></td>
                  <td>${m.bookings_count} bookings</td>
                  <td style="font-weight: 700;">₹${m.gross_amount.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 700; color: var(--status-success);">+ ₹${m.commission_earned.toLocaleString('en-IN')}</td>
                  <td style="font-weight: 600;">₹${m.owner_payout.toLocaleString('en-IN')}</td>
                  <td style="color: ${m.refunds_amount > 0 ? 'var(--status-danger)' : 'var(--text-muted)'};">
                    ${m.refunds_amount > 0 ? `- ₹${m.refunds_amount.toLocaleString('en-IN')}` : '₹0'}
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
    container.querySelector('#tab-daily')?.addEventListener('click', () => {
      activeTab = 'daily';
      render();
    });

    container.querySelector('#tab-monthly')?.addEventListener('click', () => {
      activeTab = 'monthly';
      render();
    });

    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      const isDaily = activeTab === 'daily';
      const headers = [isDaily ? 'Date' : 'Month', 'Bookings Count', 'Gross Volume', 'Platform Commission', 'Owner Payout', 'Refunds'];
      const dataRows = isDaily
        ? dailyData.map(d => [d.date, d.bookings_count, d.gross_amount, d.commission_earned, d.owner_payout, d.refunds_amount])
        : monthlyData.map(m => [m.month, m.bookings_count, m.gross_amount, m.commission_earned, m.owner_payout, m.refunds_amount]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...dataRows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `hotelhub_${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.showToast('Financial CSV report exported successfully.', 'success');
    });
  }

  loadData();
}
