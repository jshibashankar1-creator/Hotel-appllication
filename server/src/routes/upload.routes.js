import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.js';
import { db } from '../db/database.js';
import { getCloudinaryClient, isCloudinaryConfigured } from '../config/cloudinary.js';

const router = Router();

// Configure Multer storage in memory (limits: 5MB, JPG/JPEG/PNG/WEBP only)
const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are supported.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

/**
 * POST /api/uploads/room-image
 * Authenticated Hotel Admin & Owner endpoint to upload room category photos to Cloudinary
 */
router.post(
  '/room-image',
  authenticate,
  requireRole('hotel_admin', 'owner', 'super_admin', 'admin'),
  (req, res) => {
    // Multer upload wrapper for structured error handling
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image size exceeds maximum limit of 5 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload validation failed.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was provided in the request payload (expected field "image").'
        });
      }

      // Property Authorization check: If hotel_id is supplied, verify caller ownership/assignment
      const hotelId = req.body.hotel_id;
      if (hotelId) {
        const hotel = db.getHotelById(hotelId);
        if (!hotel) {
          return res.status(404).json({
            success: false,
            message: 'Specified hotel property does not exist.'
          });
        }

        const isAuthorized =
          req.user.role === 'super_admin' ||
          req.user.role === 'admin' ||
          hotel.owner_id === req.user.id ||
          hotel.hotel_admin_id === req.user.id ||
          hotel.id === req.user.hotel_id;

        if (!isAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to upload images for this hotel property.'
          });
        }
      }

      // Check Cloudinary credentials
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary server credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Please configure them in server .env.'
        });
      }

      try {
        const cloudinaryClient = getCloudinaryClient();

        // Stream buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryClient.uploader.upload_stream(
            {
              folder: 'hotelhub/room-categories',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        // Return only necessary and safe attributes
        return res.json({
          success: true,
          message: 'Room image uploaded successfully to Cloudinary.',
          secure_url: uploadResult.secure_url,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height
        });
      } catch (uploadErr) {
        console.error('Cloudinary room image upload error:', uploadErr?.message || uploadErr);
        return res.status(502).json({
          success: false,
          message: uploadErr?.message || 'Failed to upload image to Cloudinary service.'
        });
      }
    });
  }
);

/**
 * POST /api/uploads/banner-image
 * Authenticated Hotel Admin & Owner endpoint to upload promotional banner images to Cloudinary
 */
router.post(
  '/banner-image',
  authenticate,
  requireRole('hotel_admin', 'owner', 'super_admin', 'admin'),
  (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Banner image size exceeds maximum limit of 5 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload validation failed.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was provided in the request payload (expected field "image").'
        });
      }

      // Property Authorization check: If hotel_id is supplied, verify caller ownership/assignment
      const hotelId = req.body.hotel_id;
      if (hotelId) {
        const hotel = db.getHotelById(hotelId);
        if (!hotel) {
          return res.status(404).json({
            success: false,
            message: 'Specified hotel property does not exist.'
          });
        }

        const isAuthorized =
          req.user.role === 'super_admin' ||
          req.user.role === 'admin' ||
          hotel.owner_id === req.user.id ||
          hotel.hotel_admin_id === req.user.id ||
          hotel.id === req.user.hotel_id;

        if (!isAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to upload banners for this hotel property.'
          });
        }
      }

      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary server credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Please configure them in server .env.'
        });
      }

      try {
        const cloudinaryClient = getCloudinaryClient();
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryClient.uploader.upload_stream(
            {
              folder: 'hotelhub/banners',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        return res.json({
          success: true,
          message: 'Banner image uploaded successfully to Cloudinary.',
          secure_url: uploadResult.secure_url,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height
        });
      } catch (uploadErr) {
        console.error('Cloudinary banner image upload error:', uploadErr?.message || uploadErr);
        return res.status(502).json({
          success: false,
          message: uploadErr?.message || 'Failed to upload image to Cloudinary service.'
        });
      }
    });
  }
);

/**
 * POST /api/uploads/cover-image
 * Authenticated Hotel Admin & Owner endpoint to upload hotel cover images to Cloudinary
 */
router.post(
  '/cover-image',
  authenticate,
  requireRole('hotel_admin', 'owner', 'super_admin', 'admin'),
  (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Cover image size exceeds maximum limit of 5 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload validation failed.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was provided in the request payload (expected field "image").'
        });
      }

      // Property Authorization check: If hotel_id is supplied, verify caller ownership/assignment
      const hotelId = req.body.hotel_id || req.body.property_id;
      if (hotelId) {
        const hotel = db.getHotelById(hotelId);
        if (!hotel) {
          return res.status(404).json({
            success: false,
            message: 'Specified hotel property does not exist.'
          });
        }

        const isAuthorized =
          req.user.role === 'super_admin' ||
          req.user.role === 'admin' ||
          hotel.owner_id === req.user.id ||
          hotel.hotel_admin_id === req.user.id ||
          hotel.id === req.user.hotel_id;

        if (!isAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to upload cover photos for this hotel property.'
          });
        }
      }

      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary server credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Please configure them in server .env.'
        });
      }

      try {
        const cloudinaryClient = getCloudinaryClient();
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryClient.uploader.upload_stream(
            {
              folder: 'hotelhub/hotel-covers',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        return res.json({
          success: true,
          message: 'Cover image uploaded successfully to Cloudinary.',
          secure_url: uploadResult.secure_url,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height
        });
      } catch (uploadErr) {
        console.error('Cloudinary cover image upload error:', uploadErr?.message || uploadErr);
        return res.status(502).json({
          success: false,
          message: uploadErr?.message || 'Failed to upload image to Cloudinary service.'
        });
      }
    });
  }
);

/**
 * POST /api/uploads/hero-image
 * Authenticated Super Admin endpoint to upload Home screen hero background image to Cloudinary
 */
router.post(
  '/hero-image',
  authenticate,
  requireRole('super_admin'),
  (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Hero image size exceeds maximum limit of 5 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload validation failed.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was provided in the request payload (expected field "image").'
        });
      }

      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary server credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Please configure them in server .env.'
        });
      }

      try {
        const cloudinaryClient = getCloudinaryClient();
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryClient.uploader.upload_stream(
            {
              folder: 'hotelhub/home-hero',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        // Persist directly into platform_settings
        db.setHomeHero(uploadResult.secure_url, uploadResult.public_id);

        db.addAuditLog({
          admin_id: req.user.id,
          admin_name: req.user.name,
          admin_role: req.user.role,
          action: 'HERO_IMAGE_UPLOADED',
          resource: 'PlatformSettings',
          details: 'Uploaded new Home screen hero background image.',
          ip_address: req.ip || '127.0.0.1'
        });

        return res.json({
          success: true,
          message: 'Home hero background image uploaded and saved successfully.',
          secure_url: uploadResult.secure_url,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height
        });
      } catch (uploadErr) {
        console.error('Cloudinary hero image upload error:', uploadErr?.message || uploadErr);
        return res.status(502).json({
          success: false,
          message: uploadErr?.message || 'Failed to upload image to Cloudinary service.'
        });
      }
    });
  }
);

export default router;
