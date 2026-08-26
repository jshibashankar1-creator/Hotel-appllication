import './styles/main.css';
import { api } from './services/api.js';
import { createIcons, icons } from 'lucide';

window.lucide = {
  createIcons: (options = {}) => {
    try {
      createIcons({ icons, ...options });
    } catch (e) {
      console.warn('Lucide icon render warning:', e.message);
    }
  },
  icons
};

// Auth Views
import { renderLoginView } from './views/auth/LoginView.js';
import { renderRegisterView } from './views/auth/RegisterView.js';
import { renderAccessDeniedView } from './views/admin/AccessDeniedView.js';

// Admin Views
import { renderAdminDashboardView } from './views/admin/AdminDashboardView.js';
import { renderAdminHotelsView } from './views/admin/AdminHotelsView.js';
import { renderAdminOwnersView } from './views/admin/AdminOwnersView.js';
import { renderAdminBookingsView } from './views/admin/AdminBookingsView.js';
import { renderAdminPaymentsView } from './views/admin/AdminPaymentsView.js';
import { renderAdminRefundsView } from './views/admin/AdminRefundsView.js';
import { renderAdminCommissionsView } from './views/admin/AdminCommissionsView.js';
import { renderAdminCustomersView } from './views/admin/AdminCustomersView.js';
import { renderAdminSupportView } from './views/admin/AdminSupportView.js';
import { renderAdminReportsView } from './views/admin/AdminReportsView.js';
import { renderAdminSettingsView } from './views/admin/AdminSettingsView.js';
import { renderAdminUsersView } from './views/admin/AdminUsersView.js';
import { renderAdminCreateUserView } from './views/admin/AdminCreateUserView.js';
import { renderAdminProfileView } from './views/admin/AdminProfileView.js';

// Hotel Admin / Owner Views
import { renderOwnerDashboardView } from './views/owner/OwnerDashboardView.js';
import { renderOwnerHotelView } from './views/owner/OwnerHotelView.js';
import { renderOwnerRoomsView } from './views/owner/OwnerRoomsView.js';
import { renderOwnerAvailabilityView } from './views/owner/OwnerAvailabilityView.js';
import { renderOwnerBookingsView } from './views/owner/OwnerBookingsView.js';
import { renderOwnerCheckInView } from './views/owner/OwnerCheckInView.js';
import { renderOwnerCheckOutView } from './views/owner/OwnerCheckOutView.js';
import { renderOwnerEarningsView } from './views/owner/OwnerEarningsView.js';
import { renderOwnerSupportView } from './views/owner/OwnerSupportView.js';
import { renderOwnerOnboardView } from './views/owner/OwnerOnboardView.js';
import { renderOwnerProfileView } from './views/owner/OwnerProfileView.js';

const ADMIN_ROLES = new Set(['super_admin', 'admin', 'support_admin', 'finance_admin']);
const HOTEL_ADMIN_ROLES = new Set(['hotel_admin', 'owner']);

// Global Toast Dispatcher
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-root');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
    <span style="font-size: 0.84rem; font-weight: 500;">${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Global Sign-out Handler
window.handleSignOut = function() {
  api.clearSession();
  window.showToast('Signed out successfully.', 'info');
  window.navigateTo('/login');
};

// Global Navigation Function
window.navigateTo = function(path) {
  const cleanPath = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : '/' + path}`;
  if (window.location.hash !== cleanPath) {
    window.location.hash = cleanPath;
  } else {
    handleRoute();
  }
};

// Canonical Hash Normalizer: Strips stray query markers (? or &) from hash
function getNormalizedRoute() {
  let raw = window.location.hash || '#/login';
  if (raw.includes('?')) raw = raw.split('?')[0];
  if (raw.includes('&')) raw = raw.split('&')[0];
  
  if (!raw.startsWith('#/')) {
    if (raw.startsWith('#')) {
      raw = '#/' + raw.slice(1);
    } else {
      raw = '#/' + raw;
    }
  }
  return raw;
}

// Master Route Controller
function handleRoute() {
  const hash = getNormalizedRoute();
  
  // Ensure the browser's address bar displays the clean canonical hash
  if (window.location.hash !== hash) {
    history.replaceState(null, '', hash);
  }

  // Close mobile sidebar drawer on navigation
  const sidebarEl = document.getElementById('app-sidebar');
  const backdropEl = document.getElementById('sidebar-backdrop');
  if (sidebarEl) sidebarEl.classList.remove('open');
  if (backdropEl) backdropEl.classList.remove('active');

  const contentArea = document.getElementById('view-content-area');
  const viewTitle = document.getElementById('header-view-title');
  const viewSubtitle = document.getElementById('header-view-subtitle');
  const sidebarNav = document.getElementById('sidebar-nav-root');
  const userRoleBadge = document.getElementById('user-role-badge');
  const userNameEl = document.getElementById('user-name-display');
  const userAvatarEl = document.getElementById('sidebar-user-avatar');
  const userRoleDisplay = document.getElementById('user-role-display');
  const headerAvatarEl = document.getElementById('header-user-avatar');
  const headerUserNameEl = document.getElementById('header-user-name');
  const headerUserRoleEl = document.getElementById('header-user-role');
  const headerEl = document.querySelector('.top-header');

  if (!contentArea) return;

  const currentUser = api.currentUser;
  const isAuthenticated = !!(api.token && currentUser);
  const isAdminUser = currentUser && ADMIN_ROLES.has(currentUser.role);
  const isHotelAdminUser = currentUser && HOTEL_ADMIN_ROLES.has(currentUser.role);
  const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
  const userRole = currentUser ? currentUser.role : null;

  // Handle Public Unified Login & Register Views
  const isPublicAuthRoute = ['#/login', '#/admin/login', '#/hotel-admin/login', '#/owner/login', '#/', '#', ''].includes(hash);
  
  if (isPublicAuthRoute) {
    if (sidebarEl) sidebarEl.style.display = 'none';
    if (headerEl) headerEl.style.display = 'none';
    
    if (isAuthenticated) {
      if (isAdminUser) {
        window.navigateTo('/admin/dashboard');
        return;
      } else if (isHotelAdminUser) {
        window.navigateTo('/hotel-admin/dashboard');
        return;
      }
    }
    renderLoginView(contentArea);
    return;
  }

  if (hash === '#/register') {
    if (sidebarEl) sidebarEl.style.display = 'none';
    if (headerEl) headerEl.style.display = 'none';
    renderRegisterView(contentArea);
    return;
  }

  // Restore Sidebar & Header visibility for authenticated routes
  if (sidebarEl) sidebarEl.style.display = 'flex';
  if (headerEl) headerEl.style.display = 'flex';

  const isAdminArea = hash.startsWith('#/admin');
  const isHotelAdminArea = hash.startsWith('#/hotel-admin') || hash.startsWith('#/owner');

  // Strict Protected Route Guards: No cross-role access
  if (isAdminArea) {
    if (!isAuthenticated) {
      window.navigateTo('/login');
      return;
    }
    if (!isAdminUser) {
      if (isHotelAdminUser) {
        window.showToast('Redirected: Hotel Admin workspace', 'info');
        window.navigateTo('/hotel-admin/dashboard');
        return;
      }
      if (hash !== '#/admin/access-denied') {
        window.navigateTo('/admin/access-denied');
        return;
      }
    }
  }

  if (isHotelAdminArea) {
    if (!isAuthenticated) {
      window.navigateTo('/login');
      return;
    }
    if (!isHotelAdminUser) {
      if (isAdminUser) {
        window.showToast('Redirected: Platform Admin workspace', 'info');
        window.navigateTo('/admin/dashboard');
        return;
      }
      if (hash !== '#/admin/access-denied') {
        window.navigateTo('/admin/access-denied');
        return;
      }
    }
  }

  // Update Header & Sidebar User Profiles
  if (currentUser) {
    const displayName = currentUser.name || 'Administrator';
    const roleLabel = (currentUser.role || 'ADMIN').replace('_', ' ').toUpperCase();
    const initials = (displayName.split(' ').map(n => n[0]).join('') || 'AD').slice(0, 2).toUpperCase();

    if (userNameEl) userNameEl.textContent = displayName;
    if (userRoleDisplay) userRoleDisplay.textContent = roleLabel;
    if (userAvatarEl) userAvatarEl.textContent = initials;

    if (headerAvatarEl) headerAvatarEl.textContent = initials;
    if (headerUserNameEl) headerUserNameEl.textContent = displayName;
    if (headerUserRoleEl) headerUserRoleEl.textContent = roleLabel;
  }

  // Render Role-Appropriate Dynamic Sidebar
  if (isAdminArea) {
    const roleTitle = currentUser?.role === 'super_admin' ? 'SUPER ADMIN' : `${(currentUser?.role || 'ADMIN').replace('_', ' ').toUpperCase()}`;
    if (userRoleBadge) userRoleBadge.textContent = roleTitle;

    let navHtml = `
      <div class="nav-section-label">Core Executive</div>
      <a href="#/admin/dashboard" class="nav-item ${hash === '#/admin/dashboard' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></div>
      </a>
    `;

    // Hotel & Owners Section (Super Admin, Admin)
    if (isSuperAdmin || userRole === 'admin') {
      navHtml += `
        <div class="nav-section-label">Hotel Ecosystem</div>
        <a href="#/admin/hotels" class="nav-item ${hash === '#/admin/hotels' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="building-2"></i><span>Hotels</span></div>
        </a>
        <a href="#/admin/owners" class="nav-item ${hash === '#/admin/owners' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="shield-check"></i><span>Owner KYC</span></div>
        </a>
      `;
    }

    // Operations & Bookings
    navHtml += `
      <div class="nav-section-label">Operations</div>
      <a href="#/admin/bookings" class="nav-item ${hash === '#/admin/bookings' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="calendar-check"></i><span>Bookings</span></div>
      </a>
    `;

    // Financials (Super Admin, Admin, Finance Admin)
    if (isSuperAdmin || userRole === 'admin' || userRole === 'finance_admin') {
      navHtml += `
        <div class="nav-section-label">Financial Accounting</div>
        <a href="#/admin/payments" class="nav-item ${hash === '#/admin/payments' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="credit-card"></i><span>Payments</span></div>
        </a>
        <a href="#/admin/refunds" class="nav-item ${hash === '#/admin/refunds' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="rotate-ccw"></i><span>Refunds</span></div>
        </a>
        <a href="#/admin/commissions" class="nav-item ${hash === '#/admin/commissions' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="badge-percent"></i><span>Commissions</span></div>
        </a>
        <a href="#/admin/reports" class="nav-item ${hash === '#/admin/reports' || hash === '#/admin/statements' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="file-bar-chart-2"></i><span>Statements</span></div>
        </a>
      `;
    }

    // Guest Experience (Super Admin, Admin, Support Admin)
    if (isSuperAdmin || userRole === 'admin' || userRole === 'support_admin') {
      navHtml += `
        <div class="nav-section-label">Guest Experience</div>
        <a href="#/admin/customers" class="nav-item ${hash === '#/admin/customers' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="users"></i><span>Customers</span></div>
        </a>
        <a href="#/admin/support" class="nav-item ${hash === '#/admin/support' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="life-buoy"></i><span>Support Desk</span></div>
        </a>
      `;
    }

    // System Administration & Security
    if (isSuperAdmin) {
      navHtml += `
        <div class="nav-section-label">System</div>
        <a href="#/admin/admins" class="nav-item ${hash.startsWith('#/admin/admins') ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="user-cog"></i><span>Admin Users</span></div>
        </a>
        <a href="#/admin/settings" class="nav-item ${hash === '#/admin/settings' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="sliders"></i><span>Settings</span></div>
        </a>
      `;
    } else if (userRole === 'admin') {
      navHtml += `
        <div class="nav-section-label">System</div>
        <a href="#/admin/settings" class="nav-item ${hash === '#/admin/settings' ? 'active' : ''}">
          <div class="nav-item-left"><i data-lucide="sliders"></i><span>Settings</span></div>
        </a>
      `;
    }

    // Account Profile
    navHtml += `
      <div class="nav-section-label">Account</div>
      <a href="#/admin/profile" class="nav-item ${hash === '#/admin/profile' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="user"></i><span>Profile</span></div>
      </a>
      <a href="javascript:void(0)" onclick="window.handleSignOut()" class="nav-item" style="color: #EF4444;">
        <div class="nav-item-left"><i data-lucide="log-out"></i><span>Sign Out</span></div>
      </a>
    `;

    sidebarNav.innerHTML = navHtml;
  } else if (isHotelAdminArea) {
    if (userRoleBadge) userRoleBadge.textContent = 'HOTEL ADMIN';
    sidebarNav.innerHTML = `
      <div class="nav-section-label">HOTEL MANAGEMENT</div>
      <a href="#/hotel-admin/dashboard" class="nav-item ${hash === '#/hotel-admin/dashboard' || hash === '#/owner/dashboard' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></div>
      </a>
      <a href="#/hotel-admin/property" class="nav-item ${hash === '#/hotel-admin/property' || hash === '#/owner/hotel' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="building"></i><span>Property Details</span></div>
      </a>
      <a href="#/hotel-admin/rooms" class="nav-item ${hash === '#/hotel-admin/rooms' || hash === '#/owner/rooms' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="bed-double"></i><span>Rooms</span></div>
      </a>
      <a href="#/hotel-admin/availability" class="nav-item ${hash === '#/hotel-admin/availability' || hash === '#/owner/availability' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="calendar"></i><span>Availability</span></div>
      </a>

      <div class="nav-section-label">FRONT DESK</div>
      <a href="#/hotel-admin/bookings" class="nav-item ${hash === '#/hotel-admin/bookings' || hash === '#/owner/bookings' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="calendar-check"></i><span>Bookings</span></div>
      </a>
      <a href="#/hotel-admin/check-in" class="nav-item ${hash === '#/hotel-admin/check-in' || hash === '#/owner/check-in' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="log-in"></i><span>Check-In</span></div>
      </a>
      <a href="#/hotel-admin/check-out" class="nav-item ${hash === '#/hotel-admin/check-out' || hash === '#/owner/check-out' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="log-out"></i><span>Check-Out</span></div>
      </a>

      <div class="nav-section-label">FINANCIAL</div>
      <a href="#/hotel-admin/earnings" class="nav-item ${hash === '#/hotel-admin/earnings' || hash === '#/owner/earnings' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="wallet"></i><span>Earnings</span></div>
      </a>

      <div class="nav-section-label">SUPPORT</div>
      <a href="#/hotel-admin/support" class="nav-item ${hash === '#/hotel-admin/support' || hash === '#/owner/support' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="life-buoy"></i><span>Support</span></div>
      </a>
      <a href="#/hotel-admin/profile" class="nav-item ${hash === '#/hotel-admin/profile' || hash === '#/owner/profile' ? 'active' : ''}">
        <div class="nav-item-left"><i data-lucide="user"></i><span>Profile</span></div>
      </a>
      <a href="javascript:void(0)" onclick="window.handleSignOut()" class="nav-item" style="color: #EF4444;">
        <div class="nav-item-left"><i data-lucide="log-out"></i><span>Sign Out</span></div>
      </a>
    `;
  }

  // Route Dispatcher with Permission Control
  switch (hash) {
    // === ADMIN ROUTES ===
    case '#/admin/dashboard':
      viewTitle.textContent = 'Executive Control Center';
      viewSubtitle.textContent = 'Live centralized overview of properties, bookings & financial settlements';
      renderAdminDashboardView(contentArea);
      break;

    case '#/admin/hotels':
      viewTitle.textContent = 'Hotel Directory & Governance';
      viewSubtitle.textContent = 'Inspect properties, verify compliance documents, and control active status';
      renderAdminHotelsView(contentArea);
      break;

    case '#/admin/owners':
      viewTitle.textContent = 'Hotel Owner Verification (KYC)';
      viewSubtitle.textContent = 'Review business registration, PAN/GSTIN documentation, and bank settlement details';
      renderAdminOwnersView(contentArea);
      break;

    case '#/admin/bookings':
      viewTitle.textContent = 'Centralized Booking Ledger';
      viewSubtitle.textContent = 'Audit all guest reservations, stay dates, and digital invoice breakdowns';
      renderAdminBookingsView(contentArea);
      break;

    case '#/admin/payments':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'finance_admin') {
        renderAccessDeniedView(contentArea, 'Finance Administrator');
        break;
      }
      viewTitle.textContent = 'Payment Transaction Logs';
      viewSubtitle.textContent = 'Real-time gateway settlements, UPI/Card transaction records, and status';
      renderAdminPaymentsView(contentArea);
      break;

    case '#/admin/refunds':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'finance_admin') {
        renderAccessDeniedView(contentArea, 'Finance Administrator');
        break;
      }
      viewTitle.textContent = 'Cancellation Refund Queue';
      viewSubtitle.textContent = 'Process guest cancellation claims with policy fee deduction and bank settlement';
      renderAdminRefundsView(contentArea);
      break;

    case '#/admin/commissions':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'finance_admin') {
        renderAccessDeniedView(contentArea, 'Finance Administrator');
        break;
      }
      viewTitle.textContent = 'Commission Engine & Rules';
      viewSubtitle.textContent = 'Manage platform take-rate percentage and review auditable cut ledger';
      renderAdminCommissionsView(contentArea);
      break;

    case '#/admin/customers':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'support_admin') {
        renderAccessDeniedView(contentArea, 'Support Administrator');
        break;
      }
      viewTitle.textContent = 'Customer Accounts Directory';
      viewSubtitle.textContent = 'Registered mobile app guests, lifetime reservations, and contact records';
      renderAdminCustomersView(contentArea);
      break;

    case '#/admin/support':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'support_admin') {
        renderAccessDeniedView(contentArea, 'Support Administrator');
        break;
      }
      viewTitle.textContent = 'Centralized Support Desk';
      viewSubtitle.textContent = 'Two-way resolution hub for customer and hotel partner inquiries';
      renderAdminSupportView(contentArea);
      break;

    case '#/admin/reports':
    case '#/admin/statements':
      if (!isSuperAdmin && userRole !== 'admin' && userRole !== 'finance_admin') {
        renderAccessDeniedView(contentArea, 'Finance Administrator');
        break;
      }
      viewTitle.textContent = 'Financial Income Statements';
      viewSubtitle.textContent = 'Daily and monthly revenue accounting with auditable CSV export';
      renderAdminReportsView(contentArea);
      break;

    case '#/admin/settings':
      if (!isSuperAdmin && userRole !== 'admin') {
        renderAccessDeniedView(contentArea, 'Super Administrator');
        break;
      }
      viewTitle.textContent = 'Platform Global Settings';
      viewSubtitle.textContent = 'Configure live maintenance modes, payment gateways, and policies';
      renderAdminSettingsView(contentArea);
      break;

    case '#/admin/admins':
    case '#/admin/users':
      if (!isSuperAdmin) {
        renderAccessDeniedView(contentArea, 'Super Administrator');
        break;
      }
      viewTitle.textContent = 'Administrator Security & Roles';
      viewSubtitle.textContent = 'Manage administrator accounts, assign role permissions, and view audit trail';
      renderAdminUsersView(contentArea);
      break;

    case '#/admin/admins/create':
      if (!isSuperAdmin) {
        renderAccessDeniedView(contentArea, 'Super Administrator');
        break;
      }
      viewTitle.textContent = 'Provision New Administrator';
      viewSubtitle.textContent = 'Grant controlled administrative authority and assign granular operational permissions';
      renderAdminCreateUserView(contentArea);
      break;

    case '#/admin/profile':
      viewTitle.textContent = 'Administrator Profile & Security';
      viewSubtitle.textContent = 'Manage personal administrative credentials and update password';
      renderAdminProfileView(contentArea);
      break;

    case '#/admin/access-denied':
      viewTitle.textContent = 'Access Restricted';
      viewSubtitle.textContent = 'You do not have the required permissions to view this administrative page';
      renderAccessDeniedView(contentArea);
      break;

    // === HOTEL ADMIN & OWNER ROUTES ===
    case '#/hotel-admin/dashboard':
    case '#/owner/dashboard':
      viewTitle.textContent = 'Hotel Management Dashboard';
      viewSubtitle.textContent = 'Track room inventory, today’s arrivals, departures, and net earnings';
      renderOwnerDashboardView(contentArea);
      break;

    case '#/hotel-admin/property':
    case '#/hotel-admin/hotel':
    case '#/owner/hotel':
      viewTitle.textContent = 'Property Details & Media';
      viewSubtitle.textContent = 'Edit hotel details, address, amenities, and high-resolution photo gallery';
      renderOwnerHotelView(contentArea);
      break;

    case '#/hotel-admin/rooms':
    case '#/owner/rooms':
      viewTitle.textContent = 'Room Categories & Inventory';
      viewSubtitle.textContent = 'Add room categories, set nightly tariffs, capacity, and manage available units';
      renderOwnerRoomsView(contentArea);
      break;

    case '#/hotel-admin/availability':
    case '#/owner/availability':
      viewTitle.textContent = 'Availability Matrix';
      viewSubtitle.textContent = 'Real-time room occupancy grid with single-click blackout date blocking';
      renderOwnerAvailabilityView(contentArea);
      break;

    case '#/hotel-admin/bookings':
    case '#/owner/bookings':
      viewTitle.textContent = 'Reservations Management';
      viewSubtitle.textContent = 'Full list of guest bookings with stay dates, guest contact, and payout details';
      renderOwnerBookingsView(contentArea);
      break;

    case '#/hotel-admin/check-in':
    case '#/owner/check-in':
      viewTitle.textContent = 'Front Desk Check-In';
      viewSubtitle.textContent = 'Search by Booking ID to verify guest identity and confirm check-in';
      renderOwnerCheckInView(contentArea);
      break;

    case '#/hotel-admin/check-out':
    case '#/owner/check-out':
      viewTitle.textContent = 'Front Desk Check-Out';
      viewSubtitle.textContent = 'Check out guests, finalize billing, and release rooms back to active inventory';
      renderOwnerCheckOutView(contentArea);
      break;

    case '#/hotel-admin/earnings':
    case '#/owner/earnings':
      viewTitle.textContent = 'Net Earnings & Settlements';
      viewSubtitle.textContent = 'Traceable 85% net earnings per reservation with platform fee deductions';
      renderOwnerEarningsView(contentArea);
      break;

    case '#/hotel-admin/onboard':
    case '#/owner/onboard':
      viewTitle.textContent = 'Register New Property';
      viewSubtitle.textContent = '5-step onboarding wizard to submit new hotels for platform review';
      renderOwnerOnboardView(contentArea);
      break;

    case '#/hotel-admin/profile':
    case '#/owner/profile':
      viewTitle.textContent = 'Owner KYC & Business Profile';
      viewSubtitle.textContent = 'Commercial registration, PAN, GSTIN, and bank settlement details';
      renderOwnerProfileView(contentArea);
      break;

    case '#/hotel-admin/support':
    case '#/owner/support':
      viewTitle.textContent = 'Partner Concierge & Support';
      viewSubtitle.textContent = 'Direct priority messaging channel with HotelHub platform administrators';
      renderOwnerSupportView(contentArea);
      break;

    default:
      if (isAdminArea) {
        window.navigateTo('/admin/dashboard');
      } else if (isHotelAdminArea) {
        window.navigateTo('/hotel-admin/dashboard');
      } else {
        window.navigateTo('/admin/dashboard');
      }
      break;
  }

  if (window.lucide) window.lucide.createIcons();
}

// Initialize Mobile Drawer Listeners
function initMobileDrawer() {
  const toggleBtn = document.getElementById('btn-mobile-sidebar-toggle');
  const closeBtn = document.getElementById('btn-close-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar = document.getElementById('app-sidebar');

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.add('open');
      backdrop.classList.add('active');
    });
  }

  if (closeBtn && sidebar && backdrop) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }
}

// Global Routing Listeners
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  handleRoute();
});
