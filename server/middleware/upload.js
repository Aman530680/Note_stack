const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'notestack',
    resource_type: 'auto',
    format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
    public_id: `note-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDF files allowed'), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });
