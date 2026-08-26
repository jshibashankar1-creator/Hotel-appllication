import mongoose from 'mongoose';

const RoomAvailabilitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  room_id: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  booked_count: { type: Number, default: 0 },
  blocked_count: { type: Number, default: 0 }
}, { timestamps: true });

RoomAvailabilitySchema.index({ room_id: 1, date: 1 }, { unique: true });

export const RoomAvailability = mongoose.models.RoomAvailability || mongoose.model('RoomAvailability', RoomAvailabilitySchema);
