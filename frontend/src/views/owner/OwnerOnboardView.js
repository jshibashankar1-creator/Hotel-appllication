import { api } from '../../services/api.js';

export function renderOwnerOnboardView(container) {
  let currentStep = 1;
  const formData = {
    name: '',
    hotel_type: 'Boutique Hotel',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    initial_rooms: [
      {
        room_name: 'Executive Deluxe Suite',
        room_type: 'Suite',
        description: 'Spacious suite with king bed and city skyline view.',
        max_guests: 2,
        total_inventory: 10,
        price_per_night: 6500
      }
    ]
  };

  function render() {
    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto;">
        
        <!-- Multi-Step Header Wizard -->
        <div class="panel-card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
          <div class="wizard-steps">
            <div class="wizard-step-item ${currentStep === 1 ? 'active' : ''}">
              <div class="wizard-step-number">1</div>
              <span>Basic Details</span>
            </div>
            <div class="wizard-step-item ${currentStep === 2 ? 'active' : ''}">
              <div class="wizard-step-number">2</div>
              <span>Location</span>
            </div>
            <div class="wizard-step-item ${currentStep === 3 ? 'active' : ''}">
              <div class="wizard-step-number">3</div>
              <span>Photography</span>
            </div>
            <div class="wizard-step-item ${currentStep === 4 ? 'active' : ''}">
              <div class="wizard-step-number">4</div>
              <span>Initial Rooms</span>
            </div>
            <div class="wizard-step-item ${currentStep === 5 ? 'active' : ''}">
              <div class="wizard-step-number">5</div>
              <span>Review & Submit</span>
            </div>
          </div>

          <div style="padding: 24px;">
            ${renderStepContent()}
          </div>

          <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-light); background: var(--bg-surface-secondary); display: flex; justify-content: space-between;">
            ${currentStep > 1 ? `
              <button class="btn btn-secondary" id="btn-wizard-prev">← Back</button>
            ` : '<div></div>'}
            
            ${currentStep < 5 ? `
              <button class="btn btn-primary" id="btn-wizard-next">Next Step →</button>
            ` : `
              <button class="btn btn-success" id="btn-wizard-submit">
                <i data-lucide="check-circle-2"></i> Submit for Administrator Verification
              </button>
            `}
          </div>
        </div>

      </div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderStepContent() {
    if (currentStep === 1) {
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Step 1: Basic Hotel Information</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Provide your property title, branding, and contact credentials</p>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Hotel Trade Name</label>
            <input type="text" class="form-input" id="inp-name" value="${formData.name}" placeholder="e.g. The Grand Horizon Hotel" required>
          </div>
          <div class="form-group">
            <label class="form-label">Property Type</label>
            <select class="form-select" id="inp-type">
              <option value="Luxury Hotel" ${formData.hotel_type === 'Luxury Hotel' ? 'selected' : ''}>Luxury Hotel (4-5 Star)</option>
              <option value="Boutique Hotel" ${formData.hotel_type === 'Boutique Hotel' ? 'selected' : ''}>Boutique Hotel</option>
              <option value="Beach Resort" ${formData.hotel_type === 'Beach Resort' ? 'selected' : ''}>Beachfront Resort</option>
              <option value="Heritage Palace" ${formData.hotel_type === 'Heritage Palace' ? 'selected' : ''}>Heritage Palace</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Property Overview & Description</label>
          <textarea class="form-textarea" id="inp-desc" placeholder="Describe the guest experience, architecture, and luxury offerings...">${formData.description}</textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Hotel Reservation Phone</label>
            <input type="text" class="form-input" id="inp-phone" value="${formData.phone}" placeholder="+91 98201 00000">
          </div>
          <div class="form-group">
            <label class="form-label">Hotel Reservation Email</label>
            <input type="email" class="form-input" id="inp-email" value="${formData.email}" placeholder="reservations@yourhotel.com">
          </div>
        </div>
      `;
    }

    if (currentStep === 2) {
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Step 2: Location & Address</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Specify the destination and postal coordinates for mobile app discovery</p>

        <div class="form-group">
          <label class="form-label">Street Address & Landmark</label>
          <input type="text" class="form-input" id="inp-address" value="${formData.address}" placeholder="e.g. Bandra Kurla Complex, Bandra East" required>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">City / Destination</label>
            <input type="text" class="form-input" id="inp-city" value="${formData.city}" placeholder="e.g. Mumbai" required>
          </div>
          <div class="form-group">
            <label class="form-label">State</label>
            <input type="text" class="form-input" id="inp-state" value="${formData.state}" placeholder="e.g. Maharashtra" required>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Country</label>
            <input type="text" class="form-input" id="inp-country" value="${formData.country}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Postal Code / PIN</label>
            <input type="text" class="form-input" id="inp-postal" value="${formData.postal_code}" placeholder="e.g. 400051">
          </div>
        </div>
      `;
    }

    if (currentStep === 3) {
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Step 3: Hotel Photography</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Upload high-definition hotel imagery for customer mobile presentation</p>

        <div class="form-group">
          <label class="form-label">Main Facade / Cover Photo URL</label>
          <input type="url" class="form-input" id="inp-cover" value="${formData.cover_image}">
        </div>

        <div style="height: 200px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-light); margin-top: 12px;">
          <img src="${formData.cover_image}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `;
    }

    if (currentStep === 4) {
      const room = formData.initial_rooms[0];
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Step 4: Initial Room Category</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Configure the starting room category and nightly tariff</p>

        <div class="form-group">
          <label class="form-label">Room Category Name</label>
          <input type="text" class="form-input" id="inp-room-name" value="${room.room_name}">
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Base Tariff (₹ / Night)</label>
            <input type="number" class="form-input" id="inp-room-price" value="${room.price_per_night}">
          </div>
          <div class="form-group">
            <label class="form-label">Total Inventory (Number of rooms)</label>
            <input type="number" class="form-input" id="inp-room-inv" value="${room.total_inventory}">
          </div>
        </div>
      `;
    }

    if (currentStep === 5) {
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Step 5: Review & Submit for Verification</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 18px;">Confirm your hotel details before submitting to the platform administrator</p>

        <div style="background: var(--bg-surface-secondary); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 14px;">
            <img src="${formData.cover_image}" style="width: 70px; height: 70px; border-radius: var(--radius-xs); object-fit: cover;">
            <div>
              <h4 style="font-size: 1.1rem; color: var(--color-primary);">${formData.name || 'Hotel Name'}</h4>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${formData.city}, ${formData.state} • ${formData.hotel_type}</div>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
            ${formData.description || 'No description provided.'}
          </div>

          <div style="border-top: 1px solid var(--border-light); padding-top: 10px; font-size: 0.8rem;">
            <strong>Initial Room:</strong> ${formData.initial_rooms[0].room_name} (₹${formData.initial_rooms[0].price_per_night}/night • ${formData.initial_rooms[0].total_inventory} rooms)
          </div>
        </div>

        <div style="margin-top: 14px; background: var(--status-warning-bg); border: 1px solid var(--status-warning-border); padding: 12px; border-radius: var(--radius-xs); font-size: 0.78rem; color: var(--status-warning);">
          <i data-lucide="info" style="width: 14px; height: 14px; display: inline; margin-right: 4px;"></i>
          Upon submission, your hotel will enter <strong>PENDING VERIFICATION</strong> state. Once the Administrator verifies your documents, your hotel will become immediately discoverable on the Customer Mobile App.
        </div>
      `;
    }
  }

  function bindEvents() {
    container.querySelector('#btn-wizard-next')?.addEventListener('click', () => {
      saveCurrentStepData();
      currentStep += 1;
      render();
    });

    container.querySelector('#btn-wizard-prev')?.addEventListener('click', () => {
      saveCurrentStepData();
      currentStep -= 1;
      render();
    });

    container.querySelector('#btn-wizard-submit')?.addEventListener('click', async () => {
      try {
        await api.onboardHotel(formData);
        window.showToast('Hotel submitted for Administrator Verification!', 'success');
        if (window.navigateTo) window.navigateTo('/owner/dashboard');
        else window.location.hash = '#/owner/dashboard';
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  function saveCurrentStepData() {
    if (currentStep === 1) {
      formData.name = container.querySelector('#inp-name')?.value || formData.name;
      formData.hotel_type = container.querySelector('#inp-type')?.value || formData.hotel_type;
      formData.description = container.querySelector('#inp-desc')?.value || formData.description;
      formData.phone = container.querySelector('#inp-phone')?.value || formData.phone;
      formData.email = container.querySelector('#inp-email')?.value || formData.email;
    } else if (currentStep === 2) {
      formData.address = container.querySelector('#inp-address')?.value || formData.address;
      formData.city = container.querySelector('#inp-city')?.value || formData.city;
      formData.state = container.querySelector('#inp-state')?.value || formData.state;
      formData.postal_code = container.querySelector('#inp-postal')?.value || formData.postal_code;
    } else if (currentStep === 3) {
      formData.cover_image = container.querySelector('#inp-cover')?.value || formData.cover_image;
    } else if (currentStep === 4) {
      formData.initial_rooms[0].room_name = container.querySelector('#inp-room-name')?.value || formData.initial_rooms[0].room_name;
      formData.initial_rooms[0].price_per_night = Number(container.querySelector('#inp-room-price')?.value) || formData.initial_rooms[0].price_per_night;
      formData.initial_rooms[0].total_inventory = Number(container.querySelector('#inp-room-inv')?.value) || formData.initial_rooms[0].total_inventory;
    }
  }

  render();
}
