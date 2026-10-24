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

    // Track active image state
    let activeImageUrl = existingRoom && existingRoom.photos && existingRoom.photos[0] ? existingRoom.photos[0] : '';
    let activePublicId = existingRoom && existingRoom.photo_public_id ? existingRoom.photo_public_id : null;
    let isUploading = false;

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

              <!-- Professional Cloudinary Room Photo Upload Area -->
              <div class="form-group">
                <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Room Photo <span style="color: var(--danger, #ef4444);">*</span></span>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Max 5 MB • JPG, PNG, WEBP</span>
                </label>

                <div class="room-photo-uploader">
                  <!-- Hidden Native File Input -->
                  <input type="file" id="room-photo-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;">

                  <!-- Dropzone / Preview Area -->
                  <div class="upload-dropzone ${activeImageUrl ? 'has-preview' : ''}" id="room-photo-dropzone">
                    ${activeImageUrl ? `
                      <div class="upload-preview-wrapper" id="upload-preview-container">
                        <img src="${activeImageUrl}" alt="Room Preview" class="upload-preview-img" id="upload-preview-img">
                        <div class="upload-preview-badge">
                          <i data-lucide="check" style="width: 12px; height: 12px;"></i> Ready
                        </div>
                        <div class="upload-preview-actions">
                          <button type="button" class="upload-preview-btn" id="btn-replace-image">
                            <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Replace
                          </button>
                          <button type="button" class="upload-preview-btn btn-remove" id="btn-remove-image">
                            <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Remove
                          </button>
                        </div>
                      </div>
                    ` : `
                      <div class="upload-dropzone-content" id="upload-empty-content">
                        <div class="upload-dropzone-icon">
                          <i data-lucide="cloud-upload" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="upload-dropzone-text">Drag & drop room image here</div>
                        <div class="upload-dropzone-subtext">or click to browse from your device</div>
                        <button type="button" class="upload-btn-trigger" id="btn-browse-trigger">
                          <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Image
                        </button>
                      </div>
                    `}
                  </div>

                  <!-- Upload Progress Bar (hidden by default) -->
                  <div class="upload-progress-container" id="upload-progress-box" style="display: none;">
                    <div class="upload-progress-info">
                      <span id="upload-progress-label">Uploading to Cloudinary...</span>
                      <span id="upload-progress-percent">0%</span>
                    </div>
                    <div class="upload-progress-bar-bg">
                      <div class="upload-progress-bar-fill" id="upload-progress-fill"></div>
                    </div>
                  </div>

                  <!-- Status / Alert Message Container -->
                  <div id="upload-status-box" style="display: none;"></div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-close-action">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-room">${isEdit ? 'Update Room' : 'Create Room'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const fileInput = modalRoot.querySelector('#room-photo-file-input');
    const dropzone = modalRoot.querySelector('#room-photo-dropzone');
    const progressBox = modalRoot.querySelector('#upload-progress-box');
    const progressFill = modalRoot.querySelector('#upload-progress-fill');
    const progressPercent = modalRoot.querySelector('#upload-progress-percent');
    const progressLabel = modalRoot.querySelector('#upload-progress-label');
    const statusBox = modalRoot.querySelector('#upload-status-box');
    const submitBtn = modalRoot.querySelector('#btn-submit-room');

    function showStatus(message, type = 'info') {
      if (!statusBox) return;
      statusBox.className = `upload-status-msg ${type}`;
      statusBox.innerHTML = `
        <i data-lucide="${type === 'error' ? 'alert-triangle' : (type === 'success' ? 'check-circle-2' : 'info')}" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
        <span>${message}</span>
      `;
      statusBox.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }

    function clearStatus() {
      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.innerHTML = '';
      }
    }

    function renderPreview(url) {
      activeImageUrl = url;
      dropzone.className = 'upload-dropzone has-preview';
      dropzone.innerHTML = `
        <div class="upload-preview-wrapper" id="upload-preview-container">
          <img src="${url}" alt="Room Preview" class="upload-preview-img" id="upload-preview-img">
          <div class="upload-preview-badge">
            <i data-lucide="check" style="width: 12px; height: 12px;"></i> Ready
          </div>
          <div class="upload-preview-actions">
            <button type="button" class="upload-preview-btn" id="btn-replace-image">
              <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Replace
            </button>
            <button type="button" class="upload-preview-btn btn-remove" id="btn-remove-image">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Remove
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      bindPreviewEvents();
    }

    function renderEmptyDropzone() {
      activeImageUrl = '';
      activePublicId = null;
      dropzone.className = 'upload-dropzone';
      dropzone.innerHTML = `
        <div class="upload-dropzone-content" id="upload-empty-content">
          <div class="upload-dropzone-icon">
            <i data-lucide="cloud-upload" style="width: 24px; height: 24px;"></i>
          </div>
          <div class="upload-dropzone-text">Drag & drop room image here</div>
          <div class="upload-dropzone-subtext">or click to browse from your device</div>
          <button type="button" class="upload-btn-trigger" id="btn-browse-trigger">
            <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Image
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      bindEmptyEvents();
    }

    async function handleFileSelection(file) {
      if (!file) return;

      // File type validation (JPG, JPEG, PNG, WEBP)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        showStatus('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
        return;
      }

      // Max file size: 5 MB
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showStatus(`File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller file.`, 'error');
        return;
      }

      clearStatus();
      isUploading = true;
      if (submitBtn) submitBtn.disabled = true;

      // Show Progress bar
      progressBox.style.display = 'flex';
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      progressLabel.textContent = `Uploading ${file.name}...`;

      try {
        const uploadResult = await api.uploadRoomImage(file, hotelId, (percent) => {
          progressFill.style.width = `${percent}%`;
          progressPercent.textContent = `${percent}%`;
        });

        // Cloudinary upload success
        activeImageUrl = uploadResult.secure_url;
        activePublicId = uploadResult.public_id || null;
        renderPreview(activeImageUrl);
        showStatus('Image uploaded securely to Cloudinary!', 'success');
      } catch (err) {
        console.error('Room image upload failed:', err);
        showStatus(err.message || 'Image upload failed. Please check your network or Cloudinary configuration.', 'error');
      } finally {
        isUploading = false;
        progressBox.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
        if (fileInput) fileInput.value = '';
      }
    }

    function bindEmptyEvents() {
      const browseBtn = dropzone.querySelector('#btn-browse-trigger');
      browseBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput?.click();
      });
    }

    function bindPreviewEvents() {
      dropzone.querySelector('#btn-replace-image')?.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput?.click();
      });

      dropzone.querySelector('#btn-remove-image')?.addEventListener('click', (e) => {
        e.stopPropagation();
        renderEmptyDropzone();
        clearStatus();
      });
    }

    // Trigger file chooser when clicking anywhere on dropzone when empty
    dropzone.addEventListener('click', () => {
      if (!activeImageUrl && !isUploading) {
        fileInput?.click();
      }
    });

    // Native file input change
    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

    // Drag-and-drop support
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (isUploading) return;
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    if (activeImageUrl) {
      bindPreviewEvents();
    } else {
      bindEmptyEvents();
    }

    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#room-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isUploading) {
        window.showToast('Please wait for image upload to complete.', 'warning');
        return;
      }

      if (!activeImageUrl) {
        showStatus('Please upload a room photo before proceeding.', 'error');
        window.showToast('Room photo is required.', 'error');
        return;
      }

      const payload = {
        hotel_id: hotelId,
        room_name: modalRoot.querySelector('#room-name').value.trim(),
        room_type: modalRoot.querySelector('#room-type').value,
        max_guests: Number(modalRoot.querySelector('#room-capacity').value),
        price_per_night: Number(modalRoot.querySelector('#room-price').value),
        total_inventory: Number(modalRoot.querySelector('#room-inventory').value),
        description: modalRoot.querySelector('#room-desc').value.trim(),
        photos: [activeImageUrl],
        photo_public_id: activePublicId
      };

      try {
        if (isEdit) {
          await api.updateRoom(existingRoom.id, payload);
          window.showToast('Room category updated successfully.', 'success');
        } else {
          await api.createRoom(payload);
          window.showToast('New room category created successfully.', 'success');
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
