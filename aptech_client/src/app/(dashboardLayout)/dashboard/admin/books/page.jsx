'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiBook, FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiClock,
  FiCheckCircle, FiDollarSign, FiAlertTriangle, FiVideo, FiRefreshCw, FiShoppingBag,
} from 'react-icons/fi';
import { booksApi, formatTaka, FORMAT_LABEL } from '@/lib/booksApi';
import { SkeletonCard } from '@/components/Shared/Skeleton';
import { useToast } from '@/components/Shared/Toast';
import { useConfirm } from '@/components/Shared/ConfirmModal';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
];

const statusBadge = (s) => (s === 'draft'
  ? 'bg-amber-50 text-amber-700 border-amber-200'
  : 'bg-emerald-50 text-emerald-700 border-emerald-200');

const hasPrinted = (b) => b.format === 'printed' || b.format === 'both';

const PriceCell = ({ b }) => {
  if (b.isFree) return <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">FREE</span>;
  const final = b.finalPrice ?? b.price;
  const discounted = final < b.price;
  return (
    <div className="leading-tight">
      <p className="text-sm font-semibold text-slate-800">{formatTaka(final)}</p>
      {discounted && <p className="text-[11px] text-slate-400 line-through">{formatTaka(b.price)}</p>}
    </div>
  );
};

const StockCell = ({ b }) => {
  if (!hasPrinted(b)) return <span className="text-sm text-slate-300">—</span>;
  const low = Number(b.stock) <= 5;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${Number(b.stock) === 0 ? 'text-rose-500' : low ? 'text-amber-600' : 'text-slate-700'}`}>
      {low && <FiAlertTriangle size={12} />} {b.stock ?? 0}
    </span>
  );
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const { showToast, toastNode } = useToast();
  const { confirm, confirmNode } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([booksApi.adminList(), booksApi.adminStats()]);
      setBooks(Array.isArray(list) ? list : []);
      setStats(st || null);
    } catch (err) {
      showToast('error', err.message || 'Could not load books');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (book) => {
    const ok = await confirm({
      title: 'Delete this book?',
      message: `"${book.title}" will be removed from the bookstore. Existing orders stay in the records.`,
      confirmText: 'Delete',
    });
    if (!ok) return;
    setDeleting(book._id);
    try {
      await booksApi.remove(book._id);
      showToast('success', 'Book deleted');
      load();
    } catch (err) {
      showToast('error', err.message || 'Could not delete the book');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books
      .filter(b => statusFilter === 'all' || (b.status || 'published') === statusFilter)
      .filter(b => !term
        || b.title?.toLowerCase().includes(term)
        || b.author?.toLowerCase().includes(term)
        || b.category?.toLowerCase().includes(term));
  }, [books, search, statusFilter]);

  const lowStock = stats?.lowStock || [];
  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks ?? books.length, icon: FiBook, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/admin/books/orders' },
    { label: 'Approved Orders', value: stats?.approvedOrders ?? 0, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Book Revenue', value: formatTaka(stats?.revenue), icon: FiDollarSign, color: 'text-[#c9871a]', bg: 'bg-[#FEF6E7]' },
  ];

  const renderActions = (b, compact = false) => (
    <div className={`flex items-center gap-1 ${compact ? '' : 'justify-end'}`}>
      <Link href={`/dashboard/admin/books/${b._id}/edit`} title="Edit"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 transition">
        <FiEdit2 size={15} />
      </Link>
      {b.status === 'draft' ? (
        <span title="Drafts are not visible on the site" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 cursor-not-allowed">
          <FiExternalLink size={15} />
        </span>
      ) : (
        <a href={`/books/${b.slug}`} target="_blank" rel="noreferrer" title="View on site"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#c9871a] hover:bg-[#FEF6E7] transition">
          <FiExternalLink size={15} />
        </a>
      )}
      <button onClick={() => handleDelete(b)} disabled={deleting === b._id} title="Delete"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition disabled:opacity-40">
        <FiTrash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 outfit">Books</h1>
          <p className="text-sm text-slate-500 mt-1">Manage printed & digital books and their video lessons</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/books/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-[#F0DFB4] hover:text-[#c9871a] transition">
            <FiShoppingBag size={15} /> Orders
            {stats?.pendingOrders > 0 && <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">{stats.pendingOrders}</span>}
          </Link>
          <Link href="/dashboard/admin/books/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F3A522] to-[#d88f13] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#F3A522]/25 hover:shadow-xl transition">
            <FiPlus size={16} /> Add Book
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !stats ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />) : statCards.map(s => {
          const inner = (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-semibold ${s.color} truncate`}>{s.value}</p>
                <p className="text-sm text-slate-400 truncate">{s.label}</p>
              </div>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:border-[#F0DFB4] transition">{inner}</Link>
          ) : (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">{inner}</div>
          );
        })}
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-700">
            <FiAlertTriangle size={15} /> Low stock ({lowStock.length})
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {lowStock.map((b, i) => (
              <span key={b._id || i} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs text-slate-700">
                <span className="truncate max-w-[220px]">{b.title}</span>
                <span className={`font-bold ${Number(b.stock) === 0 ? 'text-rose-500' : 'text-amber-600'}`}>{Number(b.stock) === 0 ? 'Out of stock' : `${b.stock} left`}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author or category…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#F3A522] focus:ring-2 focus:ring-[#F3A522]/15 transition" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {STATUS_TABS.map(t => (
              <button key={t.id} onClick={() => setStatusFilter(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${statusFilter === t.id ? 'bg-white shadow-sm text-[#c9871a]' : 'text-slate-500 hover:text-slate-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={load} title="Reload"
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#c9871a] hover:border-[#F0DFB4] transition">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <span className="hidden sm:inline text-sm text-slate-400 whitespace-nowrap">{filtered.length}/{books.length}</span>
        </div>
      </div>

      {/* List */}
      {loading && books.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm divide-y divide-slate-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-12 h-16 rounded-md bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2"><div className="h-3.5 w-1/3 bg-slate-200 rounded animate-pulse" /><div className="h-3 w-1/5 bg-slate-100 rounded animate-pulse" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200/60">
          <FiBook className="mx-auto text-4xl text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 outfit">{books.length ? 'No books match' : 'No books yet'}</h3>
          <p className="text-slate-500 text-sm mt-1">{books.length ? 'Try a different search or filter' : 'Add your first book to start selling'}</p>
          {!books.length && (
            <Link href="/dashboard/admin/books/create" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-[#F3A522] to-[#d88f13] text-white text-sm font-bold rounded-xl">
              <FiPlus size={15} /> Add Book
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-left">
                    {['Book', 'Type / Price', 'Format', 'Stock', 'Videos', 'Status', 'Orders', 'Revenue', ''].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 8 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-14 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                            {b.coverImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[260px]">{b.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[260px]">{b.author}{b.category ? ` · ${b.category}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><PriceCell b={b} /></td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{FORMAT_LABEL[b.format]?.en || b.format}</td>
                      <td className="px-4 py-3"><StockCell b={b} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600"><FiVideo size={13} className="text-slate-400" /> {(b.videos || []).length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${statusBadge(b.status)}`}>{b.status || 'published'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${b.pendingOrders > 0 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'}`} title="Pending">{b.pendingOrders || 0} pending</span>
                          <span className="px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700" title="Approved">{b.approvedOrders || 0} ✓</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{formatTaka(b.revenue)}</td>
                      <td className="px-4 py-3">{renderActions(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / tablet cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(b => (
              <div key={b._id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="flex gap-3 p-3.5">
                  <div className="w-16 h-[86px] rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    {b.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 outfit">{b.title}</p>
                      <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${statusBadge(b.status)}`}>{b.status || 'published'}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{b.author}</p>
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <PriceCell b={b} />
                      <span className="text-[11px] text-slate-500">{FORMAT_LABEL[b.format]?.en || b.format}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 border-t border-slate-100 text-center">
                  {[
                    { l: 'Stock', v: <StockCell b={b} /> },
                    { l: 'Videos', v: <span className="text-sm font-semibold text-slate-700">{(b.videos || []).length}</span> },
                    { l: 'Orders', v: <span className="text-sm font-semibold text-slate-700">{b.approvedOrders || 0}{b.pendingOrders > 0 && <span className="text-amber-600 text-[11px]"> +{b.pendingOrders}</span>}</span> },
                    { l: 'Revenue', v: <span className="text-sm font-semibold text-slate-700">{formatTaka(b.revenue)}</span> },
                  ].map((c, i) => (
                    <div key={c.l} className={`py-2 ${i ? 'border-l border-slate-100' : ''}`}>
                      <div>{c.v}</div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{c.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1.5">
                  <Link href={`/dashboard/admin/books/${b._id}/edit`} className="px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg">Edit book</Link>
                  {renderActions(b, true)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toastNode}
      {confirmNode}
    </div>
  );
}
