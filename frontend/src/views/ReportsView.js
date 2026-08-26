import { store } from '../services/store.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let reportChartInstance = null;

export function renderReportsView(container) {
  let activeTab = 'daily'; // 'daily' or 'monthly'
  const daily = store.getDailyIncome();
  const monthly = store.getMonthlyIncome();

  function render() {
    const totalDailyGross = daily.reduce((s, d) => s + d.grossAmount, 0);
    const totalDailyCommission = daily.reduce((s, d) => s + d.commissionEarned, 0);
    const totalDailyPayout = daily.reduce((s, d) => s + d.ownerPayout, 0);

    const totalMonthlyGross = monthly.reduce((s, m) => s + m.grossAmount, 0);
    const totalMonthlyCommission = monthly.reduce((s, m) => s + m.commissionEarned, 0);

    container.innerHTML = `
      <!-- Financial Overview Cards -->
      <div class="metrics-grid">
        <div class="metric-card glow-primary">
          <div class="metric-header">
            <span class="metric-title">Aggregate Gross Booking Volume</span>
            <div class="metric-icon-box primary"><i data-lucide="bar-chart-3"></i></div>
          </div>
          <div class="metric-value">₹${(activeTab === 'daily' ? totalDailyGross : totalMonthlyGross).toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span style="color: var(--text-secondary);">${activeTab === 'daily' ? 'Last 7 Days Rolling' : 'Year-to-Date Total'}</span>
          </div>
        </div>

        <div class="metric-card glow-success">
          <div class="metric-header">
            <span class="metric-title">Net Platform Commission</span>
            <div class="metric-icon-box success"><i data-lucide="wallet-cards"></i></div>
          </div>
          <div class="metric-value">₹${(activeTab === 'daily' ? totalDailyCommission : totalMonthlyCommission).toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span class="metric-trend up"><i data-lucide="trending-up"></i> Retained Revenue</span>
          </div>
        </div>

        <div class="metric-card glow-purple">
          <div class="metric-header">
            <span class="metric-title">Owner Payout Disbursements</span>
            <div class="metric-icon-box purple"><i data-lucide="coins"></i></div>
          </div>
          <div class="metric-value">₹${(activeTab === 'daily' ? totalDailyPayout : totalMonthlyGross - totalMonthlyCommission).toLocaleString('en-IN')}</div>
          <div class="metric-footer">
            <span style="color: var(--text-muted);">85% Payout to Hotel Owners</span>
          </div>
        </div>
      </div>

      <!-- Tab Switcher & Export Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; padding: 3px;">
            <button class="btn btn-sm ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}" id="tab-daily">
              <i data-lucide="calendar"></i> Daily Income Report
            </button>
            <button class="btn btn-sm ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}" id="tab-monthly">
              <i data-lucide="calendar-range"></i> Monthly Income Report
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="btn btn-secondary" id="btn-export-current-report">
            <i data-lucide="download"></i> Download ${activeTab === 'daily' ? 'Daily' : 'Monthly'} CSV
          </button>
        </div>
      </div>

      <!-- Financial Chart Card -->
      <div class="dashboard-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>${activeTab === 'daily' ? 'Daily Revenue & Commission Breakdown' : 'Monthly Platform Income Growth'}</h2>
            <p>Visual trend of gross transaction volume against platform commission earnings</p>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas id="financialReportChart"></canvas>
        </div>
      </div>

      <!-- Income Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="card-header" style="padding: 20px 24px; margin-bottom: 0;">
          <div class="card-title-group">
            <h2>${activeTab === 'daily' ? 'Itemized Daily Income Records' : 'Itemized Monthly Income Records'}</h2>
            <p>Auditable platform financial statements</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>${activeTab === 'daily' ? 'Date' : 'Month'}</th>
                <th>Bookings Count</th>
                <th>Gross Volume</th>
                <th>Platform Commission (15%)</th>
                <th>Hotel Owner Payout</th>
                <th>Refunds Deducted</th>
              </tr>
            </thead>
            <tbody>
              ${activeTab === 'daily' ? daily.map(d => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${d.date}</div>
                  </td>
                  <td>
                    <span style="font-weight: 600; color: var(--text-main);">${d.bookingsCount} Bookings</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">₹${d.grossAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--success); font-size: 0.95rem;">+ ₹${d.commissionEarned.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">₹${d.ownerPayout.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: ${d.refunds > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                      ${d.refunds > 0 ? `- ₹${d.refunds.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                  </td>
                </tr>
              `).join('') : monthly.map(m => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${m.month}</div>
                  </td>
                  <td>
                    <span style="font-weight: 600; color: var(--text-main);">${m.bookingsCount} Bookings</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff; font-size: 1rem;">₹${m.grossAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--success); font-size: 1rem;">+ ₹${m.commissionEarned.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">₹${m.ownerPayout.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: ${m.refunds > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
                      ${m.refunds > 0 ? `- ₹${m.refunds.toLocaleString('en-IN')}` : '₹0'}
                    </div>
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

    setTimeout(() => {
      initReportChart();
    }, 50);
  }

  function initReportChart() {
    const ctx = document.getElementById('financialReportChart')?.getContext('2d');
    if (!ctx) return;

    if (reportChartInstance) {
      reportChartInstance.destroy();
    }

    const labels = activeTab === 'daily' ? daily.map(d => d.date) : monthly.map(m => m.month);
    const grossData = activeTab === 'daily' ? daily.map(d => d.grossAmount) : monthly.map(m => m.grossAmount);
    const commData = activeTab === 'daily' ? daily.map(d => d.commissionEarned) : monthly.map(m => m.commissionEarned);

    reportChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gross Volume (₹)',
            data: grossData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4
          },
          {
            label: 'Platform Net Commission (₹)',
            data: commData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#64748b',
              callback: (val) => '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : (val / 1000) + 'k')
            }
          }
        }
      }
    });
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

    container.querySelector('#btn-export-current-report')?.addEventListener('click', () => {
      store.exportToCSV(activeTab === 'daily' ? 'daily_income' : 'monthly_income');
      window.showToast(`${activeTab.toUpperCase()} income statement exported to CSV.`, 'success');
    });
  }

  // Initial render
  render();
}
