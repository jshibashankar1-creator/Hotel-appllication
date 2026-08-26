import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['customer', 'owner', 'admin'], required: true },
  sender_name: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const SupportTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  ticket_code: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  user_name: { type: String, required: true },
  user_email: { type: String, required: true },
  user_role: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, default: 'General Inquiry' },
  booking_code: { type: String, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
  messages: [MessageSchema],
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
