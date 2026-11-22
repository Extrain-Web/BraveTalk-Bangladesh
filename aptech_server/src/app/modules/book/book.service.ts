/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Book, BookOrder, IBook } from './book.model';
import { User } from '../user/user.model';
import { NotificationService } from '../notification/notification.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const slugify = (s: string) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || `book-${Date.now()}`;

export const effectivePrice = (b: any): number => {
  if (b.isFree) return 0;
  const offer = Number(b.offerPrice) || 0;
  return offer > 0 && offer < Number(b.price) ? offer : Number(b.price) || 0;
};

/** Public view: hide locked video links and the full PDF. */
const toPublic = (b: any) => {
  const videos = [...(b.videos || [])].sort((x: any, y: any) => (x.order ?? 0) - (y.order ?? 0));
  const { pdfUrl, ...rest } = b;
  return {
    ...rest,
    hasPdf: !!pdfUrl,
    finalPrice: effectivePrice(b),
    videoCount: videos.length,
    previewCount: videos.filter((v: any) => v.isPreview).length,
    videos: videos.map((v: any) => ({
      _id: v._id,
      title: v.title,
      duration: v.duration,
      order: v.order,
      isPreview: !!v.isPreview,
      locked: !v.isPreview,
      youtubeUrl: v.isPreview ? v.youtubeUrl : undefined,
    })),
  };
};

const findBook = async (idOrSlug: string, includeDrafts = false) => {
  const base: any = { isDeleted: false };
  if (!includeDrafts) base.status = 'published';
  if (Types.ObjectId.isValid(idOrSlug)) {
    const b = await Book.findOne({ ...base, _id: idOrSlug }).lean();
    if (b) return b;
  }
  if (/^\d+$/.test(idOrSlug)) {
    const b = await Book.findOne({ ...base, id: Number(idOrSlug) }).lean();
    if (b) return b;
  }
  return Book.findOne({ ...base, slug: idOrSlug }).lean();
};

const hasApprovedOrder = async (studentId: string, bookId: any) =>
  !!(await BookOrder.exists({ studentId, bookId, status: 'approved', isDeleted: false }));

const genOrderNo = () =>
  `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// ─── Public ──────────────────────────────────────────────────────────────────
const getPublicBooks = async (q: { search?: string; type?: string }) => {
  const filter: any = { status: 'published', isDeleted: false };
  if (q.search) filter.$or = [{ title: { $regex: q.search, $options: 'i' } }, { author: { $regex: q.search, $options: 'i' } }];
  if (q.type === 'free') filter.isFree = true;
  if (q.type === 'paid') filter.isFree = false;
  if (q.type === 'printed') filter.format = { $in: ['printed', 'both'] };
  if (q.type === 'digital') filter.format = { $in: ['digital', 'both'] };
  const books = await Book.find(filter).sort({ createdAt: -1 }).lean();
  return books.map(toPublic);
};

const getPublicBook = async (idOrSlug: string) => {
  const b = await findBook(idOrSlug);
  if (!b) throw new Error('Book not found');
  return toPublic(b);
};

// ─── Student ─────────────────────────────────────────────────────────────────
/** Full content (all videos + PDF) — only for free books or approved orders. */
const getBookContent = async (studentId: string, role: string, idOrSlug: string) => {
  const b: any = await findBook(idOrSlug, ['admin', 'superAdmin', 'trainingManager'].includes(role));
  if (!b) throw new Error('Book not found');
  const isStaff = ['admin', 'superAdmin', 'trainingManager'].includes(role);
  const owned = b.isFree || isStaff || (await hasApprovedOrder(studentId, b._id));
  const pub = toPublic(b);
  if (!owned) return { ...pub, hasAccess: false };
  const videos = [...(b.videos || [])].sort((x: any, y: any) => (x.order ?? 0) - (y.order ?? 0));
  return { ...pub, hasAccess: true, pdfUrl: b.pdfUrl, videos: videos.map((v: any) => ({ ...v, locked: false })) };
};

/** Access + order state for the book detail page buttons. */
const getMyBookStatus = async (studentId: string, idOrSlug: string) => {
  const b: any = await findBook(idOrSlug);
  if (!b) throw new Error('Book not found');
  const orders = await BookOrder.find({ studentId, bookId: b._id, isDeleted: false }).sort({ createdAt: -1 }).lean();
  return {
    hasAccess: b.isFree ? orders.some((o: any) => o.status === 'approved') : orders.some((o: any) => o.status === 'approved'),
    pendingOrder: orders.find((o: any) => o.status === 'pending') || null,
    orders,
  };
};

/** Free books: add to the student's library instantly (approved, no payment). */
const claimFreeBook = async (studentId: string, idOrSlug: string) => {
  const b: any = await findBook(idOrSlug);
  if (!b) throw new Error('Book not found');
  if (!b.isFree) throw new Error('This book is not free');
  const existing = await BookOrder.findOne({ studentId, bookId: b._id, status: 'approved', isDeleted: false });
  if (existing) return existing;
  const order = await BookOrder.create({
    orderNo: genOrderNo(),
    studentId,
    bookId: b._id,
    bookTitle: b.title,
    format: 'digital',
    amount: 0,
    payment: { method: 'free', status: 'paid', paidAt: new Date() },
    status: 'approved',
    approvedAt: new Date(),
  });
  await Book.updateOne({ _id: b._id }, { $inc: { totalSales: 1 } });
  return order;
};

const createOrder = async (studentId: string, payload: any) => {
  const b: any = await findBook(payload.bookId);
  if (!b) throw new Error('Book not found');
  if (b.isFree) return claimFreeBook(studentId, String(b._id));

  const format: 'printed' | 'digital' =
    b.format === 'both' ? (payload.format === 'printed' ? 'printed' : 'digital') : b.format;
  const quantity = format === 'printed' ? Math.max(1, Math.min(10, Number(payload.quantity) || 1)) : 1;

  if (format === 'printed') {
    if ((b.stock || 0) < quantity) throw new Error('Sorry, this book is out of stock');
    const s = payload.shipping || {};
    if (!s.name || !s.phone || !s.address) throw new Error('Delivery name, phone and address are required');
  }
  if (format === 'digital' && (await hasApprovedOrder(studentId, b._id))) {
    throw new Error('You already own this book');
  }
  const pay = payload.payment || {};
  if (!pay.transactionId || !pay.senderNumber) throw new Error('Sender number and transaction ID are required');

  const order = await BookOrder.create({
    orderNo: genOrderNo(),
    studentId,
    bookId: b._id,
    bookTitle: b.title,
    format,
    quantity,
    amount: effectivePrice(b) * quantity,
    payment: {
      method: 'manual',
      paymentType: pay.paymentType,
      senderNumber: pay.senderNumber,
      transactionId: pay.transactionId,
      status: 'pending',
    },
    shipping: format === 'printed' ? payload.shipping : undefined,
    status: 'pending',
  });

  try {
    const u: any = await User.findById(studentId).select('firstName lastName name').lean();
    const name = `${u?.firstName || u?.name || 'Student'} ${u?.lastName || ''}`.trim();
    const adminIds = await NotificationService.getAdminUserIds();
    if (adminIds.length) {
      await NotificationService.createBulk(
        adminIds,
        'payment',
        '📚 নতুন বই অর্ডার!',
        `${name} "${b.title}" বইটি ৳${order.amount.toLocaleString()} দিয়ে অর্ডার করেছে।`,
        '/dashboard/admin/orders'
      );
    }
  } catch { /* notifications never block an order */ }

  try {
    await NotificationService.create(
      String(studentId),
      'payment',
      '🧾 Book order received',
      `Thanks! Your order #${order.orderNo} for "${b.title}" (৳${order.amount.toLocaleString()}) is placed. We'll add it to My Books once your payment is verified.`,
      '/dashboard/user/books'
    );
  } catch { /* never block an order */ }

  return order;
};

const getMyOrders = async (studentId: string) =>
  BookOrder.find({ studentId, isDeleted: false })
    .populate('bookId', 'title slug coverImage author format id')
    .sort({ createdAt: -1 })
    .lean();

/** "My Books": every book the student can open. */
const getMyLibrary = async (studentId: string) => {
  const orders = await BookOrder.find({ studentId, status: 'approved', isDeleted: false }).lean();
  const ids = [...new Set(orders.map((o: any) => String(o.bookId)))];
  const books = await Book.find({ _id: { $in: ids }, isDeleted: false }).lean();
  return books.map((b: any) => {
    const p = toPublic(b);
    const o: any = orders.find((x: any) => String(x.bookId) === String(b._id));
    return { ...p, hasAccess: true, orderedAt: o?.approvedAt || o?.createdAt, orderFormat: o?.format, deliveryStatus: o?.deliveryStatus };
  });
};

// ─── Admin: books ────────────────────────────────────────────────────────────
const normaliseVideos = (videos: any[] = []) =>
  videos
    .filter((v) => v && v.title && v.youtubeUrl)
    .map((v, i) => ({
      ...(v._id && Types.ObjectId.isValid(v._id) ? { _id: v._id } : {}),
      title: String(v.title).trim(),
      youtubeUrl: String(v.youtubeUrl).trim(),
      duration: v.duration,
      notes: v.notes,
      pdfUrl: v.pdfUrl,
      isPreview: !!v.isPreview,
      order: i,
    }));

const adminList = async () => {
  const books = await Book.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
  const counts = await BookOrder.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: { book: '$bookId', status: '$status' }, n: { $sum: 1 }, amount: { $sum: '$amount' } } },
  ]);
  return books.map((b: any) => {
    const mine = counts.filter((c: any) => String(c._id.book) === String(b._id));
    const pending = mine.find((c: any) => c._id.status === 'pending')?.n || 0;
    const approved = mine.find((c: any) => c._id.status === 'approved');
    return { ...b, finalPrice: effectivePrice(b), pendingOrders: pending, approvedOrders: approved?.n || 0, revenue: approved?.amount || 0 };
  });
};

const adminGet = async (idOrSlug: string) => {
  const b = await findBook(idOrSlug, true);
  if (!b) throw new Error('Book not found');
  return b;
};

const createBook = async (payload: Partial<IBook>) => {
  if (!payload.title || !payload.author || !payload.coverImage || !payload.description) {
    throw new Error('Title, author, cover image and description are required');
  }
  const last = await Book.findOne().sort({ id: -1 }).select('id').lean();
  let slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
  if (await Book.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
  return Book.create({
    ...payload,
    id: (last?.id || 2000) + 1,
    slug,
    price: payload.isFree ? 0 : Number(payload.price) || 0,
    videos: normaliseVideos(payload.videos as any[]),
  });
};

const updateBook = async (idOrSlug: string, payload: any) => {
  const b: any = await findBook(idOrSlug, true);
  if (!b) throw new Error('Book not found');
  const before = (b.videos || []).length;
  const update: any = { ...payload };
  delete update._id; delete update.id; delete update.totalSales;
  if (update.slug) update.slug = slugify(update.slug);
  if (update.videos) update.videos = normaliseVideos(update.videos);
  if (update.isFree) update.price = 0;
  const saved = await Book.findByIdAndUpdate(b._id, update, { new: true });

  // Tell owners when new lessons were added
  const added = (saved?.videos?.length || 0) - before;
  if (added > 0 && saved?.status === 'published') {
    try {
      const owners = await BookOrder.distinct('studentId', { bookId: b._id, status: 'approved', isDeleted: false });
      if (owners.length) {
        await NotificationService.createBulk(
          owners.map(String),
          'system',
          '🎬 নতুন ভিডিও যোগ হয়েছে',
          `"${saved.title}" বইয়ে ${added}টি নতুন ভিডিও যোগ করা হয়েছে।`,
          `/dashboard/user/books/${saved.slug}`
        );
      }
    } catch { /* ignore */ }
  }
  return saved;
};

const deleteBook = async (idOrSlug: string) => {
  const b: any = await findBook(idOrSlug, true);
  if (!b) throw new Error('Book not found');
  return Book.findByIdAndUpdate(b._id, { isDeleted: true }, { new: true });
};

// ─── Admin: orders ───────────────────────────────────────────────────────────
const adminOrders = async (q: { status?: string }) => {
  const filter: any = { isDeleted: false };
  if (q.status && q.status !== 'all') filter.status = q.status;
  return BookOrder.find(filter)
    .populate('studentId', 'firstName lastName name email phoneNumber')
    .populate('bookId', 'title coverImage format stock slug')
    .sort({ createdAt: -1 })
    .lean();
};

const approveOrder = async (orderId: string) => {
  const order: any = await BookOrder.findById(orderId);
  if (!order || order.isDeleted) throw new Error('Order not found');
  if (order.status === 'approved') throw new Error('Order already approved');
  const book: any = await Book.findById(order.bookId);
  if (!book) throw new Error('Book not found');
  if (order.format === 'printed') {
    if ((book.stock || 0) < order.quantity) throw new Error(`Not enough stock (only ${book.stock} left)`);
    book.stock -= order.quantity;
    order.deliveryStatus = 'processing';
  }
  book.totalSales = (book.totalSales || 0) + order.quantity;
  await book.save();

  order.status = 'approved';
  order.approvedAt = new Date();
  order.payment.status = 'paid';
  order.payment.paidAt = new Date();
  await order.save();

  try {
    await NotificationService.create(
      String(order.studentId),
      'payment',
      '✅ বই অর্ডার কনফার্ম হয়েছে',
      `"${book.title}" বইয়ের পেমেন্ট যাচাই হয়েছে। এখন "আমার বই" থেকে ভিডিও দেখতে পারবেন।`,
      `/dashboard/user/books/${book.slug}`
    );
  } catch { /* ignore */ }
  return order;
};

const cancelOrder = async (orderId: string) => {
  const order: any = await BookOrder.findById(orderId);
  if (!order || order.isDeleted) throw new Error('Order not found');
  if (order.status === 'approved' && order.format === 'printed' && order.deliveryStatus !== 'delivered') {
    await Book.updateOne({ _id: order.bookId }, { $inc: { stock: order.quantity, totalSales: -order.quantity } });
  }
  order.status = 'cancelled';
  await order.save();
  return order;
};

const setDelivery = async (orderId: string, deliveryStatus: string) => {
  if (!['processing', 'shipped', 'delivered'].includes(deliveryStatus)) throw new Error('Invalid delivery status');
  const order = await BookOrder.findByIdAndUpdate(orderId, { deliveryStatus }, { new: true });
  if (!order) throw new Error('Order not found');
  return order;
};

const stats = async () => {
  const [books, agg, lowStock] = await Promise.all([
    Book.countDocuments({ isDeleted: false }),
    BookOrder.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', n: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
    Book.find({ isDeleted: false, format: { $in: ['printed', 'both'] }, stock: { $lte: 5 } }).select('title stock').lean(),
  ]);
  const get = (s: string) => agg.find((a: any) => a._id === s) || { n: 0, amount: 0 };
  return {
    totalBooks: books,
    pendingOrders: get('pending').n,
    approvedOrders: get('approved').n,
    revenue: get('approved').amount,
    lowStock,
  };
};

export const BookService = {
  getPublicBooks, getPublicBook, getBookContent, getMyBookStatus, claimFreeBook,
  createOrder, getMyOrders, getMyLibrary,
  adminList, adminGet, createBook, updateBook, deleteBook,
  adminOrders, approveOrder, cancelOrder, setDelivery, stats,
};
