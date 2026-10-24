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

    if (!hotels || hotels.length === 0) {
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
    let currentCoverUrl = hotel.cover_image || '';
    let isUploading = false;
    let hasActiveBanners = false;
    let primaryBanner = null;

    try {
      const bannerRes = await api.get('/hotel-admin/banners');
      if (bannerRes && Array.isArray(bannerRes.banners)) {
        const activeBanners = bannerRes.banners
          .filter(b => b.is_active !== false && (b.image_url || b.cover_image))
          .sort((a, b) => {
            const orderDiff = (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
            if (orderDiff !== 0) return orderDiff;
            return new Date(a.created_at || 0) - new Date(b.created_at || 0);
          });
        if (activeBanners.length > 0) {
          hasActiveBanners = true;
          primaryBanner = activeBanners[0];
          const syncImage = primaryBanner.image_url || primaryBanner.cover_image;
          if (syncImage) currentCoverUrl = syncImage;
        }
      }
    } catch (e) {
      // Continue gracefully with current hotel cover
    }

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
                <input type="text" class="form-input" id="edit-hotel-name" value="${hotel.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Hotel Type</label>
                <input type="text" class="form-input" id="edit-hotel-type" value="${hotel.hotel_type || 'Luxury Resort'}">
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" class="form-input" id="edit-hotel-city" value="${hotel.city || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">State / Region</label>
                <input type="text" class="form-input" id="edit-hotel-state" value="${hotel.state || ''}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Full Street Address</label>
              <input type="text" class="form-input" id="edit-hotel-address" value="${hotel.address || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Property Description</label>
              <textarea class="form-textarea" id="edit-hotel-desc" required style="min-height: 100px;">${hotel.description || ''}</textarea>
            </div>

            <!-- PROPERTY COVER PHOTO DIRECT UPLOADER -->
            <div class="form-group" style="margin-top: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <label class="form-label" style="margin-bottom: 0;">Property Cover Photo</label>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Max 5 MB • JPG, PNG, WEBP</span>
              </div>

              ${hasActiveBanners ? `
                <div style="background: rgba(128, 0, 32, 0.05); border: 1px solid rgba(128, 0, 32, 0.2); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
                  <i data-lucide="info" style="width: 16px; height: 16px; color: #800020; flex-shrink: 0; margin-top: 2px;"></i>
                  <div style="font-size: 0.78rem; color: #4a1525; line-height: 1.45;">
                    <strong>Synchronized with First Active Banner:</strong> Your lowest sort-order active promotional banner (Display Order: <strong>${primaryBanner?.sort_order ?? 0}</strong>) is the active source of truth for your property's public cover photo. Any manual upload will be safely preserved as fallback when no banners are active.
                  </div>
                </div>
              ` : `
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
                  <i data-lucide="check-circle" style="width: 16px; height: 16px; color: #059669; flex-shrink: 0; margin-top: 2px;"></i>
                  <div style="font-size: 0.78rem; color: #065f46; line-height: 1.45;">
                    <strong>Direct Cover Photo Active:</strong> No active promotional banners found. This image serves as your public property cover photo.
                  </div>
                </div>
              `}

              <div class="room-photo-uploader" id="hotel-cover-uploader">
                <!-- Hidden Native File Input -->
                <input type="file" id="hotel-cover-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;">

                <!-- Dropzone / Preview Area -->
                <div class="upload-dropzone ${currentCoverUrl ? 'has-preview' : ''}" id="hotel-cover-dropzone">
                  ${currentCoverUrl ? `
                    <div class="upload-preview-wrapper" id="upload-preview-container" style="max-height: 240px;">
                      <img src="${currentCoverUrl}" alt="Property Cover" class="upload-preview-img" id="hotel-cover-preview-img" style="height: 240px; object-fit: cover;">
                      <div class="upload-preview-badge">
                        <i data-lucide="check" style="width: 12px; height: 12px;"></i> Ready
                      </div>
                      <div class="upload-preview-actions">
                        <button type="button" class="upload-preview-btn" id="btn-change-cover">
                          <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Change Photo
                        </button>
                        <button type="button" class="upload-preview-btn btn-remove" id="btn-remove-cover">
                          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Remove Photo
                        </button>
                      </div>
                    </div>
                  ` : `
                    <div class="upload-dropzone-content" id="upload-empty-content">
                      <div class="upload-dropzone-icon">
                        <i data-lucide="cloud-upload" style="width: 26px; height: 26px;"></i>
                      </div>
                      <div class="upload-dropzone-text">Drag & drop property cover photo here</div>
                      <div class="upload-dropzone-subtext">or click to browse from your device</div>
                      <button type="button" class="upload-btn-trigger" id="btn-upload-cover-trigger">
                        <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Photo
                      </button>
                    </div>
                  `}
                </div>

                <!-- Upload Progress Bar (hidden by default) -->
                <div class="upload-progress-container" id="hotel-cover-progress-box" style="display: none;">
                  <div class="upload-progress-info">
                    <span id="hotel-cover-progress-label">Uploading cover photo to Cloudinary...</span>
                    <span id="hotel-cover-progress-percent">0%</span>
                  </div>
                  <div class="upload-progress-bar-bg">
                    <div class="upload-progress-bar-fill" id="hotel-cover-progress-fill"></div>
                  </div>
                </div>

                <!-- Status / Alert Message Container -->
                <div id="hotel-cover-status-box" style="display: none;"></div>
              </div>
            </div>

            <div style="margin-top: 18px;">
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

    // Elements & State management
    const fileInput = container.querySelector('#hotel-cover-file-input');
    const dropzone = container.querySelector('#hotel-cover-dropzone');
    const progressBox = container.querySelector('#hotel-cover-progress-box');
    const progressFill = container.querySelector('#hotel-cover-progress-fill');
    const progressPercent = container.querySelector('#hotel-cover-progress-percent');
    const progressLabel = container.querySelector('#hotel-cover-progress-label');
    const statusBox = container.querySelector('#hotel-cover-status-box');
    const saveBtn = container.querySelector('#btn-save-hotel');

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
      currentCoverUrl = url;
      dropzone.className = 'upload-dropzone has-preview';
      dropzone.innerHTML = `
        <div class="upload-preview-wrapper" id="upload-preview-container" style="max-height: 240px;">
          <img src="${url}" alt="Property Cover" class="upload-preview-img" id="hotel-cover-preview-img" style="height: 240px; object-fit: cover;">
          <div class="upload-preview-badge">
            <i data-lucide="check" style="width: 12px; height: 12px;"></i> Ready
          </div>
          <div class="upload-preview-actions">
            <button type="button" class="upload-preview-btn" id="btn-change-cover">
              <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Change Photo
            </button>
            <button type="button" class="upload-preview-btn btn-remove" id="btn-remove-cover">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Remove Photo
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      bindPreviewEvents();
    }

    function renderEmptyDropzone() {
      currentCoverUrl = '';
      dropzone.className = 'upload-dropzone';
      dropzone.innerHTML = `
        <div class="upload-dropzone-content" id="upload-empty-content">
          <div class="upload-dropzone-icon">
            <i data-lucide="cloud-upload" style="width: 26px; height: 26px;"></i>
          </div>
          <div class="upload-dropzone-text">Drag & drop property cover photo here</div>
          <div class="upload-dropzone-subtext">or click to browse from your device</div>
          <button type="button" class="upload-btn-trigger" id="btn-upload-cover-trigger">
            <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Photo
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      bindEmptyEvents();
    }

    async function handleFileSelection(file) {
      if (!file) return;

      // File type validation (JPG, JPEG, PNG, WEBP)
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const isMimeValid = allowedMimes.includes((file.type || '').toLowerCase());
      const isExtValid = validExtensions.includes(fileExt);

      if (!isMimeValid && !isExtValid) {
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
      if (saveBtn) saveBtn.disabled = true;

      // Show Progress bar
      progressBox.style.display = 'flex';
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      progressLabel.textContent = `Uploading ${file.name}...`;

      try {
        const uploadResult = await api.uploadCoverImage(file, hotel.id, (percent) => {
          progressFill.style.width = `${percent}%`;
          progressPercent.textContent = `${percent}%`;
        });

        // Cloudinary upload success
        currentCoverUrl = uploadResult.secure_url || uploadResult.url;
        renderPreview(currentCoverUrl);
        showStatus('Cover photo uploaded to Cloudinary! Click "Save Property Changes" to persist.', 'success');
      } catch (err) {
        console.error('Hotel cover upload failed:', err);
        showStatus(err.message || 'Cover photo upload failed. Please verify network or Cloudinary configuration.', 'error');
      } finally {
        isUploading = false;
        progressBox.style.display = 'none';
        if (saveBtn) saveBtn.disabled = false;
        if (fileInput) fileInput.value = '';
      }
    }

    function bindEmptyEvents() {
      const browseTrigger = dropzone.querySelector('#btn-upload-cover-trigger');
      if (browseTrigger) {
        browseTrigger.onclick = (e) => {
          e.stopPropagation();
          if (fileInput) fileInput.click();
        };
      }

      dropzone.onclick = () => {
        if (!dropzone.classList.contains('has-preview') && fileInput) {
          fileInput.click();
        }
      };

      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      };

      dropzone.ondragleave = () => {
        dropzone.classList.remove('drag-over');
      };

      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileSelection(e.dataTransfer.files[0]);
        }
      };
    }

    function bindPreviewEvents() {
      const btnChange = dropzone.querySelector('#btn-change-cover');
      const btnRemove = dropzone.querySelector('#btn-remove-cover');

      if (btnChange) {
        btnChange.onclick = (e) => {
          e.stopPropagation();
          if (fileInput) fileInput.click();
        };
      }

      if (btnRemove) {
        btnRemove.onclick = (e) => {
          e.stopPropagation();
          renderEmptyDropzone();
          showStatus('Cover photo removed. Click "Save Property Changes" to apply.', 'info');
        };
      }
    }

    if (fileInput) {
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileSelection(e.target.files[0]);
        }
      };
    }

    if (currentCoverUrl) {
      bindPreviewEvents();
    } else {
      bindEmptyEvents();
    }

    // Save property changes
    saveBtn?.addEventListener('click', async () => {
      if (isUploading) {
        window.showToast?.('Please wait until image upload completes before saving.', 'error');
        return;
      }

      const selectedAmenities = Array.from(container.querySelectorAll('.amenity-checkbox:checked')).map(cb => cb.value);
      const updates = {
        name: container.querySelector('#edit-hotel-name').value,
        hotel_type: container.querySelector('#edit-hotel-type').value,
        city: container.querySelector('#edit-hotel-city').value,
        state: container.querySelector('#edit-hotel-state').value,
        address: container.querySelector('#edit-hotel-address').value,
        description: container.querySelector('#edit-hotel-desc').value,
        cover_image: currentCoverUrl,
        amenities: selectedAmenities
      };

      const originalBtnHtml = saveBtn.innerHTML;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i data-lucide="loader-2" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"></i> Saving...`;
      if (window.lucide) window.lucide.createIcons();

      try {
        await api.updateHotel(hotel.id, updates);
        hotel.cover_image = currentCoverUrl;
        hotel.name = updates.name;
        showStatus('Property details and cover photo saved successfully.', 'success');
        if (window.showToast) {
          window.showToast('Hotel details and cover photo saved successfully.', 'success');
        }
      } catch (err) {
        console.error('Save hotel failed:', err);
        showStatus(err.message || 'Failed to save property changes. You can retry saving without re-uploading.', 'error');
        if (window.showToast) {
          window.showToast(err.message || 'Failed to save hotel details.', 'error');
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
  }
}
