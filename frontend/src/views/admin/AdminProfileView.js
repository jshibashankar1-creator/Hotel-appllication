import { api } from '../../services/api.js';

export async function renderAdminProfileView(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: center; padding: 2rem 0;">
      <div style="width: 100%; max-width: 860px; display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- Header Profile Card -->
        <div class="card" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-secondary) 100%); border-left: 4px solid var(--color-primary);">
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 72px; height: 72px; border-radius: var(--radius-full); background: #0B192C; color: #C5A880; font-size: 1.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #C5A880; box-shadow: var(--shadow-md);" id="profile-avatar-display">
              AD
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0;" id="profile-name-header">
                  Administrator
                </h2>
                <span class="badge" id="profile-role-badge" style="background: #0B192C; color: #C5A880; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; text-transform: uppercase;">
                  SUPER ADMIN
                </span>
                <span class="badge" id="profile-status-badge" style="background: rgba(16, 185, 129, 0.15); color: #065F46; font-size: 0.75rem; font-weight: 600;">
                  ACTIVE
                </span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);" id="profile-email-header">
                admin@hotelhub.com
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;" id="profile-last-login">
                Last Login: Loading...
              </div>
            </div>
          </div>

          <div>
            <button class="btn btn-secondary" onclick="window.navigateTo ? window.navigateTo('/admin/dashboard') : window.location.hash='#/admin/dashboard'" style="font-size: 0.85rem;">
              <i data-lucide="layout-dashboard" style="width: 15px; height: 15px;"></i>
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          
          <!-- Edit Personal Details -->
          <div class="card" style="padding: 1.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;">
              <i data-lucide="user-check" style="width: 18px; height: 18px; color: var(--color-primary);"></i>
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin: 0;">Personal Information</h3>
            </div>

            <div id="profile-info-alert" style="display: none; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; margin-bottom: 1rem;"></div>

            <form id="edit-profile-form" style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Full Name</label>
                <input type="text" id="edit-profile-name" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Email Address (Locked)</label>
                <input type="email" id="edit-profile-email" class="form-input" disabled style="background: var(--bg-surface-secondary); cursor: not-allowed;" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Contact Phone</label>
                <input type="tel" id="edit-profile-phone" class="form-input" placeholder="+91 98000 00000" />
              </div>

              <button type="submit" id="btn-save-profile" class="btn btn-primary" style="align-self: flex-start; padding: 0.6rem 1.25rem; font-size: 0.85rem; margin-top: 0.5rem;">
                <i data-lucide="save" style="width: 15px; height: 15px;"></i>
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          <!-- Change Password -->
          <div class="card" style="padding: 1.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;">
              <i data-lucide="lock" style="width: 18px; height: 18px; color: var(--color-primary);"></i>
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin: 0;">Security Credentials</h3>
            </div>

            <div id="pwd-change-alert" style="display: none; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; margin-bottom: 1rem;"></div>

            <form id="change-pwd-form" style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Current Password</label>
                <input type="password" id="current-pwd" class="form-input" placeholder="••••••••" required />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">New Secure Password</label>
                <input type="password" id="new-pwd" class="form-input" placeholder="Min 6 characters" required />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Confirm New Password</label>
                <input type="password" id="confirm-pwd" class="form-input" placeholder="Confirm password" required />
              </div>

              <button type="submit" id="btn-save-pwd" class="btn btn-secondary" style="align-self: flex-start; padding: 0.6rem 1.25rem; font-size: 0.85rem; margin-top: 0.5rem;">
                <i data-lucide="key" style="width: 15px; height: 15px;"></i>
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Assigned Permissions View -->
        <div class="card" style="padding: 1.75rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="shield-check" style="width: 18px; height: 18px; color: var(--color-primary);"></i>
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin: 0;">Authorized Role Permissions</h3>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Enforced on backend on every request</span>
          </div>

          <div id="permissions-chips-container" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load Admin Profile
  try {
    const res = await api.getAdminProfile();
    const user = res.user;

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
    document.getElementById('profile-avatar-display').textContent = initials;
    document.getElementById('profile-name-header').textContent = user.name;
    document.getElementById('profile-email-header').textContent = user.email;
    document.getElementById('profile-role-badge').textContent = user.role.replace('_', ' ').toUpperCase();
    document.getElementById('profile-status-badge').textContent = user.status.toUpperCase();
    document.getElementById('profile-last-login').textContent = `Last Login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}`;

    document.getElementById('edit-profile-name').value = user.name;
    document.getElementById('edit-profile-email').value = user.email;
    document.getElementById('edit-profile-phone').value = user.phone || '';

    // Render Permissions
    const permContainer = document.getElementById('permissions-chips-container');
    if (user.permissions && user.permissions.length > 0) {
      permContainer.innerHTML = user.permissions.map(p => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.75rem; font-family: monospace; color: var(--text-secondary);">
          <i data-lucide="check" style="width: 12px; height: 12px; color: #10B981;"></i>
          ${p}
        </span>
      `).join('');
    } else {
      permContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Full system access enabled.</span>`;
    }
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Failed to load profile:', err);
  }

  // Profile Edit Form Submit
  const editForm = document.getElementById('edit-profile-form');
  const infoAlert = document.getElementById('profile-info-alert');

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-profile-name').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();

    try {
      await api.updateAdminProfile(name, phone);
      infoAlert.style.display = 'block';
      infoAlert.style.background = 'rgba(16, 185, 129, 0.15)';
      infoAlert.style.color = '#065F46';
      infoAlert.style.border = '1px solid #10B981';
      infoAlert.textContent = 'Profile updated successfully!';
      document.getElementById('profile-name-header').textContent = name;
      const userNameDisplay = document.getElementById('user-name-display');
      if (userNameDisplay) userNameDisplay.textContent = name;
      setTimeout(() => { infoAlert.style.display = 'none'; }, 3000);
    } catch (err) {
      infoAlert.style.display = 'block';
      infoAlert.style.background = 'rgba(239, 68, 68, 0.15)';
      infoAlert.style.color = '#991B1B';
      infoAlert.style.border = '1px solid #EF4444';
      infoAlert.textContent = err.message || 'Failed to update profile.';
    }
  });

  // Change Password Form Submit
  const pwdForm = document.getElementById('change-pwd-form');
  const pwdAlert = document.getElementById('pwd-change-alert');

  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-pwd').value;
    const newPassword = document.getElementById('new-pwd').value;
    const confirmPassword = document.getElementById('confirm-pwd').value;

    if (newPassword !== confirmPassword) {
      pwdAlert.style.display = 'block';
      pwdAlert.style.background = 'rgba(239, 68, 68, 0.15)';
      pwdAlert.style.color = '#991B1B';
      pwdAlert.style.border = '1px solid #EF4444';
      pwdAlert.textContent = 'New passwords do not match.';
      return;
    }

    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      pwdAlert.style.display = 'block';
      pwdAlert.style.background = 'rgba(16, 185, 129, 0.15)';
      pwdAlert.style.color = '#065F46';
      pwdAlert.style.border = '1px solid #10B981';
      pwdAlert.textContent = 'Password changed successfully!';
      pwdForm.reset();
      setTimeout(() => { pwdAlert.style.display = 'none'; }, 3000);
    } catch (err) {
      pwdAlert.style.display = 'block';
      pwdAlert.style.background = 'rgba(239, 68, 68, 0.15)';
      pwdAlert.style.color = '#991B1B';
      pwdAlert.style.border = '1px solid #EF4444';
      pwdAlert.textContent = err.message || 'Failed to change password.';
    }
  });
}
