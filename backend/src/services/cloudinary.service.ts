import { cloudinary } from '../config/cloudinary';

/**
 * Stream a single in-memory file buffer to Cloudinary and return its secure URL.
 */
export const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shopsphere/${folder}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload failed'));
        else resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
};

/** Upload many files in parallel, preserving order. */
export const uploadManyToCloudinary = (files: Express.Multer.File[], folder: string): Promise<string[]> => {
  return Promise.all(files.map((f) => uploadToCloudinary(f, folder)));
};

/** Best-effort delete of an image by its Cloudinary secure URL. */
export const deleteFromCloudinary = async (secureUrl: string): Promise<void> => {
  const publicId = extractPublicId(secureUrl);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Cloudinary delete failed for', secureUrl, err);
  }
};

/**
 * Extract the Cloudinary public_id (including folder path, without extension)
 * from a secure URL such as
 * https://res.cloudinary.com/<cloud>/image/upload/v123/shopsphere/products/abc.jpg
 */
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}
