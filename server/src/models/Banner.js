import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  image_public_id: {
    type: String,
  },
  sort_order: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Banner = mongoose.model('Banner', bannerSchema);
