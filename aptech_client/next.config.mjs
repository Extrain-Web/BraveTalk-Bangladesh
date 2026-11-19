/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  images: {
    remotePatterns: [
      // Local development (frontend public files + backend /uploads)
      { protocol: "http", hostname: "localhost" },
      // Live site on Coolify (temporary sslip.io address) — add the real domain here later
      { protocol: "https", hostname: "**.sslip.io" },
      {
        protocol: "https",
        hostname: "api.bdcallingacademy.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'tailwindcss': path.resolve(__dirname, 'node_modules/tailwindcss'),
      '@tailwindcss/postcss': path.resolve(__dirname, 'node_modules/@tailwindcss/postcss'),
    };
    return config;
  },
  turbopack: {},
  // IELTS / mock tests were removed from this site — send old links somewhere useful.
  async redirects() {
    return [
      { source: "/ielts", destination: "/courses", permanent: false },
      { source: "/ielts/:path*", destination: "/courses", permanent: false },
      { source: "/mock-test", destination: "/courses", permanent: false },
      { source: "/mock-test/:path*", destination: "/courses", permanent: false },
      { source: "/mock-exam/:path*", destination: "/courses", permanent: false },
      { source: "/dashboard/user/mock-tests", destination: "/dashboard/user", permanent: false },
      { source: "/dashboard/user/mock-tests/:path*", destination: "/dashboard/user", permanent: false },
      { source: "/dashboard/admin/ielts", destination: "/dashboard/admin", permanent: false },
      { source: "/dashboard/admin/ielts/:path*", destination: "/dashboard/admin", permanent: false },
      { source: "/success-story", destination: "/", permanent: false },
      { source: "/dashboard/admin/site-images", destination: "/dashboard/admin/site-content/images", permanent: false },
      { source: "/dashboard/admin/payment-progress", destination: "/dashboard/admin/payments", permanent: false },
      { source: "/dashboard/admin/payment-progress/:path*", destination: "/dashboard/admin/payments", permanent: false },
      { source: "/dashboard/admin/:page(batch-analytics|student-progress|feedback|reviews|partners)", destination: "/dashboard/admin", permanent: false },
      { source: "/dashboard/admin/:page(student-progress)/:path*", destination: "/dashboard/admin", permanent: false },
      { source: "/dashboard/training-manager/:page(batch-analytics|student-progress|payment-progress)/:path*", destination: "/dashboard/training-manager", permanent: false },
      { source: "/dashboard/training-manager/:page(batch-analytics|student-progress|payment-progress)", destination: "/dashboard/training-manager", permanent: false },
    ];
  },
};

export default nextConfig;


