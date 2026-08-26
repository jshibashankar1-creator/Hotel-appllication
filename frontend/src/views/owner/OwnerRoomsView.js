import { api } from '../../services/api.js';

export async function renderOwnerRoomsView(container) {
  let hotels = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading room inventory...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getOwnerHotels();
      hotels = res.hotels;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    if (hotels.length === 0) {
      container.innerHTML = `<div class="panel-card">Please register a hotel first.</div>`;
      return;
    }

    const hotel = hotels[0];
    const rooms = hotel.rooms || [];

    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <h2 style="font-size: 1.1rem; font-weight: 700;">Room Categories for ${hotel.name}</h2>
        </div>
        <button class="btn btn-primary" id="btn-add-room">
          <i data-lucide="plus"></i> Add New Room Category
        </button>
      </div>

      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Room Type & Name</th>
                <th>Guest Capacity</th>
                <th>Inventory Quantity</th>
                <th>Base Tariff / Night</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rooms.map(r => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${r.photos && r.photos[0] ? r.photos[0] : hotel.cover_image}" style="width: 44px; height: 44px; border-radius: var(--radius-xs); object-fit: cover;">
                      <div>
                        <div style="font-weight: 700;">${r.room_name}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${r.room_type}</div>
                      </div>
                    </div>
                  </td>
                  <td>${r.max_guests} Guests max</td>
                  <td><strong>${r.total_inventory} Rooms</strong> available</td>
                  <td><strong style="color: var(--status-success); font-size: 0.95rem;">₹${r.price_per_night.toLocaleString('en-IN')}</strong></td>
                  <td><span class="status-pill active">Active</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-edit-room" data-room-id="${r.id}">
                      <i data-lucide="edit-3"></i> Edit
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="room-modal-root"></div>
    `;

    bindEvents(hotel.id);
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents(hotelId) {
    container.querySelector('#btn-add-room')?.addEventListener('click', () => {
      openRoomModal(hotelId, null);
    });

    container.querySelectorAll('.btn-edit-room').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-room-id');
        const room = hotels[0].rooms.find(r => r.id === rId);
        openRoomModal(hotelId, room);
      });
    });
  }

  function openRoomModal(hotelId, existingRoom) {
    const modalRoot = container.querySelector('#room-modal-root');
    const isEdit = !!existingRoom;

    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 580px;">
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? 'Edit Room Category' : 'Add New Room Category'}</h2>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <form id="room-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Room Category Name</label>
                <input type="text" class="form-input" id="room-name" required value="${existingRoom ? existingRoom.room_name : ''}" placeholder="e.g. Executive Club Suite">
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Room Type</label>
                  <select class="form-select" id="room-type">
                    <option value="Deluxe" ${existingRoom && existingRoom.room_type === 'Deluxe' ? 'selected' : ''}>Deluxe Room</option>
                    <option value="Suite" ${existingRoom && existingRoom.room_type === 'Suite' ? 'selected' : ''}>Executive Suite</option>
                    <option value="Villa" ${existingRoom && existingRoom.room_type === 'Villa' ? 'selected' : ''}>Private Villa</option>
                    <option value="Cottage" ${existingRoom && existingRoom.room_type === 'Cottage' ? 'selected' : ''}>Cottage</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Max Guest Capacity</label>
                  <input type="number" class="form-input" id="room-capacity" required min="1" max="10" value="${existingRoom ? existingRoom.max_guests : 2}">
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Base Tariff (₹ / Night)</label>
                  <input type="number" class="form-input" id="room-price" required min="500" step="100" value="${existingRoom ? existingRoom.price_per_night : 5000}">
                </div>
                <div class="form-group">
                  <label class="form-label">Total Rooms Inventory</label>
                  <input type="number" class="form-input" id="room-inventory" required min="1" max="100" value="${existingRoom ? existingRoom.total_inventory : 10}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Room Description</label>
                <textarea class="form-textarea" id="room-desc" placeholder="Details of bed type, square footage, bathroom amenities...">${existingRoom ? existingRoom.description : ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Photo URL</label>
                <input type="url" class="form-input" id="room-photo" value="${existingRoom && existingRoom.photos ? existingRoom.photos[0] : 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'}">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-close-action">Cancel</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Update Room' : 'Create Room'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#room-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        hotel_id: hotelId,
        room_name: modalRoot.querySelector('#room-name').value,
        room_type: modalRoot.querySelector('#room-type').value,
        max_guests: Number(modalRoot.querySelector('#room-capacity').value),
        price_per_night: Number(modalRoot.querySelector('#room-price').value),
        total_inventory: Number(modalRoot.querySelector('#room-inventory').value),
        description: modalRoot.querySelector('#room-desc').value,
        photos: [modalRoot.querySelector('#room-photo').value]
      };

      try {
        if (isEdit) {
          await api.updateRoom(existingRoom.id, payload);
          window.showToast('Room category updated.', 'success');
        } else {
          await api.createRoom(payload);
          window.showToast('New room category created.', 'success');
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
