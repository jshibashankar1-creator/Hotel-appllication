import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Indian', 'Bengali', 'Chinese', 'Continental', 'Other']
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5
  }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
