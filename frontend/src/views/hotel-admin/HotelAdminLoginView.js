import { api } from '../../services/api.js';

export function renderHotelAdminLoginView(container) {
  container.innerHTML = `
    <div style="min-height: 85vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
      <div style="width: 100%; max-width: 440px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); overflow: hidden;">
        
        <!-- Header Branding -->
        <div style="background: linear-gradient(135deg, #1E1B18 0%, #2D2721 100%); padding: 36px 32px 28px; text-align: center; border-bottom: 1px solid var(--border-light);">
          <div style="width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
            <i data-lucide="building" style="width: 26px; height: 26px; color: #1a1714;"></i>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; letter-spacing: -0.02em;">
            Hotel Admin Portal
          </h2>
          <p style="color: rgba(255, 255, 255, 0.65); font-size: 0.85rem; margin: 0;">
            Property Operations & Front-Desk Management
          </p>
        </div>

        <!-- Form Body -->
        <div style="padding: 32px;">
          <div id="hotelAdminLoginAlert" style="display: none; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.4;"></div>

          <form id="hotelAdminLoginForm" action="javascript:void(0);" novalidate>
            <!-- Email -->
            <div class="form-group" style="margin-bottom: 20px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
                Hotel Admin Email
              </label>
              <div style="position: relative;">
                <i data-lucide="mail" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--text-muted);"></i>
                <input 
                  type="email" 
                  id="hotelAdminEmail" 
                  required 
                  placeholder="hoteladmin@hotelhub.com"
                  value="hoteladmin@hotelhub.com"
                  style="width: 100%; padding: 12px 14px 12px 42px; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.9rem; color: var(--text-primary); outline: none; transition: border-color 0.2s;"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="form-group" style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin: 0;">
                  Security Password
                </label>
                <button type="button" id="btnToggleHotelPassword" style="background: none; border: none; font-size: 0.78rem; color: var(--color-primary); cursor: pointer; padding: 0;">
                  Show
                </button>
              </div>
              <div style="position: relative;">
                <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--text-muted);"></i>
                <input 
                  type="password" 
                  id="hotelAdminPassword" 
                  required 
                  placeholder="••••••••••••"
                  value="HotelAdmin@123456"
                  style="width: 100%; padding: 12px 14px 12px 42px; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.9rem; color: var(--text-primary); outline: none; transition: border-color 0.2s;"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="btnHotelAdminLogin" 
              class="btn btn-primary" 
              style="width: 100%; padding: 13px; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(197, 168, 128, 0.25);"
            >
              <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
              <span>Enter Hotel Console</span>
            </button>
          </form>

          <!-- Helper Credentials Demo Box -->
          <div style="margin-top: 24px; padding: 14px; background: var(--bg-surface-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
              Demo Hotel Admin Credentials:
            </div>
            <div style="font-size: 0.8rem; color: var(--text-primary); font-family: monospace;">
              <div><strong>Email:</strong> hoteladmin@hotelhub.com</div>
              <div><strong>Pass:</strong> HotelAdmin@123456</div>
            </div>
          </div>

          <!-- Switch to Admin Login -->
          <div style="margin-top: 20px; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
            Looking for platform administration? 
            <a href="#/admin/login" style="color: var(--color-primary); font-weight: 600; text-decoration: none; margin-left: 4px;">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Password toggle
  const pwdInput = container.querySelector('#hotelAdminPassword');
  const toggleBtn = container.querySelector('#btnToggleHotelPassword');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        toggleBtn.textContent = 'Hide';
      } else {
        pwdInput.type = 'password';
        toggleBtn.textContent = 'Show';
      }
    });
  }

  // Form Submission
  const form = container.querySelector('#hotelAdminLoginForm');
  const alertBox = container.querySelector('#hotelAdminLoginAlert');
  const submitBtn = container.querySelector('#btnHotelAdminLogin');

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
    alertBox.textContent = message;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const email = container.querySelector('#hotelAdminEmail')?.value.trim();
      const password = container.querySelector('#hotelAdminPassword')?.value;

      if (!email || !password) {
        showAlert('Please enter both hotel admin email and password.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i data-lucide="loader-2" style="width: 18px; height: 18px; animation: spin 1s linear infinite;"></i>
        <span>Authenticating...</span>
      `;
      if (window.lucide) window.lucide.createIcons();

      try {
        const result = await api.hotelAdminLogin(email, password);
        if (result.success && result.token) {
          showAlert('Authentication successful! Loading Hotel Dashboard...', 'success');
          setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
              window.navigateTo('/hotel-admin/dashboard');
            } else {
              window.location.hash = '#/hotel-admin/dashboard';
            }
          }, 400);
        } else {
          showAlert(result.message || 'Hotel Admin login failed.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i data-lucide="log-in" style="width: 18px; height: 18px;"></i><span>Enter Hotel Console</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      } catch (err) {
        console.error('Hotel Admin login error:', err);
        showAlert(err.message || 'Login failed. Please verify your credentials.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="log-in" style="width: 18px; height: 18px;"></i><span>Enter Hotel Console</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}
