/* Render a sample money-receipt to PNG so we can eyeball the design. */
import puppeteer from 'puppeteer';
import path from 'path';
import { InvoiceService } from '../app/modules/invoice/invoice.service';

const OUT = process.argv[2] || path.join(process.cwd(), 'receipt-sample.png');

const sample = {
  invoiceNumber: 'INS-3F9A2C',
  date: '09 Jul 2026',
  studentName: 'Rakib Hasan',
  studentEmail: 'rakib.hasan@gmail.com',
  studentPhone: '+880 1712-345678',
  courseName: 'Computer & Spoken English Combo (SSC Special)',
  courseType: 'Offline • South Badda (Dhaka)',
  batchName: 'Batch-07 (Morning)',
  paymentMethod: 'bkash',
  transactionId: 'BKH8X2K9Q\
',
  paidAt: '09 Jul 2026, 11:42 AM',
  status: 'Pending',
  // invoice-download "account statement" shape: line amount = total paid so far
  receiptType: 'admission' as const,
  amount: 8000,
  totalFee: 12000,
  dueAmount: 4000,
};

(async () => {
  const html = InvoiceService.generateInvoiceHTML(sample);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 840, height: 1100, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: OUT, fullPage: true });
  await browser.close();
  console.log('WROTE', OUT);
})();
