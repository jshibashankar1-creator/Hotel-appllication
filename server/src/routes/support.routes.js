import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/support/tickets (Admin: all tickets, User: their tickets)
router.get('/tickets', authenticate, (req, res) => {
  let tickets;
  const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'].includes(req.user.role);
  if (isAdmin) {
    tickets = db.getSupportTickets();
  } else {
    tickets = db.getSupportTickets(req.user.id);
  }
  return res.json({ success: true, count: tickets.length, tickets });
});

// POST /api/support/tickets (Create new inquiry)
router.post('/tickets', authenticate, (req, res) => {
  const { subject, category, priority, message, booking_id, hotel_id } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and initial message are required.' });
  }

  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newTicket = db.transaction((data) => {
    const ticketId = `TCK-${Date.now().toString(36).toUpperCase()}`;
    const randomFour = Math.floor(100 + Math.random() * 900);
    const ticketCode = `TCK-${randomFour}`;

    let bookingCode = null;
    if (booking_id) {
      const b = data.bookings.find(x => x.id === booking_id || x.booking_code === booking_id);
      if (b) bookingCode = b.booking_code;
    }

    const isAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'].includes(req.user.role);

    const ticketObj = {
      id: ticketId,
      ticket_code: ticketCode,
      user_id: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      user_role: req.user.role,
      booking_id: booking_id || null,
      booking_code: bookingCode || booking_id || null,
      hotel_id: hotel_id || null,
      subject,
      category: category || 'General Inquiry',
      priority: priority || 'medium',
      status: 'open',
      messages: [
        {
          sender: isAdmin ? 'admin' : 'customer',
          text: message,
          time: timeStr
        }
      ],
      created_at: new Date().toISOString()
    };
    data.support_tickets.unshift(ticketObj);
    return ticketObj;
  });

  return res.status(201).json({ success: true, message: 'Support ticket created.', ticket: newTicket });
});

// POST /api/support/tickets/:id/reply (Append message to thread)
router.post('/tickets/:id/reply', authenticate, (req, res) => {
  const { text, new_status } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updatedTicket = db.transaction((data) => {
    const idx = data.support_tickets.findIndex(t => t.id === req.params.id || t.ticket_code === req.params.id);
    if (idx !== -1) {
      const isSenderAdmin = ['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'].includes(req.user.role);
      data.support_tickets[idx].messages.push({
        sender: isSenderAdmin ? 'admin' : 'customer',
        text,
        time: timeStr
      });

      if (new_status) {
        data.support_tickets[idx].status = new_status;
      } else if (isSenderAdmin && data.support_tickets[idx].status === 'open') {
        data.support_tickets[idx].status = 'in_progress';
      }

      return data.support_tickets[idx];
    }
    return null;
  });

  if (!updatedTicket) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  return res.json({ success: true, message: 'Reply added to thread.', ticket: updatedTicket });
});

// PUT & PATCH /api/support/tickets/:id/status (Admin updates status)
const handleTicketStatusUpdate = (req, res) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const updatedTicket = db.transaction((data) => {
    const idx = data.support_tickets.findIndex(t => t.id === req.params.id || t.ticket_code === req.params.id);
    if (idx !== -1) {
      data.support_tickets[idx].status = status;
      return data.support_tickets[idx];
    }
    return null;
  });

  return res.json({ success: true, message: `Ticket marked as ${status.toUpperCase()}.`, ticket: updatedTicket });
};

router.put('/tickets/:id/status', authenticate, requireRole('super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'), handleTicketStatusUpdate);
router.patch('/tickets/:id/status', authenticate, requireRole('super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'), handleTicketStatusUpdate);

export default router;
