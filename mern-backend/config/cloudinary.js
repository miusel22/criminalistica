const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage para diferentes tipos de archivos
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `criminalistica/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: allowedFormats.includes('pdf') ? 'auto' : 'image',
      public_id: (req, file) => {
        // Generar un ID único
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        return `${folder}_${timestamp}_${randomString}`;
      },
      transformation: function(req, file) {
        // Solo aplicar transformaciones a imágenes
        if (file.mimetype.startsWith('image/')) {
          return [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ];
        }
        return [];
      }
    },
  });
};

// Storage específico para cada tipo
const photoStorage = createCloudinaryStorage('photos', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
const documentStorage = createCloudinaryStorage('documents', ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']);

// Función para eliminar archivo de Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Archivo eliminado de Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Error eliminando de Cloudinary:', error);
    throw error;
  }
};

// Función para obtener URL optimizada
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  photoStorage,
  documentStorage,
  deleteFromCloudinary,
  getOptimizedUrl
};
