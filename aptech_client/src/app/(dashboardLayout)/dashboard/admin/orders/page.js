'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  FiLoader, FiShoppingCart, FiX, FiSearch, FiDollarSign, FiClock, FiCheckCircle,
  FiCalendar, FiBookOpen, FiBook, FiLayers, FiTrash2, FiEye, FiUser, FiMail, FiPhone,
  FiMapPin, FiHash, FiCreditCard, FiEdit2, FiSave, FiCheck, FiRefreshCw, FiPackage,
} from 'react-icons/fi';
import { SkeletonCard, SkeletonRow } from '@/components/Shared/Skeleton';
import { useToast } from '@/components/Shared/Toast';
import { useConfirm } from '@/components/Shared/ConfirmModal';
import { booksApi } from '@/lib/booksApi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
const getToken = () => localStorage.getItem('token') || '';
const auth = () => ({ Authorization: `Bearer ${getToken()}` });

const DetailRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className="text-slate-300 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm text-slate-700 break-words ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  </div>
);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');
const fmtDateTime = (d) => (d ? `${fmtDate(d)}, ${fmtTime(d)}` : '—');
const personName = (s = {}) => `${s.firstName || s.name || 'Student'} ${s.firstName ? s.lastName || '' : ''}`.trim();
const money = (n) => `৳${(Number(n) || 0).toLocaleString('en-US')}`;
const parseFee = (v) => parseInt(String(v ?? '').replace(/[^0-9]/g, '')) || 0;

// Course enrollment status → unified order status
const courseStatus = (s) => (s === 'active' || s === 'completed' ? 'approved' : s);

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  deleted: 'bg-slate-100 text-slate-500 border-slate-200',
};
const PAY_STYLE = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-slate-100 text-slate-500 border-slate-200',
};

const toRow = {
  course: (o) => ({
    key: `c-${o._id}`, kind: 'course', id: o._id, raw: o,
    title: o.courseId?.title || 'Course',
    sub: o.courseId?.type || '',
    student: o.studentId || {},
    amount: Number(o.payment?.amount) || 0,
    free: o.payment?.method === 'free',
    method: o.payment?.gatewayData?.paymentType || o.payment?.method || '',
    trx: o.payment?.transactionId || '',
    sender: o.payment?.gatewayData?.senderNumber || '',
    payStatus: o.payment?.status || 'pending',
    status: courseStatus(o.status),
    date: o.createdAt || o.enrolledAt,
  }),
  book: (o) => ({
    key: `b-${o._id}`, kind: 'book', id: o._id, raw: o,
    title: o.bookTitle || o.bookId?.title || 'Book',
    sub: `${o.format === 'printed' ? 'Printed' : 'Digital'}${o.quantity > 1 ? ` ×${o.quantity}` : ''}`,
    student: o.studentId || {},
    amount: Number(o.amount) || 0,
    free: o.payment?.method === 'free' || Number(o.amount) === 0,
    method: o.payment?.paymentType || o.payment?.method || '',
    trx: o.payment?.transactionId || '',
    sender: o.payment?.senderNumber || '',
    payStatus: o.payment?.status || 'pending',
    status: o.status,
    date: o.createdAt,
  }),
};

export default function OrdersPage() {
  const [courseOrders, setCourseOrders] = useState([]);
  const [bookOrders, setBookOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterKind, setFilterKind] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [details, setDetails] = useState(null); // a row
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [approveRow, setApproveRow] = useState(null); // live course → choose batch
  const [approveBatch, setApproveBatch] = useState('');

  const { showToast, toastNode } = useToast();
  const { confirm, confirmNode } = useConfirm();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [enr, books, bt] = await Promise.all([
        fetch(`${API}/enrollments/all?includeDeleted=true&limit=10000`, { headers: auth() }).then(r => r.json()),
        booksApi.adminOrders('all').catch(() => []),
        fetch(`${API}/batches`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setCourseOrders(enr.data || []);
      setBookOrders(Array.isArray(books) ? books : []);
      setBatches(bt.data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const rows = useMemo(() => [
    ...courseOrders.map(toRow.course),
    ...bookOrders.map(toRow.book),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [courseOrders, bookOrders]);

  // Live batches for a course (self-paced REC-* batches excluded), earliest first
  const liveBatchesFor = (courseId) => batches
    .filter(b => (typeof b.courseId === 'object' ? b.courseId?._id : b.courseId) === courseId)
    .filter(b => !String(b.id || '').startsWith('REC-') && b.status !== 'completed' && !b.isDeleted)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const seatsLeft = (b) => (b.maxStudents || 50) - (b.studentCount || 0);

  // ── Actions ─────────────────────────────────────────────
  const approveCourse = async (row, batchId) => {
    setProcessing(row.key);
    try {
      const res = await fetch(`${API}/enrollments/approve/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify(batchId ? { batchId } : {}),
      });
      const data = await res.json();
      if (data.success) { showToast('success', 'Order approved — now in Enrollments'); loadOrders(); }
      else showToast('error', data.message || 'Error');
    } catch {
      showToast('error', 'Error approving');
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (row) => {
    if (row.kind === 'book') {
      const ok = await confirm({ title: 'Approve this book order?', message: 'This verifies payment, unlocks the book videos and reduces stock. It will appear in Book Enrollments.', confirmText: 'Approve', danger: false });
      if (!ok) return;
      setProcessing(row.key);
      try { await booksApi.approveOrder(row.id); showToast('success', 'Book order approved'); loadOrders(); }
      catch (err) { showToast('error', err.message || 'Error approving'); }
      finally { setProcessing(null); }
      return;
    }
    const type = (row.raw.courseId?.type || '').toLowerCase();
    if (type === 'recorded') {
      const ok = await confirm({ title: 'Approve this order?', message: 'Recorded course — the student gets access right away (no batch needed).', confirmText: 'Approve', danger: false });
      if (ok) approveCourse(row);
      return;
    }
    // Online / Offline → admin chooses the batch
    const list = liveBatchesFor(row.raw.courseId?._id);
    const first = list.find(b => seatsLeft(b) > 0) || list[0];
    setApproveBatch(first?._id || '');
    setApproveRow(row);
  };

  const handleCancel = async (row) => {
    const ok = await confirm({ title: 'Cancel this order?', message: 'The student will not get access. They can order again later.', confirmText: 'Cancel order', cancelText: 'Keep' });
    if (!ok) return;
    setProcessing(row.key);
    try {
      if (row.kind === 'book') await booksApi.cancelOrder(row.id);
      else {
        const res = await fetch(`${API}/enrollments/cancel/${row.id}`, { method: 'PATCH', headers: auth() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Error');
      }
      showToast('success', 'Order cancelled');
      loadOrders();
    } catch (err) {
      showToast('error', err.message || 'Error cancelling');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (row) => {
    if (!(await confirm({ title: 'Delete this order?', message: 'This order will be permanently deleted. This cannot be undone.', confirmText: 'Delete' }))) return;
    setProcessing(row.key);
    try {
      const res = await fetch(`${API}/enrollments/order/${row.id}`, { method: 'DELETE', headers: auth() });
      const data = await res.json();
      if (data.success) { loadOrders(); showToast('success', 'Order deleted'); }
      else showToast('error', data.message || 'Error');
    } catch {
      showToast('error', 'Error deleting order');
    } finally {
      setProcessing(null);
    }
  };

  // ── Course order edit (payment details) ─────────────────
  const startEdit = (o) => {
    const p = o.payment || {};
    const gw = p.gatewayData || {};
    setEditForm({
      customFee: o.customFee ?? '', amount: p.amount ?? '', method: p.method || 'manual', status: p.status || 'pending',
      transactionId: p.transactionId || '', senderNumber: gw.senderNumber || '', paymentType: gw.paymentType || '', notes: gw.notes || '',
    });
    setEditMode(true);
  };

  const saveEdit = async (orderId) => {
    setSavingEdit(true);
    try {
      const res = await fetch(`${API}/enrollments/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({
          customFee: editForm.customFee === '' ? undefined : Number(editForm.customFee),
          payment: {
            amount: Number(editForm.amount) || 0, method: editForm.method, status: editForm.status, transactionId: editForm.transactionId,
            gatewayData: { senderNumber: editForm.senderNumber, paymentType: editForm.paymentType, notes: editForm.notes },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditMode(false);
        setDetails(null);
        loadOrders();
        showToast('success', 'Order updated');
      } else showToast('error', data.message || 'Failed to update');
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Stats + filters ─────────────────────────────────────
  const live = rows.filter(r => r.status !== 'deleted' && r.status !== 'cancelled');
  const pendingCount = rows.filter(r => r.status === 'pending').length;
  const collected = live.filter(r => r.payStatus === 'paid').reduce((s, r) => s + r.amount, 0);
  const approvedCount = rows.filter(r => r.status === 'approved').length;

  const filtered = rows.filter(r => {
    if (filterKind !== 'all' && r.kind !== filterKind) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [r.title, personName(r.student), r.student.email, r.student.phoneNumber, r.trx, r.sender, r.raw.orderNo]
      .some(v => String(v || '').toLowerCase().includes(term));
  });

  const statusTabs = [
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'approved', label: 'Approved' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b4a] outfit">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Course and book orders. Approved courses go to <Link href="/dashboard/admin/enrollments" className="font-medium text-[#0142b2] hover:underline">Enrollments</Link>, approved books go to <Link href="/dashboard/admin/books/enrollments" className="font-medium text-[#0142b2] hover:underline">Book Enrollments</Link>.</p>
        </div>
        <button onClick={loadOrders} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />) : [
          { label: 'Waiting for approval', value: pendingCount, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved orders', value: approvedCount, icon: FiCheckCircle, color: 'text-[#027a1e]', bg: 'bg-emerald-50' },
          { label: 'Collected', value: money(collected), icon: FiDollarSign, color: 'text-[#0142b2]', bg: 'bg-[#eef3fc]' },
          { label: 'Total orders', value: rows.length, icon: FiShoppingCart, color: 'text-[#0b1b4a]', bg: 'bg-slate-100' },
        ].map(s => (
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, phone, course/book, TrxID…"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm focus:border-[#0142b2] outline-none" />
        </div>
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {[{ id: 'all', label: 'All' }, { id: 'course', label: 'Courses', icon: FiLayers }, { id: 'book', label: 'Books', icon: FiBook }].map(k => (
            <button key={k.id} onClick={() => setFilterKind(k.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${filterKind === k.id ? 'bg-white text-[#0142b2] font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {k.icon && <k.icon size={13} />} {k.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {statusTabs.map(t => (
            <button key={t.id} onClick={() => setFilterStatus(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${filterStatus === t.id ? 'bg-white text-[#0142b2] font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
              {t.count > 0 && <span className="rounded-sm bg-amber-500 px-1.5 text-[11px] font-bold text-white">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[31%]" /><col className="w-[20%]" /><col className="w-[18%]" /><col className="w-[11%]" /><col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-14 text-center">
                <FiShoppingCart className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="text-sm text-slate-500">{filterStatus === 'pending' ? 'No orders waiting for approval.' : 'No orders found.'}</p>
              </td></tr>
            ) : filtered.map(row => {
              const busy = processing === row.key;
              const name = personName(row.student);
              return (
                <tr key={row.key} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                  {/* Order */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${row.kind === 'book' ? 'bg-red-50 text-[#e5251f]' : 'bg-[#eef3fc] text-[#0142b2]'}`}>
                        {row.kind === 'book' ? <FiBook size={15} /> : <FiLayers size={15} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800" title={row.title}>{row.title}</p>
                        <p className="text-xs text-slate-500">
                          <span className="font-medium">{row.kind === 'book' ? 'Book' : 'Course'}</span>{row.sub ? ` · ${row.sub}` : ''} · {fmtDate(row.date)} {fmtTime(row.date)}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Student */}
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/user/${row.student._id || ''}`} className="block min-w-0 group">
                      <p className="truncate text-sm font-medium text-slate-700 group-hover:text-[#0142b2]">{name}</p>
                      <p className="truncate text-xs text-slate-400">{row.student.phoneNumber || row.student.email}</p>
                    </Link>
                  </td>
                  {/* Payment */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{row.free ? 'Free' : money(row.amount)}</p>
                    {!row.free && (
                      <p className="truncate text-xs text-slate-500" title={`${row.sender} ${row.trx}`}>
                        <span className="capitalize">{row.method}</span>{row.trx ? ` · ${row.trx}` : ''}
                      </p>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[row.status] || STATUS_STYLE.deleted}`}>{row.status}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {row.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(row)} disabled={busy}
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-[#027a1e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#026318] disabled:opacity-50">
                            {busy ? <FiLoader className="animate-spin" size={12} /> : <FiCheck size={12} />} Approve
                          </button>
                          <button onClick={() => handleCancel(row)} disabled={busy} title="Cancel order"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-[#e5251f]">
                            <FiX size={15} />
                          </button>
                        </>
                      )}
                      <button onClick={() => { setEditMode(false); setDetails(row); }} title="View details"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-[#eef3fc] hover:text-[#0142b2]">
                        <FiEye size={15} />
                      </button>
                      {row.kind === 'course' && (
                        <button onClick={() => handleDelete(row)} disabled={busy} title="Delete order"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-[#e5251f]">
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ Approve live course: choose batch ═══ */}
      {approveRow && (() => {
        const list = liveBatchesFor(approveRow.raw.courseId?._id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setApproveRow(null)}>
            <div className="w-full max-w-md rounded-md bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-bold text-[#0b1b4a] outfit">Approve & choose batch</h3>
                <button onClick={() => setApproveRow(null)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">{approveRow.title}</p>
                  <p className="text-slate-500">{personName(approveRow.student)} · {approveRow.free ? 'Free' : money(approveRow.amount)}</p>
                </div>
                {list.length === 0 ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                    This course has no batch yet. Create one in <Link href="/dashboard/admin/batch/create" className="font-semibold underline">Batches → Add Batch</Link>, or approve now and assign the batch later from Enrollments.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Batch</p>
                    {list.map(b => {
                      const left = seatsLeft(b);
                      return (
                        <label key={b._id} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 ${approveBatch === b._id ? 'border-[#0142b2] bg-[#eef3fc]' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name="batch" checked={approveBatch === b._id} onChange={() => setApproveBatch(b._id)} className="accent-[#0142b2]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{b.name || b.id}</p>
                            <p className="text-xs text-slate-500">Starts {fmtDate(b.startDate)} · {left > 0 ? `${left} seats left` : 'Full'}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
                <button onClick={() => setApproveRow(null)} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
                <button
                  onClick={() => { const r = approveRow; setApproveRow(null); approveCourse(r, approveBatch || undefined); }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#027a1e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026318]">
                  <FiCheck size={14} /> {list.length && approveBatch ? 'Approve & add to batch' : 'Approve without batch'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ Details modal ═══ */}
      {details && (() => {
        const row = details;
        const o = row.raw;
        const s = row.student;
        const name = personName(s);
        const close = () => { setEditMode(false); setDetails(null); };
        const isCourse = row.kind === 'course';
        const c = o.courseId || {};
        const coursePrice = isCourse ? (Number(o.customFee) || ((parseFee(c.offerPrice) > 0 && (parseFee(c.fee) === 0 || parseFee(c.offerPrice) < parseFee(c.fee))) ? parseFee(c.offerPrice) : parseFee(c.fee))) : row.amount;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={close}>
            <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 bg-[#0b1b4a] shrink-0">
                <div>
                  <h3 className="text-white font-bold text-lg outfit">{isCourse ? 'Course order' : 'Book order'}</h3>
                  <p className="text-white/70 text-xs font-mono">#{o.orderNo || String(o._id).slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isCourse && !editMode && (
                    <button onClick={() => startEdit(o)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-md">
                      <FiEdit2 size={13} /> Edit payment
                    </button>
                  )}
                  <button onClick={close} className="text-white/70 hover:text-white"><FiX size={20} /></button>
                </div>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold capitalize border ${STATUS_STYLE[row.status] || STATUS_STYLE.deleted}`}>Order: {row.status}</span>
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold capitalize border ${PAY_STYLE[row.payStatus] || PAY_STYLE.refunded}`}>Payment: {row.payStatus}</span>
                  {row.sub && <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-[#eef3fc] text-[#0142b2] border border-[#c9d8f5]">{row.sub}</span>}
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiUser size={12} /> Student</h4>
                  <p className="font-semibold text-slate-800 mb-2">{name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DetailRow icon={FiMail} label="Email" value={s.email} />
                    <DetailRow icon={FiPhone} label="Phone" value={s.phoneNumber} />
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">{isCourse ? <FiBookOpen size={12} /> : <FiBook size={12} />} {isCourse ? 'Course' : 'Book'}</h4>
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><FiCalendar size={11} /> Ordered: {fmtDateTime(row.date)}</p>
                  {!isCourse && o.format === 'printed' && o.shipping && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailRow icon={FiUser} label="Ship to" value={o.shipping.name} />
                      <DetailRow icon={FiPhone} label="Phone" value={o.shipping.phone} />
                      <DetailRow icon={FiMapPin} label="Address" value={[o.shipping.address, o.shipping.city].filter(Boolean).join(', ')} />
                      <DetailRow icon={FiPackage} label="Delivery" value={o.deliveryStatus} />
                    </div>
                  )}
                </div>

                {isCourse && editMode && editForm ? (
                  <div className="rounded-md border border-[#c9d8f5] bg-[#eef3fc]/40 p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-[#0142b2] uppercase tracking-wider flex items-center gap-1.5"><FiEdit2 size={12} /> Edit payment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ['customFee', 'Course price (৳)', 'number', `Default: ${coursePrice}`],
                        ['amount', 'Amount paid (৳)', 'number'],
                        ['transactionId', 'Transaction ID', 'text'],
                        ['senderNumber', 'Paid from (number)', 'text', '01XXXXXXXXX'],
                        ['notes', 'Notes', 'text'],
                      ].map(([k, label, type, ph]) => (
                        <div key={k}>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">{label}</label>
                          <input type={type} value={editForm[k]} placeholder={ph} onChange={e => setEditForm({ ...editForm, [k]: e.target.value })}
                            className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-[#0142b2]" />
                        </div>
                      ))}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Method</label>
                        <select value={editForm.method} onChange={e => setEditForm({ ...editForm, method: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white">
                          <option value="manual">Manual (bank/mobile)</option><option value="cash">Hand Cash</option><option value="bkash">bKash</option><option value="sslcommerz">Card/Bank (SSL)</option><option value="free">Free</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Payment status</label>
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white">
                          <option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Payment via</label>
                        <select value={editForm.paymentType} onChange={e => setEditForm({ ...editForm, paymentType: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white">
                          <option value="">—</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option><option value="cash">Hand Cash</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => saveEdit(o._id)} disabled={savingEdit} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0142b2] text-white text-sm font-semibold rounded-md hover:bg-[#01368f] disabled:opacity-50">
                        {savingEdit ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />} Save changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-200 p-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiCreditCard size={12} /> Payment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailRow icon={FiDollarSign} label="Amount" value={row.free ? 'Free' : `${money(row.amount)}${isCourse && coursePrice && coursePrice !== row.amount ? ` (price ${money(coursePrice)})` : ''}`} />
                      <DetailRow icon={FiCreditCard} label="Method" value={row.method} />
                      <DetailRow icon={FiPhone} label="Paid from (number)" value={row.sender} />
                      <DetailRow icon={FiHash} label="Transaction ID" value={row.trx} mono />
                      <DetailRow icon={FiClock} label="Paid at" value={o.payment?.paidAt ? fmtDateTime(o.payment.paidAt) : 'Not approved yet'} />
                    </div>
                  </div>
                )}
              </div>

              {!editMode && row.status === 'pending' && (
                <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 shrink-0">
                  <button onClick={() => { setDetails(null); handleApprove(row); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#027a1e] text-white text-sm font-semibold rounded-md hover:bg-[#026318]">
                    <FiCheck size={14} /> Approve
                  </button>
                  <button onClick={() => { setDetails(null); handleCancel(row); }} className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50">
                    Cancel order
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {toastNode}
      {confirmNode}
    </div>
  );
}
