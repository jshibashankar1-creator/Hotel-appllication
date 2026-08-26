import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/hotels (Public for Mobile App & Discovery)
router.get('/', (req, res) => {
  const { city, minPrice, maxPrice, starCategory, search } = req.query;
  let hotels = db.getHotels().filter(h => h.status === 'active');

  if (city) {
    hotels = hotels.filter(h => h.city.toLowerCase() === city.toLowerCase());
  }

  if (starCategory) {
    hotels = hotels.filter(h => h.star_category === Number(starCategory));
  }

  if (search) {
    const q = search.toLowerCase();
    hotels = hotels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q)
    );
  }

  // Attach starting price and room inventory to each hotel
  const results = hotels.map(h => {
    const rooms = db.getRoomsByHotel(h.id);
    const minRoomPrice = rooms.length > 0
      ? Math.min(...rooms.map(r => r.price_per_night))
      : 5000;
    const totalRooms = rooms.reduce((acc, r) => acc + r.total_inventory, 0);

    return {
      ...h,
      starting_price: minRoomPrice,
      rooms_count: totalRooms,
      available_rooms: totalRooms
    };
  });

  if (minPrice) {
    hotels = results.filter(h => h.starting_price >= Number(minPrice));
  }
  if (maxPrice) {
    hotels = results.filter(h => h.starting_price <= Number(maxPrice));
  }

  return res.json({ success: true, count: results.length, hotels: results });
});

// GET /api/hotels/admin & /api/hotels/admin/all (Admin Panel: All hotels with full administrative metadata)
const getAdminHotels = (req, res) => {
  const hotels = db.getHotels().map(h => {
    const rooms = db.getRoomsByHotel(h.id);
    const owner = db.getUserById(h.owner_id);
    const ownerKyc = db.getOwnerProfile(h.owner_id);

    return {
      ...h,
      rooms,
      owner_name: owner ? owner.name : h.owner_name,
      owner_email: owner ? owner.email : '',
      owner_phone: owner ? owner.phone : '',
      owner_kyc_status: ownerKyc ? ownerKyc.kyc_status : 'pending'
    };
  });

  return res.json({ success: true, count: hotels.length, hotels });
};

router.get('/admin', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), getAdminHotels);
router.get('/admin/all', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), getAdminHotels);

// GET /api/hotels/owner (Hotel Owner & Hotel Admin: Hotels belonging to authenticated user)
router.get('/owner', authenticate, requireRole('owner', 'super_admin', 'admin', 'hotel_admin'), (req, res) => {
  const userHotels = db.getHotels().filter(h =>
    h.owner_id === req.user.id ||
    h.hotel_admin_id === req.user.id ||
    (req.user.hotel_id && h.id === req.user.hotel_id)
  );

  const hotels = userHotels.map(h => {
    const rooms = db.getRoomsByHotel(h.id);
    return { ...h, rooms };
  });

  return res.json({ success: true, count: hotels.length, hotels });
});

// GET /api/hotels/:id (Single Hotel Details with Rooms, Reviews, Amenities)
router.get('/:id', (req, res) => {
  const hotel = db.getHotelById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  const rooms = db.getRoomsByHotel(hotel.id);
  const reviews = db.getReviews(hotel.id);
  const owner = db.getUserById(hotel.owner_id);

  return res.json({
    success: true,
    hotel: {
      ...hotel,
      rooms,
      reviews,
      owner_name: owner ? owner.name : hotel.owner_name
    }
  });
});

// POST /api/hotels/onboard (Owner & Hotel Admin Registration)
router.post('/onboard', authenticate, requireRole('owner', 'hotel_admin'), (req, res) => {
  try {
    const {
      name,
      hotel_type,
      description,
      phone,
      email,
      address,
      city,
      state,
      country,
      postal_code,
      star_category,
      amenities,
      cover_image,
      gallery,
      rooms
    } = req.body;

    if (!name || !address || !city || !state) {
      return res.status(400).json({ success: false, message: 'Hotel name, address, city, and state are required.' });
    }

    const hotelId = `HTL-${Date.now().toString(36).toUpperCase()}`;

    const newHotel = db.transaction((data) => {
      const hotelObj = {
        id: hotelId,
        owner_id: req.user.id,
        owner_name: req.user.name,
        name,
        hotel_type: hotel_type || 'Luxury Hotel',
        description: description || '',
        address,
        city,
        state,
        country: country || 'India',
        postal_code: postal_code || '',
        rating: 5.0,
        reviews_count: 0,
        star_category: Number(star_category) || 4,
        status: 'under_review',
        cover_image: cover_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
        gallery: gallery && gallery.length > 0 ? gallery : [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80'
        ],
        amenities: amenities || ['Free High-Speed Wi-Fi', '24/7 Room Service', 'Swimming Pool'],
        created_at: new Date().toISOString()
      };
      data.hotels.push(hotelObj);

      // Create initial rooms if provided
      if (rooms && Array.isArray(rooms)) {
        rooms.forEach((r, idx) => {
          data.rooms.push({
            id: `RM-${hotelId}-${idx + 1}`,
            hotel_id: hotelId,
            room_name: r.room_name || 'Deluxe Room',
            room_type: r.room_type || 'Deluxe',
            description: r.description || '',
            max_guests: Number(r.max_guests) || 2,
            total_inventory: Number(r.total_inventory) || 5,
            price_per_night: Number(r.price_per_night) || 5000,
            photos: r.photos || [hotelObj.cover_image],
            is_active: true
          });
        });
      }

      return hotelObj;
    });

    return res.status(201).json({
      success: true,
      message: 'Hotel property submitted successfully for administrative review.',
      hotel: newHotel
    });
  } catch (err) {
    console.error('Hotel onboarding error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit hotel onboarding.' });
  }
});

// PUT /api/hotels/:id (Owner or Admin updates hotel info)
router.put('/:id', authenticate, (req, res) => {
  const hotel = db.getHotelById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  const isAdmin = ['super_admin', 'admin', 'hotel_admin'].includes(req.user.role);
  if (!isAdmin && hotel.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You do not own this hotel.' });
  }

  const updatedHotel = db.transaction((data) => {
    const idx = data.hotels.findIndex(h => h.id === req.params.id);
    if (idx !== -1) {
      data.hotels[idx] = {
        ...data.hotels[idx],
        ...req.body,
        id: hotel.id,
        owner_id: hotel.owner_id // preserve ownership
      };
      return data.hotels[idx];
    }
    return null;
  });

  return res.json({ success: true, message: 'Hotel updated successfully.', hotel: updatedHotel });
});

// PUT /api/hotels/:id/status (Hotel / Super Admin verifies/rejects/suspends hotel)
router.put('/:id/status', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'under_review', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be active, under_review, or suspended.' });
  }

  const updatedHotel = db.transaction((data) => {
    const idx = data.hotels.findIndex(h => h.id === req.params.id);
    if (idx !== -1) {
      data.hotels[idx].status = status;
      return data.hotels[idx];
    }
    return null;
  });

  if (!updatedHotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: status === 'active' ? 'HOTEL_APPROVED' : 'HOTEL_SUSPENDED',
    resource: 'Hotel',
    resource_id: updatedHotel.id,
    details: `Hotel '${updatedHotel.name}' status set to '${status}'.`,
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Hotel status updated to ${status.toUpperCase()}.`,
    hotel: updatedHotel
  });
});

export default router;
