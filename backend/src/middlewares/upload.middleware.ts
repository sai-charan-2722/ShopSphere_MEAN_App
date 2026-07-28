import multer from 'multer';
import { HttpError } from '../types';

/**
 * Multer configured with in-memory storage.
 * Render's free tier has an ephemeral filesystem, so files are streamed
 * directly from memory to Cloudinary — never written to disk.
 */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError(400, 'Only JPG, PNG and WEBP images are allowed'));
  }
}

/** Product images: up to 5 files, 5MB each. */
export const uploadProductImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array('images', 5);

/** Single avatar image, 2MB max. */
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single('avatar');

/** Single category image, 2MB max. */
export const uploadCategoryImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single('image');

/** Review images: up to 3 files, 3MB each. */
export const uploadReviewImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 3 },
}).array('images', 3);
