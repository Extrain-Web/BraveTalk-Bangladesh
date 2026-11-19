'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LuClipboardList, LuFileText, LuDownload, LuCalendar, LuImage, LuBell } from 'react-icons/lu';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

const fmtDate = (d, bn) => {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(bn ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const NoticeSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="h-11 w-11 rounded-xl bg-slate-100" />
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
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[380px] w-[380px] rounded-full bg-red-100/60 blur-[120px]" />
          <div className="absolute -top-10 right-[-80px] h-[380px] w-[380px] rounded-full bg-blue-200/60 blur-[120px]" />
          <div className="absolute bottom-[-200px] left-1/3 h-[340px] w-[340px] rounded-full bg-emerald-100/60 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5251f]" />
            <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{isBn ? 'ঘোষণা ও আপডেট' : 'Announcements & updates'}</span>
          </div>
          <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
            {isBn ? <>নোটিশ <span className="text-[#e5251f]">বোর্ড</span></> : <>Notice <span className="text-[#e5251f]">Board</span></>}
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
            {isBn ? 'ক্লাস, ব্যাচ ও ইভেন্টের সর্বশেষ ঘোষণা ও নোটিশসমূহ।' : 'The latest announcements about classes, batches and events.'}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 sm:py-14">
        {loading ? (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => <NoticeSkeleton key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-[#0142b2] shadow-sm">
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
                <article key={n._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3.5">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
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
                          <img src={n.attachmentUrl} alt={n.attachmentName || 'notice'} className="max-h-96 w-auto max-w-full rounded-xl border border-slate-100" />
                        </a>
                      ) : (
                        <a
                          href={n.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-[#0142b2] transition hover:border-[#0142b2]/40 hover:bg-white work ${bn}`}
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
