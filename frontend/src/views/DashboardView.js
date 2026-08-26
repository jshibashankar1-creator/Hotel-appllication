import { store } from '../services/store.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let revenueChartInstance = null;
let bookingStatusChartInstance = null;

export function renderDashboardView(container) {
  const kpis = store.getKPIs();
  const bookings = store.getBookings().slice(0, 5);
  const owners = store.getOwners().filter(o => o.verificationStatus === 'pending');
  const refunds = store.getRefunds().filter(r => r.status === 'pending');

  container.innerHTML = `
    <!-- Top KPI Grid -->
    <div class="metrics-grid">
      <div class="metric-card glow-primary">
        <div class="metric-header">
          <span class="metric-title">Gross Booking Value</span>
          <div class="metric-icon-box primary"><i data-lucide="wallet"></i></div>
        </div>
        <div class="metric-value">₹${kpis.totalGMV.toLocaleString('en-IN')}</div>
        <div class="metric-footer">
          <span class="metric-trend up"><i data-lucide="trending-up"></i> +18.4%</span>
          <span>vs last month</span>
        </div>
      </div>

      <div class="metric-card glow-success">
        <div class="metric-header">
          <span class="metric-title">Platform Net Commission</span>
          <div class="metric-icon-box success"><i data-lucide="percent"></i></div>
        </div>
        <div class="metric-value">₹${kpis.totalCommission.toLocaleString('en-IN')}</div>
        <div class="metric-footer">
          <span class="metric-trend up"><i data-lucide="arrow-up-right"></i> 15.0%</span>
          <span>avg platform commission cut</span>
        </div>
      </div>

      <div class="metric-card glow-purple">
        <div class="metric-header">
          <span class="metric-title">Active Hotels</span>
          <div class="metric-icon-box purple"><i data-lucide="building-2"></i></div>
        </div>
        <div class="metric-value">${kpis.activeHotels} <span style="font-size: 1rem; color: var(--text-muted); font-weight: normal;">/ ${kpis.totalHotels}</span></div>
        <div class="metric-footer">
          <span class="metric-trend up"><i data-lucide="check-circle-2"></i> 100%</span>
          <span>verified inventory live</span>
        </div>
      </div>

      <div class="metric-card glow-warning">
        <div class="metric-header">
          <span class="metric-title">Pending KYC Verification</span>
          <div class="metric-icon-box warning"><i data-lucide="shield-alert"></i></div>
        </div>
        <div class="metric-value">${kpis.pendingKYC}</div>
        <div class="metric-footer">
          <span style="color: var(--warning); font-weight: 600;">Action Required</span>
          <span>• Hotel Owner Onboarding</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Revenue & Platform Commission Trends</h2>
            <p>Daily breakdown of Gross Bookings vs 15% Platform Take Rate</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" id="btn-export-daily-chart">
              <i data-lucide="download"></i> Export CSV
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas id="revenueTrendChart"></canvas>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Booking Distribution</h2>
            <p>Breakdown by operational status</p>
          </div>
        </div>
        <div class="chart-wrapper" style="display: flex; align-items: center; justify-content: center;">
          <canvas id="bookingStatusChart" style="max-height: 250px;"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom Grids: Recent Bookings & Action Items -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
      <!-- Recent Bookings Table -->
      <div class="dashboard-card" style="margin-bottom: 0;">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Recent Platform Bookings</h2>
            <p>Real-time booking confirmations from Customer App</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-view-all-bookings">
            View All (${kpis.totalBookings})
          </button>
        </div>
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel & Guest</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary);">${b.bookingId}</span>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #fff;">${b.hotelName}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${b.customerName} • ${b.roomType}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.82rem;">${b.checkInDate}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">to ${b.checkOutDate} (${b.nights}n)</div>
                  </td>
                  <td>
                    <div style="font-weight: 700;">₹${b.totalAmount.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.72rem; color: var(--success);">Cut: ₹${b.commissionAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <span class="status-badge ${b.bookingStatus}">${b.bookingStatus}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Items & Alerts -->
      <div class="dashboard-card" style="margin-bottom: 0; display: flex; flex-direction: column; gap: 16px;">
        <div class="card-header" style="margin-bottom: 0;">
          <div class="card-title-group">
            <h2>Immediate Actions</h2>
            <p>Requires admin review & clearance</p>
          </div>
        </div>

        <!-- Pending KYC Notice -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--warning); display: flex; align-items: center; gap: 6px;">
              <i data-lucide="user-check"></i> Owner KYC Submissions
            </span>
            <span class="nav-badge warning">${owners.length} Pending</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 12px;">
            ${owners.length > 0 ? `${owners[0].name} (${owners[0].businessName}) submitted documents for review.` : 'No pending owner KYC requests.'}
          </p>
          <button class="btn btn-primary btn-sm" style="width: 100%;" id="btn-goto-kyc">
            Inspect & Verify KYC
          </button>
        </div>

        <!-- Pending Refunds Notice -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--danger); display: flex; align-items: center; gap: 6px;">
              <i data-lucide="rotate-ccw"></i> Customer Refund Queue
            </span>
            <span class="nav-badge danger">${refunds.length} Pending</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 12px;">
            ${refunds.length > 0 ? `Refund request for ${refunds[0].bookingId} (₹${refunds[0].refundAmount.toLocaleString('en-IN')}) pending.` : 'All refund requests cleared.'}
          </p>
          <button class="btn btn-danger btn-sm" style="width: 100%;" id="btn-goto-refunds">
            Process Refunds Queue
          </button>
        </div>
      </div>
    </div>
  `;

  // Initialize Charts
  setTimeout(() => {
    initRevenueChart();
    initBookingStatusChart();
  }, 50);

  // Setup Event Listeners
  container.querySelector('#btn-export-daily-chart')?.addEventListener('click', () => {
    store.exportToCSV('daily_income');
  });

  container.querySelector('#btn-view-all-bookings')?.addEventListener('click', () => {
    window.location.hash = '#bookings';
  });

  container.querySelector('#btn-goto-kyc')?.addEventListener('click', () => {
    window.location.hash = '#owners';
  });

  container.querySelector('#btn-goto-refunds')?.addEventListener('click', () => {
    window.location.hash = '#refunds';
  });
}

function initRevenueChart() {
  const ctx = document.getElementById('revenueTrendChart')?.getContext('2d');
  if (!ctx) return;

  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }

  const daily = store.getDailyIncome();
  const labels = daily.map(d => d.date.slice(5)); // '08-17', etc.
  const grossData = daily.map(d => d.grossAmount);
  const commissionData = daily.map(d => d.commissionEarned);

  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Gross Bookings (₹)',
          data: grossData,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'Admin Commission Cut (₹)',
          data: commissionData,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
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
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
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
            callback: (val) => '₹' + (val / 1000) + 'k'
          }
        }
      }
    }
  });
}

function initBookingStatusChart() {
  const ctx = document.getElementById('bookingStatusChart')?.getContext('2d');
  if (!ctx) return;

  if (bookingStatusChartInstance) {
    bookingStatusChartInstance.destroy();
  }

  const bookings = store.getBookings();
  const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length;
  const checkedIn = bookings.filter(b => b.bookingStatus === 'checked-in').length;
  const checkedOut = bookings.filter(b => b.bookingStatus === 'checked-out').length;
  const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;

  bookingStatusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
      datasets: [
        {
          data: [confirmed, checkedIn, checkedOut, cancelled],
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
          borderColor: '#111827',
          borderWidth: 3,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 11 },
            boxWidth: 12,
            padding: 14
          }
        }
      },
      cutout: '70%'
    }
  });
}
