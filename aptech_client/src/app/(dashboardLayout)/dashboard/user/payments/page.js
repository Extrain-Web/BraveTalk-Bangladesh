'use client';

import React, { useState, useEffect } from 'react';
import {
  FiDollarSign, FiDownload, FiLoader, FiFilter,
  FiCheckCircle, FiClock, FiXCircle, FiCreditCard,
} from 'react-icons/fi';

import { useToast } from '@/components/Shared/Toast';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

export default function UserPaymentsPage() {
  const { showToast, toastNode } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = { Authorization: `Bearer ${token}` };
      const eRes = await fetch(`${API}/enrollments/my-enrollments`, { headers });
      const eData = await eRes.json();
      if (eData.success) setEnrollments(eData.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDownloadInvoice = async (enrollmentId) => {
    setDownloadingId(enrollmentId);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API}/invoice/download/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${enrollmentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        showToast('error', 'Failed to download invoice');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <FiCheckCircle size={12} /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            <FiClock size={12} /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            <FiXCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Show the REAL method (manual হলে bKash/Nagad/Rocket, cash হলে Hand Cash)
  const getMethodLabel = (payment = {}) => {
    const method = payment.method;
    const via = payment.gatewayData?.paymentType;
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
    switch (method) {
      case 'bkash': return { label: 'bKash', icon: '🅱️', color: 'text-pink-600' };
      case 'sslcommerz': return { label: 'Card/Bank', icon: '💳', color: 'text-blue-600' };
      case 'cash': return { label: 'Hand Cash', icon: '💵', color: 'text-emerald-600' };
      case 'free': return { label: 'Free', icon: '🎁', color: 'text-green-600' };
      case 'manual': return {
        label: via ? cap(via) : 'Bank Transfer',
        icon: via === 'bkash' ? '🅱️' : via === 'nagad' ? '🟠' : via === 'rocket' ? '🟣' : '🏦',
        color: 'text-amber-600',
      };
      default: return { label: cap(method) || '—', icon: '💰', color: 'text-slate-600' };
    }
  };

  const filtered = filter === 'all'
    ? enrollments
    : enrollments.filter(e => e.payment?.status === filter);

  // One-time full payment per course — amount is what the student paid for that purchase
  const totalPaid = enrollments
    .filter(e => e.payment?.status === 'paid')
    .reduce((acc, e) => acc + (Number(e.payment?.amount) || 0), 0);
  const totalPending = enrollments.filter(e => e.payment?.status === 'pending').length;

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
        <FiLoader className="animate-spin text-[#F3A522]" size={30} />
        <p className="ml-3 text-slate-500">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <p className="text-slate-500 text-sm mt-1">View your payment records and download invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FiDollarSign className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Paid</p>
              <p className="text-xl font-bold text-slate-900 outfit">৳{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiCreditCard className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Courses Purchased</p>
              <p className="text-xl font-bold text-slate-900 outfit">{enrollments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <FiClock className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending</p>
              <p className="text-xl font-bold text-slate-900 outfit">{totalPending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm w-fit">
        {[
          { id: 'all', label: 'All' },
          { id: 'paid', label: 'Paid' },
          { id: 'pending', label: 'Pending' },
          { id: 'failed', label: 'Failed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab.id
              ? 'bg-[#F3A522] text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment Records */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <FiCreditCard className="mx-auto text-4xl text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Payment Records</h3>
          <p className="text-slate-500 text-sm">No payments found for the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TrxID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((enrollment) => {
                  const course = enrollment.courseId || {};
                  const payment = enrollment.payment || {};
                  const method = getMethodLabel(payment);

                  return (
                    <tr key={enrollment._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.image && (
                            <img src={course.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{course.title || 'Course'}</p>
                            <p className="text-[11px] text-slate-400">{course.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          {payment.method === 'free' || Number(payment.amount) === 0 ? 'Free' : `৳${(Number(payment.amount) || 0).toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${method.color}`}>
                          <span>{method.icon}</span>
                          {method.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500">{payment.transactionId || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : new Date(enrollment.enrolledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === 'paid' && (
                            <button
                              onClick={() => handleDownloadInvoice(enrollment._id)}
                              disabled={downloadingId === enrollment._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-[#F3A522] hover:text-white transition-all disabled:opacity-50"
                            >
                              {downloadingId === enrollment._id ? (
                                <FiLoader className="animate-spin" size={12} />
                              ) : (
                                <FiDownload size={12} />
                              )}
                              Invoice
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
        </div>
      )}

      {toastNode}
    </div>
  );
}
