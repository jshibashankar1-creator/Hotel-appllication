import { api } from '../../services/api.js';

export async function renderOwnerBannersView(container) {
  container.innerHTML = `
    <div class="card p-6" style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700;">Hotel Banners</h2>
        <button class="btn btn-primary" id="add-banner-btn" style="display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="plus"></i> Add Banner
        </button>
      </div>
      <div id="banners-loading">Loading banners...</div>
      <div id="banners-list" style="display: none; flex-direction: column; gap: 1rem;"></div>
    </div>

    <!-- Add/Edit Modal -->
    <div id="banner-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="card p-6" style="width: 100%; max-width: 500px; background: var(--bg-surface);">
        <h3 id="modal-title" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Add Banner</h3>
        <form id="banner-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="banner-id">
          
          <div class="form-group">
            <label>Banner Image URL <span style="color:red">*</span></label>
            <input type="url" id="banner-image" class="form-control" required placeholder="https://...">
            <small style="color: var(--text-secondary); margin-top: 0.25rem; display: block;">Use existing image upload/storage URLs</small>
          </div>
          
          <div class="form-group">
            <label>Banner Title (Optional)</label>
            <input type="text" id="banner-title" class="form-control" placeholder="e.g. Summer Special">
          </div>
          
          <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="banner-order" class="form-control" value="0">
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            <input type="checkbox" id="banner-active" checked>
            <label for="banner-active">Active</label>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
            <button type="button" class="btn btn-secondary" id="banner-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const loadingEl = document.getElementById('banners-loading');
  const listEl = document.getElementById('banners-list');
  const modal = document.getElementById('banner-modal');
  const form = document.getElementById('banner-form');
  const addBtn = document.getElementById('add-banner-btn');
  const cancelBtn = document.getElementById('banner-cancel-btn');

  const fetchBanners = async () => {
    loadingEl.style.display = 'block';
    listEl.style.display = 'none';
    try {
      const res = await api.get('/api/hotel-admin/banners');
      if (res.success) {
        renderBanners(res.banners || []);
      } else {
        window.showToast(res.message, 'error');
      }
    } catch (err) {
      window.showToast('Failed to load banners', 'error');
    } finally {
      loadingEl.style.display = 'none';
    }
  };

  const renderBanners = (banners) => {
    listEl.innerHTML = '';
    if (banners.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No banners found.</div>';
    } else {
      banners.forEach(b => {
        const row = document.createElement('div');
        row.style.cssText = `
          display: flex; align-items: center; justify-content: space-between; 
          padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-surface);
        `;
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${b.image_url}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/100x60?text=Error'">
            <div>
              <div style="font-weight: 600;">${b.title || 'Untitled Banner'}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                <span style="color: ${b.is_active ? 'green' : 'red'}; font-weight: 600;">${b.is_active ? 'Active' : 'Inactive'}</span>
                <span style="margin-left: 0.5rem;">Order: ${b.sort_order}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${b.id}">Edit</button>
            <button class="btn btn-secondary btn-sm toggle-btn" data-id="${b.id}" data-active="${b.is_active}">
              ${b.is_active ? 'Disable' : 'Enable'}
            </button>
            <button class="btn btn-sm" style="background: var(--danger); color: white;" data-delete="${b.id}">Delete</button>
          </div>
        `;
        listEl.appendChild(row);
      });

      // Attach events
      listEl.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const banner = banners.find(x => x.id === btn.dataset.id);
          if (banner) {
            document.getElementById('modal-title').textContent = 'Edit Banner';
            document.getElementById('banner-id').value = banner.id;
            document.getElementById('banner-image').value = banner.image_url;
            document.getElementById('banner-title').value = banner.title;
            document.getElementById('banner-order').value = banner.sort_order;
            document.getElementById('banner-active').checked = banner.is_active;
            modal.style.display = 'flex';
          }
        });
      });

      listEl.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const isActive = btn.dataset.active === 'true';
          try {
            const res = await api.patch('/api/hotel-admin/banners/' + id + '/status', { is_active: !isActive });
            if (res.success) {
              window.showToast('Banner status updated', 'success');
              fetchBanners();
            } else {
              window.showToast(res.message, 'error');
            }
          } catch (e) {
            window.showToast('Error updating status', 'error');
          }
        });
      });

      listEl.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this banner?')) {
            const id = btn.dataset.delete;
            try {
              const res = await api.delete('/api/hotel-admin/banners/' + id);
              if (res.success) {
                window.showToast('Banner deleted', 'success');
                fetchBanners();
              } else {
                window.showToast(res.message, 'error');
              }
            } catch (e) {
              window.showToast('Error deleting banner', 'error');
            }
          }
        });
      });
    }
    listEl.style.display = 'flex';
  };

  addBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add Banner';
    form.reset();
    document.getElementById('banner-id').value = '';
    modal.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('banner-id').value;
    const payload = {
      image_url: document.getElementById('banner-image').value,
      title: document.getElementById('banner-title').value,
      sort_order: parseInt(document.getElementById('banner-order').value, 10),
      is_active: document.getElementById('banner-active').checked
    };

    try {
      let res;
      if (id) {
        res = await api.put('/api/hotel-admin/banners/' + id, payload);
      } else {
        res = await api.post('/api/hotel-admin/banners', payload);
      }

      if (res.success) {
        window.showToast(id ? 'Banner updated' : 'Banner added', 'success');
        modal.style.display = 'none';
        fetchBanners();
      } else {
        window.showToast(res.message, 'error');
      }
    } catch (err) {
      window.showToast('Error saving banner', 'error');
    }
  });

  fetchBanners();
}
