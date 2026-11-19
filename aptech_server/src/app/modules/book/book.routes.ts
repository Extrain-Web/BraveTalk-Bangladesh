import express from 'express';
import { BookController } from './book.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadFileLocal } from '../../config/localUpload';

const router = express.Router();
const admin = [authMiddleware, authorize('admin', 'trainingManager')];

// ── Admin (static paths first so they never clash with /:id) ──
router.get('/admin/all', ...admin, BookController.adminList);
router.get('/admin/stats', ...admin, BookController.stats);
router.get('/admin/orders', ...admin, BookController.adminOrders);
router.patch('/admin/orders/:orderId/approve', ...admin, BookController.approve);
router.patch('/admin/orders/:orderId/cancel', ...admin, BookController.cancel);
router.patch('/admin/orders/:orderId/delivery', ...admin, BookController.delivery);
router.post('/admin/upload', ...admin, uploadFileLocal.single('file'), BookController.upload);
router.get('/admin/:id', ...admin, BookController.adminGet);
router.post('/', ...admin, BookController.create);
router.patch('/:id', ...admin, BookController.update);
router.delete('/:id', ...admin, BookController.remove);

// ── Student ──
router.get('/my/library', authMiddleware, BookController.myLibrary);
router.get('/my/orders', authMiddleware, BookController.myOrders);
router.post('/orders', authMiddleware, BookController.createOrder);
router.get('/:id/content', authMiddleware, BookController.content);
router.get('/:id/my-status', authMiddleware, BookController.myStatus);
router.post('/:id/claim-free', authMiddleware, BookController.claimFree);

// ── Public ──
router.get('/', BookController.list);
router.get('/:id', BookController.getOne);

export const BookRoutes = router;
