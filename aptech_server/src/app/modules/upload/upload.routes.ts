/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../../config/cloudinary';
import { uploadFileLocal } from '../../config/localUpload';
import config from '../../config';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// Cloudinary is used only when all three keys are configured; otherwise files are
// stored on this server (/uploads/materials, a persistent volume on Coolify).
const cloudinaryReady = () =>
  !!(config.cloudinary.cloud_name && config.cloudinary.api_key && config.cloudinary.api_secret);

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

const pickStorage = (field: string) => (req: Request, res: Response, next: NextFunction) => {
  const mw = cloudinaryReady() ? uploadImage.single(field) : uploadFileLocal.single(field);
  mw(req, res, (err: any) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    next();
  });
};

const fileUrl = (req: Request, file: any) => {
  if (file?.filename && !cloudinaryReady()) {
    // Behind Coolify's proxy the original scheme arrives in x-forwarded-proto
    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || req.protocol;
    return `${proto}://${req.get('host')}/uploads/materials/${file.filename}`;
  }
  return file?.path || file?.url;
};

// POST /api/upload/image — single image upload, returns a hosted URL. Field name: "image"
router.post(
  '/image',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  pickStorage('image'),
  (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, message: 'No image file provided' });
    if (!cloudinaryReady() && !IMAGE_RE.test(file.originalname || '')) {
      return res.status(400).json({ success: false, message: 'Please upload an image (jpg, png, webp, gif, svg)' });
    }
    res.status(200).json({ success: true, data: { url: fileUrl(req, file) } });
  }
);

export const UploadRoutes = router;
