import { api } from '../../services/api.js';

export async function renderOwnerAvailabilityView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <i data-lucide="loader-2" style="width: 36px; height: 36px; color: var(--color-primary); animation: spin 1s linear infinite; margin-bottom: 12px; display: inline-block;"></i>
      <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500;">Loading availability matrix & room inventory...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    // 1. Fetch authenticated property & room categories
    let rooms = [];
    let propertyName = '';

    try {
      const res = await api.getOwnerHotels();
      if (res && res.hotels && res.hotels.length > 0) {
        const hotel = res.hotels[0];
        propertyName = hotel.name || 'Hotel Property';
        rooms = (hotel.rooms || []).filter(r => r.is_active !== false);
      }
    } catch (e) {
      console.warn('Owner hotels fetch error, falling back to hotel admin rooms:', e);
    }

    // Fallback for hotel_admin if getOwnerHotels was empty
    if (rooms.length === 0) {
      try {
        const adminRoomsRes = await api.getHotelAdminRooms();
        if (adminRoomsRes && adminRoomsRes.rooms && adminRoomsRes.rooms.length > 0) {
          rooms = adminRoomsRes.rooms.filter(r => r.is_active !== false);
        }
      } catch (e) {
        console.warn('Hotel admin rooms fetch error:', e);
      }
    }

    if (rooms.length === 0) {
      container.innerHTML = `
        <div class="panel-card" style="text-align: center; padding: 48px 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-surface-secondary); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid var(--border-light);">
            <i data-lucide="bed-double" style="width: 28px; height: 28px; color: var(--text-muted);"></i>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">No Room Categories Configured</h3>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px; font-size: 0.88rem;">
            Please add room categories and total inventory under the Rooms section before managing live daily availability.
          </p>
          <a href="#/hotel-admin/rooms" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <i data-lucide="plus"></i> Go to Room Categories
          </a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let selectedRoomId = rooms[0].id;

    // Helper for robust local calendar date format YYYY-MM-DD (avoiding timezone offset shifts)
    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    async function loadMatrix() {
      const now = new Date();
      const startDateStr = formatYMD(now);
      const endDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
      const endDateStr = formatYMD(endDateObj);

      const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

      let matrix = [];
      let loadError = null;

      try {
        const availRes = await api.getRoomAvailability(selectedRoomId, startDateStr, endDateStr);
        if (availRes && Array.isArray(availRes.matrix)) {
          matrix = availRes.matrix;
        } else {
          throw new Error('Unexpected response format from availability endpoint.');
        }
      } catch (err) {
        loadError = err.message || 'Failed to load availability data.';
      }

      // Compute summary stats for the 14-day window
      const totalBooked = matrix.reduce((sum, m) => sum + (m.booked_count || 0), 0);
      const totalBlocked = matrix.reduce((sum, m) => sum + (m.blocked_count || 0), 0);
      const daysAtFullCapacity = matrix.filter(m => m.available_count === 0).length;

      container.innerHTML = `
        <style>
          .avail-matrix-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 20px;
          }
          .avail-summary-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 22px;
          }
          @media (max-width: 900px) {
            .avail-summary-bar {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 480px) {
            .avail-summary-bar {
              grid-template-columns: 1fr;
            }
          }
          .avail-summary-chip {
            background: var(--bg-surface-secondary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-sm);
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .avail-chip-label {
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--text-muted);
          }
          .avail-chip-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-main);
          }
          .avail-grid-scroll {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }
          .avail-card {
            background: var(--bg-surface-secondary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-sm);
            padding: 14px 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
            position: relative;
            min-height: 190px;
          }
          .avail-card:hover {
            border-color: var(--color-primary-light);
            box-shadow: var(--shadow-sm);
          }
          .avail-card.is-today {
            border-top: 3px solid var(--color-primary);
          }
          .avail-card.is-zero {
            background: var(--status-danger-bg);
            border-color: var(--status-danger-border);
          }
          .avail-card-date {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-main);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .avail-card-subdate {
            font-size: 0.72rem;
            color: var(--text-muted);
            margin-bottom: 8px;
          }
          .avail-count-badge {
            display: flex;
            align-items: baseline;
            gap: 4px;
            margin: 6px 0;
          }
          .avail-count-big {
            font-size: 1.55rem;
            font-weight: 800;
            font-family: var(--font-heading);
            color: var(--color-primary);
            line-height: 1;
          }
          .avail-card.is-zero .avail-count-big {
            color: var(--status-danger);
          }
          .avail-count-unit {
            font-size: 0.72rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
          }
          .avail-breakdown-bar {
            height: 6px;
            width: 100%;
            border-radius: 3px;
            background: var(--border-light);
            overflow: hidden;
            display: flex;
            margin: 8px 0;
          }
          .avail-bar-booked { background: #3B82F6; }
          .avail-bar-blocked { background: #F59E0B; }
          .avail-bar-free { background: #10B981; }
          .avail-breakdown-text {
            font-size: 0.7rem;
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 10px;
          }
          .avail-card-actions {
            margin-top: auto;
            display: flex;
            gap: 6px;
          }
          .avail-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(2px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }
          .avail-modal-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 440px;
            overflow: hidden;
            animation: fadeInModal 0.2s ease-out;
          }
          @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
        </style>

        <div class="panel-card">
          <!-- Top Header & Controls -->
          <div class="avail-matrix-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge" style="background: var(--color-primary-subtle); color: var(--color-primary); border: 1px solid var(--border-light); font-size: 0.72rem; padding: 2px 8px; font-weight: 600;">
                  ${propertyName || 'Property'}
                </span>
                <span style="font-size: 0.76rem; color: var(--text-muted);">
                  Formula: Available = Total (${currentRoom.total_inventory}) − Booked − Blocked
                </span>
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">
                Real-Time Room Availability Calendar (Next 14 Days)
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.82rem; margin: 4px 0 0;">
                Live stay availability with atomic blackout reservation controls to prevent double-booking.
              </p>
            </div>

            <!-- Room Category Dropdown Selection -->
            <div style="display: flex; align-items: center; gap: 10px; min-width: 260px;">
              <label for="select-room-matrix" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap;">
                Category:
              </label>
              <select class="select-filter" id="select-room-matrix" style="flex: 1; font-weight: 600; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); background: var(--bg-surface-secondary);">
                ${rooms.map(r => `
                  <option value="${r.id}" ${r.id === selectedRoomId ? 'selected' : ''}>
                    ${r.room_name || r.name} — (${r.total_inventory || 1} units)
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Summary Chips -->
          <div class="avail-summary-bar">
            <div class="avail-summary-chip">
              <span class="avail-chip-label">Room Category</span>
              <span class="avail-chip-value" style="font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${currentRoom.room_name || currentRoom.name}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">₹${currentRoom.price_per_night || currentRoom.base_price || 0} / night</span>
            </div>
            <div class="avail-summary-chip">
              <span class="avail-chip-label">Total Room Inventory</span>
              <span class="avail-chip-value" style="color: var(--color-primary);">${currentRoom.total_inventory || 1} Rooms</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Physical capacity per day</span>
            </div>
            <div class="avail-summary-chip">
              <span class="avail-chip-label">14-Day Booked Units</span>
              <span class="avail-chip-value" style="color: #2563EB;">${totalBooked} Booked</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${totalBlocked} Units Blocked / Blackout</span>
            </div>
            <div class="avail-summary-chip">
              <span class="avail-chip-label">Full Capacity Days</span>
              <span class="avail-chip-value" style="color: ${daysAtFullCapacity > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
                ${daysAtFullCapacity} / 14 Days
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${14 - daysAtFullCapacity} Days with Open Slots</span>
            </div>
          </div>

          <!-- Error Alert if API failed -->
          ${loadError ? `
            <div style="background: var(--status-danger-bg); border: 1px solid var(--status-danger-border); color: var(--status-danger); padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                <span style="font-size: 0.85rem; font-weight: 500;">${loadError}</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-retry-matrix" style="padding: 4px 10px;">Retry</button>
            </div>
          ` : ''}

          <!-- Legend -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 10px 14px; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.76rem;">
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                <span style="color: var(--text-secondary);">Available For Guests</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #3B82F6; display: inline-block;"></span>
                <span style="color: var(--text-secondary);">Confirmed Bookings</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
                <span style="color: var(--text-secondary);">Admin Blocked / Blackout</span>
              </div>
            </div>
            <span style="color: var(--text-muted); font-size: 0.72rem;">* Click "Manage" or "Unblock" on any date to adjust room capacity</span>
          </div>

          <!-- 14-Day Calendar Matrix Cards -->
          <div class="avail-grid-scroll">
            ${matrix.map(m => {
              const dParts = m.date.split('-');
              const dObj = new Date(Number(dParts[0]), Number(dParts[1]) - 1, Number(dParts[2]));
              const weekday = dObj.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const isToday = m.date === startDateStr;
              const isZero = m.available_count === 0;

              const totalInv = m.total_inventory || currentRoom.total_inventory || 1;
              const bookedPct = Math.round((m.booked_count / totalInv) * 100);
              const blockedPct = Math.round((m.blocked_count / totalInv) * 100);
              const freePct = Math.max(0, 100 - bookedPct - blockedPct);

              return `
                <div class="avail-card ${isToday ? 'is-today' : ''} ${isZero ? 'is-zero' : ''}" data-date="${m.date}">
                  <div>
                    <div class="avail-card-date">
                      <span>${weekday}</span>
                      ${isToday ? `<span class="badge" style="background: var(--color-primary); color: #fff; font-size: 0.6rem; padding: 1px 5px; border-radius: 3px;">TODAY</span>` : ''}
                      ${isZero && !isToday ? `<span class="badge" style="background: var(--status-danger); color: #fff; font-size: 0.6rem; padding: 1px 5px; border-radius: 3px;">FULL</span>` : ''}
                    </div>
                    <div class="avail-card-subdate">${monthDay}</div>

                    <div class="avail-count-badge">
                      <span class="avail-count-big">${m.available_count}</span>
                      <span class="avail-count-unit">open / ${totalInv}</span>
                    </div>

                    <!-- Visual Segmented Bar -->
                    <div class="avail-breakdown-bar" title="Booked: ${m.booked_count}, Blocked: ${m.blocked_count}, Available: ${m.available_count}">
                      <div class="avail-bar-booked" style="width: ${bookedPct}%;"></div>
                      <div class="avail-bar-blocked" style="width: ${blockedPct}%;"></div>
                      <div class="avail-bar-free" style="width: ${freePct}%;"></div>
                    </div>

                    <div class="avail-breakdown-text">
                      <div style="display: flex; justify-content: space-between;">
                        <span style="color: #2563EB;">● Booked:</span>
                        <strong>${m.booked_count}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between;">
                        <span style="color: #D97706;">● Blocked:</span>
                        <strong>${m.blocked_count}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="avail-card-actions">
                    ${m.blocked_count > 0 ? `
                      <button class="btn btn-secondary btn-sm btn-unblock-direct" 
                        data-date="${m.date}" 
                        data-room="${selectedRoomId}"
                        title="Unblock all blocked inventory for this date"
                        style="width: 100%; font-size: 0.72rem; padding: 4px 6px; border-color: var(--status-warning-border); color: #B45309; background: #FFFBEB;">
                        <i data-lucide="unlock" style="width: 12px; height: 12px;"></i> Unblock
                      </button>
                    ` : ''}
                    <button class="btn btn-primary btn-sm btn-open-block-modal" 
                      data-date="${m.date}" 
                      data-room="${selectedRoomId}"
                      data-available="${m.available_count}"
                      data-booked="${m.booked_count}"
                      data-blocked="${m.blocked_count}"
                      data-total="${totalInv}"
                      style="width: 100%; font-size: 0.72rem; padding: 4px 6px;">
                      <i data-lucide="sliders-horizontal" style="width: 12px; height: 12px;"></i> ${m.blocked_count > 0 ? 'Edit Block' : 'Block Rooms'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Block Inventory Modal Mount Point -->
        <div id="avail-modal-mount"></div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Retry handler
      container.querySelector('#btn-retry-matrix')?.addEventListener('click', () => {
        loadMatrix();
      });

      // Room selector change
      container.querySelector('#select-room-matrix')?.addEventListener('change', (e) => {
        selectedRoomId = e.target.value;
        loadMatrix();
      });

      // Quick Unblock Button
      container.querySelectorAll('.btn-unblock-direct').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const date = btn.getAttribute('data-date');
          const confirmed = window.confirm(`Are you sure you want to unblock all rooms for ${date}? This will restore available inventory for guests.`);
          if (!confirmed) return;

          btn.disabled = true;
          btn.innerHTML = `<i data-lucide="loader-2" style="width: 12px; height: 12px; animation: spin 1s linear infinite;"></i> Unblocking...`;
          if (window.lucide) window.lucide.createIcons();

          try {
            await api.blockAvailability(selectedRoomId, date, 0);
            if (window.showToast) {
              window.showToast(`Successfully unblocked rooms for ${date}.`, 'success');
            }
            await loadMatrix();
          } catch (err) {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="unlock" style="width: 12px; height: 12px;"></i> Unblock`;
            if (window.lucide) window.lucide.createIcons();
            if (window.showToast) {
              window.showToast(err.message || 'Failed to unblock rooms.', 'error');
            } else {
              alert(`Error: ${err.message}`);
            }
          }
        });
      });

      // Open Modal to Configure Block Count
      container.querySelectorAll('.btn-open-block-modal').forEach(btn => {
        btn.addEventListener('click', () => {
          const date = btn.getAttribute('data-date');
          const available = Number(btn.getAttribute('data-available'));
          const booked = Number(btn.getAttribute('data-booked'));
          const currentBlocked = Number(btn.getAttribute('data-blocked'));
          const total = Number(btn.getAttribute('data-total'));
          
          // Max quantity that can be blocked is (total - booked)
          const maxBlockable = Math.max(0, total - booked);

          openBlockModal({
            roomId: selectedRoomId,
            roomName: currentRoom.room_name || currentRoom.name,
            date,
            available,
            booked,
            currentBlocked,
            total,
            maxBlockable
          });
        });
      });
    }

    // Modal Manager
    function openBlockModal(info) {
      const modalMount = container.querySelector('#avail-modal-mount');
      if (!modalMount) return;

      const dParts = info.date.split('-');
      const dObj = new Date(Number(dParts[0]), Number(dParts[1]) - 1, Number(dParts[2]));
      const formattedDate = dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      modalMount.innerHTML = `
        <div class="avail-modal-overlay" id="modal-overlay">
          <div class="avail-modal-card">
            <div class="modal-header">
              <div>
                <h3 class="modal-title" style="font-size: 1.05rem;">Manage Inventory Block</h3>
                <p style="font-size: 0.74rem; color: var(--text-muted); margin: 2px 0 0;">${info.roomName} • ${formattedDate}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-block-modal" aria-label="Close">
                <i data-lucide="x" style="width: 18px; height: 18px;"></i>
              </button>
            </div>

            <form id="form-manage-block" style="padding: 20px;">
              <div style="background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                  <span style="color: var(--text-secondary);">Total Physical Capacity:</span>
                  <strong>${info.total} Rooms</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                  <span style="color: #2563EB;">Currently Confirmed Bookings:</span>
                  <strong>${info.booked} Booked</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                  <span style="color: #D97706;">Currently Blocked:</span>
                  <strong>${info.currentBlocked} Rooms</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; border-top: 1px solid var(--border-light); padding-top: 6px; margin-top: 4px;">
                  <span style="color: var(--color-primary); font-weight: 600;">Max Available to Block:</span>
                  <strong style="color: var(--color-primary);">${info.maxBlockable} Rooms</strong>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 16px;">
                <label for="input-blocked-count" style="display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; color: var(--text-main);">
                  Blocked Rooms Quantity
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="number" 
                    id="input-blocked-count" 
                    name="blocked_count"
                    min="0" 
                    max="${info.maxBlockable}" 
                    value="${info.currentBlocked > 0 ? info.currentBlocked : Math.min(1, info.maxBlockable)}" 
                    class="form-control" 
                    style="width: 100%; padding: 8px 12px; font-size: 1rem; font-weight: 700; border: 1px solid var(--border-medium); border-radius: var(--radius-sm);"
                    required />
                  <span style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap;">/ ${info.maxBlockable} max</span>
                </div>
                <small style="display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                  Setting this to 0 unblocks all rooms for ${info.date}.
                </small>
              </div>

              <div id="modal-error-box" style="display: none; background: var(--status-danger-bg); border: 1px solid var(--status-danger-border); color: var(--status-danger); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; margin-bottom: 14px;"></div>

              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                ${info.currentBlocked > 0 ? `
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-clear-block" style="margin-right: auto; color: #B45309; border-color: var(--status-warning-border); background: #FFFBEB;">
                    Unblock (Set to 0)
                  </button>
                ` : ''}
                <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-sm" id="btn-modal-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const closeModal = () => {
        modalMount.innerHTML = '';
      };

      modalMount.querySelector('#btn-close-block-modal')?.addEventListener('click', closeModal);
      modalMount.querySelector('#btn-modal-cancel')?.addEventListener('click', closeModal);
      modalMount.querySelector('#modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
      });

      // Quick Clear Button in modal
      modalMount.querySelector('#btn-modal-clear-block')?.addEventListener('click', async () => {
        const confirmed = window.confirm(`Set blocked rooms to 0 for ${info.date}?`);
        if (!confirmed) return;
        await submitBlock(0);
      });

      // Form submit handler
      modalMount.querySelector('#form-manage-block')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputVal = Number(modalMount.querySelector('#input-blocked-count').value);
        if (isNaN(inputVal) || inputVal < 0) {
          showModalError('Please enter a valid non-negative number.');
          return;
        }
        if (inputVal > info.maxBlockable) {
          showModalError(`Cannot block ${inputVal} rooms. Maximum available to block is ${info.maxBlockable} rooms (${info.booked} already booked).`);
          return;
        }

        const confirmMsg = inputVal === 0 
          ? `Confirm unblocking all rooms for ${info.date}?` 
          : `Confirm blocking ${inputVal} rooms for ${info.date}? These rooms will not be available for guests to book.`;

        if (!window.confirm(confirmMsg)) return;

        await submitBlock(inputVal);
      });

      function showModalError(msg) {
        const errBox = modalMount.querySelector('#modal-error-box');
        if (errBox) {
          errBox.textContent = msg;
          errBox.style.display = 'block';
        }
      }

      async function submitBlock(count) {
        const saveBtn = modalMount.querySelector('#btn-modal-save');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<i data-lucide="loader-2" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"></i> Saving...`;
          if (window.lucide) window.lucide.createIcons();
        }

        try {
          await api.blockAvailability(info.roomId, info.date, count);
          closeModal();
          if (window.showToast) {
            window.showToast(count === 0 ? `Unblocked rooms for ${info.date}.` : `Blocked ${count} rooms for ${info.date}.`, 'success');
          }
          await loadMatrix();
        } catch (err) {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `Save Changes`;
          }
          showModalError(err.message || 'Failed to update room availability.');
        }
      }
    }

    await loadMatrix();
  } catch (err) {
    container.innerHTML = `
      <div class="panel-card" style="color: var(--status-danger); padding: 30px; text-align: center;">
        <i data-lucide="alert-circle" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Failed to initialize availability manager</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${err.message}</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
