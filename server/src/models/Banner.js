import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true, index: true },
  hotel_id: { type: String, required: true, index: true },
  title: { type: String, default: '', trim: true },
  image_url: { type: String, required: true },
  image_public_id: { type: String },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

