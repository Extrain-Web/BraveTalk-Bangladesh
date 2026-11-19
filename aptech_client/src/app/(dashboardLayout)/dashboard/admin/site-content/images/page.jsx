'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FiImage, FiLink, FiRotateCcw, FiSave, FiLoader, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import { SITE_IMAGE_SLOTS } from '@/lib/siteImages';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/components/Shared/Toast';
import ImageUploadButton from '@/components/Admin/ImageUploadButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const authHdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
const isUrl = (v) => /^(https?:\/\/|\/)\S+$/i.test(v);

function SlotCard({ slot, value, onChange, showToast }) {
  const [pasting, setPasting] = useState(false);
  const [draft, setDraft] = useState('');
  const custom = !!value;
  const src = value || slot.def;

  const applyUrl = () => {
    const v = draft.trim();
    if (!isUrl(v)) return showToast('error', 'Please paste a valid image URL (https://…)');
    onChange(v);
    setPasting(false);
    setDraft('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col">
      <div className="relative aspect-[16/9] bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={slot.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-sm text-[11px] font-bold text-white ${custom ? 'bg-[#027a1e]' : 'bg-slate-700/80'}`}>
          {custom ? 'Custom' : 'Default'}
        </span>
        <a href={src} target="_blank" rel="noreferrer" title="Open full image"
          className="absolute top-2 right-2 w-7 h-7 rounded bg-white/90 text-slate-700 flex items-center justify-center hover:text-[#0142b2]">
          <FiExternalLink size={13} />
        </a>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-sm font-bold text-[#0b1b4a] outfit">{slot.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{slot.hint}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">{slot.key}</p>
        </div>

        {pasting && (
          <div className="flex gap-2">
            <input
              autoFocus
              type="url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyUrl(); if (e.key === 'Escape') setPasting(false); }}
              placeholder="https://…/photo.jpg"
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-[#0142b2]"
            />
            <button type="button" onClick={applyUrl} className="px-2.5 rounded-md bg-[#0142b2] text-white hover:bg-[#01368f]" title="Use this URL"><FiCheck size={14} /></button>
            <button type="button" onClick={() => setPasting(false)} className="px-2.5 rounded-md border border-slate-300 text-slate-500 hover:text-slate-700" title="Cancel"><FiX size={14} /></button>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <ImageUploadButton
            label="Upload"
            onUploaded={(url) => { onChange(url); showToast('success', `${slot.label} uploaded — click Save changes`); }}
            onError={(msg) => showToast('error', msg)}
          />
          <button type="button" onClick={() => { setPasting((p) => !p); setDraft(value || ''); }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-[#0142b2] hover:text-[#0142b2]">
            <FiLink size={14} /> Paste URL
          </button>
          {custom && (
            <button type="button" onClick={() => onChange('')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-500 hover:border-[#e5251f] hover:text-[#e5251f]">
              <FiRotateCcw size={14} /> Reset to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SiteImagesPage() {
  const { showToast, toastNode } = useToast();
  const { refreshSettings } = useSettings() || {};
  const [saved, setSaved] = useState({});
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`, { cache: 'no-store' });
        const data = await res.json();
        const map = (data.success && data.data?.siteImages) || {};
        setSaved(map);
        setImages(map);
      } catch {
        showToast('error', 'Could not load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const groups = useMemo(() => {
    const out = [];
    SITE_IMAGE_SLOTS.forEach((s) => {
      let g = out.find((x) => x.page === s.page);
      if (!g) { g = { page: s.page, slots: [] }; out.push(g); }
      g.slots.push(s);
    });
    return out;
  }, []);

  const clean = (m) => Object.fromEntries(Object.entries(m).filter(([, v]) => v));
  const dirty = JSON.stringify(clean(images)) !== JSON.stringify(clean(saved));
  const customCount = SITE_IMAGE_SLOTS.filter((s) => images[s.key]).length;

  const setSlot = (key, url) => setImages((prev) => {
    const next = { ...prev };
    if (url) next[key] = url; else delete next[key];
    return next;
  });

  const save = async () => {
    setSaving(true);
    try {
      const siteImages = clean(images);
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PATCH', headers: authHdr(), body: JSON.stringify({ siteImages }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        const stored = data.data?.siteImages || siteImages;
        setSaved(stored);
        setImages(stored);
        showToast('success', 'Site images saved');
        refreshSettings?.();
      } else {
        showToast('error', data.message || 'Save failed');
      }
    } catch {
      showToast('error', 'Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 poppins pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 outfit flex items-center gap-2"><FiImage className="text-[#0142b2]" /> Site Images</h1>
        <p className="text-sm text-slate-500 mt-1">
          Change any photo on the public website. Upload a new image or paste a URL, then click <b>Save changes</b>.
          ওয়েবসাইটের যেকোনো ছবি এখান থেকে বদলান — আপলোড করে Save চাপুন।
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-16 justify-center"><FiLoader className="animate-spin" /> Loading…</div>
      ) : (
        groups.map((g) => (
          <section key={g.page} className="space-y-3">
            <h2 className="text-base font-bold text-[#0b1b4a] outfit border-l-4 border-[#e5251f] pl-3">{g.page}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.slots.map((s) => (
                <SlotCard key={s.key} slot={s} value={images[s.key] || ''} onChange={(url) => setSlot(s.key, url)} showToast={showToast} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-20 -mx-1">
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-md shadow-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {dirty ? <span className="font-semibold text-[#e5251f]">You have unsaved changes.</span> : 'All changes saved.'}
            <span className="text-slate-400"> · {customCount} of {SITE_IMAGE_SLOTS.length} photos customised</span>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setImages(saved)} disabled={!dirty || saving}
              className="px-4 py-2 rounded-md border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Discard
            </button>
            <button type="button" onClick={save} disabled={!dirty || saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[#0142b2] text-white text-sm font-bold hover:bg-[#01368f] disabled:opacity-50">
              {saving ? <FiLoader className="animate-spin" size={15} /> : <FiSave size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {toastNode}
    </div>
  );
}
