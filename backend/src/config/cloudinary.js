const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dst1g3fpd',
  api_key: process.env.CLOUDINARY_API_KEY || '132278347151341',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath, options = {}) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'nirmaan',
    resource_type: 'auto',
    ...options,
  });
  return result;
}

async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

function getPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary')) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
  return publicIdWithExt.replace(/\.[^.]+$/, '');
}

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
