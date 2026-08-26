import { store } from '../services/store.js';

export function renderSupportView(container) {
  let tickets = store.getTickets();
  let statusFilter = 'all';
  let searchQuery = '';

  function render() {
    const filteredTickets = tickets.filter(t => {
      const matchSearch = t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });

    const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    container.innerHTML = `
      <div style="background: linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(17, 24, 39, 0.8) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-lg); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; background: rgba(59, 130, 246, 0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--info);">
            <i data-lucide="headphones" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <h3 style="color: #fff; font-size: 1.05rem;">Customer Support Helpdesk Oversight</h3>
            <p style="color: var(--text-secondary); font-size: 0.82rem;">Supervise and reply directly to guest inquiries, hotel escalations, and grievance tickets.</p>
          </div>
        </div>
        <div>
          <span style="background: var(--info-light); color: var(--info); border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 14px; border-radius: var(--radius-full); font-weight: 700; font-size: 0.82rem;">
            ${openCount} Active Inquiries
          </span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input-box">
            <i data-lucide="search"></i>
            <input type="text" id="support-search-input" placeholder="Search Ticket ID, Subject, Guest..." value="${searchQuery}">
          </div>

          <select class="select-filter" id="support-status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Ticket Statuses</option>
            <option value="open" ${statusFilter === 'open' ? 'selected' : ''}>Open (Unresolved)</option>
            <option value="in_progress" ${statusFilter === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${statusFilter === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer & Booking</th>
                <th>Subject & Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTickets.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No support tickets found.
                  </td>
                </tr>
              ` : filteredTickets.map(t => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.9rem;">${t.ticketId}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${t.customerName}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${t.customerEmail}</div>
                    <div style="font-size: 0.72rem; font-family: monospace; color: var(--primary); margin-top: 2px;">Ref: ${t.bookingId}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #fff; max-width: 260px;">${t.subject}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${t.category}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-sm); ${
                      t.priority === 'high' ? 'background: var(--danger-light); color: var(--danger);' :
                      t.priority === 'medium' ? 'background: var(--warning-light); color: var(--warning);' :
                      'background: var(--primary-light); color: var(--primary);'
                    }">
                      ${t.priority}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge ${t.status}">${t.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.78rem; color: var(--text-secondary);">${new Date(t.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-open-ticket" data-ticket-id="${t.ticketId}">
                      <i data-lucide="message-square"></i> Open Thread
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Support Modal Root -->
      <div id="support-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelector('#support-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#support-status-filter')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-open-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-ticket-id');
        openTicketModal(tId);
      });
    });
  }

  function openTicketModal(ticketId) {
    const ticket = store.getTickets().find(t => t.ticketId === ticketId);
    if (!ticket) return;

    const modalRoot = container.querySelector('#support-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active" id="ticket-chat-modal">
        <div class="modal-container" style="max-width: 650px;">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.75rem; font-family: monospace; color: var(--primary); font-weight: 700;">SUPPORT CONVERSATION • ${ticket.ticketId}</span>
              <h2 class="modal-title">${ticket.subject}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="display: flex; justify-content: space-between; background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px; font-size: 0.82rem;">
              <div>
                <span style="color: var(--text-muted);">Customer:</span> <strong style="color: #fff;">${ticket.customerName}</strong> (${ticket.customerEmail})
              </div>
              <div>
                <span style="color: var(--text-muted);">Booking:</span> <strong style="color: var(--primary);">${ticket.bookingId}</strong>
              </div>
            </div>

            <!-- Messages Thread -->
            <div class="support-thread" id="chat-messages-container">
              ${ticket.messages.map(m => `
                <div class="chat-bubble ${m.sender}">
                  <div>${m.text}</div>
                  <span class="chat-time">${m.sender === 'admin' ? '🛡️ Admin Support' : '👤 Customer'} • ${m.time}</span>
                </div>
              `).join('')}
            </div>

            <!-- Reply Box -->
            <div style="display: flex; gap: 10px; margin-top: 14px;">
              <input type="text" class="form-input" id="ticket-reply-input" placeholder="Type official admin resolution message...">
              <button class="btn btn-primary" id="btn-send-reply">
                <i data-lucide="send"></i> Reply
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.85rem; color: var(--text-secondary);">
              Status: <span class="status-badge ${ticket.status}">${ticket.status.replace('_', ' ')}</span>
            </span>
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            ${ticket.status !== 'resolved' ? `
              <button class="btn btn-success" id="btn-resolve-ticket">
                <i data-lucide="check-circle-2"></i> Mark as Resolved
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const closeModal = () => {
      modalRoot.innerHTML = '';
    };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    const handleSend = () => {
      const input = modalRoot.querySelector('#ticket-reply-input');
      const text = input.value.trim();
      if (!text) return;

      store.addTicketReply(ticketId, text, 'in_progress');
      tickets = store.getTickets();
      window.showToast('Reply sent to customer ticket.', 'success');
      openTicketModal(ticketId); // re-render thread
    };

    modalRoot.querySelector('#btn-send-reply')?.addEventListener('click', handleSend);
    modalRoot.querySelector('#ticket-reply-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    modalRoot.querySelector('#btn-resolve-ticket')?.addEventListener('click', () => {
      store.addTicketReply(ticketId, 'Ticket resolved by platform administration.', 'resolved');
      tickets = store.getTickets();
      window.showToast(`Ticket ${ticketId} marked as RESOLVED.`, 'success');
      closeModal();
      render();
    });
  }

  // Initial render
  render();
}
