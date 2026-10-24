import { v2 as cloudinary } from 'cloudinary';

// Verify Cloudinary configuration credentials
export function isCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_CLOUD_NAME.trim() &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_KEY.trim() &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_API_SECRET.trim()
  );
}

// Lazy configure Cloudinary instance
export function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary environment credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true
  });

  return cloudinary;
}

export { cloudinary };
