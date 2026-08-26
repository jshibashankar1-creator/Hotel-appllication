import { api } from '../../services/api.js';

export async function renderAdminUsersView(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.75rem;">
      
      <!-- Top Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; margin: 0;">
            Administrative Access & Security Control
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0 0;">
            Manage platform administrators, role permissions, and active authorization statuses.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <a href="#/admin/admins/create" class="btn btn-primary" style="padding: 0.6rem 1.25rem; font-size: 0.85rem;">
            <i data-lucide="user-plus" style="width: 15px; height: 15px;"></i>
            <span>Create Administrator</span>
          </a>
        </div>
      </div>

      <!-- Alert Box -->
      <div id="users-action-alert" style="display: none; padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem;"></div>

      <!-- Admin Users Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div class="table-container">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Role Tier</th>
                <th>Status</th>
                <th>Assigned Permissions</th>
                <th>Last Login</th>
                <th>Created Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-users-table-body">
              <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  Loading administrators...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Activity Preview -->
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="activity" style="width: 18px; height: 18px; color: var(--color-primary);"></i>
            <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; margin: 0;">Security Audit Log (Recent Actions)</h3>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Automated Tamper-Proof Trail</span>
        </div>

        <div id="audit-logs-container" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Loaded dynamically -->
        </div>
      </div>

    </div>

    <!-- Edit Role Modal -->
    <div id="edit-role-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; align-items: center; justify-content: center;">
      <div style="background: var(--bg-surface); width: 100%; max-width: 480px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 2rem; box-shadow: var(--shadow-xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; margin: 0;">Update Admin Role</h3>
          <button id="btn-close-role-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div id="role-modal-target-info" style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;"></div>

        <form id="edit-role-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="modal-target-admin-id" />
          <div class="form-group">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Select New Role</label>
            <select id="modal-select-role" class="form-select" required>
              <option value="admin">Platform Admin (General Operations)</option>
              <option value="support_admin">Support Admin (Customer Helpdesk)</option>
              <option value="finance_admin">Finance Admin (Payments & Commissions)</option>
              <option value="hotel_admin">Hotel Admin (Property Verification & Rooms)</option>
              <option value="super_admin">Super Administrator (Full System Authority)</option>
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
            <button type="button" id="btn-cancel-role-modal" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Apply Role Change</button>
          </div>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const tableBody = document.getElementById('admin-users-table-body');
  const alertBox = document.getElementById('users-action-alert');
  const auditContainer = document.getElementById('audit-logs-container');

  async function loadAdminData() {
    try {
      const [usersRes, logsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAuditLogs()
      ]);

      const users = usersRes.users;
      const logs = logsRes.logs;

      // Render Admin Users Table
      if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No administrator accounts found.</td></tr>`;
      } else {
        tableBody.innerHTML = users.map(u => {
          const roleBadgeColor = {
            super_admin: 'background: #0B192C; color: #C5A880; font-weight: 700;',
            admin: 'background: rgba(59, 130, 246, 0.15); color: #1D4ED8;',
            finance_admin: 'background: rgba(16, 185, 129, 0.15); color: #065F46;',
            support_admin: 'background: rgba(245, 158, 11, 0.15); color: #92400E;',
            hotel_admin: 'background: rgba(139, 92, 246, 0.15); color: #5B21B6;'
          }[u.role] || 'background: var(--bg-surface-secondary); color: var(--text-secondary);';

          const statusBadge = {
            active: '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #065F46;">Active</span>',
            suspended: '<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #991B1B;">Suspended</span>',
            inactive: '<span class="badge" style="background: rgba(100, 116, 139, 0.15); color: #475569;">Inactive</span>',
            pending: '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #92400E;">Pending</span>'
          }[u.status] || `<span class="badge">${u.status}</span>`;

          const permissionsCount = u.permissions ? u.permissions.length : 0;

          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: #0B192C; color: #C5A880; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                    ${u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.88rem;">${u.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" style="${roleBadgeColor}; font-size: 0.75rem; text-transform: uppercase;">
                  ${u.role.replace('_', ' ')}
                </span>
              </td>
              <td>${statusBadge}</td>
              <td>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">
                  ${u.role === 'super_admin' ? 'Full Authority (All)' : `${permissionsCount} permissions`}
                </span>
              </td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">
                ${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
              </td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">
                ${new Date(u.created_at || Date.now()).toLocaleDateString()}
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.openRoleModal('${u.id}', '${u.name}', '${u.role}')" title="Change Role" style="padding: 4px 8px; font-size: 0.75rem;">
                    <i data-lucide="shield" style="width: 13px; height: 13px;"></i>
                    <span>Role</span>
                  </button>
                  
                  ${u.status === 'active' ? `
                    <button class="btn btn-secondary btn-sm" onclick="window.toggleAdminStatus('${u.id}', 'suspended', '${u.name}')" title="Suspend Admin" style="padding: 4px 8px; font-size: 0.75rem; color: #DC2626;">
                      <i data-lucide="ban" style="width: 13px; height: 13px;"></i>
                      <span>Suspend</span>
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" onclick="window.toggleAdminStatus('${u.id}', 'active', '${u.name}')" title="Activate Admin" style="padding: 4px 8px; font-size: 0.75rem; color: #16A34A;">
                      <i data-lucide="check-circle" style="width: 13px; height: 13px;"></i>
                      <span>Activate</span>
                    </button>
                  `}

                  <button class="btn btn-secondary btn-sm" onclick="window.deleteAdmin('${u.id}', '${u.name}')" title="Delete Account" style="padding: 4px 8px; font-size: 0.75rem; color: #DC2626;">
                    <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      // Render Audit Logs
      if (logs.length === 0) {
        auditContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">No recorded audit events yet.</div>`;
      } else {
        auditContainer.innerHTML = logs.slice(0, 5).map(l => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-light); font-size: 0.8rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge" style="background: rgba(11, 25, 44, 0.1); color: #0B192C; font-family: monospace; font-size: 0.7rem;">${l.action}</span>
              <span style="color: var(--text-primary); font-weight: 500;">${l.details}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.75rem;">
              <span>By <strong>${l.admin_name}</strong> (${l.admin_role})</span>
              <span>${new Date(l.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        `).join('');
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #DC2626; padding: 2rem;">${err.message || 'Error loading administrators'}</td></tr>`;
    }
  }

  // Global Handlers for Table Actions
  window.openRoleModal = (id, name, currentRole) => {
    document.getElementById('modal-target-admin-id').value = id;
    document.getElementById('role-modal-target-info').textContent = `Modifying role permissions for ${name}`;
    document.getElementById('modal-select-role').value = currentRole;
    document.getElementById('edit-role-modal').style.display = 'flex';
  };

  const closeModal = () => {
    document.getElementById('edit-role-modal').style.display = 'none';
  };
  document.getElementById('btn-close-role-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-role-modal').addEventListener('click', closeModal);

  document.getElementById('edit-role-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-target-admin-id').value;
    const newRole = document.getElementById('modal-select-role').value;

    try {
      await api.updateAdminUserRole(id, newRole);
      closeModal();
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
      alertBox.style.color = '#065F46';
      alertBox.style.border = '1px solid #10B981';
      alertBox.textContent = `Admin role updated to ${newRole} successfully.`;
      loadAdminData();
      setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  });

  window.toggleAdminStatus = async (id, status, name) => {
    const actionLabel = status === 'suspended' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionLabel} administrator '${name}'?`)) return;

    try {
      await api.updateAdminUserStatus(id, status);
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
      alertBox.style.color = '#065F46';
      alertBox.style.border = '1px solid #10B981';
      alertBox.textContent = `Admin status updated to ${status}.`;
      loadAdminData();
      setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
    } catch (err) {
      alert(err.message || 'Failed to change status');
    }
  };

  window.deleteAdmin = async (id, name) => {
    if (!confirm(`CAUTION: Permanently delete administrator '${name}'? This action cannot be undone.`)) return;

    try {
      await api.deleteAdminUser(id);
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
      alertBox.style.color = '#065F46';
      alertBox.style.border = '1px solid #10B981';
      alertBox.textContent = `Administrator '${name}' deleted successfully.`;
      loadAdminData();
      setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete administrator');
    }
  };

  loadAdminData();
}
