import { api } from '../../services/api.js';

export function renderAdminCreateUserView(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: center; padding: 2rem 0;">
      <div style="width: 100%; max-width: 740px; display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; margin: 0;">
              Provision New Administrator
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0 0;">
              Grant controlled administrative authority and assign granular operational permissions.
            </p>
          </div>
          <button class="btn btn-secondary" onclick="window.navigateTo ? window.navigateTo('/admin/admins') : window.location.hash='#/admin/admins'" style="font-size: 0.85rem;">
            <i data-lucide="arrow-left" style="width: 15px; height: 15px;"></i>
            <span>Back to Administrators</span>
          </button>
        </div>

        <!-- Form Card -->
        <div class="card" style="padding: 2rem;">
          <div id="create-admin-alert" style="display: none; padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1.5rem;"></div>

          <form id="create-admin-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Full Name</label>
                <input type="text" id="admin-name" class="form-input" placeholder="e.g. Anand Mahindra" required />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Official Email Address</label>
                <input type="email" id="admin-email" class="form-input" placeholder="e.g. anand@hotelhub.com" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Contact Phone</label>
                <input type="tel" id="admin-phone" class="form-input" placeholder="+91 98000 12345" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Initial Access Password</label>
                <input type="password" id="admin-password" class="form-input" placeholder="Min 6 characters" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Assigned Role Tier</label>
                <select id="admin-role-select" class="form-select" required>
                  <option value="admin">Platform Admin (Operations & Verification)</option>
                  <option value="support_admin">Support Admin (Helpdesk & Guest Care)</option>
                  <option value="finance_admin">Finance Admin (Settlements & Commissions)</option>
                  <option value="hotel_admin">Hotel Admin (Properties & Room Categories)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Account Status</label>
                <select id="admin-status-select" class="form-select" required>
                  <option value="active">Active (Immediate Portal Access)</option>
                  <option value="pending">Pending Review</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Granular Permissions Picker -->
            <div style="border-top: 1px solid var(--border-light); padding-top: 1.25rem; margin-top: 0.5rem;">
              <label class="form-label" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; display: block;">
                Custom Granular Permissions
              </label>
              
              <div id="permissions-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; background: var(--bg-surface-secondary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="dashboard.view" checked />
                  <span>dashboard.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="hotels.view" checked />
                  <span>hotels.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="hotels.verify" checked />
                  <span>hotels.verify</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="owners.view" checked />
                  <span>owners.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="owners.verify" checked />
                  <span>owners.verify</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="bookings.view" checked />
                  <span>bookings.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="bookings.manage" checked />
                  <span>bookings.manage</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="payments.view" />
                  <span>payments.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="refunds.manage" />
                  <span>refunds.manage</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="commission.view" />
                  <span>commission.view</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="support.manage" checked />
                  <span>support.manage</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" name="perm" value="reports.view" checked />
                  <span>reports.view</span>
                </label>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
              <button type="button" class="btn btn-secondary" onclick="window.navigateTo ? window.navigateTo('/admin/admins') : window.location.hash='#/admin/admins'">
                Cancel
              </button>
              <button type="submit" id="btn-submit-create" class="btn btn-primary" style="padding: 0.65rem 1.5rem; font-weight: 600;">
                <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
                <span>Provision Administrator</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('create-admin-form');
  const alertBox = document.getElementById('create-admin-alert');
  const submitBtn = document.getElementById('btn-submit-create');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('admin-name').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const phone = document.getElementById('admin-phone').value.trim();
    const password = document.getElementById('admin-password').value;
    const role = document.getElementById('admin-role-select').value;
    const status = document.getElementById('admin-status-select').value;

    const checkedPerms = Array.from(document.querySelectorAll('input[name="perm"]:checked')).map(cb => cb.value);

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Creating...</span>`;
    alertBox.style.display = 'none';

    try {
      await api.adminCreate({
        name,
        email,
        phone,
        password,
        role,
        status,
        permissions: checkedPerms
      });

      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
      alertBox.style.color = '#065F46';
      alertBox.style.border = '1px solid #10B981';
      alertBox.textContent = `Administrator '${name}' created successfully! Redirecting...`;

      setTimeout(() => {
        if (window.navigateTo) window.navigateTo('/admin/admins');
        else window.location.hash = '#/admin/admins';
      }, 1200);
    } catch (err) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.color = '#991B1B';
      alertBox.style.border = '1px solid #EF4444';
      alertBox.textContent = err.message || 'Failed to create administrator.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="shield-check" style="width: 16px; height: 16px;"></i><span>Provision Administrator</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  });
}
