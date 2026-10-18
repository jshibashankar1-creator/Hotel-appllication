import { api } from '../../services/api.js';

export function renderOwnerBannersView(container) {
  container.innerHTML = `
    <div class="card fade-in">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 class="card-title">Hotel Banners</h2>
          <p class="card-subtitle">Manage promotional slider images for your property.</p>
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

    <!-- Add/Edit Banner Modal -->
    <div id="modal-banner" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title" id="banner-modal-title">Add Banner</h3>
          <button id="btn-close-banner-modal" class="btn-icon"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-banner">
            <input type="hidden" id="banner-id" />
            <div class="form-group">
              <label class="form-label">Banner Title (Optional)</label>
              <input type="text" id="banner-title" class="form-input" placeholder="e.g. Summer Special" />
            </div>
            <div class="form-group">
              <label class="form-label">Image URL <span style="color:red">*</span></label>
              <input type="url" id="banner-image" class="form-input" required placeholder="https://example.com/image.jpg" />
              <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Paste the direct URL of the high-resolution hotel image.</p>
            </div>
            <div class="form-group" style="display: flex; gap: 16px;">
              <div style="flex: 1;">
                <label class="form-label">Display Order</label>
                <input type="number" id="banner-order" class="form-input" value="0" />
              </div>
              <div style="flex: 1;">
                <label class="form-label">Status</label>
                <select id="banner-status" class="form-input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
              <button type="button" id="btn-cancel-banner" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-save-banner">Save Banner</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const grid = document.getElementById('banners-grid');
  const loading = document.getElementById('banners-loading');
  const errorEl = document.getElementById('banners-error');
  
  const modal = document.getElementById('modal-banner');
  const form = document.getElementById('form-banner');
  
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
      
      grid.innerHTML = '';
      if (!res.banners || res.banners.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #64748b; grid-column: 1 / -1; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <i data-lucide="image" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p style="font-weight: 500; font-size: 16px; margin-bottom: 8px;">No Banners Found</p>
            <p style="font-size: 14px;">Upload your first promotional banner to showcase on the customer app.</p>
          </div>
        `;
      } else {
        grid.style.display = 'grid';
        res.banners.forEach(b => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.overflow = 'hidden';
          card.innerHTML = `
            <div style="height: 160px; background: #e2e8f0; position: relative;">
              <img src="${b.image_url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x200?text=Invalid+Image'" />
              ${!b.is_active ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">INACTIVE</div>' : ''}
              <div style="position: absolute; top: 8px; right: 8px; background: ${b.is_active ? '#10b981' : '#64748b'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                ${b.is_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            <div style="padding: 16px;">
              <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a;">${b.title || 'Untitled Banner'}</h4>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Order: ${b.sort_order}</p>
              
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                <button class="btn-edit" data-id="${b.id}" style="background: none; border: none; color: #3b82f6; font-weight: 500; cursor: pointer; padding: 4px;">Edit</button>
                <button class="btn-toggle" data-id="${b.id}" data-active="${b.is_active}" style="background: none; border: none; color: ${b.is_active ? '#f59e0b' : '#10b981'}; font-weight: 500; cursor: pointer; padding: 4px;">
                  ${b.is_active ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-delete" data-id="${b.id}" style="background: none; border: none; color: #ef4444; font-weight: 500; cursor: pointer; padding: 4px;">Delete</button>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });
        
        // Attach events
        grid.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', () => {
            const banner = res.banners.find(x => x.id === btn.dataset.id);
            if (banner) openModal(banner);
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

  function openModal(banner = null) {
    document.getElementById('banner-id').value = banner ? banner.id : '';
    document.getElementById('banner-title').value = banner ? banner.title : '';
    document.getElementById('banner-image').value = banner ? banner.image_url : '';
    document.getElementById('banner-order').value = banner ? banner.sort_order : '0';
    document.getElementById('banner-status').value = banner ? (banner.is_active ? 'true' : 'false') : 'true';
    document.getElementById('banner-modal-title').textContent = banner ? 'Edit Banner' : 'Add Banner';
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
    form.reset();
  }

  document.getElementById('btn-add-banner').addEventListener('click', () => openModal());
  document.getElementById('btn-close-banner-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-banner').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('banner-id').value;
    const payload = {
      title: document.getElementById('banner-title').value,
      image_url: document.getElementById('banner-image').value,
      sort_order: parseInt(document.getElementById('banner-order').value) || 0,
      is_active: document.getElementById('banner-status').value === 'true'
    };

    const btn = document.getElementById('btn-save-banner');
    const ogText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      if (id) {
        await api.put(`/hotel-admin/banners/${id}`, payload);
        window.showToast('Banner updated', 'success');
      } else {
        await api.post('/hotel-admin/banners', payload);
        window.showToast('Banner created', 'success');
      }
      closeModal();
      loadBanners();
    } catch (err) {
      window.showToast(err.message, 'error');
    } finally {
      btn.textContent = ogText;
      btn.disabled = false;
    }
  });

  loadBanners();
}
