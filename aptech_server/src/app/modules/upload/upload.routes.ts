/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import { uploadImage } from '../../config/cloudinary';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// POST /api/upload/image — single image upload (Cloudinary), returns hosted URL
// Field name: "image"
router.post(
  '/image',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  uploadImage.single('image'),
  (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file || !file.path) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    // Cloudinary multer storage puts the hosted URL in file.path
    res.status(200).json({ success: true, data: { url: file.path } });
  }
);

export const UploadRoutes = router;
