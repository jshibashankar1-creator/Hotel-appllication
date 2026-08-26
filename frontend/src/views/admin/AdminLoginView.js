import { api } from '../../services/api.js';

export function renderAdminLoginView(container) {
  container.innerHTML = `
    <div style="min-height: 85vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
      <div style="width: 100%; max-width: 960px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; display: grid; grid-template-columns: 1fr 1.2fr;">
        
        <!-- Left Branding Panel (Commercial Hospitality Aesthetic) -->
        <div style="background: linear-gradient(135deg, #0B192C 0%, #1E293B 100%); padding: 3rem 2.5rem; color: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid var(--border-light);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
              <div style="width: 42px; height: 42px; background: #C5A880; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #0B192C;">
                <i data-lucide="hotel" style="width: 24px; height: 24px;"></i>
              </div>
              <div>
                <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; color: #FFFFFF;">HotelHub</div>
                <div style="font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #C5A880; font-weight: 600;">Enterprise Suite</div>
              </div>
            </div>

            <h2 style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; line-height: 1.3; margin-bottom: 1rem; color: #FFFFFF;">
              Executive Portal Authentication
            </h2>
            <p style="color: #94A3B8; font-size: 0.88rem; line-height: 1.5; margin-bottom: 2rem;">
              Role-based centralized control system for platform administrators, property operations, and financial auditing.
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: #CBD5E1;">
                <i data-lucide="shield-check" style="width: 16px; height: 16px; color: #C5A880;"></i>
                <span>Multi-Tier Role Hierarchy & Verification</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: #CBD5E1;">
                <i data-lucide="lock" style="width: 16px; height: 16px; color: #C5A880;"></i>
                <span>Strict Granular Permission Guards</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: #CBD5E1;">
                <i data-lucide="file-check-2" style="width: 16px; height: 16px; color: #C5A880;"></i>
                <span>Real-Time Tamper-Proof Audit Logging</span>
              </div>
            </div>
          </div>

          <div style="font-size: 0.75rem; color: #64748B; padding-top: 1.5rem;">
            &copy; 2026 HotelHub Global Hospitality Technologies. All rights reserved.
          </div>
        </div>

        <!-- Right Form Panel -->
        <div style="padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: center;">
          <div style="margin-bottom: 2rem;">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 4px 10px; background: rgba(197, 168, 128, 0.15); color: #8A6D3B; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem;">
              <i data-lucide="shield" style="width: 13px; height: 13px;"></i>
              Administrator Login
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">
              Sign in to your control center
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
              Enter your authorized administrative credentials to access your portal.
            </p>
          </div>

          <!-- Alert Container -->
          <div id="login-alert" style="display: none; padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1.25rem;"></div>

          <form id="admin-login-form" action="javascript:void(0);" method="POST" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Authorized Email Address</label>
              <div style="position: relative;">
                <input 
                  type="email" 
                  id="admin-email" 
                  class="form-input" 
                  placeholder="admin@hotelhub.com" 
                  value="admin@hotelhub.com" 
                  required 
                  style="padding-left: 2.5rem;"
                />
                <i data-lucide="mail" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              </div>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 600; margin: 0;">Password</label>
                <button type="button" id="btn-toggle-password" style="background: none; border: none; font-size: 0.75rem; color: var(--color-primary); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <span id="toggle-pwd-label">Show</span>
                </button>
              </div>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="admin-password" 
                  class="form-input" 
                  placeholder="••••••••" 
                  value="Admin@123" 
                  required 
                  style="padding-left: 2.5rem;"
                />
                <i data-lucide="key-round" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="remember-me" checked style="accent-color: var(--color-primary);" />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button type="submit" id="btn-submit-login" class="btn btn-primary" style="width: 100%; padding: 0.75rem; justify-content: center; font-weight: 600; font-size: 0.9rem; margin-top: 0.5rem;">
              <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
              <span id="login-btn-text">Authenticate & Enter Portal</span>
            </button>
          </form>

          <!-- Fast Role Switch Demo Hint for testing -->
          <div style="margin-top: 1.5rem; padding: 0.85rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px dashed var(--border-light); font-size: 0.75rem; color: var(--text-muted);">
            <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Platform Admin Demo Credentials:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 8px;">
              <span style="cursor: pointer; color: var(--color-primary);" onclick="document.getElementById('admin-email').value='admin@hotelhub.com'; document.getElementById('admin-password').value='Admin@123';">👑 Super Admin</span>
              <span style="cursor: pointer; color: var(--color-primary);" onclick="document.getElementById('admin-email').value='manager@hotelhub.com'; document.getElementById('admin-password').value='Admin@123';">💼 Ops Admin</span>
              <span style="cursor: pointer; color: var(--color-primary);" onclick="document.getElementById('admin-email').value='support.admin@hotelhub.com'; document.getElementById('admin-password').value='Admin@123';">🎧 Support Admin</span>
              <span style="cursor: pointer; color: var(--color-primary);" onclick="document.getElementById('admin-email').value='finance.admin@hotelhub.com'; document.getElementById('admin-password').value='Admin@123';">💳 Finance Admin</span>
            </div>
            <div style="border-top: 1px solid var(--border-light); padding-top: 6px; text-align: center;">
              <span>Looking for Hotel Admin? </span>
              <a href="#/hotel-admin/login" style="color: var(--color-primary); font-weight: 700; text-decoration: none;">
                🏨 Go to Hotel Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Toggle Password
  const pwdInput = document.getElementById('admin-password');
  const toggleBtn = document.getElementById('btn-toggle-password');
  const toggleLabel = document.getElementById('toggle-pwd-label');

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        toggleLabel.textContent = 'Hide';
      } else {
        pwdInput.type = 'password';
        toggleLabel.textContent = 'Show';
      }
    });
  }

  // Form Submit Handler
  const form = document.getElementById('admin-login-form');
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('btn-submit-login');
  const btnText = document.getElementById('login-btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    alertBox.style.display = 'none';
    submitBtn.disabled = true;
    btnText.textContent = 'Signing in...';

    try {
      // 1. Call backend API for admin authentication
      const res = await api.adminLogin(email, password);

      // 2. Fetch and verify authenticated user profile
      const user = await api.getMe();

      // 3. Verify Admin Role
      const allowedAdminRoles = new Set(['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin']);
      if (!allowedAdminRoles.has(user.role)) {
        throw new Error('Access denied. This account does not possess administrative authority.');
      }

      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
      alertBox.style.color = '#065F46';
      alertBox.style.border = '1px solid #10B981';
      alertBox.textContent = `Authentication successful. Welcome, ${user.name}! Redirecting...`;

      // 4. Clean Navigate to destination without query artifacts
      setTimeout(() => {
        let dest = '/admin/dashboard';
        if (user.role === 'support_admin') dest = '/admin/support';
        else if (user.role === 'finance_admin') dest = '/admin/payments';
        else if (user.role === 'hotel_admin') dest = '/admin/hotels';

        if (window.navigateTo) {
          window.navigateTo(dest);
        } else {
          window.location.hash = `#${dest}`;
        }
      }, 300);

    } catch (err) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.color = '#991B1B';
      alertBox.style.border = '1px solid #EF4444';
      
      const isHotelAdminEmail = email.toLowerCase().includes('hotel') || email.toLowerCase().includes('owner') || email.toLowerCase().includes('rajesh');
      if (isHotelAdminEmail) {
        alertBox.innerHTML = `This account belongs to the Hotel Admin / Property operations. Please sign in at the <a href="#/hotel-admin/login" style="color: var(--color-primary); font-weight: 700; text-decoration: underline;">Hotel Admin Portal</a>.`;
      } else {
        alertBox.textContent = err.message || 'Invalid email or password. Please verify credentials.';
      }

      submitBtn.disabled = false;
      btnText.textContent = 'Authenticate & Enter Portal';
      if (window.lucide) window.lucide.createIcons();
    }
  });
}
