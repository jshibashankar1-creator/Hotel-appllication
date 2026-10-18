import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const allBanners = db.data.banners || [];
  
  // Only active banners
  let activeBanners = allBanners.filter(b => b.is_active !== false);

  // Sort using sort_order ASC, then created_at DESC
  activeBanners.sort((a, b) => {
    if (a.sort_order === b.sort_order) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return a.sort_order - b.sort_order;
  });

  res.json({ success: true, count: activeBanners.length, banners: activeBanners });
});

export default router;
