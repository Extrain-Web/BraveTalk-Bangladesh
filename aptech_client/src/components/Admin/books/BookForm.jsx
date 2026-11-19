'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft, FiSave, FiLoader, FiBookOpen, FiImage, FiDollarSign, FiPackage,
  FiVideo, FiUpload, FiLink, FiPlus, FiTrash2, FiArrowUp, FiArrowDown,
  FiAlertCircle, FiFileText, FiCheckCircle, FiEye, FiX, FiYoutube,
} from 'react-icons/fi';
import { booksApi, formatTaka } from '@/lib/booksApi';
import { isValidYouTubeUrl, getYouTubeThumb } from '@/lib/youtube';
import YouTubePlayer from '@/components/Books/YouTubePlayer';
import { useToast } from '@/components/Shared/Toast';

// ─── Small UI helpers (same look as CourseForm) ───────────────
const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 ' +
  'placeholder:text-gray-300 focus:outline-none focus:border-[#F3A522] focus:ring-2 focus:ring-[#F3A522]/15 transition-all';
const invalidClass = ' !border-red-300';
const labelClass = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';

const FieldError = ({ msg }) => msg
  ? <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1"><FiAlertCircle size={11} /> {msg}</p>
  : null;

const SectionTitle = ({ icon: Icon, title, hint, right }) => (
  <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#FEF6E7] flex items-center justify-center shrink-0">
        <Icon className="text-[#c9871a]" size={16} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-gray-800 outfit leading-tight">{title}</h2>
        {hint && <p className="text-[11px] text-gray-400 work mt-0.5">{hint}</p>}
      </div>
    </div>
    {right}
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 ${className}`}>{children}</div>
);

// Two/three option segmented control
const Segmented = ({ value, onChange, options }) => (
  <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg w-full sm:w-auto">
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap
          ${value === o.value ? 'bg-white text-[#a5680f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/**
 * File field: upload through booksApi.upload OR paste a URL.
 * kind: 'image' shows a preview; 'pdf' shows an "open" link.
 */
const FileField = ({ label, value, onChange, kind = 'pdf', required, error, hint, onToast }) => {
  const [mode, setMode] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (kind === 'image' && !file.type.startsWith('image/')) return onToast?.('error', 'Please choose an image file');
    if (kind === 'pdf' && file.type !== 'application/pdf') return onToast?.('error', 'Please choose a PDF file');
    setUploading(true);
    try {
      const res = await booksApi.upload(file);
      onChange(res?.url || '');
      onToast?.('success', `${file.name} uploaded`);
    } catch (err) {
      onToast?.('error', err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`${labelClass} !mb-0`}>{label}{required && <span className="text-red-400"> *</span>}</span>
        <div className="flex gap-0.5 p-0.5 bg-gray-100 rounded-md">
          {[{ k: 'upload', I: FiUpload, t: 'Upload' }, { k: 'url', I: FiLink, t: 'URL' }].map(({ k, I, t }) => (
            <button key={k} type="button" onClick={() => setMode(k)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition ${mode === k ? 'bg-white text-[#a5680f] shadow-sm' : 'text-gray-400'}`}>
              <I size={10} /> {t}
            </button>
          ))}
        </div>
      </div>

      {mode === 'upload' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 border-dashed text-xs font-semibold transition
            ${error ? 'border-red-300 text-red-400' : 'border-gray-200 text-gray-500 hover:border-[#F3A522] hover:text-[#c9871a] hover:bg-[#FEF6E7]/40'} disabled:opacity-60`}
        >
          {uploading ? <FiLoader className="animate-spin" size={14} /> : <FiUpload size={14} />}
          {uploading ? 'Uploading…' : value ? `Replace ${kind === 'image' ? 'image' : 'PDF'}` : `Choose ${kind === 'image' ? 'image' : 'PDF'} file`}
        </button>
      ) : (
        <input
          type="url"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={kind === 'image' ? 'https://…/cover.jpg' : 'https://…/book.pdf'}
          className={inputClass + (error ? invalidClass : '')}
        />
      )}
      <input ref={inputRef} type="file" hidden accept={kind === 'image' ? 'image/*' : 'application/pdf'} onChange={handleFile} />

      {value && kind === 'pdf' && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <FiFileText className="text-[#c9871a] shrink-0" size={14} />
          <a href={value} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-[#c9871a] truncate flex-1">{value}</a>
          <button type="button" onClick={() => onChange('')} className="text-slate-400 hover:text-rose-500" title="Remove"><FiX size={13} /></button>
        </div>
      )}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
};

let keySeq = 0;
const newKey = () => `v${Date.now().toString(36)}${keySeq++}`;
const emptyVideo = () => ({ key: newKey(), title: '', youtubeUrl: '', duration: '', notes: '', pdfUrl: '', isPreview: false });

const EMPTY = {
  title: '', author: '', category: '', shortDescription: '', description: '',
  pages: '', language: 'Bangla', coverImage: '',
  isFree: false, price: '', offerPrice: '',
  format: 'digital', stock: '', pdfUrl: '', samplePdfUrl: '',
  status: 'draft', videos: [],
};

const fromBook = (b) => ({
  title: b.title || '', author: b.author || '', category: b.category || '',
  shortDescription: b.shortDescription || '', description: b.description || '',
  pages: b.pages ?? '', language: b.language || 'Bangla', coverImage: b.coverImage || '',
  isFree: !!b.isFree, price: b.isFree ? '' : (b.price ?? ''), offerPrice: b.offerPrice ? b.offerPrice : '',
  format: b.format || 'digital', stock: b.stock ?? '', pdfUrl: b.pdfUrl || '', samplePdfUrl: b.samplePdfUrl || '',
  status: b.status || 'published',
  videos: [...(b.videos || [])]
    .sort((a, c) => (a.order ?? 0) - (c.order ?? 0))
    .map(v => ({
      key: v._id || newKey(), _id: v._id, title: v.title || '', youtubeUrl: v.youtubeUrl || '',
      duration: v.duration || '', notes: v.notes || '', pdfUrl: v.pdfUrl || '', isPreview: !!v.isPreview,
    })),
});

// ═══════════════════════════════════════════════════════════════
export default function BookForm({ mode = 'create', bookId = null }) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const { showToast, toastNode } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [bookDoc, setBookDoc] = useState(null);
  const [fetching, setFetching] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [coverMode, setCoverMode] = useState('upload');
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef(null);

  useEffect(() => {
    if (!isEdit || !bookId) return;
    let alive = true;
    (async () => {
      try {
        const b = await booksApi.adminGet(bookId);
        if (!alive) return;
        setBookDoc(b);
        const f = fromBook(b);
        setForm(f);
        setSelectedKey(f.videos[0]?.key || null);
      } catch (err) {
        if (alive) setLoadError(err.message || 'Could not load the book');
      } finally {
        if (alive) setFetching(false);
      }
    })();
    return () => { alive = false; };
  }, [isEdit, bookId]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // ─── Video helpers ──────────────────────────────────────────
  const setVideo = (key, field, value) => {
    setForm(prev => ({ ...prev, videos: prev.videos.map(v => v.key === key ? { ...v, [field]: value } : v) }));
    const errKey = `video_${key}_${field}`;
    if (errors[errKey]) setErrors(prev => { const n = { ...prev }; delete n[errKey]; return n; });
  };
  const addVideo = () => {
    const v = emptyVideo();
    setForm(prev => ({ ...prev, videos: [...prev.videos, v] }));
    setSelectedKey(v.key);
  };
  const removeVideo = (key) => {
    const idx = form.videos.findIndex(v => v.key === key);
    const videos = form.videos.filter(v => v.key !== key);
    if (selectedKey === key) setSelectedKey(videos[Math.max(0, idx - 1)]?.key || null);
    setForm(prev => ({ ...prev, videos: prev.videos.filter(v => v.key !== key) }));
  };
  const moveVideo = (key, dir) => {
    setForm(prev => {
      const list = [...prev.videos];
      const i = list.findIndex(v => v.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, videos: list };
    });
  };

  // ─── Cover upload ───────────────────────────────────────────
  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('error', 'Please choose an image file');
    setCoverUploading(true);
    try {
      const res = await booksApi.upload(file);
      set('coverImage', res?.url || '');
      showToast('success', 'Cover uploaded');
    } catch (err) {
      showToast('error', err.message || 'Upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  // ─── Validation ─────────────────────────────────────────────
  const hasPrinted = form.format === 'printed' || form.format === 'both';
  const hasDigital = form.format === 'digital' || form.format === 'both';

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.coverImage.trim()) e.coverImage = 'Cover image is required';
    if (form.pages !== '' && (Number(form.pages) < 0 || !Number.isFinite(Number(form.pages)))) e.pages = 'Invalid number';
    if (!form.isFree) {
      const price = Number(form.price);
      if (form.price === '' || !Number.isFinite(price) || price <= 0) e.price = 'Enter a price greater than 0';
      if (form.offerPrice !== '') {
        const offer = Number(form.offerPrice);
        if (!Number.isFinite(offer) || offer <= 0) e.offerPrice = 'Offer price must be greater than 0';
        else if (price > 0 && offer >= price) e.offerPrice = 'Offer price must be less than the regular price';
      }
    }
    if (hasPrinted && (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))) {
      e.stock = 'Enter stock quantity (0 or more)';
    }
    const first = Object.values(e)[0];
    let lessonMsg = '';
    form.videos.forEach((v, i) => {
      if (!v.title.trim()) {
        e[`video_${v.key}_title`] = 'Title is required';
        lessonMsg ||= `Lesson ${i + 1}: title is required`;
      }
      if (!v.youtubeUrl.trim()) {
        e[`video_${v.key}_youtubeUrl`] = 'YouTube link is required';
        lessonMsg ||= `Lesson ${i + 1}: YouTube link is required`;
      } else if (!isValidYouTubeUrl(v.youtubeUrl)) {
        e[`video_${v.key}_youtubeUrl`] = 'Not a valid YouTube link';
        lessonMsg ||= `Lesson ${i + 1}: not a valid YouTube link`;
      }
    });
    return { e, message: first || lessonMsg };
  };

  const onSave = async () => {
    const { e, message } = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      showToast('error', message || 'Please fix the highlighted fields');
      return;
    }
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description,
      pages: form.pages === '' ? undefined : Number(form.pages),
      language: form.language.trim() || undefined,
      coverImage: form.coverImage.trim(),
      isFree: form.isFree,
      price: form.isFree ? 0 : Number(form.price),
      offerPrice: form.isFree || form.offerPrice === '' ? 0 : Number(form.offerPrice),
      format: form.format,
      stock: hasPrinted ? Number(form.stock) : 0,
      pdfUrl: hasDigital ? form.pdfUrl.trim() : '',
      samplePdfUrl: hasDigital ? form.samplePdfUrl.trim() : '',
      status: form.status,
      videos: form.videos.map(v => ({
        ...(v._id ? { _id: v._id } : {}),
        title: v.title.trim(),
        youtubeUrl: v.youtubeUrl.trim(),
        duration: v.duration.trim(),
        notes: v.notes,
        pdfUrl: v.pdfUrl.trim(),
        isPreview: v.isPreview,
      })),
    };
    setSaving(true);
    try {
      if (isEdit) await booksApi.update(bookDoc?._id || bookId, payload);
      else await booksApi.create(payload);
      showToast('success', isEdit ? 'Book updated' : 'Book created');
      setTimeout(() => router.push('/dashboard/admin/books'), 700);
    } catch (err) {
      showToast('error', err.message || 'Could not save the book');
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <FiLoader className="animate-spin text-[#F3A522]" size={34} />
        <p className="text-sm text-gray-400 work">Loading book…</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <FiAlertCircle className="mx-auto text-rose-400 mb-3" size={34} />
        <p className="font-bold text-slate-800 outfit">Could not load this book</p>
        <p className="text-sm text-slate-500 mt-1">{loadError}</p>
        <Link href="/dashboard/admin/books" className="inline-flex items-center gap-1.5 mt-5 text-sm font-bold text-[#c9871a] hover:underline">
          <FiArrowLeft size={14} /> Back to books
        </Link>
      </div>
    );
  }

  const selected = form.videos.find(v => v.key === selectedKey) || null;
  const selectedIndex = selected ? form.videos.indexOf(selected) : -1;
  const priceNum = Number(form.price) || 0;
  const offerNum = form.offerPrice === '' ? null : Number(form.offerPrice);
  const hasOffer = offerNum !== null && offerNum > 0 && offerNum < priceNum;
  const finalPrice = form.isFree ? 0 : (hasOffer ? offerNum : priceNum);
  const previewCount = form.videos.filter(v => v.isPreview).length;
  const err = (k) => errors[k];

  return (
    <div className="-m-4 lg:-m-6 xl:-m-7 min-h-screen bg-[#faf9f6] pb-24">
      {/* ─── Sticky top bar ─────────────────────────────────── */}
      <div className="sticky top-[64px] z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#F3A522] via-[#e2941c] to-[#9AA0A8]" />
        <div className="w-full px-4 md:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href="/dashboard/admin/books"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-[#c9871a] transition-colors">
              <FiArrowLeft size={12} /> Books
            </Link>
            <h1 className="text-base md:text-xl font-bold text-gray-900 outfit truncate">
              {isEdit ? (<>Edit Book{bookDoc?.title ? <span className="text-[#c9871a]">: {bookDoc.title}</span> : ''}</>) : 'Add New Book'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="hidden sm:block px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:border-[#F3A522] cursor-pointer">
              <option value="published">✓ Published</option>
              <option value="draft">◌ Draft</option>
            </select>
            <button onClick={onSave} disabled={saving || coverUploading}
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#F3A522] to-[#d88f13] text-white text-sm font-bold shadow-lg shadow-[#F3A522]/25 hover:shadow-xl hover:shadow-[#F3A522]/30 disabled:opacity-50 transition-all">
              {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
              <span className="hidden sm:inline">{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Book'}</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 pt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ═════════ Left / main column ═════════ */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* Basic info */}
          <Card>
            <SectionTitle icon={FiBookOpen} title="Basic Information" hint="What students see on the book page" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Spoken English Starter Guide"
                  className={inputClass + (err('title') ? invalidClass : '')} />
                <FieldError msg={err('title')} />
              </div>
              <div>
                <label className={labelClass}>Author <span className="text-red-400">*</span></label>
                <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name"
                  className={inputClass + (err('author') ? invalidClass : '')} />
                <FieldError msg={err('author')} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Spoken English" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pages</label>
                <input type="number" min="0" value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="e.g. 120"
                  className={inputClass + (err('pages') ? invalidClass : '')} />
                <FieldError msg={err('pages')} />
              </div>
              <div>
                <label className={labelClass}>Language</label>
                <input list="book-languages" value={form.language} onChange={e => set('language', e.target.value)} placeholder="Bangla" className={inputClass} />
                <datalist id="book-languages">
                  <option value="Bangla" /><option value="English" /><option value="Bangla & English" />
                </datalist>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Short description</label>
                <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} maxLength={220}
                  placeholder="One or two lines shown on the book card" className={inputClass} />
                <p className="text-[11px] text-gray-300 mt-1 text-right">{form.shortDescription.length}/220</p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                <textarea rows={6} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="What the book covers, who it is for, what students will learn…"
                  className={inputClass + ' resize-y' + (err('description') ? invalidClass : '')} />
                <FieldError msg={err('description')} />
              </div>
            </div>
          </Card>

          {/* Pricing + format */}
          <Card>
            <SectionTitle icon={FiDollarSign} title="Pricing" hint="Free books are added to the library instantly" />
            <div className="space-y-4">
              <Segmented value={form.isFree ? 'free' : 'paid'} onChange={v => set('isFree', v === 'free')}
                options={[{ value: 'paid', label: 'Paid' }, { value: 'free', label: 'Free' }]} />
              {!form.isFree && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Price (৳) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 450"
                      className={inputClass + (err('price') ? invalidClass : '')} />
                    <FieldError msg={err('price')} />
                  </div>
                  <div>
                    <label className={labelClass}>Offer price (৳)</label>
                    <input type="number" min="0" value={form.offerPrice}
                      onChange={e => { set('offerPrice', e.target.value); if (errors.offerPrice) setErrors(p => { const n = { ...p }; delete n.offerPrice; return n; }); }}
                      placeholder="Optional"
                      className={inputClass + (err('offerPrice') || (offerNum !== null && priceNum > 0 && offerNum >= priceNum) ? invalidClass : '')} />
                    <FieldError msg={err('offerPrice') || (offerNum !== null && priceNum > 0 && offerNum >= priceNum ? 'Must be less than the price' : '')} />
                  </div>
                  <div className="rounded-lg bg-[#FEF6E7]/60 border border-[#F0DFB4]/70 px-4 py-2.5 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-[#a5680f] uppercase tracking-wider">Student pays</p>
                    <p className="text-lg font-bold text-slate-800 outfit">
                      {formatTaka(finalPrice)}
                      {hasOffer && <span className="ml-2 text-xs text-slate-400 line-through font-medium">{formatTaka(priceNum)}</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={FiPackage} title="Format & Files" hint="Printed books need stock; digital books need the full PDF" />
            <div className="space-y-4">
              <Segmented value={form.format} onChange={v => set('format', v)}
                options={[{ value: 'printed', label: 'Printed' }, { value: 'digital', label: 'Digital (PDF)' }, { value: 'both', label: 'Both' }]} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasPrinted && (
                  <div>
                    <label className={labelClass}>Stock (copies) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" step="1" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 50"
                      className={inputClass + (err('stock') ? invalidClass : '')} />
                    <FieldError msg={err('stock')} />
                    {!err('stock') && form.stock !== '' && Number(form.stock) <= 5 && (
                      <p className="text-[11px] text-amber-600 mt-1">Low stock — this book will appear in the low-stock warning.</p>
                    )}
                  </div>
                )}
                {hasDigital && (
                  <>
                    <FileField label="Full book PDF" value={form.pdfUrl} onChange={v => set('pdfUrl', v)} kind="pdf"
                      hint="Only students who own the book can open it" onToast={showToast} />
                    <FileField label="Sample PDF (optional)" value={form.samplePdfUrl} onChange={v => set('samplePdfUrl', v)} kind="pdf"
                      hint="A few public sample pages" onToast={showToast} />
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* ═════════ Video lessons ═════════ */}
          <Card>
            <SectionTitle
              icon={FiVideo}
              title={`Video Lessons (${form.videos.length})`}
              hint={`YouTube links · ${previewCount} free preview${previewCount === 1 ? '' : 's'} · the rest unlock after purchase`}
              right={(
                <button type="button" onClick={addVideo}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FEF6E7] border border-[#F0DFB4] text-[#a5680f] text-xs font-bold hover:bg-[#F3A522] hover:text-white hover:border-[#F3A522] transition shrink-0">
                  <FiPlus size={13} /> Add lesson
                </button>
              )}
            />

            {form.videos.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                <FiYoutube className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm font-semibold text-gray-500">No video lessons yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Add YouTube lessons that come with this book</p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.videos.map((v, i) => {
                  const thumb = getYouTubeThumb(v.youtubeUrl);
                  const isSel = v.key === selectedKey;
                  const urlErr = err(`video_${v.key}_youtubeUrl`) || (v.youtubeUrl.trim() && !isValidYouTubeUrl(v.youtubeUrl) ? 'Not a valid YouTube link' : '');
                  return (
                    <div key={v.key}
                      className={`rounded-xl border transition-all ${isSel ? 'border-[#F3A522] ring-2 ring-[#F3A522]/10 bg-[#FEF6E7]/20' : 'border-gray-100 bg-white hover:border-[#F0DFB4]'}`}>
                      {/* Row header */}
                      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100/80">
                        <span className="w-6 h-6 rounded-md bg-[#F3A522] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <button type="button" onClick={() => setSelectedKey(v.key)} className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-gray-700 truncate">{v.title || <span className="text-gray-300">Untitled lesson</span>}</p>
                        </button>
                        {v.isPreview && <span className="hidden sm:inline px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">FREE PREVIEW</span>}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button type="button" onClick={() => setSelectedKey(v.key)} title="Preview"
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition ${isSel ? 'text-[#c9871a] bg-[#FEF6E7]' : 'text-gray-400 hover:text-[#c9871a] hover:bg-[#FEF6E7]'}`}>
                            <FiEye size={13} />
                          </button>
                          <button type="button" onClick={() => moveVideo(v.key, -1)} disabled={i === 0} title="Move up"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
                            <FiArrowUp size={13} />
                          </button>
                          <button type="button" onClick={() => moveVideo(v.key, 1)} disabled={i === form.videos.length - 1} title="Move down"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
                            <FiArrowDown size={13} />
                          </button>
                          <button type="button" onClick={() => removeVideo(v.key)} title="Remove lesson"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4" onFocus={() => setSelectedKey(v.key)}>
                        <button type="button" onClick={() => setSelectedKey(v.key)}
                          className="relative w-full sm:w-[120px] aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FiYoutube className="text-slate-300" size={22} />
                          )}
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Lesson title <span className="text-red-400">*</span></label>
                            <input value={v.title} onChange={e => setVideo(v.key, 'title', e.target.value)} placeholder="e.g. Introduction"
                              className={inputClass + (err(`video_${v.key}_title`) ? invalidClass : '')} />
                            <FieldError msg={err(`video_${v.key}_title`)} />
                          </div>
                          <div>
                            <label className={labelClass}>Duration</label>
                            <input value={v.duration} onChange={e => setVideo(v.key, 'duration', e.target.value)} placeholder="e.g. 12:30" className={inputClass} />
                          </div>
                          <div className="sm:col-span-3">
                            <label className={labelClass}>YouTube link <span className="text-red-400">*</span></label>
                            <div className="relative">
                              <FiYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={15} />
                              <input value={v.youtubeUrl} onChange={e => setVideo(v.key, 'youtubeUrl', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=…"
                                className={inputClass + ' pl-9 pr-9' + (urlErr ? invalidClass : '')} />
                              {v.youtubeUrl.trim() && isValidYouTubeUrl(v.youtubeUrl) && (
                                <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={15} />
                              )}
                            </div>
                            <FieldError msg={urlErr} />
                          </div>
                          <div className="sm:col-span-3">
                            <label className={labelClass}>Notes</label>
                            <textarea rows={3} value={v.notes} onChange={e => setVideo(v.key, 'notes', e.target.value)}
                              placeholder="Lesson notes shown under the video (for owners)" className={inputClass + ' resize-y'} />
                          </div>
                          <div className="sm:col-span-2">
                            <FileField label="Lesson PDF (optional)" value={v.pdfUrl} onChange={val => setVideo(v.key, 'pdfUrl', val)} kind="pdf" onToast={showToast} />
                          </div>
                          <div className="flex items-end">
                            <label className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition select-none
                              ${v.isPreview ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-200'}`}>
                              <input type="checkbox" checked={v.isPreview} onChange={e => setVideo(v.key, 'isPreview', e.target.checked)}
                                className="w-4 h-4 accent-emerald-600" />
                              <span className="text-xs font-bold">Free preview</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button type="button" onClick={addVideo}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#F0DFB4] text-[#a5680f] text-sm font-bold hover:bg-[#FEF6E7]/60 hover:border-[#F3A522] transition">
              <FiPlus size={15} /> Add lesson
            </button>
          </Card>
        </div>

        {/* ═════════ Right / side column ═════════ */}
        <div className="space-y-6 min-w-0">
          <div className="xl:sticky xl:top-[150px] space-y-6">
            {/* Cover */}
            <Card>
              <SectionTitle icon={FiImage} title="Cover Image" hint="Portrait (3:4) works best" />
              <div className="flex gap-4 xl:flex-col">
                <div className={`relative w-28 xl:w-full shrink-0 aspect-[3/4] rounded-xl overflow-hidden border bg-slate-50 flex items-center justify-center
                  ${err('coverImage') ? 'border-red-300' : 'border-gray-100'}`}>
                  {form.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-2">
                      <FiImage className="mx-auto text-slate-300" size={28} />
                      <p className="text-[11px] text-slate-400 mt-1">No cover yet</p>
                    </div>
                  )}
                  {coverUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><FiLoader className="animate-spin text-[#F3A522]" size={22} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex gap-0.5 p-0.5 bg-gray-100 rounded-md w-fit">
                    {[{ k: 'upload', I: FiUpload, t: 'Upload' }, { k: 'url', I: FiLink, t: 'Paste URL' }].map(({ k, I, t }) => (
                      <button key={k} type="button" onClick={() => setCoverMode(k)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition ${coverMode === k ? 'bg-white text-[#a5680f] shadow-sm' : 'text-gray-400'}`}>
                        <I size={11} /> {t}
                      </button>
                    ))}
                  </div>
                  {coverMode === 'upload' ? (
                    <button type="button" onClick={() => coverRef.current?.click()} disabled={coverUploading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#F3A522] hover:text-[#c9871a] hover:bg-[#FEF6E7]/40 transition disabled:opacity-60">
                      <FiUpload size={14} /> {coverUploading ? 'Uploading…' : form.coverImage ? 'Replace image' : 'Choose image'}
                    </button>
                  ) : (
                    <input type="url" value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://…/cover.jpg"
                      className={inputClass + (err('coverImage') ? invalidClass : '')} />
                  )}
                  <input ref={coverRef} type="file" hidden accept="image/*" onChange={handleCoverFile} />
                  {form.coverImage && (
                    <button type="button" onClick={() => set('coverImage', '')} className="text-[11px] font-semibold text-rose-500 hover:underline">Remove cover</button>
                  )}
                  <FieldError msg={err('coverImage')} />
                </div>
              </div>
            </Card>

            {/* Live lesson preview */}
            <Card>
              <SectionTitle icon={FiEye} title="Lesson Preview"
                hint={selected ? `Lesson ${selectedIndex + 1}${selected.title ? ` · ${selected.title}` : ''}` : 'Select a lesson to preview it'} />
              {selected && isValidYouTubeUrl(selected.youtubeUrl) ? (
                <YouTubePlayer url={selected.youtubeUrl} title={selected.title || 'Lesson preview'} />
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-4">
                  <FiYoutube className="text-slate-300 mb-1.5" size={28} />
                  <p className="text-xs text-slate-400">{selected ? 'Paste a valid YouTube link to preview' : form.videos.length ? 'Click a lesson to preview' : 'Add a lesson first'}</p>
                </div>
              )}
              {selected && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  {selected.duration && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">{selected.duration}</span>}
                  <span className={`px-2 py-0.5 rounded-md font-bold border ${selected.isPreview ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {selected.isPreview ? 'Free preview' : 'Locked until purchase'}
                  </span>
                  {selected.pdfUrl && <span className="px-2 py-0.5 rounded-md bg-[#FEF6E7] text-[#a5680f] font-semibold border border-[#F0DFB4]">PDF attached</span>}
                </div>
              )}
            </Card>

            {/* Status */}
            <Card>
              <SectionTitle icon={FiCheckCircle} title="Status" hint="Drafts are hidden from the bookstore" />
              <Segmented value={form.status} onChange={v => set('status', v)}
                options={[{ value: 'draft', label: '◌ Draft' }, { value: 'published', label: '✓ Published' }]} />
              <button onClick={onSave} disabled={saving || coverUploading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-[#F3A522] to-[#d88f13] text-white text-sm font-bold shadow-lg shadow-[#F3A522]/25 hover:shadow-xl disabled:opacity-50 transition-all">
                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Book'}
              </button>
            </Card>
          </div>
        </div>
      </div>

      {toastNode}
    </div>
  );
}
