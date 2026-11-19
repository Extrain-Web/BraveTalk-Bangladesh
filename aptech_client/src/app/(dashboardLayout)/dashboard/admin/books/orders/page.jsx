'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiShoppingBag, FiSearch, FiRefreshCw, FiCheck, FiX, FiTruck, FiMapPin,
  FiPhone, FiMail, FiHash, FiChevronDown, FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiList,
} from 'react-icons/fi';
import { booksApi, formatTaka } from '@/lib/booksApi';
import { SkeletonRow } from '@/components/Shared/Skeleton';
import { useToast } from '@/components/Shared/Toast';
import { useConfirm } from '@/components/Shared/ConfirmModal';

const TABS = [
  { id: 'pending', label: 'Pending', icon: FiClock },
  { id: 'approved', label: 'Approved', icon: FiCheckCircle },
  { id: 'cancelled', label: 'Cancelled', icon: FiXCircle },
  { id: 'all', label: 'All', icon: FiList },
];

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-600 border-amber-300',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-300',
  cancelled: 'bg-red-50 text-red-500 border-red-300',
};

const DELIVERY = [
  { value: 'processing', label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'shipped', label: 'Shipped', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];
const deliveryColor = (s) => DELIVERY.find(d => d.value === s)?.color || 'bg-slate-50 text-slate-500 border-slate-200';

const PAY_LABEL = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', cash: 'Hand Cash', free: 'Free', manual: 'Manual' };

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');
const studentName = (s = {}) => `${s.firstName || s.name || 'Student'} ${s.firstName ? s.lastName || '' : ''}`.trim();

export default function AdminBookOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);

  const { showToast, toastNode } = useToast();
  const { confirm, confirmNode } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await booksApi.adminOrders('all');
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      showToast('error', err.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, approved: 0, cancelled: 0 };
    orders.forEach(o => { if (c[o.status] !== undefined) c[o.status] += 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter(o => tab === 'all' || o.status === tab)
      .filter(o => {
        if (!term) return true;
        const s = o.studentId || {};
        return [o.orderNo, o.bookTitle, o.bookId?.title, studentName(s), s.email, s.phoneNumber,
          o.payment?.transactionId, o.payment?.senderNumber]
          .some(v => String(v || '').toLowerCase().includes(term));
      });
  }, [orders, tab, search]);

  const run = async (id, fn, okMsg) => {
    setProcessing(id);
    try {
      await fn();
      showToast('success', okMsg);
      await load();
    } catch (err) {
      showToast('error', err.message || 'Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (o) => {
    const ok = await confirm({
      title: 'Approve this order?',
      message: 'This verifies payment, unlocks the videos and reduces stock.',
      confirmText: 'Approve',
      danger: false,
    });
    if (ok) run(o._id, () => booksApi.approveOrder(o._id), `Order ${o.orderNo || ''} approved`.trim());
  };

  const handleCancel = async (o) => {
    const ok = await confirm({
      title: 'Cancel this order?',
      message: 'The student will not get access to this book. You can ask them to order again.',
      confirmText: 'Cancel order',
      cancelText: 'Keep',
    });
    if (ok) run(o._id, () => booksApi.cancelOrder(o._id), 'Order cancelled');
  };

  const handleDelivery = (o, value) => {
    if (!value || value === o.deliveryStatus) return;
    run(o._id, () => booksApi.setDelivery(o._id, value), `Delivery marked as ${value}`);
  };

  // ─── Shared cell renderers ──────────────────────────────────
  const renderBook = (o) => {
    const b = o.bookId || {};
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
          {b.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-700 font-medium truncate max-w-[180px]">{b.title || o.bookTitle || 'Book'}</p>
          <p className="text-[11px] text-slate-400 capitalize">
            {o.format === 'printed' ? 'Printed' : 'Digital'}{o.format === 'printed' ? ` × ${o.quantity || 1}` : ''}
          </p>
        </div>
      </div>
    );
  };

  const renderPayment = (o) => {
    const p = o.payment || {};
    if (p.method === 'free' || Number(o.amount) === 0) return <span className="text-xs font-semibold text-emerald-600">Free</span>;
    return (
      <div className="text-xs leading-relaxed">
        <p className="font-semibold text-slate-700">{PAY_LABEL[p.paymentType] || PAY_LABEL[p.method] || p.paymentType || p.method || '—'}</p>
        {p.senderNumber && <p className="text-slate-500 flex items-center gap-1"><FiPhone size={10} /> {p.senderNumber}</p>}
        {p.transactionId && <p className="font-mono text-slate-500 flex items-center gap-1"><FiHash size={10} /> {p.transactionId}</p>}
      </div>
    );
  };

  const renderShipping = (o) => {
    const sh = o.shipping;
    if (o.format !== 'printed' || !sh) return <span className="text-xs text-slate-300">—</span>;
    return (
      <div className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
        <p className="font-semibold text-slate-700">{sh.name}</p>
        {sh.phone && <p className="flex items-center gap-1 text-slate-500"><FiPhone size={10} /> {sh.phone}</p>}
        <p className="flex items-start gap-1 text-slate-500"><FiMapPin size={10} className="mt-0.5 shrink-0" /> <span>{[sh.address, sh.city].filter(Boolean).join(', ')}</span></p>
        {sh.note && <p className="text-[11px] text-slate-400 italic mt-0.5">“{sh.note}”</p>}
      </div>
    );
  };

  const renderDelivery = (o) => {
    if (o.format !== 'printed') return <span className="text-xs text-slate-300">Digital</span>;
    if (o.status !== 'approved') {
      return o.deliveryStatus
        ? <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${deliveryColor(o.deliveryStatus)}`}>{o.deliveryStatus}</span>
        : <span className="text-xs text-slate-300">—</span>;
    }
    return (
      <div className="relative inline-block">
        <FiTruck size={11} className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
        <select
          value={o.deliveryStatus || ''}
          onChange={e => handleDelivery(o, e.target.value)}
          disabled={processing === o._id}
          className={`appearance-none pl-6 pr-6 py-1.5 rounded-md text-xs font-medium border cursor-pointer outline-none disabled:opacity-50 ${deliveryColor(o.deliveryStatus)}`}
        >
          {!o.deliveryStatus && <option value="">Set delivery…</option>}
          {DELIVERY.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <FiChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
      </div>
    );
  };

  const renderActions = (o) => {
    if (o.status !== 'pending') {
      return o.status === 'approved'
        ? <span className="text-xs text-emerald-500 whitespace-nowrap">✓ {fmtDate(o.approvedAt)}</span>
        : <span className="text-xs text-red-400">Cancelled</span>;
    }
    return (
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={() => handleApprove(o)} disabled={processing === o._id}
          className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition whitespace-nowrap">
          <FiCheck size={13} /> Approve
        </button>
        <button onClick={() => handleCancel(o)} disabled={processing === o._id} title="Cancel order"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition disabled:opacity-50">
          <FiX size={15} />
        </button>
      </div>
    );
  };

  const statusBadge = (o) => (
    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-500 border-slate-300'}`}>{o.status}</span>
  );

  const pendingAmount = orders.filter(o => o.status === 'pending').reduce((s, o) => s + (Number(o.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Link href="/dashboard/admin/books" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-[#c9871a] transition">
            <FiArrowLeft size={12} /> Books
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 outfit">Book Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Verify payments, unlock books and track printed deliveries</p>
        </div>
        {counts.pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
            <FiClock size={15} /> <span><b>{counts.pending}</b> waiting · {formatTaka(pendingAmount)}</span>
          </div>
        )}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${tab === t.id ? 'bg-white text-[#c9871a] shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon size={14} /> {t.label}
              <span className={`min-w-[20px] px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tab === t.id ? 'bg-[#FEF6E7] text-[#a5680f]' : 'bg-white/70 text-slate-500'}`}>{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order no, student, phone, TrxID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 text-sm outline-none bg-white shadow-sm focus:border-[#F3A522] focus:ring-2 focus:ring-[#F3A522]/15" />
        </div>
        <button onClick={load} className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-[#F0DFB4] hover:text-[#c9871a] transition shadow-sm">
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reload
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden xl:block bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-left">
                {['Order', 'Student', 'Book', 'Amount', 'Payment', 'Shipping', 'Status', 'Delivery', ''].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 8 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-14 text-center">
                  <FiShoppingBag className="mx-auto text-slate-300 mb-3" size={34} />
                  <p className="font-medium text-slate-600">No {tab === 'all' ? '' : tab} orders</p>
                </td></tr>
              ) : filtered.map(o => {
                const s = o.studentId || {};
                return (
                  <tr key={o._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 align-top transition">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs font-semibold text-slate-700">{o.orderNo || `#${String(o._id).slice(-6).toUpperCase()}`}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(o.createdAt)}</p>
                      <p className="text-[11px] text-slate-400">{fmtTime(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-slate-700 font-medium truncate max-w-[160px]">{studentName(s)}</p>
                      {s.email && <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{s.email}</p>}
                      {s.phoneNumber && <p className="text-[11px] text-slate-400">{s.phoneNumber}</p>}
                    </td>
                    <td className="px-4 py-3.5">{renderBook(o)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">{formatTaka(o.amount)}</td>
                    <td className="px-4 py-3.5">{renderPayment(o)}</td>
                    <td className="px-4 py-3.5">{renderShipping(o)}</td>
                    <td className="px-4 py-3.5">{statusBadge(o)}</td>
                    <td className="px-4 py-3.5">{renderDelivery(o)}</td>
                    <td className="px-4 py-3.5 text-right">{renderActions(o)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="xl:hidden space-y-3">
        {loading && orders.length === 0 ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-xl border border-slate-200/60 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200/60">
            <FiShoppingBag className="mx-auto text-slate-300 mb-3" size={34} />
            <p className="font-medium text-slate-600">No {tab === 'all' ? '' : tab} orders</p>
          </div>
        ) : filtered.map(o => {
          const s = o.studentId || {};
          return (
            <div key={o._id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/70 border-b border-slate-100">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-slate-700 truncate">{o.orderNo || `#${String(o._id).slice(-6).toUpperCase()}`}</p>
                  <p className="text-[11px] text-slate-400">{fmtDate(o.createdAt)} · {fmtTime(o.createdAt)}</p>
                </div>
                {statusBadge(o)}
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {renderBook(o)}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Student</p>
                    <p className="text-sm font-medium text-slate-700">{studentName(s)}</p>
                    {s.email && <p className="text-xs text-slate-500 flex items-center gap-1 break-all"><FiMail size={10} className="shrink-0" /> {s.email}</p>}
                    {s.phoneNumber && <p className="text-xs text-slate-500 flex items-center gap-1"><FiPhone size={10} /> {s.phoneNumber}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Payment</p>
                      {renderPayment(o)}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Amount</p>
                      <p className="text-base font-bold text-slate-800 outfit">{formatTaka(o.amount)}</p>
                    </div>
                  </div>
                  {o.format === 'printed' && o.shipping && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ship to</p>
                      {renderShipping(o)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-100">
                <div>{renderDelivery(o)}</div>
                {renderActions(o)}
              </div>
            </div>
          );
        })}
      </div>

      {toastNode}
      {confirmNode}
    </div>
  );
}
