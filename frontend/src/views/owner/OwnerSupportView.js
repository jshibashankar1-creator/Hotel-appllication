import { api } from '../../services/api.js';

export async function renderOwnerSupportView(container) {
  let tickets = [];

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i data-lucide="loader-2" style="width: 32px; height: 32px; color: var(--color-primary); animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">Loading support tickets...</p>
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
      <div class="filter-bar">
        <h2 style="font-size: 1.1rem; font-weight: 700;">Partner Helpdesk & Platform Inquiries</h2>
        <button class="btn btn-primary" id="btn-raise-ticket">
          <i data-lucide="plus"></i> Raise New Ticket
        </button>
      </div>

      <div class="panel-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="commercial-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No open inquiries. You can contact platform support anytime.</td></tr>
              ` : tickets.map(t => `
                <tr>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--color-primary);">${t.ticket_code}</span></td>
                  <td>
                    <div style="font-weight: 600;">${t.subject}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${t.category}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">${t.priority}</span>
                  </td>
                  <td>
                    <span class="status-pill ${t.status}">${t.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(t.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-open-thread" data-ticket-id="${t.id}">
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
    container.querySelector('#btn-raise-ticket')?.addEventListener('click', () => {
      openNewTicketModal();
    });

    container.querySelectorAll('.btn-open-thread').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-ticket-id');
        openThreadModal(tId);
      });
    });
  }

  function openNewTicketModal() {
    const modalRoot = container.querySelector('#support-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 540px;">
          <div class="modal-header">
            <h2 class="modal-title">Submit Support Ticket to Admin</h2>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <form id="new-ticket-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input type="text" class="form-input" id="ticket-subject" placeholder="e.g. Inquiry regarding payout disbursement" required>
              </div>

              <div class="form-group">
                <label class="form-label">Inquiry Category</label>
                <select class="form-select" id="ticket-category">
                  <option value="Payout & Finance">Payout & Finance</option>
                  <option value="Hotel Verification">Hotel Verification / Document Update</option>
                  <option value="Room Inventory & Bookings">Room Inventory & Bookings</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Message Details</label>
                <textarea class="form-textarea" id="ticket-message" placeholder="Explain your inquiry in detail..." required></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-close-action">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Inquiry</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const closeModal = () => { modalRoot.innerHTML = ''; };

    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-action')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#new-ticket-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.createSupportTicket({
          subject: modalRoot.querySelector('#ticket-subject').value,
          category: modalRoot.querySelector('#ticket-category').value,
          message: modalRoot.querySelector('#ticket-message').value
        });
        window.showToast('Support ticket dispatched to platform administrator.', 'success');
        closeModal();
        loadData();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  function openThreadModal(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const modalRoot = container.querySelector('#support-modal-root');
    modalRoot.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-container" style="max-width: 600px;">
          <div class="modal-header">
            <div>
              <span style="font-size: 0.7rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">TICKET ${ticket.ticket_code}</span>
              <h2 class="modal-title">${ticket.subject}</h2>
            </div>
            <button class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
          </div>

          <div class="modal-body">
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding: 6px; margin-bottom: 14px;">
              ${ticket.messages.map(m => `
                <div style="padding: 10px 14px; border-radius: var(--radius-sm); max-width: 85%; font-size: 0.85rem; line-height: 1.4; ${
                  m.sender === 'admin' ?
                  'align-self: flex-start; background: var(--bg-surface-secondary); border: 1px solid var(--border-light); color: var(--text-main);' :
                  'align-self: flex-end; background: var(--color-primary); color: #fff;'
                }">
                  <div>${m.text}</div>
                  <span style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px; display: block;">${m.sender === 'admin' ? '🛡️ Administrator Response' : '👤 You'} • ${m.time}</span>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" id="reply-input" placeholder="Type reply...">
              <button class="btn btn-primary" id="btn-send-reply">Send</button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-close-action">Close</button>
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
      window.showToast('Reply added.', 'success');
      const res = await api.getSupportTickets();
      tickets = res.tickets;
      openThreadModal(ticketId);
    });
  }

  loadData();
}
