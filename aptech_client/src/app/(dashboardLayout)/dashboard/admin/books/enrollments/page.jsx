'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiBook, FiSearch, FiRefreshCw, FiTruck, FiMonitor, FiUsers, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { booksApi } from '@/lib/booksApi';
import { SkeletonCard, SkeletonRow } from '@/components/Shared/Skeleton';
import { useToast } from '@/components/Shared/Toast';

// Approved book orders = students who own the book (videos unlocked).
// Printed books also carry a delivery status here.

const DELIVERY = [
  { value: 'processing', label: 'Processing', color: 'bg-[#eef3fc] text-[#0142b2] border-[#c9d8f5]' },
  { value: 'shipped', label: 'Shipped', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];
const deliveryColor = (s) => DELIVERY.find((d) => d.value === s)?.color || 'bg-slate-50 text-slate-500 border-slate-200';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const personName = (s = {}) => `${s.firstName || s.name || 'Student'} ${s.firstName ? s.lastName || '' : ''}`.trim();
const money = (n) => (Number(n) > 0 ? `৳${Number(n).toLocaleString('en-US')}` : 'Free');

export default function BookEnrollmentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('all');
  const [book, setBook] = useState('all');
  const [processing, setProcessing] = useState(null);
  const { showToast, toastNode } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await booksApi.adminOrders('approved');
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      showToast('error', err.message || 'Could not load book enrollments');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const books = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => m.set(String(o.bookId?._id || o.bookId), o.bookTitle || o.bookId?.title || 'Book'));
    return [...m].map(([id, title]) => ({ id, title }));
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (format !== 'all' && o.format !== format) return false;
      if (book !== 'all' && String(o.bookId?._id || o.bookId) !== book) return false;
      if (!term) return true;
      const s = o.studentId || {};
      return [o.orderNo, o.bookTitle, personName(s), s.email, s.phoneNumber].some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [orders, search, format, book]);

  const stats = useMemo(() => ({
    students: new Set(orders.map((o) => String(o.studentId?._id || o.studentId))).size,
    digital: orders.filter((o) => o.format !== 'printed').length,
    toDeliver: orders.filter((o) => o.format === 'printed' && o.deliveryStatus !== 'delivered').length,
  }), [orders]);

  const handleDelivery = async (o, value) => {
    if (!value || value === o.deliveryStatus) return;
    setProcessing(o._id);
    try {
      await booksApi.setDelivery(o._id, value);
      setOrders((prev) => prev.map((x) => (x._id === o._id ? { ...x, deliveryStatus: value } : x)));
      showToast('success', `Delivery marked as ${value}`);
    } catch (err) {
      showToast('error', err.message || 'Could not update delivery');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b4a] outfit">Book Enrollments</h1>
          <p className="text-sm text-slate-500 mt-1">Students who got a book (approved orders). New book orders are approved from <Link href="/dashboard/admin/orders" className="font-medium text-[#0142b2] hover:underline">Orders</Link>.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />) : [
          { label: 'Book enrollments', value: orders.length, icon: FiBook, color: 'text-[#e5251f]', bg: 'bg-red-50' },
          { label: 'Students', value: stats.students, icon: FiUsers, color: 'text-[#0142b2]', bg: 'bg-[#eef3fc]' },
          { label: 'Digital (video access)', value: stats.digital, icon: FiMonitor, color: 'text-[#027a1e]', bg: 'bg-emerald-50' },
          { label: 'Printed — to deliver', value: stats.toDeliver, icon: FiTruck, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-md ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
              <div>
                <p className={`text-xl font-bold outfit ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, phone, book, order no…"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:border-[#0142b2]" />
        </div>
        <select value={book} onChange={(e) => setBook(e.target.value)} className="max-w-[220px] rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="all">All books</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {[['all', 'All'], ['digital', 'Digital'], ['printed', 'Printed']].map(([id, label]) => (
            <button key={id} onClick={() => setFormat(id)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${format === id ? 'bg-white text-[#0142b2] font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <colgroup><col className="w-[32%]" /><col className="w-[24%]" /><col className="w-[14%]" /><col className="w-[30%]" /></colgroup>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Access / Delivery</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [1, 2, 3].map((i) => <SkeletonRow key={i} />) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-14 text-center">
                <FiBook className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="text-sm text-slate-500">No book enrollments yet. They appear here after a book order is approved.</p>
              </td></tr>
            ) : filtered.map((o) => {
              const s = o.studentId || {};
              const printed = o.format === 'printed';
              return (
                <tr key={o._id} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="h-11 w-9 shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {o.bookId?.coverImage && <img src={o.bookId.coverImage} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800" title={o.bookTitle}>{o.bookTitle || o.bookId?.title}</p>
                        <p className="text-xs text-slate-500">{printed ? 'Printed' : 'Digital'}{o.quantity > 1 ? ` ×${o.quantity}` : ''} · #{o.orderNo || String(o._id).slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/user/${s._id || ''}`} className="block min-w-0 group">
                      <p className="truncate text-sm font-medium text-slate-700 group-hover:text-[#0142b2]">{personName(s)}</p>
                      <p className="truncate text-xs text-slate-400">{s.phoneNumber || s.email}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{money(o.amount)}</p>
                    <p className="text-xs text-slate-400">{fmtDate(o.approvedAt || o.payment?.paidAt || o.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Videos unlocked</span>
                    {printed && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <FiTruck size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-60" />
                          <select value={o.deliveryStatus || ''} disabled={processing === o._id} onChange={(e) => handleDelivery(o, e.target.value)}
                            className={`appearance-none rounded-md border py-1 pl-6 pr-6 text-xs font-semibold outline-none disabled:opacity-50 ${deliveryColor(o.deliveryStatus)}`}>
                            {!o.deliveryStatus && <option value="">Set delivery…</option>}
                            {DELIVERY.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                          </select>
                          <FiChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50" />
                        </div>
                        {o.shipping?.address && (
                          <span className="flex min-w-0 items-center gap-1 truncate text-xs text-slate-500" title={[o.shipping.address, o.shipping.city].filter(Boolean).join(', ')}>
                            <FiMapPin size={11} className="shrink-0" /> {o.shipping.city || o.shipping.address}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {toastNode}
    </div>
  );
}
