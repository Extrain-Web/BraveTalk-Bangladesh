import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { UserRoutes } from './app/modules/user/user.route';
import { StudentRoutes } from './app/modules/student/student.route';
import { MentorRoutes } from './app/modules/mentor/mentor.routes';
import { CourseRoutes } from './app/modules/courses/course.routes';
import { BookRoutes } from './app/modules/book/book.routes';
import { CategoryRoutes } from './app/modules/courseCategory/courseCategory.routes';
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { CertificateRoutes } from './app/modules/certificate/certificate.routes';
import { BatchRoutes } from './app/modules/batch/batch.routes';
import { BlogRoutes } from './app/modules/blog/blog.routes';
import { ContactRoutes } from './app/modules/contact/contact.routes';
import { SiteContentRoutes } from './app/modules/siteContent/siteContent.route';
import { SettingsRoutes } from './app/modules/settings/settings.routes';
import { ModuleRoutes } from './app/modules/courseModule/courseModule.routes';
import { LessonRoutes } from './app/modules/lesson/lesson.routes';
import { EnrollmentRoutes } from './app/modules/enrollment/enrollment.routes';
import { PaymentRoutes } from './app/modules/payment/payment.routes';
import { InvoiceRoutes } from './app/modules/invoice/invoice.routes';
import { InstallmentRoutes } from './app/modules/installment/installment.routes';
import { ClassScheduleRoutes } from './app/modules/classSchedule/classSchedule.routes';
import { AttendanceRoutes } from './app/modules/attendance/attendance.routes';
import { ExamRoutes } from './app/modules/exam/exam.routes';
import { AssignmentRoutes } from './app/modules/assignment/assignment.routes';
import { AnalyticsRoutes } from './app/modules/analytics/analytics.routes';
import { NotificationRoutes } from './app/modules/notification/notification.routes';
import { ChatbotRoutes } from './app/modules/chatbot/chatbot.routes';
import { ReviewRoutes } from './app/modules/review/review.routes';
import { UploadRoutes } from './app/modules/upload/upload.routes';
import { CourseCouponRoutes } from './app/modules/coupon/coupon.route';
import { NoticeRoutes } from './app/modules/notice/notice.route';
import { PartnerRoutes } from './app/modules/partner/partner.route';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();

// Behind Coolify's reverse proxy: trust X-Forwarded-* so req.protocol is https and
// uploaded-file URLs / rate limiting use the real client info.
app.set('trust proxy', 1);

// ✅ Security: Helmet (HTTP headers)
app.use(helmet());

// ✅ Security: CORS
const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5005',
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Security: Rate Limiting (global — 500 req per 15min per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // increase for dev — reduce to 100 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// ✅ Security: Auth Rate Limiting (stricter — failed attempts per 15min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // dev-friendly; reduce to ~10 in production
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed logins toward the limit
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ✅ Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Serve locally-uploaded files (class materials / recordings / PDFs)
// CORP override so the client origin (3000) can embed/download these from the server (5000).
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// ✅ Security: NoSQL Injection Prevention
app.use(mongoSanitize());

// ─── Application Routes ─────────────────────────────────────
app.use('/api/user', UserRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/mentors', MentorRoutes);
app.use('/api/courses', CourseRoutes);
app.use('/api/books', BookRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/certificate', CertificateRoutes);
app.use('/api/batches', BatchRoutes);
app.use('/api/blogs', BlogRoutes);
app.use('/api/contacts', ContactRoutes);
app.use('/api/site-content', SiteContentRoutes);
app.use('/api/settings', SettingsRoutes);
// ── LMS Core Routes (Phase 2) ────────────────────────────────
app.use('/api/modules', ModuleRoutes);
app.use('/api/lessons', LessonRoutes);
app.use('/api/enrollments', EnrollmentRoutes);
app.use('/api/payment', PaymentRoutes);
app.use('/api/invoice', InvoiceRoutes);
app.use('/api/installments', InstallmentRoutes);
app.use('/api/classes', ClassScheduleRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/exams', ExamRoutes);
app.use('/api/assignments', AssignmentRoutes);
app.use('/api/analytics', AnalyticsRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api/chatbot', ChatbotRoutes);
app.use('/api/reviews', ReviewRoutes);
app.use('/api/upload', UploadRoutes);
app.use('/api/coupon', CourseCouponRoutes);
app.use('/api/notices', NoticeRoutes);
app.use('/api/partners', PartnerRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'BraveTalk Bangladesh Server is running! 🚀' });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
