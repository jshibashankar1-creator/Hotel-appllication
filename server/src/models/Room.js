import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  hotel_id: { type: String, required: true, index: true },
  room_name: { type: String, required: true },
  room_type: { type: String, default: 'Deluxe' },
  description: { type: String, default: '' },
  max_guests: { type: Number, required: true, default: 2 },
  total_inventory: { type: Number, required: true, default: 10 },
  price_per_night: { type: Number, required: true, index: true },
  photos: [{ type: String }],
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
