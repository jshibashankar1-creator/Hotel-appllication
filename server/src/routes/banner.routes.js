import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/banners (Public endpoint for Customer App & Web discovery)
router.get('/', (req, res) => {
  const { hotel_id } = req.query;

  // When hotel_id is provided, return active banners for that hotel,
  // or fall back to that hotel's own cover image (clearly marked fallback: true)
  if (hotel_id) {
    const banners = typeof db.getActiveBannersByHotel === 'function'
      ? db.getActiveBannersByHotel(hotel_id)
      : [];

    const isFallback = banners.length > 0 && banners[0].fallback === true;
    return res.json({
      success: true,
      count: banners.length,
      banners: banners,
      fallback: isFallback
    });
  }

  // When hotel_id is NOT provided (Customer Discovery carousel across hotels):
  const allBanners = typeof db.getBanners === 'function' ? db.getBanners() : (db.data.banners || []);
  const activeBanners = allBanners.filter(b => b.is_active !== false);
  const activeHotels = typeof db.getHotels === 'function'
    ? db.getHotels().filter(h => h.status === 'active' && h.cover_image)
    : [];

  const combinedBanners = [];
  const coveredHotelIds = new Set();

  // First, add all active promotional banners
  activeBanners.forEach(b => {
    const hotel = b.hotel_id ? db.getHotelById(b.hotel_id) : null;
    const finalImage = b.image_url || b.cover_image || (hotel ? hotel.cover_image : null);
    if (finalImage) {
      if (b.hotel_id) coveredHotelIds.add(b.hotel_id);
      combinedBanners.push({
        ...b,
        hotel_id: b.hotel_id || (hotel ? hotel.id : null),
        image_url: finalImage,
        cover_image: finalImage,
        hotel: hotel || null,
        fallback: false
      });
    }
  });

  // For any active hotel that doesn't have an active promotional banner, include its cover photo as fallback
  activeHotels.forEach((h, idx) => {
    if (!coveredHotelIds.has(h.id)) {
      combinedBanners.push({
        id: `BNR-${h.id}`,
        hotel_id: h.id,
        title: h.name,
        image_url: h.cover_image,
        cover_image: h.cover_image,
        sort_order: 100 + idx,
        is_active: true,
        created_at: h.created_at || new Date().toISOString(),
        updated_at: h.updated_at || new Date().toISOString(),
        hotel: h,
        fallback: true
      });
    }
  });

  // Sort by sort_order ascending, then created_at
  combinedBanners.sort((a, b) => {
    const orderDiff = (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const hasCustomBanners = activeBanners.length > 0;
  return res.json({
    success: true,
    count: combinedBanners.length,
    banners: combinedBanners,
    fallback: !hasCustomBanners
  });
});

export default router;
