import { api } from '../../services/api.js';

export async function renderOwnerPickupsView(container) {
  let activeTab = 'requests'; // 'requests', 'vehicles', 'locations'
  let hotels = [];
  let pickups = [];
  let pickupSettings = null;
  let statusFilter = 'all';

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading pickup services & requests...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const hotelsRes = await api.getOwnerHotels();
      hotels = hotelsRes.hotels || [];
      if (hotels.length > 0) {
        const hotel = hotels[0];
        const [pickupsRes, settingsRes] = await Promise.all([
          api.getPickups({ hotel_id: hotel.id }),
          api.getHotelPickupSettings(hotel.id)
        ]);
        pickups = pickupsRes.pickups || [];
        pickupSettings = settingsRes;
      }
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error loading pickup data: ${err.message}</div>`;
    }
  }

  function render() {
    if (hotels.length === 0) {
      container.innerHTML = `<div class="panel-card">Please register an active hotel first to manage pickup services.</div>`;
      return;
    }

    const hotel = hotels[0];
    const isEnabled = pickupSettings ? pickupSettings.pickup_service_enabled !== false : true;
    const locations = pickupSettings?.all_locations || hotel.pickup_locations || [];
    const vehicles = pickupSettings?.all_vehicles || hotel.pickup_vehicles || [];

    const filteredPickups = pickups.filter(p => {
      if (statusFilter === 'all') return true;
      return p.pickup && p.pickup.status === statusFilter;
    });

    container.innerHTML = `
      <!-- TOP STATUS BAR & GLOBAL TOGGLE -->
      <div class="panel-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark);">${hotel.name}</h2>
            <span class="status-pill ${isEnabled ? 'active' : 'inactive'}">
              ${isEnabled ? 'Pickup Service LIVE' : 'Pickup Service DISABLED'}
            </span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Manage airport, railway & bus pickup fleets, custom pick-up points, and guest transfer requests.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <button id="btn-toggle-service" class="btn ${isEnabled ? 'btn-secondary' : 'btn-primary'}" style="font-size: 0.82rem;">
            <i data-lucide="${isEnabled ? 'power-off' : 'check'}"></i>
            ${isEnabled ? 'Disable Pickup Service' : 'Enable Pickup Service'}
          </button>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <button class="btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-requests">
          <i data-lucide="calendar-check"></i> Pickup Requests (${pickups.length})
        </button>
        <button class="btn btn-sm ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-vehicles">
          <i data-lucide="car"></i> Vehicle Fleet (${vehicles.length})
        </button>
        <button class="btn btn-sm ${activeTab === 'locations' ? 'btn-primary' : 'btn-secondary'}" id="tab-btn-locations">
          <i data-lucide="map-pin"></i> Pickup Locations (${locations.length})
        </button>
      </div>

      <!-- TAB 1: PICKUP REQUESTS QUEUE -->
      ${activeTab === 'requests' ? `
        <div class="filter-bar" style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Filter Status:</span>
            <select id="status-filter-select" class="form-control" style="padding: 4px 10px; font-size: 0.82rem; width: auto;">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Requests (${pickups.length})</option>
              <option value="requested" ${statusFilter === 'requested' ? 'selected' : ''}>Requested</option>
              <option value="confirmed" ${statusFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="assigned" ${statusFilter === 'assigned' ? 'selected' : ''}>Driver Assigned</option>
              <option value="driver_on_way" ${statusFilter === 'driver_on_way' ? 'selected' : ''}>Driver On Way</option>
              <option value="arrived" ${statusFilter === 'arrived' ? 'selected' : ''}>Arrived</option>
              <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>

        <div class="panel-card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="commercial-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest & Contact</th>
                  <th>Pickup Type & Location</th>
                  <th>Schedule</th>
                  <th>Vehicle & Pax</th>
                  <th>Pickup Fare</th>
                  <th>Driver Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPickups.length === 0 ? `
                  <tr><td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">No pickup requests found for this filter.</td></tr>
                ` : filteredPickups.map(p => {
                  const pk = p.pickup || {};
                  const drv = pk.driver || {};
                  const isAssigned = drv.name && drv.name.trim() !== '';
                  return `
                    <tr>
                      <td>
                        <span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${p.booking_code}</span>
                      </td>
                      <td>
                        <div style="font-weight: 700;">${p.customer_name}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${p.customer_phone || p.customer_email}</div>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: var(--color-primary-dark); text-transform: capitalize;">
                          ${pk.type === 'airport' ? '✈️ Airport' : pk.type === 'railway' ? '🚆 Railway' : pk.type === 'bus' ? '🚌 Bus' : '📍 Custom'}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-dark); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
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
                        <div style="font-weight: 600;">${pk.location_name || 'Station Transfer'}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${pk.pickup_time || '10:30 AM'}</div>
                      </td>
                      <td>
                        <strong style="color: #2E7D32; font-size: 0.95rem;">${(pk.pickup_charge === 0 || pk.pickup_service === 'FREE' || pk.service === 'FREE') ? 'FREE (₹0)' : `₹${(pk.pickup_charge || 0).toLocaleString('en-IN')}`}</strong>
                      </td>
                      <td>
                        ${isAssigned ? `
                          <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-dark);">👤 ${drv.name}</div>
                          <div style="font-size: 0.7rem; color: var(--text-muted);">${drv.phone ? '📞 ' + drv.phone : ''} ${drv.vehicle_number ? `(${drv.vehicle_number})` : ''}</div>
                        ` : `
                          <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">Unassigned</span>
                        `}
                      </td>
                      <td>
                        <span class="status-pill ${pk.status || 'confirmed'}">${(pk.status || 'confirmed').replace('_', ' ')}</span>
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                          <button class="btn btn-secondary btn-sm btn-assign-driver" data-booking-id="${p.booking_id}">
                            <i data-lucide="user-check"></i> Driver
                          </button>
                          <button class="btn btn-primary btn-sm btn-update-status" data-booking-id="${p.booking_id}">
                            <i data-lucide="refresh-cw"></i> Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- TAB 2: VEHICLE FLEET MANAGEMENT -->
      ${activeTab === 'vehicles' ? `
        <div class="filter-bar" style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1rem; font-weight: 700;">Configured Vehicles (${vehicles.length})</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-vehicle">
            <i data-lucide="plus"></i> Add Vehicle
          </button>
        </div>

        <div class="panel-card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="commercial-table">
              <thead>
                <tr>
                  <th>Vehicle Name & Category</th>
                  <th>Max Capacity</th>
                  <th>Fixed Pickup Price</th>
                  <th>Vehicle Number / Plate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${vehicles.length === 0 ? `
                  <tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No vehicles configured yet.</td></tr>
                ` : vehicles.map(v => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-dark);">${v.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${v.type || 'Sedan'}</div>
                    </td>
                    <td><strong>${v.capacity} Passengers max</strong></td>
                    <td><strong style="color: var(--status-success); font-size: 0.95rem;">₹${(v.price || 800).toLocaleString('en-IN')}</strong></td>
                    <td><span style="font-family: monospace; font-size: 0.8rem; font-weight: 600;">${v.vehicle_number || 'N/A'}</span></td>
                    <td><span class="status-pill ${v.active !== false ? 'active' : 'inactive'}">${v.active !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm btn-edit-vehicle" data-vehicle-id="${v.id}">
                          <i data-lucide="edit-3"></i> Edit
                        </button>
                        <button class="btn btn-secondary btn-sm btn-delete-vehicle" data-vehicle-id="${v.id}" style="color: var(--status-danger);">
                          <i data-lucide="trash-2"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- TAB 3: PICKUP LOCATIONS MANAGEMENT -->
      ${activeTab === 'locations' ? `
        <div class="filter-bar" style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1rem; font-weight: 700;">Configured Pickup Locations (${locations.length})</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-location">
            <i data-lucide="plus"></i> Add Location
          </button>
        </div>

        <div class="panel-card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="commercial-table">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Location Category</th>
                  <th>Address / Landmark</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${locations.length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">No locations configured yet.</td></tr>
                ` : locations.map(l => `
                  <tr>
                    <td><strong style="color: var(--text-dark);">${l.name}</strong></td>
                    <td><span style="text-transform: capitalize; font-weight: 600; color: var(--color-primary);">${l.type || 'Custom'}</span></td>
                    <td><span style="font-size: 0.8rem; color: var(--text-muted);">${l.address || 'N/A'}</span></td>
                    <td><span class="status-pill ${l.active !== false ? 'active' : 'inactive'}">${l.active !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm btn-edit-location" data-location-id="${l.id}">
                          <i data-lucide="edit-3"></i> Edit
                        </button>
                        <button class="btn btn-secondary btn-sm btn-delete-location" data-location-id="${l.id}" style="color: var(--status-danger);">
                          <i data-lucide="trash-2"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- MODAL CONTAINER -->
      <div id="pickup-modal-root"></div>
    `;

    bindEvents(hotel.id);
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents(hotelId) {
    // Tab Switching
    container.querySelector('#tab-btn-requests')?.addEventListener('click', () => {
      activeTab = 'requests';
      render();
    });
    container.querySelector('#tab-btn-vehicles')?.addEventListener('click', () => {
      activeTab = 'vehicles';
      render();
    });
    container.querySelector('#tab-btn-locations')?.addEventListener('click', () => {
      activeTab = 'locations';
      render();
    });

    // Global Service Toggle
    container.querySelector('#btn-toggle-service')?.addEventListener('click', async () => {
      const current = pickupSettings ? pickupSettings.pickup_service_enabled !== false : true;
      try {
        await api.updateHotelPickupSettings(hotelId, !current);
        window.showToast(`Pickup service ${!current ? 'enabled' : 'disabled'} for ${hotels[0].name}.`, 'success');
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });

    // Status Filter
    container.querySelector('#status-filter-select')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    // Assign Driver Buttons
    container.querySelectorAll('.btn-assign-driver').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-booking-id');
        const booking = pickups.find(p => p.booking_id === bId);
        openAssignDriverModal(bId, booking);
      });
    });

    // Update Status Buttons
    container.querySelectorAll('.btn-update-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-booking-id');
        const booking = pickups.find(p => p.booking_id === bId);
        openUpdateStatusModal(bId, booking);
      });
    });

    // Add / Edit Vehicle
    container.querySelector('#btn-add-vehicle')?.addEventListener('click', () => {
      openVehicleModal(hotelId, null);
    });

    container.querySelectorAll('.btn-edit-vehicle').forEach(btn => {
      btn.addEventListener('click', () => {
        const vId = btn.getAttribute('data-vehicle-id');
        const vehicle = (pickupSettings?.all_vehicles || hotels[0].pickup_vehicles || []).find(v => v.id === vId);
        openVehicleModal(hotelId, vehicle);
      });
    });

    container.querySelectorAll('.btn-delete-vehicle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const vId = btn.getAttribute('data-vehicle-id');
        if (confirm('Are you sure you want to remove this vehicle from your fleet?')) {
          try {
            await api.deletePickupVehicle(hotelId, vId);
            window.showToast('Vehicle removed from fleet.', 'success');
            loadData();
          } catch (err) {
            window.showToast(err.message, 'error');
          }
        }
      });
    });

    // Add / Edit Location
    container.querySelector('#btn-add-location')?.addEventListener('click', () => {
      openLocationModal(hotelId, null);
    });

    container.querySelectorAll('.btn-edit-location').forEach(btn => {
      btn.addEventListener('click', () => {
        const lId = btn.getAttribute('data-location-id');
        const location = (pickupSettings?.all_locations || hotels[0].pickup_locations || []).find(l => l.id === lId);
        openLocationModal(hotelId, location);
      });
    });

    container.querySelectorAll('.btn-delete-location').forEach(btn => {
      btn.addEventListener('click', async () => {
        const lId = btn.getAttribute('data-location-id');
        if (confirm('Are you sure you want to remove this pickup point?')) {
          try {
            await api.deletePickupLocation(hotelId, lId);
            window.showToast('Pickup point removed.', 'success');
            loadData();
          } catch (err) {
            window.showToast(err.message, 'error');
          }
        }
      });
    });
  }

  // --- MODAL: ASSIGN DRIVER ---
  function openAssignDriverModal(bookingId, booking) {
    const modalRoot = container.querySelector('#pickup-modal-root');
    const existingDriver = booking?.pickup?.driver || {};

    modalRoot.innerHTML = `
      <div class="modal-backdrop active" id="assign-driver-backdrop">
        <div class="modal-card" style="max-width: 480px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">Assign Transfer Driver</h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-assign-modal">✕</button>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
            Assign verified front-desk driver and vehicle for Booking <strong>${booking?.booking_code}</strong> (${booking?.customer_name}).
          </p>

          <form id="form-assign-driver">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Driver Full Name *</label>
              <input type="text" id="driver-name" class="form-control" value="${existingDriver.name || ''}" placeholder="e.g. Ramesh Chandra" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Driver Phone / WhatsApp *</label>
              <input type="text" id="driver-phone" class="form-control" value="${existingDriver.phone || ''}" placeholder="e.g. +91 98300 12345" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Vehicle Model & Plate Number</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <input type="text" id="driver-vehicle" class="form-control" value="${existingDriver.vehicle || booking?.pickup?.vehicle_name || 'Executive Sedan'}" placeholder="e.g. Toyota Etios">
                <input type="text" id="driver-vehicle-num" class="form-control" value="${existingDriver.vehicle_number || ''}" placeholder="e.g. WB-30-AB-1290">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-assign">Cancel</button>
              <button type="submit" class="btn btn-primary">Confirm Assignment</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-assign-modal').addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-cancel-assign').addEventListener('click', closeModal);

    modalRoot.querySelector('#form-assign-driver').addEventListener('submit', async (e) => {
      e.preventDefault();
      const driverData = {
        driver_name: modalRoot.querySelector('#driver-name').value.trim(),
        driver_phone: modalRoot.querySelector('#driver-phone').value.trim(),
        vehicle: modalRoot.querySelector('#driver-vehicle').value.trim(),
        vehicle_number: modalRoot.querySelector('#driver-vehicle-num').value.trim()
      };

      try {
        await api.assignPickupDriver(bookingId, driverData);
        window.showToast('Driver assigned successfully.', 'success');
        closeModal();
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // --- MODAL: UPDATE STATUS ---
  function openUpdateStatusModal(bookingId, booking) {
    const modalRoot = container.querySelector('#pickup-modal-root');
    const currentStatus = booking?.pickup?.status || 'confirmed';

    modalRoot.innerHTML = `
      <div class="modal-backdrop active" id="update-status-backdrop">
        <div class="modal-card" style="max-width: 440px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">Update Transfer Status</h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-status-modal">✕</button>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
            Update live status for Booking <strong>${booking?.booking_code}</strong>.
          </p>

          <form id="form-update-status">
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Pickup Service Status</label>
              <select id="pickup-new-status" class="form-control">
                <option value="requested" ${currentStatus === 'requested' ? 'selected' : ''}>Requested (Pending review)</option>
                <option value="confirmed" ${currentStatus === 'confirmed' ? 'selected' : ''}>Confirmed (Accepted)</option>
                <option value="assigned" ${currentStatus === 'assigned' ? 'selected' : ''}>Vehicle/Driver Assigned</option>
                <option value="driver_on_way" ${currentStatus === 'driver_on_way' ? 'selected' : ''}>Driver On Way</option>
                <option value="arrived" ${currentStatus === 'arrived' ? 'selected' : ''}>Driver Arrived at Station/Airport</option>
                <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed (Guest Dropped at Hotel)</option>
                <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Internal Front-Desk Notes (Optional)</label>
              <input type="text" id="status-notes" class="form-control" placeholder="e.g. Guest called, train delayed by 15 mins">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-status">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Status</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-status-modal').addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-cancel-status').addEventListener('click', closeModal);

    modalRoot.querySelector('#form-update-status').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newStatus = modalRoot.querySelector('#pickup-new-status').value;
      const notes = modalRoot.querySelector('#status-notes').value.trim();

      try {
        await api.updatePickupStatus(bookingId, newStatus, notes);
        window.showToast(`Pickup status updated to ${newStatus.toUpperCase()}.`, 'success');
        closeModal();
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // --- MODAL: ADD / EDIT VEHICLE ---
  function openVehicleModal(hotelId, vehicle) {
    const isEdit = !!vehicle;
    const modalRoot = container.querySelector('#pickup-modal-root');

    modalRoot.innerHTML = `
      <div class="modal-backdrop active">
        <div class="modal-card" style="max-width: 460px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">${isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-veh-modal">✕</button>
          </div>

          <form id="form-vehicle-manage">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Vehicle Name / Model *</label>
              <input type="text" id="veh-name" class="form-control" value="${vehicle?.name || ''}" placeholder="e.g. Executive Sedan (Dzire)" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Vehicle Category</label>
              <select id="veh-type" class="form-control">
                <option value="Sedan" ${vehicle?.type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                <option value="SUV" ${vehicle?.type === 'SUV' ? 'selected' : ''}>SUV</option>
                <option value="Tempo Traveller" ${vehicle?.type === 'Tempo Traveller' ? 'selected' : ''}>Tempo Traveller</option>
                <option value="Luxury Bus" ${vehicle?.type === 'Luxury Bus' ? 'selected' : ''}>Luxury Bus</option>
              </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Max Capacity (Pax) *</label>
                <input type="number" id="veh-capacity" class="form-control" min="1" max="50" value="${vehicle?.capacity || 4}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Fixed Fare (₹) *</label>
                <input type="number" id="veh-price" class="form-control" min="0" value="${vehicle?.price || 800}" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Vehicle Plate / Registration Number</label>
              <input type="text" id="veh-plate" class="form-control" value="${vehicle?.vehicle_number || ''}" placeholder="e.g. WB-30-AB-1290">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
                <input type="checkbox" id="veh-active" ${vehicle ? (vehicle.active !== false ? 'checked' : '') : 'checked'}>
                Vehicle is available for active bookings
              </label>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-veh">Cancel</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Vehicle'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-veh-modal').addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-cancel-veh').addEventListener('click', closeModal);

    modalRoot.querySelector('#form-vehicle-manage').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: modalRoot.querySelector('#veh-name').value.trim(),
        type: modalRoot.querySelector('#veh-type').value,
        capacity: Number(modalRoot.querySelector('#veh-capacity').value),
        price: Number(modalRoot.querySelector('#veh-price').value),
        vehicle_number: modalRoot.querySelector('#veh-plate').value.trim(),
        active: modalRoot.querySelector('#veh-active').checked
      };

      try {
        if (isEdit) {
          await api.updatePickupVehicle(hotelId, vehicle.id, payload);
          window.showToast('Vehicle updated successfully.', 'success');
        } else {
          await api.addPickupVehicle(hotelId, payload);
          window.showToast('Vehicle added to fleet.', 'success');
        }
        closeModal();
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // --- MODAL: ADD / EDIT LOCATION ---
  function openLocationModal(hotelId, location) {
    const isEdit = !!location;
    const modalRoot = container.querySelector('#pickup-modal-root');

    modalRoot.innerHTML = `
      <div class="modal-backdrop active">
        <div class="modal-card" style="max-width: 460px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">${isEdit ? 'Edit Pickup Point' : 'Add Pickup Point'}</h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-loc-modal">✕</button>
          </div>

          <form id="form-location-manage">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Location Name *</label>
              <input type="text" id="loc-name" class="form-control" value="${location?.name || ''}" placeholder="e.g. New Digha Railway Station" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Location Category</label>
              <select id="loc-type" class="form-control">
                <option value="railway" ${location?.type === 'railway' ? 'selected' : ''}>Railway Station</option>
                <option value="airport" ${location?.type === 'airport' ? 'selected' : ''}>Airport</option>
                <option value="bus" ${location?.type === 'bus' ? 'selected' : ''}>Bus Stand / Terminal</option>
                <option value="custom" ${location?.type === 'custom' ? 'selected' : ''}>Custom Landmark / Other</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Address / Landmark Details</label>
              <input type="text" id="loc-address" class="form-control" value="${location?.address || ''}" placeholder="e.g. Near Station Exit Gate 1, New Digha">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
                <input type="checkbox" id="loc-active" ${location ? (location.active !== false ? 'checked' : '') : 'checked'}>
                Location is active for guest bookings
              </label>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-loc">Cancel</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Location'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#btn-close-loc-modal').addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-cancel-loc').addEventListener('click', closeModal);

    modalRoot.querySelector('#form-location-manage').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: modalRoot.querySelector('#loc-name').value.trim(),
        type: modalRoot.querySelector('#loc-type').value,
        address: modalRoot.querySelector('#loc-address').value.trim(),
        active: modalRoot.querySelector('#loc-active').checked
      };

      try {
        if (isEdit) {
          await api.updatePickupLocation(hotelId, location.id, payload);
          window.showToast('Pickup point updated.', 'success');
        } else {
          await api.addPickupLocation(hotelId, payload);
          window.showToast('Pickup point added.', 'success');
        }
        closeModal();
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  loadData();
}
