export function renderAccessDeniedView(container, requiredRole = 'Administrator') {
  container.innerHTML = `
    <div style="min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
      <div style="width: 100%; max-width: 540px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 3rem 2rem; text-align: center; box-shadow: var(--shadow-md);">
        
        <div style="width: 64px; height: 64px; background: rgba(239, 68, 68, 0.12); color: #EF4444; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
          <i data-lucide="shield-alert" style="width: 32px; height: 32px;"></i>
        </div>

        <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
          403 • Access Restricted
        </h2>
        
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.75rem;">
          Your current account role does not have authorized permission to access this administrative module (${requiredRole}).
        </p>

        <div style="padding: 1rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2rem; text-align: left;">
          <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Security Protocol:</div>
          <div>All sensitive administrative requests are verified by backend role policies and logged to the central audit registry.</div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <a href="#/admin/dashboard" class="btn btn-primary" style="padding: 0.65rem 1.25rem; font-size: 0.85rem;">
            <i data-lucide="layout-dashboard" style="width: 15px; height: 15px;"></i>
            <span>Return to Dashboard</span>
          </a>
          <button onclick="window.history.back()" class="btn btn-secondary" style="padding: 0.65rem 1.25rem; font-size: 0.85rem;">
            <i data-lucide="arrow-left" style="width: 15px; height: 15px;"></i>
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
