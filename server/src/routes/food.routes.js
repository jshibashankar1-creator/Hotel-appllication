import express from 'express';
import FoodItem from '../models/FoodItem.js';
import { Hotel } from '../models/Hotel.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Get all food items (Public)
router.get('/', async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ isAvailable: true }).sort('displayOrder');
    res.status(200).json({ success: true, count: foodItems.length, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get food items for a specific hotel (Public)
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ hotel: req.params.hotelId, isAvailable: true }).sort('displayOrder');
    res.status(200).json({ success: true, count: foodItems.length, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Routes for their own hotel
router.use(protect);
router.use(restrictTo('hotel_admin', 'owner'));

// Get all food items for the admin's hotel
router.get('/admin/my-food', async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id });
    if (!hotels.length) {
      return res.status(404).json({ success: false, message: 'No hotel found for this admin' });
    }
    const hotelIds = hotels.map(h => h._id);
    const foodItems = await FoodItem.find({ hotel: { $in: hotelIds } }).sort('displayOrder');
    res.status(200).json({ success: true, count: foodItems.length, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add food item
router.post('/admin', async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id });
    if (!hotels.length) {
      return res.status(404).json({ success: false, message: 'No hotel found for this admin' });
    }
    
    // Assign to first hotel by default if not specified
    const hotelId = req.body.hotel || hotels[0]._id;
    
    // Verify ownership
    if (!hotels.some(h => h._id.toString() === hotelId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized for this hotel' });
    }
    
    const newFood = await FoodItem.create({ ...req.body, hotel: hotelId });
    res.status(201).json({ success: true, data: newFood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update food item
router.put('/admin/:id', async (req, res) => {
  try {
    let foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    
    const hotels = await Hotel.find({ owner: req.user._id });
    if (!hotels.some(h => h._id.toString() === foodItem.hotel.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this food item' });
    }
    
    foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: foodItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete food item
router.delete('/admin/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    
    const hotels = await Hotel.find({ owner: req.user._id });
    if (!hotels.some(h => h._id.toString() === foodItem.hotel.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this food item' });
    }
    
    await FoodItem.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
