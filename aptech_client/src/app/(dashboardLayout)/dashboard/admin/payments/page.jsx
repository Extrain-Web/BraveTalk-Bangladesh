'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiRefreshCw, FiDownload, FiBook, FiLayers, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api';
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtMoney = (n) => `৳${Number(n || 0).toLocaleString('en-US')}`;
const personName = (u) => (u ? u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '—' : '—');

const STATUS_STYLE = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
};

// One row per payment — course enrollments and book orders together.
const fromEnrollment = (e) => ({
  id: `c-${e._id}`,
  type: 'course',
  item: e.courseId?.title || 'Course',
  student: personName(e.studentId),
  phone: e.studentId?.phoneNumber || '',
  amount: Number(e.payment?.amount || 0),
  method: e.payment?.method || '—',
  sender: e.payment?.gatewayData?.senderNumber || '',
  trx: e.payment?.transactionId || '',
  status: e.payment?.status || 'pending',
  date: e.payment?.paidAt || e.enrolledAt || e.createdAt,
  coupon: e.couponCode || '',
});

const fromBookOrder = (o) => ({
  id: `b-${o._id}`,
  type: 'book',
  item: `${o.bookTitle || o.bookId?.title || 'Book'}${o.quantity > 1 ? ` ×${o.quantity}` : ''}`,
  student: personName(o.studentId),
  phone: o.studentId?.phoneNumber || o.shipping?.phone || '',
  amount: Number(o.amount || 0),
  method: o.payment?.method || '—',
  sender: o.payment?.senderNumber || '',
  trx: o.payment?.transactionId || '',
  status: o.payment?.status || 'pending',
  date: o.payment?.paidAt || o.createdAt,
  coupon: '',
});

export default function PaymentHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [enr, books] = await Promise.all([
        fetch(`${API}/enrollments/all?includeDeleted=true&limit=10000`, { headers: hdrs() }).then((r) => r.json()),
        fetch(`${API}/books/admin/orders`, { headers: hdrs() }).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);
      const list = [
        ...(Array.isArray(enr?.data) ? enr.data : []).map(fromEnrollment),
        ...(Array.isArray(books?.data) ? books.data : []).map(fromBookOrder),
      ]
        // free enrollments / free books are not payments
        .filter((r) => r.method !== 'free' && r.amount > 0)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setRows(list);
    } catch (e) {
      setError('Could not load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) =>
      (type === 'all' || r.type === type) &&
      (status === 'all' || r.status === status) &&
      (!q || [r.item, r.student, r.phone, r.sender, r.trx].some((v) => String(v).toLowerCase().includes(q)))
    );
  }, [rows, type, status, query]);

  const totals = useMemo(() => {
    const sum = (list) => list.reduce((s, r) => s + r.amount, 0);
    const paid = filtered.filter((r) => r.status === 'paid');
    const pending = filtered.filter((r) => r.status === 'pending');
    return { paid: sum(paid), paidCount: paid.length, pending: sum(pending), pendingCount: pending.length, count: filtered.length };
  }, [filtered]);

  const exportCsv = () => {
    const head = ['Date', 'Type', 'Item', 'Student', 'Phone', 'Amount', 'Method', 'Sender', 'Transaction ID', 'Status', 'Coupon'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [head.join(','), ...filtered.map((r) => [fmtDate(r.date), r.type, r.item, r.student, r.phone, r.amount, r.method, r.sender, r.trx, r.status, r.coupon].map(esc).join(','))];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cards = [
    { label: 'Received', value: fmtMoney(totals.paid), sub: `${totals.paidCount} payments`, icon: FiCheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending approval', value: fmtMoney(totals.pending), sub: `${totals.pendingCount} payments`, icon: FiClock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total records', value: totals.count, sub: 'courses + books', icon: FiDollarSign, color: 'text-[#0142b2] bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 outfit">Payment History</h1>
          <p className="text-sm text-slate-500 work">Every course and book payment in one place. Approve pending ones from <Link href="/dashboard/admin/orders" className="text-[#0142b2] font-medium hover:underline">Orders</Link>.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#01368f] disabled:opacity-50">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`flex h-11 w-11 items-center justify-center rounded-md ${color}`}><Icon size={20} /></span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="text-xl font-bold text-slate-900 outfit">{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student, phone, course/book, transaction ID…" className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0142b2]" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="all">All types</option>
          <option value="course">Courses</option>
          <option value="book">Books</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Sender / TrxID</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading payments…</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-rose-600">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No payments found.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {r.type === 'book' ? <FiBook className="shrink-0 text-[#e5251f]" /> : <FiLayers className="shrink-0 text-[#0142b2]" />}
                      <span className="max-w-[220px] truncate font-medium text-slate-800" title={r.item}>{r.item}</span>
                    </span>
                    {r.coupon && <span className="ml-6 text-[11px] text-slate-400">Coupon: {r.coupon}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.student}</p>
                    {r.phone && <p className="text-xs text-slate-400">{r.phone}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{fmtMoney(r.amount)}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{r.method}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {r.sender && <p>{r.sender}</p>}
                    {r.trx && <p className="font-mono text-slate-500">{r.trx}</p>}
                    {!r.sender && !r.trx && '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[r.status] || STATUS_STYLE.refunded}`}>{r.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
