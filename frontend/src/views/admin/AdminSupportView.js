import { api } from '../../services/api.js';

export async function renderAdminSupportView(container) {
  let tickets = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading support desk tickets...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await api.getSupportTickets();
      tickets = res.tickets;
      render();
    } catch (err) {
      container.innerHTML = `<div class="panel-card" style="color: var(--status-danger);">Error: ${err.message}</div>`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Sender & Booking</th>
                <th>Subject & Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${t.ticket_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${t.user_name} (${t.user_role})</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${t.user_email}</div>
                    ${t.booking_code ? `<div style="font-size: 0.7rem; font-family: monospace; color: var(--color-primary);">Ref: ${t.booking_code}</div>` : ''}
                  </td>
                  <td>
                    <div style="font-weight: 600; max-width: 240px;">${t.subject}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${t.category}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 2px 7px; border-radius: var(--radius-xs); ${
                      t.priority === 'high' ? 'background: var(--status-danger-bg); color: var(--status-danger);' :
                      t.priority === 'medium' ? 'background: var(--status-warning-bg); color: var(--status-warning);' :
                      'background: var(--status-info-bg); color: var(--status-info);'
                    }">
                      ${t.priority}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${t.status}">${t.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(t.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-open-ticket" data-ticket-id="${t.id}">
                      <i data-lucide="message-square"></i> Open Thread
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="support-modal-root"></div>
    `;

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    container.querySelectorAll('.btn-open-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-ticket-id');
        openTicketModal(tId);
      });
    });
  }

  function openTicketModal(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const modalRoot = container.querySelector('#support-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 620px;">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.7rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">SUPPORT CONVERSATION • ${ticket.ticket_code}</span>
              <h2 class="modal-title">${ticket.subject}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="background: var(--bg-surface-secondary); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 14px; font-size: 0.8rem; display: flex; justify-content: space-between;">
              <div>Sender: <strong>${ticket.user_name}</strong> (${ticket.user_email})</div>
              <div>Ref: <strong>${ticket.booking_code || 'General'}</strong></div>
            </div>

            <!-- Messages Stream -->
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding: 6px; margin-bottom: 14px;">
              ${ticket.messages.map(m => `
                <div style="padding: 10px 14px; border-radius: var(--radius-sm); max-width: 85%; font-size: 0.85rem; line-height: 1.4; ${
                  m.sender === 'admin' ?
                  'align-self: flex-end; background: var(--color-primary); color: #fff;' :
                  'align-self: flex-start; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); color: var(--text-main);'
                }">
                  <div>${m.text}</div>
                  <span style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px; display: block;">${m.sender === 'admin' ? '🛡️ Administrator' : '👤 Customer'} • ${m.time}</span>
                </div>
              `).join('')}
            </div>

            <!-- Reply Box -->
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" id="reply-input" placeholder="Type resolution or inquiry message...">
              <button class="btn btn-primary" id="btn-send-reply">Send</button>
            </div>
          </div>

          <div class="modal-footer">
            <span style="margin-right: auto; font-size: 0.8rem; color: var(--text-secondary);">
              Status: <span class="status-pill ${ticket.status}">${ticket.status.replace('_', ' ')}</span>
            </span>
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
            ${ticket.status !== 'resolved' ? `
              <button class="btn btn-success" id="btn-resolve-ticket">Mark Resolved</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#btn-send-reply')?.addEventListener('click', async () => {
      const text = modalRoot.querySelector('#reply-input').value.trim();
      if (!text) return;
      await api.replySupportTicket(ticketId, text);
      window.showToast('Reply dispatched to ticket.', 'success');
      const res = await api.getSupportTickets();
      tickets = res.tickets;
      openTicketModal(ticketId);
    });

    modalRoot.querySelector('#btn-resolve-ticket')?.addEventListener('click', async () => {
      await api.updateTicketStatus(ticketId, 'resolved');
      window.showToast('Ticket marked as RESOLVED.', 'success');
      closeModal();
      loadData();
    });
  }

  loadData();
}
