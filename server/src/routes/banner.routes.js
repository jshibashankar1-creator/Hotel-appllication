import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/banners (Public endpoint for Customer App & Web discovery)
router.get('/', (req, res) => {
  const { hotel_id } = req.query;
  const allBanners = typeof db.getBanners === 'function' ? db.getBanners() : (db.data.banners || []);
  let activeBanners = allBanners.filter(b => b.is_active !== false);

  if (hotel_id) {
    activeBanners = activeBanners.filter(b => String(b.hotel_id) === String(hotel_id));
  }

  if (activeBanners.length > 0) {
    activeBanners.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const populatedBanners = activeBanners.map(b => {
      const hotel = b.hotel_id ? db.getHotelById(b.hotel_id) : null;
      const finalImage = b.image_url || b.cover_image || (hotel ? hotel.cover_image : null);
      return {
        ...b,
        hotel_id: b.hotel_id || (hotel ? hotel.id : null),
        image_url: finalImage,
        cover_image: finalImage,
        hotel: hotel || null
      };
    });

    return res.json({
      success: true,
      count: populatedBanners.length,
      banners: populatedBanners,
      fallback: false
    });
  }

  // If a specific hotel was requested and has no banners, do not return global fallback banners
  if (hotel_id) {
    return res.json({
      success: true,
      count: 0,
      banners: [],
      fallback: false
    });
  }

  // Fallback: If no custom promotional banners exist globally, provide banners from active hotels with real cover images
  const activeHotels = db.getHotels().filter(h => h.status === 'active' && h.cover_image);
  const fallbackBanners = activeHotels.slice(0, 5).map((h, idx) => ({
    id: `BNR-${h.id}`,
    hotel_id: h.id,
    title: h.name,
    image_url: h.cover_image,
    cover_image: h.cover_image,
    sort_order: idx,
    is_active: true,
    created_at: h.created_at || new Date().toISOString(),
    updated_at: h.created_at || new Date().toISOString(),
    hotel: h,
    fallback: true
  }));

  return res.json({
    success: true,
    count: fallbackBanners.length,
    banners: fallbackBanners,
    fallback: true
  });
});

export default router;
