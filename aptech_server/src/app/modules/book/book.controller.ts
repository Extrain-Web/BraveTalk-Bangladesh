/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { BookService } from './book.service';

// Small wrapper: every handler returns { success, data } or { success:false, message }
const handle =
  (fn: (req: Request) => Promise<any>, okStatus = 200) =>
  async (req: Request, res: Response) => {
    try {
      const data = await fn(req);
      res.status(okStatus).json({ success: true, data });
    } catch (e: any) {
      const msg = e?.message || 'Something went wrong';
      const status = /not found/i.test(msg) ? 404 : 400;
      res.status(status).json({ success: false, message: msg });
    }
  };

const uid = (req: Request) => String((req as any).user?._id || (req as any).user?.id || '');
const role = (req: Request) => String((req as any).user?.role || '');

export const BookController = {
  // public
  list: handle((req) => BookService.getPublicBooks({ search: req.query.search as string, type: req.query.type as string })),
  getOne: handle((req) => BookService.getPublicBook(req.params.id)),

  // student
  content: handle((req) => BookService.getBookContent(uid(req), role(req), req.params.id)),
  myStatus: handle((req) => BookService.getMyBookStatus(uid(req), req.params.id)),
  claimFree: handle((req) => BookService.claimFreeBook(uid(req), req.params.id), 201),
  createOrder: handle((req) => BookService.createOrder(uid(req), req.body), 201),
  myOrders: handle((req) => BookService.getMyOrders(uid(req))),
  myLibrary: handle((req) => BookService.getMyLibrary(uid(req))),

  // admin: books
  adminList: handle(() => BookService.adminList()),
  adminGet: handle((req) => BookService.adminGet(req.params.id)),
  create: handle((req) => BookService.createBook(req.body), 201),
  update: handle((req) => BookService.updateBook(req.params.id, req.body)),
  remove: handle((req) => BookService.deleteBook(req.params.id)),

  // admin: orders
  adminOrders: handle((req) => BookService.adminOrders({ status: req.query.status as string })),
  approve: handle((req) => BookService.approveOrder(req.params.orderId)),
  cancel: handle((req) => BookService.cancelOrder(req.params.orderId)),
  delivery: handle((req) => BookService.setDelivery(req.params.orderId, req.body?.deliveryStatus)),
  stats: handle(() => BookService.stats()),

  // admin: file upload (cover image / PDF) → local /uploads/materials
  upload: (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const base = `${req.protocol}://${req.get('host')}`;
    res.status(200).json({ success: true, data: { url: `${base}/uploads/materials/${file.filename}`, name: file.originalname } });
  },
};
