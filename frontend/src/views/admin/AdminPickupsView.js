import { api } from '../../services/api.js';

export async function renderAdminPickupsView(container) {
  let pickups = [];
  let hotels = [];
  let searchQuery = '';
  let statusFilter = 'all';
  let hotelFilter = 'all';
  let typeFilter = 'all';

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading platform-wide pickup transfers...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const [pickupsRes, hotelsRes] = await Promise.all([
        api.getPickups(),
        api.getAdminHotels()
      ]);
      pickups = pickupsRes.pickups || [];
      hotels = hotelsRes.hotels || [];
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error loading pickups: ${err.message}</div>`;
    }
  }

  function render() {
    const filteredPickups = pickups.filter(p => {
      const pk = p.pickup || {};
      const matchSearch = p.booking_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pk.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || pk.status === statusFilter;
      const matchHotel = hotelFilter === 'all' || p.hotel_id === hotelFilter;
      const matchType = typeFilter === 'all' || pk.type === typeFilter;

      return matchSearch && matchStatus && matchHotel && matchType;
    });

    const totalRevenue = pickups.reduce((sum, p) => sum + (p.pickup?.pickup_charge || 0), 0);
    const activeCount = pickups.filter(p => ['confirmed', 'assigned', 'driver_on_way'].includes(p.pickup?.status)).length;
    const completedCount = pickups.filter(p => p.pickup?.status === 'completed').length;

    container.innerHTML = `
      <!-- TOP METRIC CARDS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div class="panel-card" style="padding: 16px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Transfers</div>
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--color-primary); margin-top: 4px;">${pickups.length}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">All-time customer requests</div>
        </div>

        <div class="panel-card" style="padding: 16px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Active / On-Duty</div>
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--color-gold); margin-top: 4px;">${activeCount}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Confirmed or en route</div>
        </div>

        <div class="panel-card" style="padding: 16px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Completed Transfers</div>
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--status-success); margin-top: 4px;">${completedCount}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Guests safely dropped</div>
        </div>

        <div class="panel-card" style="padding: 16px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Pickup Gross Volume</div>
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--text-dark); margin-top: 4px;">₹${totalRevenue.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: var(--status-success); margin-top: 2px;">100% Verified Revenue</div>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-bar" style="margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div class="search-input-box" style="flex: 1; min-width: 220px;">
          <i data-lucide="search" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
          <input type="text" id="pickup-search-input" placeholder="Search by Booking ID, Guest, Hotel, Location..." value="${searchQuery}">
        </div>

        <select class="select-filter" id="pickup-hotel-filter" style="min-width: 180px;">
          <option value="all" ${hotelFilter === 'all' ? 'selected' : ''}>All Hotels</option>
          ${hotels.map(h => `<option value="${h.id}" ${hotelFilter === h.id ? 'selected' : ''}>${h.name}</option>`).join('')}
        </select>

        <select class="select-filter" id="pickup-type-filter">
          <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All Pickup Types</option>
          <option value="airport" ${typeFilter === 'airport' ? 'selected' : ''}>Airport</option>
          <option value="railway" ${typeFilter === 'railway' ? 'selected' : ''}>Railway Station</option>
          <option value="bus" ${typeFilter === 'bus' ? 'selected' : ''}>Bus Stand</option>
          <option value="other" ${typeFilter === 'other' ? 'selected' : ''}>Custom Location</option>
        </select>

        <select class="select-filter" id="pickup-status-filter">
          <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="requested" ${statusFilter === 'requested' ? 'selected' : ''}>Requested</option>
          <option value="confirmed" ${statusFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="assigned" ${statusFilter === 'assigned' ? 'selected' : ''}>Driver Assigned</option>
          <option value="driver_on_way" ${statusFilter === 'driver_on_way' ? 'selected' : ''}>Driver On Way</option>
          <option value="arrived" ${statusFilter === 'arrived' ? 'selected' : ''}>Arrived</option>
          <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>

      <!-- TABLE -->
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Booking Code</th>
                <th>Hotel Property</th>
                <th>Guest Details</th>
                <th>Pickup Point & Type</th>
                <th>Schedule</th>
                <th>Vehicle & Fare</th>
                <th>Assigned Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPickups.length === 0 ? `
                <tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">No transfer activity found matching criteria.</td></tr>
              ` : filteredPickups.map(p => {
                const pk = p.pickup || {};
                const drv = pk.driver || {};
                return `
                  <tr>
                    <td>
                      <span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${p.booking_code}</span>
                      <div style="font-size: 0.7rem; color: var(--text-muted);">${new Date(p.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--text-dark);">${p.hotel_name}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600;">${p.customer_name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${p.customer_phone || p.customer_email}</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--color-primary-dark); text-transform: capitalize;">
                        ${pk.type === 'airport' ? '✈️ Airport' : pk.type === 'railway' ? '🚆 Railway' : pk.type === 'bus' ? '🚌 Bus' : '📍 Custom'}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${pk.location_name || 'Designated Point'}
                      </div>
                      ${pk.flight_number ? `<div style="font-size: 0.7rem; color: var(--color-primary);">Flight: ${pk.flight_number}</div>` : ''}
                      ${pk.train_number ? `<div style="font-size: 0.7rem; color: var(--color-primary);">Train: ${pk.train_number}</div>` : ''}
                    </td>
                    <td>
                      <div style="font-weight: 600;">${pk.pickup_time || '10:30 AM'}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${pk.pickup_date || p.check_in_date}</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #2E7D32;">${(pk.pickup_charge === 0 || pk.pickup_service === 'FREE' || pk.service === 'FREE') ? 'FREE (₹0)' : `₹${(pk.pickup_charge || 0).toLocaleString('en-IN')}`}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${pk.location_name || 'Station Transfer'}</div>
                    </td>
                    <td>
                      ${drv.name ? `
                        <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-dark);">👤 ${drv.name}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${drv.phone ? '📞 ' + drv.phone : ''} ${drv.vehicle_number ? `(${drv.vehicle_number})` : ''}</div>
                      ` : `
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">Unassigned</span>
                      `}
                    </td>
                    <td>
                      <span class="status-pill ${pk.status || 'confirmed'}">${(pk.status || 'confirmed').replace('_', ' ')}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#pickup-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#pickup-hotel-filter')?.addEventListener('change', (e) => {
      hotelFilter = e.target.value;
      render();
    });

    container.querySelector('#pickup-type-filter')?.addEventListener('change', (e) => {
      typeFilter = e.target.value;
      render();
    });

    container.querySelector('#pickup-status-filter')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });
  }

  loadData();
}
