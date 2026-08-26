import { api } from '../../services/api.js';

export function renderLoginView(container) {
  container.innerHTML = `
    <div style="min-height: 90vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; background-color: var(--bg-app);">
      <div style="width: 100%; max-width: 440px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-md); overflow: hidden;">
        
        <!-- Header Branding -->
        <div style="background-color: var(--bg-surface); padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid var(--border-light);">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #c5a880 0%, #a07840 100%); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(197, 168, 128, 0.25);">
            <i data-lucide="building-2" style="width: 22px; height: 22px; color: #0b192c;"></i>
          </div>
          <h1 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; letter-spacing: -0.015em;">
            HotelHub
          </h1>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0; font-weight: 500;">
            Hotel Management Platform
          </p>
        </div>

        <!-- Form Body -->
        <div style="padding: 28px 32px 32px;">
          <div style="margin-bottom: 22px;">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
              Welcome back
            </h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">
              Sign in to continue to your workspace.
            </p>
          </div>

          <!-- Alert Container -->
          <div id="login-alert" style="display: none; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; margin-bottom: 18px; line-height: 1.4;"></div>

          <form id="unified-login-form" action="javascript:void(0);" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Email -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 6px; display: block;">
                Email Address
              </label>
              <div style="position: relative;">
                <input 
                  type="email" 
                  id="login-email" 
                  class="form-input" 
                  placeholder="name@hotelhub.com" 
                  value="admin@hotelhub.com" 
                  required 
                  style="padding-left: 38px; height: 42px; font-size: 0.88rem;"
                />
                <i data-lucide="mail" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              </div>
            </div>

            <!-- Password -->
            <div class="form-group" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin: 0;">
                  Password
                </label>
                <button type="button" id="btn-toggle-pwd" style="background: none; border: none; font-size: 0.76rem; color: var(--color-accent-dark); font-weight: 600; cursor: pointer; padding: 0;">
                  Show
                </button>
              </div>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="login-password" 
                  class="form-input" 
                  placeholder="••••••••••••" 
                  value="Admin@123456" 
                  required 
                  style="padding-left: 38px; height: 42px; font-size: 0.88rem;"
                />
                <i data-lucide="lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
              </div>
            </div>

            <!-- Remember me & Forgot Password -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
              <label style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); cursor: pointer; user-select: none;">
                <input type="checkbox" id="remember-me" checked style="accent-color: var(--color-primary);" />
                <span>Keep me signed in</span>
              </label>
              <a href="javascript:void(0)" onclick="alert('Password reset link will be sent to your registered email.')" style="color: var(--color-accent-dark); font-weight: 600; text-decoration: none;">
                Forgot Password?
              </a>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="btn-submit-unified-login" class="btn btn-primary" style="width: 100%; height: 44px; justify-content: center; font-weight: 600; font-size: 0.92rem; margin-top: 4px;">
              <i data-lucide="log-in" style="width: 17px; height: 17px;"></i>
              <span id="btn-submit-text">Sign In</span>
            </button>
          </form>

          <!-- Register link -->
          <div style="margin-top: 20px; text-align: center; font-size: 0.82rem; color: var(--text-secondary); border-top: 1px solid var(--border-light); padding-top: 16px;">
            <span>Partnering with HotelHub? </span>
            <a href="#/register" style="color: var(--color-primary); font-weight: 700; text-decoration: none;">
              Register as Hotel Partner
            </a>
          </div>

          <!-- Development Demo Fast Switcher (Dev Mode Only) -->
          ${import.meta.env.DEV !== false ? `
            <div style="margin-top: 16px; padding: 12px; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); border: 1px dashed var(--border-light); font-size: 0.74rem; color: var(--text-muted);">
              <div style="font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">
                DEMO ACCOUNTS (DEVELOPMENT ONLY):
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 8px;" onclick="document.getElementById('login-email').value='admin@hotelhub.com'; document.getElementById('login-password').value='Admin@123456';">
                  👑 Super Admin
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 8px;" onclick="document.getElementById('login-email').value='hoteladmin@hotelhub.com'; document.getElementById('login-password').value='HotelAdmin@123456';">
                  🏨 Hotel Admin
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Footer security note -->
          <div style="margin-top: 16px; text-align: center; font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 6px;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px; color: var(--status-success);"></i>
            <span>Secure role-based access & encryption</span>
          </div>

        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Password Visibility Toggle
  const pwdInput = container.querySelector('#login-password');
  const toggleBtn = container.querySelector('#btn-toggle-pwd');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        toggleBtn.textContent = 'Hide';
      } else {
        pwdInput.type = 'password';
        toggleBtn.textContent = 'Show';
      }
    });
  }

  // Unified Form Submit Handler
  const form = container.querySelector('#unified-login-form');
  const alertBox = container.querySelector('#login-alert');
  const submitBtn = container.querySelector('#btn-submit-unified-login');
  const btnText = container.querySelector('#btn-submit-text');

  function showAlert(message, type = 'danger') {
    if (!alertBox) return;
    alertBox.style.display = 'block';
    if (type === 'danger') {
      alertBox.style.background = 'var(--status-danger-bg)';
      alertBox.style.border = '1px solid var(--status-danger-border)';
      alertBox.style.color = 'var(--status-danger)';
    } else {
      alertBox.style.background = 'var(--status-success-bg)';
      alertBox.style.border = '1px solid var(--status-success-border)';
      alertBox.style.color = 'var(--status-success)';
    }
    alertBox.innerHTML = message;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const email = container.querySelector('#login-email')?.value.trim();
      const password = container.querySelector('#login-password')?.value;

      if (!email || !password) {
        showAlert('Please enter both email and password.');
        return;
      }

      alertBox.style.display = 'none';
      submitBtn.disabled = true;
      btnText.textContent = 'Signing in...';

      try {
        const result = await api.login(email, password);

        if (!result.success || !result.token) {
          throw new Error(result.message || 'Authentication failed. Please verify credentials.');
        }

        const user = result.user || {};
        const role = user.role;

        // Route Guard for Customer role
        if (role === 'customer') {
          api.clearSession();
          showAlert('Customer accounts are for the HotelHub Mobile App. Please use the mobile application to manage guest bookings.', 'danger');
          submitBtn.disabled = false;
          btnText.textContent = 'Sign In';
          return;
        }

        showAlert(`Welcome back, <strong>${user.name || 'User'}</strong>! Redirecting to workspace...`, 'success');

        // Dynamic Role-based Navigation
        setTimeout(() => {
          let dest = '/admin/dashboard';
          if (role === 'hotel_admin' || role === 'owner') {
            dest = '/hotel-admin/dashboard';
          } else if (role === 'support_admin') {
            dest = '/admin/support';
          } else if (role === 'finance_admin') {
            dest = '/admin/payments';
          }

          if (typeof window.navigateTo === 'function') {
            window.navigateTo(dest);
          } else {
            window.location.hash = `#${dest}`;
          }
        }, 350);

      } catch (err) {
        console.error('Unified login error:', err);
        showAlert(err.message || 'Invalid email or password.');
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}
