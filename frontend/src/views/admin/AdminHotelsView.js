import { api } from '../../services/api.js';

export async function renderAdminHotelsView(container) {
  let hotels = [];
  let currentCity = 'all';
  let currentStatus = 'all';
  let searchQuery = '';

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading hotels...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getAdminHotels();
      hotels = res.hotels;
      render();
    } catch (err) {
      container.innerHTML = `
        <div style="background: var(--status-danger-bg); border: 1px solid var(--status-danger-border); padding: 20px; border-radius: var(--radius-sm); color: var(--status-danger);">
          <strong>Error loading hotels:</strong> ${err.message}
        </div>
      `;
    }
  }

  function render() {
    const filteredHotels = hotels.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = currentCity === 'all' || h.city.toLowerCase() === currentCity.toLowerCase();
      const matchStatus = currentStatus === 'all' || h.status.toLowerCase() === currentStatus.toLowerCase();
      return matchSearch && matchCity && matchStatus;
    });

    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
            <input type="text" id="hotel-search-input" placeholder="Search hotel, city, owner..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="city-filter">
            <option value="all" ${currentCity === 'all' ? 'selected' : ''}>All Locations</option>
            <option value="mumbai" ${currentCity === 'mumbai' ? 'selected' : ''}>Mumbai</option>
            <option value="jaipur" ${currentCity === 'jaipur' ? 'selected' : ''}>Jaipur</option>
            <option value="goa" ${currentCity === 'goa' ? 'selected' : ''}>Goa</option>
            <option value="delhi" ${currentCity === 'delhi' ? 'selected' : ''}>Delhi</option>
          </select>

          <select class="select-filter" id="status-filter">
            <option value="all" ${currentStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>Active (Live on App)</option>
            <option value="under_review" ${currentStatus === 'under_review' ? 'selected' : ''}>Under Review</option>
            <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
      </div>

      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Hotel & ID</th>
                <th>Location</th>
                <th>Owner & KYC</th>
                <th>Star & Rating</th>
                <th>Rooms</th>
                <th>App Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredHotels.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No hotels match the selected criteria.
                  </td>
                </tr>
              ` : filteredHotels.map(h => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${h.cover_image}" style="width: 44px; height: 44px; border-radius: var(--radius-xs); object-fit: cover;">
                      <div>
                        <div style="font-weight: 700; color: var(--text-main);">${h.name}</div>
                        <div style="font-size: 0.72rem; font-family: monospace; color: var(--color-primary);">${h.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>${h.city}, ${h.state}</td>
                  <td>
                    <div style="font-weight: 600;">${h.owner_name}</div>
                    <span class="status-pill ${h.owner_kyc_status}" style="font-size: 0.65rem; margin-top: 2px;">KYC: ${h.owner_kyc_status}</span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: var(--color-accent-dark);">
                      <i data-lucide="star" style="width: 14px; height: 14px; fill: var(--color-accent);"></i>
                      <span>${h.rating}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">(${h.reviews_count})</span>
                    </div>
                  </td>
                  <td>${h.rooms ? h.rooms.length : 0} room categories</td>
                  <td>
                    <span class="status-pill ${h.status}">${h.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm btn-inspect-hotel" data-hotel-id="${h.id}">
                        <i data-lucide="eye"></i> Details
                      </button>
                      ${h.status === 'active' ? `
                        <button class="btn btn-danger btn-sm btn-set-status" data-hotel-id="${h.id}" data-status="suspended">
                          Suspend
                        </button>
                      ` : `
                        <button class="btn btn-success btn-sm btn-set-status" data-hotel-id="${h.id}" data-status="active">
                          Approve Live
                        </button>
                      `}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="hotel-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#hotel-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#city-filter')?.addEventListener('change', (e) => {
      currentCity = e.target.value;
      render();
    });

    container.querySelector('#status-filter')?.addEventListener('change', (e) => {
      currentStatus = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-set-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const hotelId = btn.getAttribute('data-hotel-id');
        const newStatus = btn.getAttribute('data-status');
        try {
          await api.updateHotelStatus(hotelId, newStatus);
          window.showToast(`Hotel status updated to ${newStatus.toUpperCase()}`, 'success');
          loadData();
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-inspect-hotel').forEach(btn => {
      btn.addEventListener('click', () => {
        const hotelId = btn.getAttribute('data-hotel-id');
        openHotelModal(hotelId);
      });
    });
  }

  function openHotelModal(hotelId) {
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    const modalRoot = container.querySelector('#hotel-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.72rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">${hotel.id}</div>
              <h2 class="modal-title">${hotel.name}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="height: 200px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 18px; position: relative;">
              <img src="${hotel.cover_image}" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(15,23,42,0.8); padding: 4px 10px; border-radius: var(--radius-xs); color: #fff; font-size: 0.75rem;">
                <i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${hotel.address}, ${hotel.city}, ${hotel.state}
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 16px;">
              <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Owner & Management</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">${hotel.owner_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${hotel.owner_email || 'Verified Owner'}</div>
              </div>
              <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Hotel Category & Type</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;">${hotel.hotel_type || 'Luxury Stay'}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${hotel.star_category} Star Rated</div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Description</div>
              <p style="font-size: 0.82rem; color: var(--text-main); line-height: 1.5; background: var(--bg-surface-secondary); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                ${hotel.description}
              </p>
            </div>

            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Configured Amenities</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${hotel.amenities.map(a => `
                  <span style="background: var(--bg-surface-secondary); border: 1px solid var(--border-light); font-size: 0.72rem; padding: 3px 8px; border-radius: var(--radius-full); color: var(--text-main);">
                    ✓ ${a}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.78rem; color: var(--text-secondary);">
              Status: <span class="status-pill ${hotel.status}">${hotel.status.replace('_', ' ')}</span>
            </span>
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            ${hotel.status === 'active' ? `
              <button class="btn btn-danger" id="modal-suspend-btn">Suspend Hotel</button>
            ` : `
              <button class="btn btn-success" id="modal-approve-btn">Approve & Make Live</button>
            `}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#modal-suspend-btn')?.addEventListener('click', async () => {
      await api.updateHotelStatus(hotelId, 'suspended');
      window.showToast(`Hotel suspended from customer application.`, 'warning');
      closeModal();
      loadData();
    });

    modalRoot.querySelector('#modal-approve-btn')?.addEventListener('click', async () => {
      await api.updateHotelStatus(hotelId, 'active');
      window.showToast(`Hotel is now LIVE on customer app!`, 'success');
      closeModal();
      loadData();
    });
  }

  loadData();
}
