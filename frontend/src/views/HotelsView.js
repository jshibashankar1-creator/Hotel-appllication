import { store } from '../services/store.js';

export function renderHotelsView(container) {
  let hotels = store.getHotels();
  let currentCity = 'all';
  let currentStatus = 'all';
  let searchQuery = '';
  let viewMode = 'grid'; // 'grid' or 'table'

  function render() {
    const filteredHotels = hotels.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = currentCity === 'all' || h.city.toLowerCase() === currentCity.toLowerCase();
      const matchStatus = currentStatus === 'all' || h.status.toLowerCase() === currentStatus.toLowerCase();
      return matchSearch && matchCity && matchStatus;
    });

    container.innerHTML = `
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="hotel-search-input" placeholder="Search by hotel, city, owner..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="city-filter">
            <option value="all" ${currentCity === 'all' ? 'selected' : ''}>All Locations</option>
            <option value="mumbai" ${currentCity === 'mumbai' ? 'selected' : ''}>Mumbai</option>
            <option value="jaipur" ${currentCity === 'jaipur' ? 'selected' : ''}>Jaipur</option>
            <option value="goa" ${currentCity === 'goa' ? 'selected' : ''}>Goa</option>
            <option value="delhi" ${currentCity === 'delhi' ? 'selected' : ''}>Delhi</option>
            <option value="bengaluru" ${currentCity === 'bengaluru' ? 'selected' : ''}>Bengaluru</option>
            <option value="shimla" ${currentCity === 'shimla' ? 'selected' : ''}>Shimla</option>
          </select>

          <select class="select-filter" id="status-filter">
            <option value="all" ${currentStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>Active (Live on App)</option>
            <option value="under_review" ${currentStatus === 'under_review' ? 'selected' : ''}>Under Review</option>
            <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>

        <div class="filter-group">
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; padding: 2px;">
            <button class="btn-icon ${viewMode === 'grid' ? 'active' : ''}" id="btn-view-grid" style="${viewMode === 'grid' ? 'background: var(--primary); color: #fff;' : ''}" title="Grid View">
              <i data-lucide="layout-grid"></i>
            </button>
            <button class="btn-icon ${viewMode === 'table' ? 'active' : ''}" id="btn-view-table" style="${viewMode === 'table' ? 'background: var(--primary); color: #fff;' : ''}" title="Table View">
              <i data-lucide="list"></i>
            </button>
          </div>
          <button class="btn btn-primary" id="btn-add-hotel">
            <i data-lucide="plus-circle"></i> Add Hotel
          </button>
        </div>
      </div>

      <!-- Hotels Content Container -->
      ${viewMode === 'grid' ? renderGridView(filteredHotels) : renderTableView(filteredHotels)}

      <!-- Hotel Detail Modal Container -->
      <div id="hotel-modal-root"></div>
    `;

    // Bind event listeners
    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderGridView(hotelList) {
    if (hotelList.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i data-lucide="building-x" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h3 style="color: #fff; margin-bottom: 6px;">No Hotels Found</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search terms.</p>
        </div>
      `;
    }

    return `
      <div class="hotels-grid">
        ${hotelList.map(h => `
          <div class="hotel-card">
            <div class="hotel-card-image-wrap">
              <img src="${h.coverImage}" alt="${h.name}" class="hotel-card-image" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'">
              <div class="hotel-card-badge">
                <span class="status-badge ${h.status}">${h.status.replace('_', ' ')}</span>
              </div>
              <div class="hotel-rating-tag">
                <i data-lucide="star" style="width: 14px; height: 14px; fill: var(--accent-gold);"></i>
                <span>${h.rating}</span>
                <span style="opacity: 0.7; font-weight: normal;">(${h.reviewsCount})</span>
              </div>
            </div>

            <div class="hotel-card-body">
              <h3 class="hotel-card-title">${h.name}</h3>
              <div class="hotel-card-location">
                <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--primary);"></i>
                <span>${h.city}, ${h.state}</span>
              </div>

              <div class="hotel-card-stats">
                <div class="hotel-stat-item">
                  <span class="hotel-stat-label">Starting Price</span>
                  <span class="hotel-stat-val" style="color: var(--success);">₹${h.pricePerNight.toLocaleString('en-IN')}<span style="font-size: 0.7rem; color: var(--text-muted);"> / night</span></span>
                </div>
                <div class="hotel-stat-item">
                  <span class="hotel-stat-label">Available Rooms</span>
                  <span class="hotel-stat-val">${h.availableRooms} / ${h.roomsCount}</span>
                </div>
              </div>

              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="user" style="width: 13px; height: 13px;"></i>
                <span>Owner: <strong>${h.ownerName}</strong></span>
              </div>

              <div class="hotel-card-actions">
                <button class="btn btn-secondary btn-sm btn-inspect-hotel" data-hotel-id="${h.id}">
                  <i data-lucide="eye"></i> View Details
                </button>
                <div style="display: flex; gap: 6px;">
                  ${h.status === 'active' ? `
                    <button class="btn btn-danger btn-sm btn-toggle-status" data-hotel-id="${h.id}" data-new-status="suspended" title="Suspend Hotel">
                      <i data-lucide="pause-circle"></i> Suspend
                    </button>
                  ` : `
                    <button class="btn btn-success btn-sm btn-toggle-status" data-hotel-id="${h.id}" data-new-status="active" title="Activate Hotel">
                      <i data-lucide="check-circle-2"></i> Make Live
                    </button>
                  `}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTableView(hotelList) {
    return `
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Hotel & ID</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Star & Rating</th>
                <th>Rooms</th>
                <th>Base Price</th>
                <th>App Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${hotelList.map(h => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${h.coverImage}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;">
                      <div>
                        <div style="font-weight: 700; color: #fff;">${h.name}</div>
                        <div style="font-size: 0.75rem; font-family: monospace; color: var(--primary);">${h.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>${h.city}, ${h.state}</td>
                  <td>${h.ownerName}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 4px; color: var(--accent-gold); font-weight: 700;">
                      <i data-lucide="star" style="width: 14px; height: 14px; fill: var(--accent-gold);"></i>
                      <span>${h.rating}</span>
                    </div>
                  </td>
                  <td>${h.availableRooms} / ${h.roomsCount} avail</td>
                  <td style="font-weight: 700; color: var(--success);">₹${h.pricePerNight.toLocaleString('en-IN')}</td>
                  <td>
                    <span class="status-badge ${h.status}">${h.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm btn-inspect-hotel" data-hotel-id="${h.id}">
                        <i data-lucide="eye"></i> Inspect
                      </button>
                      ${h.status === 'active' ? `
                        <button class="btn btn-danger btn-sm btn-toggle-status" data-hotel-id="${h.id}" data-new-status="suspended">
                          Suspend
                        </button>
                      ` : `
                        <button class="btn btn-success btn-sm btn-toggle-status" data-hotel-id="${h.id}" data-new-status="active">
                          Approve
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
    `;
  }

  function bindEvents() {
    // Search input
    const searchInput = container.querySelector('#hotel-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    // City Filter
    const cityFilter = container.querySelector('#city-filter');
    cityFilter?.addEventListener('change', (e) => {
      currentCity = e.target.value;
      render();
    });

    // Status Filter
    const statusFilter = container.querySelector('#status-filter');
    statusFilter?.addEventListener('change', (e) => {
      currentStatus = e.target.value;
      render();
    });

    // View Mode toggles
    container.querySelector('#btn-view-grid')?.addEventListener('click', () => {
      viewMode = 'grid';
      render();
    });
    container.querySelector('#btn-view-table')?.addEventListener('click', () => {
      viewMode = 'table';
      render();
    });

    // Toggle status
    container.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hotelId = btn.getAttribute('data-hotel-id');
        const newStatus = btn.getAttribute('data-new-status');
        store.setHotelStatus(hotelId, newStatus);
        hotels = store.getHotels();
        window.showToast(`Hotel status updated to ${newStatus.toUpperCase()}`, 'success');
        render();
      });
    });

    // Inspect hotel modal
    container.querySelectorAll('.btn-inspect-hotel').forEach(btn => {
      btn.addEventListener('click', () => {
        const hotelId = btn.getAttribute('data-hotel-id');
        openHotelDetailModal(hotelId);
      });
    });

    // Add Hotel Modal
    container.querySelector('#btn-add-hotel')?.addEventListener('click', () => {
      openAddHotelModal();
    });
  }

  function openHotelDetailModal(hotelId) {
    const hotel = store.getHotel(hotelId);
    if (!hotel) return;

    const modalRoot = container.querySelector('#hotel-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="hotel-detail-modal">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <div style="font-size: 0.75rem; font-family: monospace; color: var(--primary); font-weight: 700;">${hotel.id}</div>
              <h2 class="modal-title">${hotel.name}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="height: 220px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 20px; position: relative;">
              <img src="${hotel.coverImage}" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 4px 10px; border-radius: var(--radius-sm); color: #fff; font-size: 0.8rem;">
                <i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${hotel.address}
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 18px;">
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Owner & Management</div>
                <div style="font-weight: 700; color: #fff; margin-top: 4px;">${hotel.ownerName}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">Owner ID: ${hotel.ownerId}</div>
              </div>
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Inventory & Pricing</div>
                <div style="font-weight: 700; color: var(--success); margin-top: 4px;">₹${hotel.pricePerNight.toLocaleString('en-IN')} / night</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">${hotel.availableRooms} of ${hotel.roomsCount} Rooms Live</div>
              </div>
            </div>

            <div style="margin-bottom: 18px;">
              <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">Description</h4>
              <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.5; background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md);">
                ${hotel.description}
              </p>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">Amenities Available</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${hotel.amenities.map(a => `
                  <span style="background: var(--bg-surface); border: 1px solid var(--border-color); font-size: 0.78rem; padding: 4px 10px; border-radius: var(--radius-full); color: var(--text-main);">
                    ✓ ${a}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.85rem; color: var(--text-secondary);">
              Current App Status: <span class="status-badge ${hotel.status}">${hotel.status.replace('_', ' ')}</span>
            </span>
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            ${hotel.status === 'active' ? `
              <button class="btn btn-danger" id="modal-suspend-btn"><i data-lucide="pause-circle"></i> Suspend Hotel</button>
            ` : `
              <button class="btn btn-success" id="modal-approve-btn"><i data-lucide="check-circle-2"></i> Approve & Make Live</button>
            `}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => {
      modalRoot.innerHTML = '';
    };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#modal-suspend-btn')?.addEventListener('click', () => {
      store.setHotelStatus(hotelId, 'suspended');
      hotels = store.getHotels();
      window.showToast(`Hotel ${hotel.name} suspended from customer app.`, 'warning');
      closeModal();
      render();
    });

    modalRoot.querySelector('#modal-approve-btn')?.addEventListener('click', () => {
      store.setHotelStatus(hotelId, 'active');
      hotels = store.getHotels();
      window.showToast(`Hotel ${hotel.name} is now LIVE on Customer App!`, 'success');
      closeModal();
      render();
    });
  }

  function openAddHotelModal() {
    const owners = store.getOwners().filter(o => o.verificationStatus === 'verified');
    const modalRoot = container.querySelector('#hotel-modal-root');
    
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="add-hotel-modal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Register New Hotel On Platform</h2>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <form id="new-hotel-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Hotel Name</label>
                <input type="text" class="form-input" id="new-hotel-name" required placeholder="e.g. Taj Lakefront Suites">
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Assign Verified Owner</label>
                  <select class="form-select" id="new-hotel-owner" required>
                    ${owners.map(o => `<option value="${o.id}">${o.name} (${o.businessName})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input type="text" class="form-input" id="new-hotel-city" required placeholder="e.g. Mumbai">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Full Address</label>
                <input type="text" class="form-input" id="new-hotel-address" required placeholder="Street address, landmark, pincode">
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Base Starting Price (₹ / night)</label>
                  <input type="number" class="form-input" id="new-hotel-price" required min="1000" placeholder="e.g. 7500">
                </div>
                <div class="form-group">
                  <label class="form-label">Total Rooms Count</label>
                  <input type="number" class="form-input" id="new-hotel-rooms" required min="1" placeholder="e.g. 30">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Cover Image URL</label>
                <input type="url" class="form-input" id="new-hotel-image" required value="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80">
              </div>

              <div class="form-group">
                <label class="form-label">Property Description</label>
                <textarea class="form-textarea" id="new-hotel-desc" required placeholder="Describe the hotel amenities and experience..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="plus"></i> Add Hotel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => {
      modalRoot.innerHTML = '';
    };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-cancel')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#new-hotel-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const ownerId = modalRoot.querySelector('#new-hotel-owner').value;
      const ownerObj = store.getOwner(ownerId);
      
      const newHotelData = {
        name: modalRoot.querySelector('#new-hotel-name').value,
        ownerId: ownerId,
        ownerName: ownerObj ? ownerObj.name : 'Registered Owner',
        city: modalRoot.querySelector('#new-hotel-city').value,
        state: 'India',
        address: modalRoot.querySelector('#new-hotel-address').value,
        pricePerNight: Number(modalRoot.querySelector('#new-hotel-price').value),
        roomsCount: Number(modalRoot.querySelector('#new-hotel-rooms').value),
        availableRooms: Number(modalRoot.querySelector('#new-hotel-rooms').value),
        coverImage: modalRoot.querySelector('#new-hotel-image').value,
        description: modalRoot.querySelector('#new-hotel-desc').value,
        starCategory: 5,
        amenities: ['Free WiFi', '24/7 Room Service', 'Swimming Pool', 'Fine Dining']
      };

      store.addHotel(newHotelData);
      hotels = store.getHotels();
      window.showToast('New Hotel registered successfully on Platform!', 'success');
      closeModal();
      render();
    });
  }

  // Initial render
  render();
}
