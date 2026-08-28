import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  owner_id: { type: String, required: true, index: true },
  owner_name: { type: String, required: true },
  name: { type: String, required: true, index: true },
  hotel_type: { type: String, default: 'Luxury Hotel' },
  description: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  postal_code: { type: String, default: '' },
  rating: { type: Number, default: 5.0 },
  reviews_count: { type: Number, default: 0 },
  star_category: { type: Number, default: 4, index: true },
  status: { type: String, enum: ['active', 'under_review', 'suspended'], default: 'under_review', index: true },
  cover_image: { type: String, default: '' },
  gallery: [{ type: String }],
  amenities: [{ type: String }],
  pickup_service_enabled: { type: Boolean, default: true },
  pickup_locations: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['airport', 'railway', 'bus', 'custom'], default: 'railway' },
    address: { type: String, default: '' },
    active: { type: Boolean, default: true }
  }],
  pickup_vehicles: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'Sedan' },
    capacity: { type: Number, default: 4 },
    price: { type: Number, default: 800 },
    vehicle_number: { type: String, default: '' },
    active: { type: Boolean, default: true }
  }],
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

export const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
