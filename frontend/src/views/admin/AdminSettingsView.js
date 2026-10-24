import { api } from '../../services/api.js';

function getAuthUser() {
  if (api.currentUser) return api.currentUser;
  try {
    const raw = localStorage.getItem('hotelhub_current_user');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function isUserSuperAdmin() {
  const user = getAuthUser();
  if (!user || !user.role) return false;
  const role = String(user.role).trim().toLowerCase();
  return role === 'super_admin' || role === 'superadmin';
}

export async function renderAdminSettingsView(container) {
  let settings = null;
  let heroImage = null;

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading settings...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    // Ensure role and user profile are fully hydrated from backend /api/auth/me
    if (api.token) {
      try {
        const freshUser = await api.getMe();
        if (freshUser) {
          api.currentUser = freshUser;
        }
      } catch (err) {
        console.warn('[AdminSettingsView] Session hydration from /api/auth/me notice:', err.message);
      }
    }

    try {
      const [res, heroRes] = await Promise.all([
        api.getSettings().catch(() => ({ settings: {} })),
        api.getHomeHero().catch(() => ({ image_url: null }))
      ]);
      settings = res.settings || {};
      heroImage = heroRes?.image_url || heroRes?.hero_image || settings.home_hero_bg_image || null;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    const isSuperAdmin = isUserSuperAdmin();
    const currentUser = getAuthUser();
    const userRole = currentUser?.role || 'admin';

    container.innerHTML = `
      <div style="max-width: 760px; display: flex; flex-direction: column; gap: 24px;">
        <!-- Prominent Customer App Home Hero Background Management Card -->
        <div class="panel-card" id="hero-settings-card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div class="card-title-group">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0;">Customer App Home Hero Background</h2>
                <span class="badge ${isSuperAdmin ? 'badge-primary' : 'badge-warning'}" style="font-size: 0.72rem; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; font-weight: 600;">
                  ${isSuperAdmin ? 'Super Admin Only' : 'Restricted (Super Admin)'}
                </span>
              </div>
              <p style="margin-top: 4px; color: var(--text-muted); font-size: 0.85rem;">
                Manage the hero background image displayed behind "Find Your Perfect Stay" on the customer mobile app home screen.
              </p>
            </div>
          </div>

          ${!isSuperAdmin ? `
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: var(--radius-md); padding: 12px 16px; margin-top: 12px; display: flex; align-items: center; gap: 10px; color: #b45309; font-size: 0.85rem;">
              <i data-lucide="shield-alert" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
              <span>You are logged in as <strong>${userRole}</strong>. Only <strong>Super Admin</strong> can upload, replace, or remove the customer app home hero background.</span>
            </div>
          ` : `
            <div style="margin-top: 18px;">
              <input type="file" id="hero-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;">

              <div class="upload-dropzone ${heroImage ? 'has-preview' : ''}" id="hero-dropzone">
                ${heroImage ? `
                  <div class="upload-preview-wrapper" style="position: relative; width: 100%; border-radius: var(--radius-md); overflow: hidden; max-height: 260px;">
                    <img src="${heroImage}" alt="Customer App Hero Background" id="hero-preview-img" style="width: 100%; height: 240px; object-fit: cover; display: block; border-radius: var(--radius-md);" />
                    <div class="upload-preview-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0; transition: opacity 0.2s ease;">
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-change-hero" style="color: #fff; border-color: rgba(255,255,255,0.6); background: rgba(0,0,0,0.4);">
                        <i data-lucide="camera" style="width: 14px; height: 14px;"></i> Change Photo
                      </button>
                      <button type="button" class="btn btn-danger btn-sm" id="btn-remove-hero" style="background: #dc2626; border-color: #dc2626; color: #fff;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Remove Photo
                      </button>
                    </div>
                  </div>
                ` : `
                  <div class="upload-dropzone-content" id="hero-empty-content">
                    <div class="upload-dropzone-icon">
                      <i data-lucide="image" style="width: 28px; height: 28px;"></i>
                    </div>
                    <div class="upload-dropzone-text" style="font-weight: 600; margin-top: 8px;">Drag & drop home hero background image here</div>
                    <div class="upload-dropzone-subtext" style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">Supports JPG, JPEG, PNG, and WebP (Max 5 MB)</div>
                    <button type="button" class="upload-btn-trigger" id="btn-upload-hero-trigger">
                      <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Hero Image
                    </button>
                  </div>
                `}
              </div>

              <!-- Upload Progress Bar -->
              <div class="upload-progress-container" id="hero-progress-box" style="display: none; margin-top: 12px;">
                <div class="upload-progress-info" style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
                  <span id="hero-progress-label">Uploading to Cloudinary...</span>
                  <span id="hero-progress-percent" style="font-weight: 600;">0%</span>
                </div>
                <div class="upload-progress-bar-bg" style="width: 100%; height: 6px; background: var(--bg-surface-secondary); border-radius: 999px; overflow: hidden;">
                  <div class="upload-progress-bar-fill" id="hero-progress-fill" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.2s ease;"></div>
                </div>
              </div>

              <!-- Status / Alert Message Container -->
              <div id="hero-status-box" style="display: none; margin-top: 12px; font-size: 0.85rem; padding: 10px 14px; border-radius: var(--radius-sm); align-items: center; gap: 8px;"></div>
            </div>
          `}
        </div>

        <!-- Platform & App Configurations Form -->
        <div class="panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>Platform & App Configurations</h2>
              <p>Global operating parameters for Customer Mobile App & Hotel Owner Panel</p>
            </div>
          </div>

          <form id="settings-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Customer App Mode</label>
                <select class="form-select" id="setting-app-mode">
                  <option value="live" ${settings.app_mode === 'live' ? 'selected' : ''}>🟢 Live (Customer Bookings Enabled)</option>
                  <option value="maintenance" ${settings.app_mode === 'maintenance' ? 'selected' : ''}>🔴 Maintenance Mode (App Locked)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Payment Gateway Mode</label>
                <select class="form-select" id="setting-payment-mode">
                  <option value="production" ${settings.payment_mode === 'production' ? 'selected' : ''}>⚡ Production (Live Gateway)</option>
                  <option value="test" ${settings.payment_mode === 'test' ? 'selected' : ''}>🧪 Sandbox / Test Mode</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Default Platform Commission Take-Rate (%)</label>
                <input type="number" class="form-input" id="setting-commission-rate" value="${settings.commission_rate ?? 15}" min="1" max="50">
              </div>

              <div class="form-group">
                <label class="form-label">Standard Cancellation Processing Fee (%)</label>
                <input type="number" class="form-input" id="setting-cancel-fee" value="${settings.cancel_fee_pct ?? 10}" min="0" max="50">
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Helpdesk Support Email</label>
                <input type="email" class="form-input" id="setting-support-email" value="${settings.support_email || 'support@hotelhub.com'}">
              </div>

              <div class="form-group">
                <label class="form-label">Helpdesk Support Phone</label>
                <input type="text" class="form-input" id="setting-support-phone" value="${settings.support_phone || '+91 1800 200 8899'}">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
              <button type="submit" class="btn btn-primary" id="btn-save-settings">
                <i data-lucide="save"></i> Save Platform Configurations
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    bindEvents();
    if (isSuperAdmin) {
      bindHeroEvents();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function bindHeroEvents() {
    const fileInput = container.querySelector('#hero-file-input');
    const dropzone = container.querySelector('#hero-dropzone');
    const progressBox = container.querySelector('#hero-progress-box');
    const progressFill = container.querySelector('#hero-progress-fill');
    const progressPercent = container.querySelector('#hero-progress-percent');
    const progressLabel = container.querySelector('#hero-progress-label');
    const statusBox = container.querySelector('#hero-status-box');

    function showStatus(msg, type = 'info') {
      if (!statusBox) return;
      statusBox.style.display = 'flex';
      if (type === 'error') {
        statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
        statusBox.style.color = '#dc2626';
        statusBox.style.border = '1px solid rgba(239, 68, 68, 0.25)';
      } else if (type === 'success') {
        statusBox.style.background = 'rgba(34, 197, 94, 0.1)';
        statusBox.style.color = '#16a34a';
        statusBox.style.border = '1px solid rgba(34, 197, 94, 0.25)';
      } else {
        statusBox.style.background = 'var(--bg-surface-secondary)';
        statusBox.style.color = 'var(--text-main)';
        statusBox.style.border = '1px solid var(--border-light)';
      }
      statusBox.innerHTML = `
        <i data-lucide="${type === 'error' ? 'alert-triangle' : (type === 'success' ? 'check-circle-2' : 'info')}" style="width: 15px; height: 15px; flex-shrink: 0;"></i>
        <span>${msg}</span>
      `;
      if (window.lucide) window.lucide.createIcons();
    }

    function clearStatus() {
      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.innerHTML = '';
      }
    }

    if (!dropzone) return;

    // Trigger browse button
    const triggerBtn = dropzone.querySelector('#btn-upload-hero-trigger');
    if (triggerBtn) {
      triggerBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput?.click();
      };
    }

    // Change photo button
    const changeBtn = dropzone.querySelector('#btn-change-hero');
    if (changeBtn) {
      changeBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput?.click();
      };
    }

    // Remove photo button
    const removeBtn = dropzone.querySelector('#btn-remove-hero');
    if (removeBtn) {
      removeBtn.onclick = async (e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to remove the customer app home hero background image?')) return;
        try {
          await api.removeHomeHero();
          heroImage = null;
          showStatus('Hero background image removed successfully.', 'success');
          window.showToast?.('Hero image removed.', 'success');
          setTimeout(() => render(), 700);
        } catch (err) {
          showStatus(err.message || 'Failed to remove hero image.', 'error');
        }
      };
    }

    // Dropzone click
    dropzone.onclick = () => {
      if (!dropzone.classList.contains('has-preview') && fileInput) {
        fileInput.click();
      }
    };

    // Drag and drop
    dropzone.ondragover = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    };

    dropzone.ondragleave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    };

    dropzone.ondrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer?.files?.length) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    };

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files?.length) {
        handleFileSelection(e.target.files[0]);
      }
    });

    async function handleFileSelection(file) {
      if (!file) return;

      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const isMimeValid = allowedMimes.includes((file.type || '').toLowerCase());
      const isExtValid = validExtensions.includes(fileExt);

      if (!isMimeValid && !isExtValid) {
        showStatus('Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.', 'error');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showStatus(`File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller file.`, 'error');
        return;
      }

      clearStatus();
      if (progressBox) progressBox.style.display = 'block';
      if (progressFill) progressFill.style.width = '0%';
      if (progressPercent) progressPercent.textContent = '0%';
      if (progressLabel) progressLabel.textContent = `Uploading ${file.name} to Cloudinary...`;

      try {
        const uploadResult = await api.uploadHeroImage(file, (percent) => {
          if (progressFill) progressFill.style.width = `${percent}%`;
          if (progressPercent) progressPercent.textContent = `${percent}%`;
        });

        heroImage = uploadResult.secure_url || uploadResult.url;
        showStatus('Home hero background uploaded and saved successfully!', 'success');
        window.showToast?.('Hero background updated successfully.', 'success');
        setTimeout(() => render(), 700);
      } catch (err) {
        console.error('Hero background upload failed:', err);
        showStatus(err.message || 'Hero background upload failed. Please verify Cloudinary configuration.', 'error');
      } finally {
        if (progressBox) progressBox.style.display = 'none';
        if (fileInput) fileInput.value = '';
      }
    }
  }

  function bindEvents() {
    container.querySelector('#settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updates = {
        app_mode: container.querySelector('#setting-app-mode').value,
        payment_mode: container.querySelector('#setting-payment-mode').value,
        commission_rate: Number(container.querySelector('#setting-commission-rate').value),
        cancel_fee_pct: Number(container.querySelector('#setting-cancel-fee').value),
        support_email: container.querySelector('#setting-support-email').value,
        support_phone: container.querySelector('#setting-support-phone').value
      };

      try {
        await api.updateSettings(updates);
        window.showToast('Platform configurations saved successfully.', 'success');
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  loadData();
}
