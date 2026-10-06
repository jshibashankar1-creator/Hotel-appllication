import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ============================================================================
// WISHLIST
// ============================================================================
router.get('/wishlist', authenticate, (req, res) => {
  if (!db.data.wishlists) db.data.wishlists = {};
  const userWishlist = db.data.wishlists[req.user.id] || [];
  
  // Populate hotels
  const hotels = userWishlist
    .map(hotelId => db.getHotelById(hotelId))
    .filter(h => h && h.status === 'active');

  return res.json({ success: true, count: hotels.length, hotels });
});

router.post('/wishlist/:hotelId', authenticate, (req, res) => {
  const { hotelId } = req.params;
  const hotel = db.getHotelById(hotelId);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  db.transaction((data) => {
    if (!data.wishlists) data.wishlists = {};
    if (!data.wishlists[req.user.id]) data.wishlists[req.user.id] = [];
    
    if (!data.wishlists[req.user.id].includes(hotelId)) {
      data.wishlists[req.user.id].push(hotelId);
    }
    return true;
  });

  return res.json({ success: true, message: 'Added to wishlist.' });
});

router.delete('/wishlist/:hotelId', authenticate, (req, res) => {
  const { hotelId } = req.params;
  
  db.transaction((data) => {
    if (!data.wishlists) data.wishlists = {};
    if (data.wishlists[req.user.id]) {
      data.wishlists[req.user.id] = data.wishlists[req.user.id].filter(id => id !== hotelId);
    }
    return true;
  });

  return res.json({ success: true, message: 'Removed from wishlist.' });
});

// ============================================================================
// PAYMENT METHODS
// ============================================================================
router.get('/payment-methods', authenticate, (req, res) => {
  // We do NOT store raw card numbers. We return safe metadata.
  // Assuming no persistent saved cards in Razorpay TEST mode are supported by architecture.
  return res.json({ 
    success: true, 
    methods: [], 
    message: 'Payment methods are securely managed during checkout via Razorpay.' 
  });
});

// ============================================================================
// OFFERS
// ============================================================================
router.get('/offers', authenticate, (req, res) => {
  if (!db.data.offers) {
    // Generate some default active offers if array doesn't exist
    db.data.offers = [
      {
        id: 'OFFER-1',
        title: 'VIP Weekend Getaway',
        description: 'Get 15% off on luxury suites this weekend.',
        discount_pct: 15,
        status: 'active',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'OFFER-2',
        title: 'Free Airport Transfer',
        description: 'Complimentary premium pickup for stays over 3 nights.',
        discount_pct: 0,
        status: 'active',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  const activeOffers = db.data.offers.filter(o => o.status === 'active' && new Date(o.valid_until) > new Date());
  return res.json({ success: true, count: activeOffers.length, offers: activeOffers });
});

// ============================================================================
// REWARDS
// ============================================================================
router.get('/rewards', authenticate, (req, res) => {
  if (!db.data.rewards) db.data.rewards = {};
  
  if (!db.data.rewards[req.user.id]) {
    // Calculate initial rewards based on completed bookings
    const completedBookings = db.getBookings().filter(b => b.customer_id === req.user.id && b.booking_status === 'confirmed');
    const points = completedBookings.length * 500; // 500 points per booking
    db.transaction((data) => {
      if (!data.rewards) data.rewards = {};
      data.rewards[req.user.id] = {
        points_balance: points,
        lifetime_points: points,
        redeemed_points: 0,
        updated_at: new Date().toISOString()
      };
      return true;
    });
  }

  return res.json({ success: true, rewards: db.data.rewards[req.user.id] });
});

// ============================================================================
// MEMBERSHIP
// ============================================================================
router.get('/membership', authenticate, (req, res) => {
  if (!db.data.memberships) db.data.memberships = {};
  
  if (!db.data.memberships[req.user.id]) {
    // Calculate initial membership tier
    const completedBookings = db.getBookings().filter(b => b.customer_id === req.user.id && b.booking_status === 'confirmed');
    let tier = 'Member';
    if (completedBookings.length > 5) tier = 'Gold';
    if (completedBookings.length > 10) tier = 'Platinum';
    if (completedBookings.length > 20) tier = 'VIP';

    db.transaction((data) => {
      if (!data.memberships) data.memberships = {};
      data.memberships[req.user.id] = {
        membership_tier: tier,
        status: 'active',
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        benefits: tier === 'VIP' ? ['Free Upgrades', 'Late Checkout'] : []
      };
      return true;
    });
  }

  return res.json({ success: true, membership: db.data.memberships[req.user.id] });
});

// ============================================================================
// BANNERS
// ============================================================================
// GET /api/banners does not need authentication. It should probably be public.
// But customer.routes.js seems to be mounted at /api and might not enforce `authenticate` globally on the router itself. 
// Wait, looking at the code above, the routes use `authenticate` individually.
// Let's add the banner route without `authenticate`.

router.get('/banners', (req, res) => {
  const allBanners = db.getBanners();
  const activeBanners = allBanners.filter(b => b.is_active !== false);
  
  activeBanners.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  return res.json({ success: true, count: activeBanners.length, banners: activeBanners });
});

export default router;
