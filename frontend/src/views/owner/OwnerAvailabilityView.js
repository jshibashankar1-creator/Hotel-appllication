import { api } from '../../services/api.js';

export async function renderOwnerAvailabilityView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading availability calendar matrix...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await api.getOwnerHotels();
    const hotels = res.hotels;
    if (hotels.length === 0 || !hotels[0].rooms || hotels[0].rooms.length === 0) {
      container.innerHTML = `<div class="panel-card">Please register rooms for your hotel first to manage availability.</div>`;
      return;
    }

    const rooms = hotels[0].rooms;
    let selectedRoomId = rooms[0].id;

    async function loadMatrix() {
      const availRes = await api.getRoomAvailability(selectedRoomId, 14);
      const matrix = availRes.matrix;

      container.innerHTML = `
        <div class="panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Real-Time Room Availability Calendar (Next 14 Days)</h2>
              <p>Monitor live booked quantities and block blackout dates to prevent double-booking</p>
            </div>
            <div class="card-actions">
              <select class="select-filter" id="select-room-matrix">
                ${rooms.map(r => `<option value="${r.id}" ${r.id === selectedRoomId ? 'selected' : ''}>${r.room_name} (${r.total_inventory} total rooms)</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Availability 14-day Grid -->
          <div class="availability-grid">
            ${matrix.map(m => `
              <div class="avail-day-card ${m.available_count === 0 ? 'fully-booked' : ''}">
                <div class="avail-date-label">${new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary); margin-top: 4px;">
                  ${m.available_count} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">avail</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">
                  ${m.booked_count} Booked • ${m.blocked_count} Blocked
                </div>
                <button class="btn btn-secondary btn-sm btn-block-date" data-date="${m.date}" data-blocked="${m.blocked_count}" style="width: 100%; margin-top: 8px; font-size: 0.7rem; padding: 3px 6px;">
                  ${m.blocked_count > 0 ? 'Unblock' : 'Block Rooms'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      container.querySelector('#select-room-matrix')?.addEventListener('change', (e) => {
        selectedRoomId = e.target.value;
        loadMatrix();
      });

      container.querySelectorAll('.btn-block-date').forEach(btn => {
        btn.addEventListener('click', async () => {
          const date = btn.getAttribute('data-date');
          const currentBlocked = Number(btn.getAttribute('data-blocked'));
          const newBlock = currentBlocked > 0 ? 0 : 2; // Toggle 2 blocked rooms
          try {
            await api.blockAvailability(selectedRoomId, date, newBlock);
            window.showToast(`Inventory updated for ${date}.`, 'success');
            loadMatrix();
          } catch (err) {
            window.showToast(err.message, 'error');
          }
        });
      });
    }

    loadMatrix();
  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
