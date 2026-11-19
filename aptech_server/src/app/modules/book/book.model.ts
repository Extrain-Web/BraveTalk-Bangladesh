import { Schema, model, Types } from 'mongoose';

// ─── Book ────────────────────────────────────────────────────────────────────
// A book can be printed, digital (PDF) or both, Free or Paid, and can carry a
// list of lesson videos (YouTube links). Only the preview videos are public;
// the rest unlock after an approved order (or instantly for a free book).

export interface IBookVideo {
  _id?: Types.ObjectId;
  title: string;
  youtubeUrl: string;
  duration?: string;
  notes?: string;
  pdfUrl?: string;
  isPreview: boolean;
  order: number;
}

export interface IBook {
  id: number;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  shortDescription?: string;
  description: string;
  format: 'printed' | 'digital' | 'both';
  isFree: boolean;
  price: number;
  offerPrice?: number;
  stock: number;
  pdfUrl?: string;        // full digital book — only for owners
  samplePdfUrl?: string;  // public sample pages
  pages?: number;
  language?: string;
  category?: string;
  videos: IBookVideo[];
  status: 'draft' | 'published';
  totalSales: number;
  isDeleted: boolean;
}

const videoSchema = new Schema<IBookVideo>(
  {
    title: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    notes: { type: String },
    pdfUrl: { type: String },
    isPreview: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const bookSchema = new Schema<IBook>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, required: true },
    format: { type: String, enum: ['printed', 'digital', 'both'], default: 'digital' },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    offerPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    pdfUrl: { type: String },
    samplePdfUrl: { type: String },
    pages: { type: Number },
    language: { type: String, default: 'Bangla' },
    category: { type: String, trim: true },
    videos: { type: [videoSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    totalSales: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookSchema.index({ status: 1, isDeleted: 1 });

export const Book = model<IBook>('Book', bookSchema);

// ─── Book Order ──────────────────────────────────────────────────────────────
export interface IBookOrder {
  orderNo: string;
  studentId: Types.ObjectId;
  bookId: Types.ObjectId;
  bookTitle: string;
  format: 'printed' | 'digital';
  quantity: number;
  amount: number;
  payment: {
    method: 'manual' | 'bkash' | 'free' | 'cash';
    paymentType?: string;     // bkash / nagad / rocket (manual send money)
    senderNumber?: string;
    transactionId?: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paidAt?: Date;
  };
  shipping?: { name?: string; phone?: string; address?: string; city?: string; note?: string };
  status: 'pending' | 'approved' | 'cancelled';
  deliveryStatus?: 'processing' | 'shipped' | 'delivered';
  approvedAt?: Date;
  isDeleted: boolean;
}

const bookOrderSchema = new Schema<IBookOrder>(
  {
    orderNo: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true },
    format: { type: String, enum: ['printed', 'digital'], required: true },
    quantity: { type: Number, default: 1, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    payment: {
      method: { type: String, enum: ['manual', 'bkash', 'free', 'cash'], required: true },
      paymentType: { type: String },
      senderNumber: { type: String },
      transactionId: { type: String },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      paidAt: { type: Date },
    },
    shipping: {
      name: String,
      phone: String,
      address: String,
      city: String,
      note: String,
    },
    status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
    deliveryStatus: { type: String, enum: ['processing', 'shipped', 'delivered'] },
    approvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookOrderSchema.index({ studentId: 1, bookId: 1 });
bookOrderSchema.index({ status: 1 });

export const BookOrder = model<IBookOrder>('BookOrder', bookOrderSchema);
