'use client';

import React, { useRef, useState } from 'react';
import { FiUpload, FiLoader } from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

/** Uploads one image to POST /api/upload/image (admin token) and resolves to its URL. */
export async function uploadSiteImage(file) {
  if (!file) throw new Error('No file selected');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5MB');
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}` },
    body: fd,
  });
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error */ }
  if (!res.ok || !data.success || !data.data?.url) throw new Error(data.message || 'Image upload failed');
  return data.data.url;
}

/**
 * Small "Upload image" button: picks a file, uploads it, calls onUploaded(url).
 *   <ImageUploadButton onUploaded={(url) => ...} onError={(msg) => ...} />
 */
export default function ImageUploadButton({ onUploaded, onError, label = 'Upload image', className = '' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadSiteImage(file);
      onUploaded?.(url);
    } catch (err) {
      onError?.(err.message || 'Image upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-[#0142b2] hover:text-[#0142b2] disabled:opacity-60 transition-colors ${className}`}
      >
        {busy ? <FiLoader className="animate-spin" size={14} /> : <FiUpload size={14} />}
        {busy ? 'Uploading…' : label}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onFile} />
    </>
  );
}
