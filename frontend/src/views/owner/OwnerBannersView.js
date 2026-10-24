import { api } from '../../services/api.js';

export async function renderOwnerBannersView(container) {
  let activeHotel = null;
  let banners = [];

  container.innerHTML = `
    <div class="card fade-in">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 class="card-title">Hotel Banners</h2>
          <p class="card-subtitle" id="banners-subtitle">Manage promotional slider images for your property.</p>
        </div>
        <button id="btn-add-banner" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="plus"></i> Add Banner
        </button>
      </div>
      <div class="card-body">
        <div id="banners-loading" style="text-align: center; padding: 40px; color: #64748b;">
          <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px; margin-bottom: 12px;"></i>
          <p>Loading banners...</p>
        </div>
        <div id="banners-error" class="alert alert-error" style="display: none; margin-bottom: 16px;"></div>
        <div id="banners-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; display: none;">
          <!-- Banners go here -->
        </div>
      </div>
    </div>

    <!-- Modal container root -->
    <div id="banner-modal-root"></div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const grid = container.querySelector('#banners-grid');
  const loading = container.querySelector('#banners-loading');
  const errorEl = container.querySelector('#banners-error');
  const subtitleEl = container.querySelector('#banners-subtitle');
  const addBtn = container.querySelector('#btn-add-banner');
  const modalRoot = container.querySelector('#banner-modal-root');

  // Resolve authorized hotel
  try {
    const hotelRes = await api.getOwnerHotels();
    if (hotelRes && hotelRes.hotels && hotelRes.hotels.length > 0) {
      activeHotel = hotelRes.hotels[0];
      subtitleEl.textContent = `Manage promotional slider images for ${activeHotel.name}.`;
    }
  } catch (err) {
    console.warn('Could not fetch hotel details:', err.message);
  }

  async function loadBanners() {
    try {
      loading.style.display = 'block';
      grid.style.display = 'none';
      errorEl.style.display = 'none';

      const res = await api.get('/hotel-admin/banners');
      loading.style.display = 'none';

      if (!res.success) {
        errorEl.textContent = res.message || 'Failed to load banners.';
        errorEl.style.display = 'block';
        return;
      }

      banners = res.banners || [];
      grid.innerHTML = '';

      if (banners.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #64748b; grid-column: 1 / -1; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <i data-lucide="image" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p style="font-weight: 500; font-size: 16px; margin-bottom: 8px;">No Banners Found</p>
            <p style="font-size: 14px; margin-bottom: 16px;">Upload your first promotional banner to showcase on the customer app.</p>
            <button id="btn-empty-add-banner" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Add Banner Now
            </button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        grid.querySelector('#btn-empty-add-banner')?.addEventListener('click', () => openBannerModal());
      } else {
        grid.style.display = 'grid';
        banners.forEach(b => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.overflow = 'hidden';
          card.innerHTML = `
            <div style="height: 160px; background: #e2e8f0; position: relative;">
              <img src="${b.image_url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x200?text=Invalid+Image'" />
              ${!b.is_active ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; letter-spacing: 0.05em;">INACTIVE</div>' : ''}
              <div style="position: absolute; top: 8px; right: 8px; background: ${b.is_active ? '#10b981' : '#64748b'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                ${b.is_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            <div style="padding: 16px;">
              <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${b.title || 'Untitled Banner'}</h4>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Display Order: <strong>${b.sort_order ?? 0}</strong></p>
              
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                <button class="btn-edit" data-id="${b.id}" style="background: none; border: none; color: #3b82f6; font-weight: 500; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; gap: 4px;">
                  <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Edit
                </button>
                <button class="btn-toggle" data-id="${b.id}" data-active="${b.is_active}" style="background: none; border: none; color: ${b.is_active ? '#f59e0b' : '#10b981'}; font-weight: 500; cursor: pointer; padding: 4px;">
                  ${b.is_active ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-delete" data-id="${b.id}" style="background: none; border: none; color: #ef4444; font-weight: 500; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; gap: 4px;">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
                </button>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });

        // Attach events
        grid.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', () => {
            const banner = banners.find(x => x.id === btn.dataset.id);
            if (banner) openBannerModal(banner);
          });
        });

        grid.querySelectorAll('.btn-toggle').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const currentActive = btn.dataset.active === 'true';
            if (confirm(`Are you sure you want to ${currentActive ? 'disable' : 'enable'} this banner?`)) {
              try {
                btn.textContent = '...';
                await api.patch(`/hotel-admin/banners/${id}/status`, { is_active: !currentActive });
                window.showToast('Banner status updated', 'success');
                loadBanners();
              } catch (e) {
                window.showToast(e.message, 'error');
                loadBanners();
              }
            }
          });
        });

        grid.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this banner permanently?')) {
              try {
                btn.textContent = '...';
                await api.delete(`/hotel-admin/banners/${btn.dataset.id}`);
                window.showToast('Banner deleted successfully', 'success');
                loadBanners();
              } catch (e) {
                window.showToast(e.message, 'error');
                loadBanners();
              }
            }
          });
        });
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      loading.style.display = 'none';
      errorEl.textContent = e.message;
      errorEl.style.display = 'block';
    }
  }

  function openBannerModal(existingBanner = null) {
    const isEdit = !!existingBanner;
    let activeImageUrl = existingBanner ? existingBanner.image_url : '';
    let activePublicId = existingBanner ? existingBanner.image_public_id : null;
    let isUploading = false;

    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="modal-banner-overlay" style="display: flex;">
        <div class="modal-container" style="max-width: 540px; max-height: calc(100vh - 32px);">
          <div class="modal-header">
            <h3 class="modal-title">${isEdit ? 'Edit Banner' : 'Add New Promotional Banner'}</h3>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <form id="form-banner" style="display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow: hidden; margin: 0;">
            <div class="modal-body" style="overflow-y: auto; flex: 1 1 auto; min-height: 0; padding: 20px;">
              <input type="hidden" id="banner-id" value="${existingBanner ? existingBanner.id : ''}" />

              <!-- Property Selection (Locked to authorized hotel) -->
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label">Associated Property</label>
                <div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--bg-surface-secondary, #f8fafc); border: 1px solid var(--border-light, #e2e8f0); border-radius: var(--radius-sm, 6px); font-size: 0.88rem; color: var(--text-main, #0f172a);">
                  <i data-lucide="building" style="width: 16px; height: 16px; color: var(--color-primary, #0ea5e9);"></i>
                  <strong>${activeHotel ? activeHotel.name : 'Authorized Hotel Property'}</strong>
                  ${activeHotel ? `<span style="font-size: 0.75rem; color: #64748b; margin-left: auto;">ID: ${activeHotel.id}</span>` : ''}
                </div>
              </div>

              <!-- Banner Title -->
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" for="banner-title">Banner Title (Optional)</label>
                <input type="text" id="banner-title" class="form-input" placeholder="e.g. Summer Weekend Getaway Special" value="${existingBanner && existingBanner.title ? existingBanner.title : ''}" />
                <p style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Displayed as a headline caption on promotional hero carousels.</p>
              </div>

              <!-- Cloudinary Image Upload Area -->
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Banner Image <span style="color: #ef4444;">*</span></span>
                  <span style="font-size: 0.72rem; color: #64748b; font-weight: normal;">Max 5 MB • JPG, PNG, WEBP</span>
                </label>

                <div class="room-photo-uploader">
                  <!-- Hidden Native File Input -->
                  <input type="file" id="banner-photo-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;" />

                  <!-- Dropzone / Preview Area -->
                  <div class="upload-dropzone ${activeImageUrl ? 'has-preview' : ''}" id="banner-photo-dropzone">
                    ${activeImageUrl ? `
                      <div class="upload-preview-wrapper" id="upload-preview-container">
                        <img src="${activeImageUrl}" alt="Banner Preview" class="upload-preview-img" id="upload-preview-img" style="height: 160px; object-fit: cover; width: 100%; border-radius: 6px;" />
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
                          <i data-lucide="cloud-upload" style="width: 28px; height: 28px;"></i>
                        </div>
                        <div class="upload-dropzone-text" style="font-weight: 500; margin-top: 6px;">Drag & drop banner image here</div>
                        <div class="upload-dropzone-subtext" style="font-size: 0.75rem; color: #64748b; margin-bottom: 10px;">or click to browse from your device</div>
                        <button type="button" class="upload-btn-trigger" id="btn-browse-trigger">
                          <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Image
                        </button>
                      </div>
                    `}
                  </div>

                  <!-- Upload Progress Bar -->
                  <div class="upload-progress-container" id="upload-progress-box" style="display: none;">
                    <div class="upload-progress-info">
                      <span id="upload-progress-label">Uploading to Cloudinary...</span>
                      <span id="upload-progress-percent">0%</span>
                    </div>
                    <div class="upload-progress-bar-bg">
                      <div class="upload-progress-bar-fill" id="upload-progress-fill"></div>
                    </div>
                  </div>

                  <!-- Status message -->
                  <div id="upload-status-box" style="display: none; margin-top: 8px;"></div>
                </div>
              </div>

              <!-- Display Order & Status -->
              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label" for="banner-order">Display Order</label>
                  <input type="number" id="banner-order" class="form-input" min="0" value="${existingBanner ? existingBanner.sort_order ?? 0 : 0}" />
                  <p style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Lower numbers appear first.</p>
                </div>
                <div class="form-group">
                  <label class="form-label" for="banner-status">Status</label>
                  <select id="banner-status" class="form-input">
                    <option value="true" ${!existingBanner || existingBanner.is_active !== false ? 'selected' : ''}>Active</option>
                    <option value="false" ${existingBanner && existingBanner.is_active === false ? 'selected' : ''}>Inactive</option>
                  </select>
                  <p style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Active banners are visible to guests.</p>
                </div>
              </div>
            </div>

            <!-- Pinned Action Footer -->
            <div class="modal-footer" style="flex-shrink: 0; background: var(--bg-surface-secondary, #f8fafc); border-top: 1px solid var(--border-light, #e2e8f0); padding: 14px 20px; z-index: 10;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-banner">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-save-banner">
                ${isEdit ? 'Update Banner' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const fileInput = modalRoot.querySelector('#banner-photo-file-input');
    const dropzone = modalRoot.querySelector('#banner-photo-dropzone');
    const progressBox = modalRoot.querySelector('#upload-progress-box');
    const progressFill = modalRoot.querySelector('#upload-progress-fill');
    const progressPercent = modalRoot.querySelector('#upload-progress-percent');
    const progressLabel = modalRoot.querySelector('#upload-progress-label');
    const statusBox = modalRoot.querySelector('#upload-status-box');
    const saveBtn = modalRoot.querySelector('#btn-save-banner');
    const form = modalRoot.querySelector('#form-banner');

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
          <img src="${url}" alt="Banner Preview" class="upload-preview-img" id="upload-preview-img" style="height: 160px; object-fit: cover; width: 100%; border-radius: 6px;" />
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
            <i data-lucide="cloud-upload" style="width: 28px; height: 28px;"></i>
          </div>
          <div class="upload-dropzone-text" style="font-weight: 500; margin-top: 6px;">Drag & drop banner image here</div>
          <div class="upload-dropzone-subtext" style="font-size: 0.75rem; color: #64748b; margin-bottom: 10px;">or click to browse from your device</div>
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

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        showStatus('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showStatus(`File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller file.`, 'error');
        return;
      }

      clearStatus();
      isUploading = true;
      if (saveBtn) saveBtn.disabled = true;

      progressBox.style.display = 'flex';
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      progressLabel.textContent = `Uploading ${file.name}...`;

      try {
        const uploadResult = await api.uploadBannerImage(file, activeHotel ? activeHotel.id : null, (percent) => {
          progressFill.style.width = `${percent}%`;
          progressPercent.textContent = `${percent}%`;
        });

        activeImageUrl = uploadResult.secure_url;
        activePublicId = uploadResult.public_id || null;
        renderPreview(activeImageUrl);
        showStatus('Image uploaded securely to Cloudinary!', 'success');
      } catch (err) {
        console.error('Banner upload failed:', err);
        showStatus(err.message || 'Image upload failed. Please check network or Cloudinary configuration.', 'error');
      } finally {
        isUploading = false;
        progressBox.style.display = 'none';
        if (saveBtn) saveBtn.disabled = false;
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

    dropzone.addEventListener('click', () => {
      if (!activeImageUrl && !isUploading) {
        fileInput?.click();
      }
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

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

    const closeModal = () => {
      modalRoot.innerHTML = '';
    };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-cancel-banner')?.addEventListener('click', closeModal);

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isUploading) {
        window.showToast('Please wait for image upload to complete.', 'warning');
        return;
      }

      if (!activeImageUrl) {
        showStatus('Banner image is required. Please upload an image first.', 'error');
        window.showToast('Please upload a banner image before saving.', 'error');
        return;
      }

      const id = modalRoot.querySelector('#banner-id').value;
      const payload = {
        title: modalRoot.querySelector('#banner-title').value.trim(),
        image_url: activeImageUrl,
        image_public_id: activePublicId,
        sort_order: parseInt(modalRoot.querySelector('#banner-order').value) || 0,
        is_active: modalRoot.querySelector('#banner-status').value === 'true'
      };

      if (activeHotel) {
        payload.hotel_id = activeHotel.id;
      }

      const ogText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      try {
        if (id) {
          await api.put(`/hotel-admin/banners/${id}`, payload);
          window.showToast('Banner updated successfully', 'success');
        } else {
          await api.post('/hotel-admin/banners', payload);
          window.showToast('Banner created successfully', 'success');
        }
        closeModal();
        loadBanners();
      } catch (err) {
        window.showToast(err.message, 'error');
        showStatus(err.message, 'error');
      } finally {
        saveBtn.textContent = ogText;
        saveBtn.disabled = false;
      }
    });
  }

  addBtn.addEventListener('click', () => openBannerModal());

  loadBanners();
}
