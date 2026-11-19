'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LuSearch, LuCircleCheck, LuCircleX, LuShieldCheck, LuLoaderCircle, LuQrCode, LuClock, LuArrowRight } from 'react-icons/lu';
import { useLanguage } from '@/context/LanguageContext';
import PhotoBanner from '@/components/Shared/PhotoBanner';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

const fmt = (d, bn) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString(bn ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const bn = isBn ? 'hind-siliguri' : '';
  const L = (en, bnText) => (isBn ? bnText : en);

  const [certId, setCertId] = useState(initialId);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verify = useCallback(async (id) => {
    const clean = String(id || '').trim();
    if (!clean) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API}/certificate/verify/${encodeURIComponent(clean)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, message: 'Error verifying', error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) verify(initialId);
  }, [initialId, verify]);

  const handleSubmit = (e) => { e.preventDefault(); verify(certId); };

  const status = result?.certificate?.status;
  const statusText = result?.valid
    ? L('This certificate is valid and was issued by BraveTalk Bangladesh.', 'এই সার্টিফিকেটটি বৈধ এবং ব্রেভটক বাংলাদেশ কর্তৃক প্রদত্ত।')
    : result?.error
      ? L('Could not verify right now. Please try again.', 'এখন যাচাই করা যাচ্ছে না। আবার চেষ্টা করুন।')
      : status === 'revoked'
        ? L('This certificate has been revoked.', 'এই সার্টিফিকেটটি বাতিল করা হয়েছে।')
        : status === 'pending'
          ? L('This certificate is waiting for activation.', 'এই সার্টিফিকেটটি এখনো সক্রিয় হয়নি।')
          : L('No certificate was found with this ID. Please check it and try again.', 'এই আইডিতে কোনো সার্টিফিকেট পাওয়া যায়নি। আইডিটি দেখে আবার চেষ্টা করুন।');

  const cert = result?.certificate;
  const rows = cert
    ? [
        [L('Certificate ID', 'সার্টিফিকেট আইডি'), cert.id],
        [L('Student name', 'শিক্ষার্থীর নাম'), cert.studentName],
        [L('Course', 'কোর্স'), cert.courseName],
        [L('Batch', 'ব্যাচ'), cert.batchNumber],
        [L('Duration', 'সময়কাল'), `${fmt(cert.startDate, isBn)} — ${fmt(cert.endDate, isBn)}`],
        [L('Issue date', 'প্রদানের তারিখ'), fmt(cert.issueDate, isBn)],
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PhotoBanner
        slot="pageBanner"
        eyebrow={L('Certificate verification', 'সার্টিফিকেট যাচাই')}
        crumbs={[{ label: L('Verify certificate', 'সার্টিফিকেট যাচাই') }]}
        title={isBn ? <>সার্টিফিকেট <span className="text-[#ff6b63]">যাচাই করুন</span></> : <>Verify a <span className="text-[#ff6b63]">Certificate</span></>}
        subtitle={L(
          'Enter the certificate ID printed on the certificate, or scan its QR code, to check that it is genuine.',
          'সার্টিফিকেটে ছাপা আইডি লিখুন অথবা QR কোড স্ক্যান করুন — সার্টিফিকেটটি আসল কিনা যাচাই করুন।'
        )}
      />

      <section className="mx-auto max-w-[680px] px-4 sm:px-6 py-12 lg:py-16">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 border-t-[3px] border-t-[#0142b2] bg-white p-4 sm:p-5 shadow-md">
          <label htmlFor="certId" className={`mb-2 block text-sm font-medium text-slate-700 work ${bn}`}>
            {L('Certificate ID', 'সার্টিফিকেট আইডি')}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <LuShieldCheck className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
              <input
                id="certId"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. BT-CERT-0001"
                className="w-full rounded-md border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-medium uppercase text-[#0b1b4a] outline-none transition placeholder:normal-case focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10 work"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certId.trim()}
              className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0142b2] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] disabled:cursor-not-allowed disabled:opacity-60 work ${bn}`}
            >
              {loading ? <LuLoaderCircle className="animate-spin text-base" /> : <LuSearch className="text-base" />}
              {L('Verify', 'যাচাই করুন')}
            </button>
          </div>
        </form>

        {/* Result */}
        {searched && !loading && result && (
          <div
            className={`mt-6 overflow-hidden rounded-md border bg-white shadow-sm ${
              result.valid ? 'border-emerald-200' : status === 'pending' ? 'border-amber-200' : 'border-red-200'
            }`}
          >
            <div
              className={`flex items-start gap-4 p-5 sm:p-6 ${
                result.valid ? 'bg-emerald-50/70' : status === 'pending' ? 'bg-amber-50/70' : 'bg-red-50/70'
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ${
                  result.valid ? 'text-[#027a1e]' : status === 'pending' ? 'text-amber-500' : 'text-[#e5251f]'
                }`}
              >
                {result.valid ? <LuCircleCheck className="text-2xl" /> : status === 'pending' ? <LuClock className="text-2xl" /> : <LuCircleX className="text-2xl" />}
              </span>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>
                  {result.valid ? L('Valid certificate', 'বৈধ সার্টিফিকেট') : status === 'pending' ? L('Pending activation', 'সক্রিয়করণ বাকি') : L('Not valid', 'বৈধ নয়')}
                </h2>
                <p className={`mt-0.5 text-sm text-slate-600 work ${bn}`}>{statusText}</p>
              </div>
            </div>

            {cert && (
              <dl className="divide-y divide-slate-100 px-5 sm:px-6">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <dt className={`text-xs font-medium uppercase tracking-wider text-slate-400 work ${bn}`}>{k}</dt>
                    <dd className="text-sm font-semibold text-[#0b1b4a] sm:text-right work">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3.5 rounded-md border border-slate-200 bg-slate-50 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0142b2]">
              <LuQrCode className="text-lg" />
            </span>
            <p className={`text-sm text-slate-600 work ${bn}`}>
              {L('Every BraveTalk Bangladesh certificate has a unique ID and a QR code that opens this page.', 'ব্রেভটক বাংলাদেশের প্রতিটি সার্টিফিকেটে একটি ইউনিক আইডি ও QR কোড থাকে, যা এই পেজটি খোলে।')}
            </p>
          </div>
          <div className="flex items-start gap-3.5 rounded-md border border-slate-200 bg-slate-50 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[#027a1e]">
              <LuShieldCheck className="text-lg" />
            </span>
            <div className={`text-sm text-slate-600 work ${bn}`}>
              {L('Want to learn more about our certificates?', 'আমাদের সার্টিফিকেট সম্পর্কে আরও জানতে চান?')}{' '}
              <Link href="/certification" className="inline-flex items-center gap-1 font-semibold text-[#0142b2]">
                {L('Read more', 'বিস্তারিত')} <LuArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <LuLoaderCircle className="animate-spin text-3xl text-[#0142b2]" />
        </div>
      }
    >
      <VerifyCertificateContent />
    </Suspense>
  );
}
