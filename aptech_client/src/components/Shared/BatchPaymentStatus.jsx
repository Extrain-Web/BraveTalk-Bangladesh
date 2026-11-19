'use client';

// Per-batch payment status — one-time full payment per student (no installments / dues).
// Shows who has paid, how much, and whose payment is still pending verification.
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FiUsers, FiCheckCircle, FiClock, FiSearch, FiX, FiLoader, FiRefreshCw,
  FiArrowLeft, FiPhone, FiDollarSign, FiShoppingCart,
} from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
const getToken = () => localStorage.getItem('token') || '';

const formatTk = (n) => `৳${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function BatchPaymentStatus({ batchId, basePath }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | paid | pending

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/analytics/batch-details/${batchId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const r = await res.json();
      if (r.success) setDetails(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><FiLoader className="animate-spin text-teal-500" size={28} /></div>;
  if (!details) return (
    <div className="text-center py-20">
      <p className="text-sm text-slate-500">Failed to load</p>
      <Link href={`${basePath}/payment-progress`} className="text-sm text-teal-600 hover:underline mt-2 inline-block">← Back</Link>
    </div>
  );

  const payment = details.payment || {};
  const students = details.students || [];
  const statusOf = (sid) => students.find((s) => String(s._id) === String(sid))?.paymentStatus || 'pending';
  const rows = (payment.perStudent || []).map((ps) => ({
    ...ps,
    status: statusOf(ps.studentId) === 'paid' ? 'paid' : 'pending',
    amount: ps.admissionPayment || 0, // the one-time payment submitted at checkout
  }));
  const paidRows = rows.filter((r) => r.status === 'paid');
  const pendingRows = rows.filter((r) => r.status !== 'paid');
  const collected = paidRows.reduce((s, r) => s + r.amount, 0);
  const pendingAmount = pendingRows.reduce((s, r) => s + r.amount, 0);

  const filtered = rows.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(r.name || '').toLowerCase().includes(q) && !(r.email || '').toLowerCase().includes(q) && !(r.phone || '').includes(q)) return false;
    }
    if (filter === 'paid') return r.status === 'paid';
    if (filter === 'pending') return r.status !== 'paid';
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All', count: rows.length, active: 'bg-slate-700 text-white border-slate-700' },
    { id: 'paid', label: 'Paid', count: paidRows.length, active: 'bg-emerald-600 text-white border-emerald-600' },
    { id: 'pending', label: 'Pending Verification', count: pendingRows.length, active: 'bg-amber-500 text-white border-amber-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`${basePath}/payment-progress`} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition shrink-0">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 outfit">{details.batch?.name || 'Batch'}</h1>
            <p className="text-xs text-slate-400">{details.batch?.courseName || ''} • {fmtDate(details.batch?.startDate)} — {fmtDate(details.batch?.endDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingRows.length > 0 && (
            <Link href={`${basePath}/orders`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition">
              <FiShoppingCart size={12} /> Verify in Orders
            </Link>
          )}
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Course Price', value: formatTk(payment.coursePrice), border: 'border-slate-200', color: 'text-slate-700', icon: FiDollarSign },
          { label: 'Total Collected', value: formatTk(collected), border: 'border-emerald-200', color: 'text-emerald-600', icon: FiCheckCircle },
          { label: 'Paid Students', value: `${paidRows.length} / ${rows.length}`, border: 'border-teal-200', color: 'text-teal-600', icon: FiUsers },
          { label: 'Pending Verification', value: `${pendingRows.length} · ${formatTk(pendingAmount)}`, border: 'border-amber-200', color: 'text-amber-600', icon: FiClock },
        ].map((c) => (
          <div key={c.label} className={`bg-white border ${c.border} rounded-xl px-4 py-3`}>
            <p className="text-[10px] text-slate-400 font-medium uppercase flex items-center gap-1"><c.icon size={10} /> {c.label}</p>
            <p className={`text-lg font-bold ${c.color} mt-0.5`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${filter === f.id ? f.active : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              {f.label}
              <span className={`ml-1 ${filter === f.id ? 'text-white/80' : 'text-slate-400'}`}>({f.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-56 shrink-0">
          <FiSearch size={13} className="text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..." className="text-sm text-slate-600 outline-none bg-transparent w-full" />
          {search && <button onClick={() => setSearch('')}><FiX size={12} className="text-slate-400" /></button>}
        </div>
      </div>

      {/* Students */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FiUsers className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm text-slate-500">No students found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Phone</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.studentId || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {r.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{r.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500"><span className="flex items-center gap-1"><FiPhone size={10} /> {r.phone || '—'}</span></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${r.status === 'paid' ? 'text-emerald-600' : 'text-slate-500'}`}>{formatTk(r.amount)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${r.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {r.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400">{fmtDate(r.enrolledAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
