'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PhotoBanner from '@/components/Shared/PhotoBanner';
import { LuClipboardList, LuFileText, LuDownload, LuCalendar, LuImage, LuBell } from 'react-icons/lu';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

const fmtDate = (d, bn) => {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(bn ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const NoticeSkeleton = () => (
  <div className="animate-pulse rounded-md border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="h-11 w-11 rounded-md bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
    </div>
    <div className="mt-5 space-y-2">
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-4/5 rounded bg-slate-100" />
    </div>
  </div>
);

export default function PublicNoticeBoardPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const bn = isBn ? 'hind-siliguri' : '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/notices/public`);
        const data = await res.json();
        if (data.success) setList(data.data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PhotoBanner
        slot="pageBanner"
        eyebrow={isBn ? 'ঘোষণা ও আপডেট' : 'Announcements & updates'}
        crumbs={[{ label: isBn ? 'নোটিশ বোর্ড' : 'Notice board' }]}
        title={isBn ? <>নোটিশ <span className="text-[#ff6b63]">বোর্ড</span></> : <>Notice <span className="text-[#ff6b63]">Board</span></>}
        subtitle={isBn ? 'ক্লাস, ব্যাচ ও ইভেন্টের সর্বশেষ ঘোষণা ও নোটিশসমূহ।' : 'The latest announcements about classes, batches and events.'}
      />

      {/* Body */}
      <section className="mx-auto max-w-[900px] px-4 sm:px-6 py-12 lg:py-16">
        {loading ? (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => <NoticeSkeleton key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-2xl text-[#0142b2] shadow-sm">
              <LuBell />
            </div>
            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? 'এখনো কোনো নোটিশ নেই' : 'No notices yet'}</h3>
            <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bn}`}>{isBn ? 'নতুন নোটিশ এলে এখানে দেখা যাবে।' : 'New notices will appear here.'}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {list.map((n, idx) => {
              const Icon = n.attachmentType === 'image' ? LuImage : n.attachmentType === 'pdf' ? LuFileText : LuClipboardList;
              const tint = ['bg-blue-50 text-[#0142b2]', 'bg-red-50 text-[#e5251f]', 'bg-emerald-50 text-[#027a1e]'][idx % 3];
              return (
                <article key={n._id} className="overflow-hidden rounded-md border border-slate-200 border-l-4 border-l-[#e5251f] bg-white shadow-sm transition hover:shadow-md">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3.5">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${tint}`}>
                        <Icon className="text-xl" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold leading-snug text-[#0b1b4a] outfit">{n.title}</h2>
                        <p className={`mt-1 flex items-center gap-1.5 text-xs text-slate-400 work ${bn}`}>
                          <LuCalendar className="text-[11px]" /> {fmtDate(n.createdAt, isBn)}
                        </p>
                      </div>
                    </div>

                    {n.body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 work">{n.body}</p>}

                    {n.attachmentUrl && (
                      n.attachmentType === 'image' ? (
                        <a href={n.attachmentUrl} target="_blank" rel="noreferrer" className="mt-4 block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={n.attachmentUrl} alt={n.attachmentName || 'notice'} className="max-h-96 w-auto max-w-full rounded-md border border-slate-200" />
                        </a>
                      ) : (
                        <a
                          href={n.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-4 inline-flex max-w-full items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-[#0142b2] transition hover:border-[#0142b2]/40 hover:bg-white work ${bn}`}
                        >
                          <LuFileText className="shrink-0" />
                          <span className="truncate">{n.attachmentName || (isBn ? 'ফাইল দেখুন' : 'View file')}</span>
                          <LuDownload className="shrink-0" />
                        </a>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
