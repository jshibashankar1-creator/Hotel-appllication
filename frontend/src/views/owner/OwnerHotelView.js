import { api } from '../../services/api.js';

export async function renderOwnerHotelView(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading hotel details...</p>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await api.getOwnerHotels();
    const hotels = res.hotels;

    if (hotels.length === 0) {
      container.innerHTML = `
        <div class="panel-card" style="text-align: center; padding: 40px;">
          <i data-lucide="building" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h3 style="font-size: 1.1rem; color: var(--text-main);">No Hotel Registered Yet</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">Complete our multi-step onboarding wizard to register your property for admin review.</p>
          <a href="#/owner/onboard" class="btn btn-primary">Start Hotel Onboarding Wizard</a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const hotel = hotels[0]; // Active property

    container.innerHTML = `
      <div style="max-width: 820px;">
        <div class="panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>${hotel.name}</h2>
              <p>Status: <span class="status-pill ${hotel.status}">${hotel.status.replace('_', ' ')}</span> • ID: <strong style="font-family: monospace;">${hotel.id}</strong></p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-save-hotel">
              <i data-lucide="save"></i> Save Property Changes
            </button>
          </div>

          <form id="hotel-edit-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Hotel Name</label>
                <input type="text" class="form-input" id="edit-hotel-name" value="${hotel.name}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Hotel Type</label>
                <input type="text" class="form-input" id="edit-hotel-type" value="${hotel.hotel_type || 'Luxury Resort'}">
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" class="form-input" id="edit-hotel-city" value="${hotel.city}" required>
              </div>
              <div class="form-group">
                <label class="form-label">State / Region</label>
                <input type="text" class="form-input" id="edit-hotel-state" value="${hotel.state}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Full Street Address</label>
              <input type="text" class="form-input" id="edit-hotel-address" value="${hotel.address}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Property Description</label>
              <textarea class="form-textarea" id="edit-hotel-desc" required style="min-height: 100px;">${hotel.description}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Cover Photo URL</label>
              <input type="url" class="form-input" id="edit-hotel-cover" value="${hotel.cover_image}">
            </div>

            <div style="margin-top: 14px;">
              <label class="form-label">Active Hotel Amenities</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${['Free Wi-Fi', 'Swimming Pool', 'Spa & Wellness', 'Fine Dining Restaurant', '24/7 Room Service', 'Valet Parking', 'Airport Shuttle', 'Gym & Fitness'].map(a => `
                  <label style="display: inline-flex; align-items: center; gap: 6px; background: var(--bg-surface-secondary); padding: 5px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); font-size: 0.78rem; cursor: pointer;">
                    <input type="checkbox" class="amenity-checkbox" value="${a}" ${hotel.amenities && hotel.amenities.includes(a) ? 'checked' : ''}>
                    <span>${a}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-save-hotel')?.addEventListener('click', async () => {
      const selectedAmenities = Array.from(container.querySelectorAll('.amenity-checkbox:checked')).map(cb => cb.value);
      const updates = {
        name: container.querySelector('#edit-hotel-name').value,
        hotel_type: container.querySelector('#edit-hotel-type').value,
        city: container.querySelector('#edit-hotel-city').value,
        state: container.querySelector('#edit-hotel-state').value,
        address: container.querySelector('#edit-hotel-address').value,
        description: container.querySelector('#edit-hotel-desc').value,
        cover_image: container.querySelector('#edit-hotel-cover').value,
        amenities: selectedAmenities
      };

      try {
        await api.updateHotel(hotel.id, updates);
        window.showToast('Hotel details saved successfully.', 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
