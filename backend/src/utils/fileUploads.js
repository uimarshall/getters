import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// configure multer-storage-cloudinary

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gethub',
    transformations: [{ width: 500, height: 500, crop: 'limit' }],
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

const fileUpload = multer({ storage });
export default fileUpload;
