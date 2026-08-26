import { api } from '../../services/api.js';

export function renderRegisterView(container) {
  container.innerHTML = `
    <div style="min-height: 90vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; background-color: var(--bg-app);">
      <div style="width: 100%; max-width: 520px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-md); overflow: hidden;">
        
        <!-- Header Branding -->
        <div style="background-color: var(--bg-surface); padding: 28px 32px 20px; text-align: center; border-bottom: 1px solid var(--border-light);">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #c5a880 0%, #a07840 100%); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(197, 168, 128, 0.25);">
            <i data-lucide="building-2" style="width: 22px; height: 22px; color: #0b192c;"></i>
          </div>
          <h1 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0; letter-spacing: -0.015em;">
            HotelHub Partner Onboarding
          </h1>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0;">
            Register your hotel property for verified platform listing
          </p>
        </div>

        <!-- Form Body -->
        <div style="padding: 24px 32px 32px;">
          <!-- Alert Container -->
          <div id="register-alert" style="display: none; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; margin-bottom: 18px; line-height: 1.4;"></div>

          <form id="partner-register-form" action="javascript:void(0);" method="POST" style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Full Name & Phone -->
            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="reg-name" 
                  class="form-input" 
                  placeholder="Vikram Malhotra" 
                  required 
                  style="height: 40px; font-size: 0.86rem;"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                  Mobile Number
                </label>
                <input 
                  type="tel" 
                  id="reg-phone" 
                  class="form-input" 
                  placeholder="+91 98200 12345" 
                  required 
                  style="height: 40px; font-size: 0.86rem;"
                />
              </div>
            </div>

            <!-- Email Address -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                Official Business Email
              </label>
              <input 
                type="email" 
                id="reg-email" 
                class="form-input" 
                placeholder="manager@myhotel.com" 
                required 
                style="height: 40px; font-size: 0.86rem;"
              />
            </div>

            <!-- Hotel Property Name -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                Hotel / Property Name
              </label>
              <input 
                type="text" 
                id="reg-hotel-name" 
                class="form-input" 
                placeholder="The Grand Palace Hotel & Resort" 
                required 
                style="height: 40px; font-size: 0.86rem;"
              />
            </div>

            <!-- Hotel Address -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                Property Address & City
              </label>
              <input 
                type="text" 
                id="reg-hotel-address" 
                class="form-input" 
                placeholder="12 Marine Drive, Mumbai, Maharashtra" 
                required 
                style="height: 40px; font-size: 0.86rem;"
              />
            </div>

            <!-- Password & Confirm Password -->
            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                  Password
                </label>
                <input 
                  type="password" 
                  id="reg-password" 
                  class="form-input" 
                  placeholder="••••••••••••" 
                  required 
                  style="height: 40px; font-size: 0.86rem;"
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px; display: block;">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  id="reg-confirm-password" 
                  class="form-input" 
                  placeholder="••••••••••••" 
                  required 
                  style="height: 40px; font-size: 0.86rem;"
                />
              </div>
            </div>

            <!-- Terms notice -->
            <div style="font-size: 0.74rem; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
              By submitting this form, you apply for a Hotel Admin Partner account. Accounts undergo compliance verification before full listing activation.
            </div>

            <!-- Submit Button -->
            <button type="submit" id="btn-submit-register" class="btn btn-primary" style="width: 100%; height: 44px; justify-content: center; font-weight: 600; font-size: 0.92rem; margin-top: 6px;">
              <i data-lucide="user-plus" style="width: 17px; height: 17px;"></i>
              <span id="btn-register-text">Submit Partner Registration</span>
            </button>
          </form>

          <!-- Back to Login -->
          <div style="margin-top: 20px; text-align: center; font-size: 0.82rem; color: var(--text-secondary); border-top: 1px solid var(--border-light); padding-top: 16px;">
            <span>Already have an account? </span>
            <a href="#/login" style="color: var(--color-primary); font-weight: 700; text-decoration: none;">
              Sign In to Workspace
            </a>
          </div>

        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = container.querySelector('#partner-register-form');
  const alertBox = container.querySelector('#register-alert');
  const submitBtn = container.querySelector('#btn-submit-register');
  const btnText = container.querySelector('#btn-register-text');

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

      const name = container.querySelector('#reg-name')?.value.trim();
      const phone = container.querySelector('#reg-phone')?.value.trim();
      const email = container.querySelector('#reg-email')?.value.trim();
      const hotelName = container.querySelector('#reg-hotel-name')?.value.trim();
      const hotelAddress = container.querySelector('#reg-hotel-address')?.value.trim();
      const password = container.querySelector('#reg-password')?.value;
      const confirmPassword = container.querySelector('#reg-confirm-password')?.value;

      if (!name || !email || !password || !hotelName) {
        showAlert('Please fill in all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-enter.');
        return;
      }

      alertBox.style.display = 'none';
      submitBtn.disabled = true;
      btnText.textContent = 'Registering property...';

      try {
        const result = await api.register({
          name,
          phone,
          email,
          password,
          role: 'hotel_admin',
          hotel_name: hotelName,
          hotel_address: hotelAddress
        });

        if (!result.success) {
          throw new Error(result.message || 'Registration failed.');
        }

        showAlert('<strong>Registration submitted!</strong> Your hotel partner dossier is under administrative review. Redirecting to login...', 'success');
        setTimeout(() => {
          if (typeof window.navigateTo === 'function') {
            window.navigateTo('/login');
          } else {
            window.location.hash = '#/login';
          }
        }, 1200);

      } catch (err) {
        console.error('Registration error:', err);
        showAlert(err.message || 'Registration failed. Please try again.');
        submitBtn.disabled = false;
        btnText.textContent = 'Submit Partner Registration';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}
