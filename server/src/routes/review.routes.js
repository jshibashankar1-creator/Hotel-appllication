import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/reviews/:hotelId
router.get('/:hotelId', (req, res) => {
  const reviews = db.getReviews(req.params.hotelId);
  return res.json({ success: true, count: reviews.length, reviews });
});

// POST /api/reviews (Customer submits review for completed booking)
router.post('/', authenticate, requireRole(['customer']), (req, res) => {
  const { booking_id, hotel_id, rating, comment } = req.body;

  if (!booking_id || !hotel_id || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'booking_id, hotel_id, rating, and comment are required.' });
  }

  const booking = db.getBookingById(booking_id);
  if (!booking || booking.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
  }

  if (booking.booking_status !== 'checked_out') {
    return res.status(400).json({
      success: false,
      message: 'Reviews are only permitted for completed stays (status: checked_out).'
    });
  }

  const newReview = db.transaction((data) => {
    const reviewObj = {
      id: `REV-${Date.now().toString(36).toUpperCase()}`,
      booking_id,
      customer_id: req.user.id,
      customer_name: req.user.name,
      hotel_id,
      rating: Number(rating),
      comment,
      created_at: new Date().toISOString()
    };
    data.reviews.unshift(reviewObj);

    // Recompute hotel rating and review count
    const hotelReviews = data.reviews.filter(r => r.hotel_id === hotel_id);
    const avgRating = hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length;
    const hIdx = data.hotels.findIndex(h => h.id === hotel_id);
    if (hIdx !== -1) {
      data.hotels[hIdx].rating = Number(avgRating.toFixed(1));
      data.hotels[hIdx].reviews_count = hotelReviews.length;
    }

    return reviewObj;
  });

  return res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newReview });
});

export default router;
