'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBook, FiFolder, FiArrowRight, FiLoader, FiCalendar, FiClock, FiUsers, FiSearch, FiUserCheck } from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

export default function AllBatchMaterialsPage() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [classCounts, setClassCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get ALL batches
      const batchRes = await fetch(`${API}/batches`, { headers }).then(r => r.json());
      const batchList = Array.isArray(batchRes) ? batchRes : (batchRes.data || []);
      setBatches(batchList);

      // Fetch class count per batch
      const counts = {};
      await Promise.all(batchList.slice(0, 20).map(async (b) => {
        try {
          const res = await fetch(`${API}/classes/batch/${b._id}`, { headers }).then(r => r.json());
          counts[b._id] = res.data?.length || 0;
        } catch (e) { counts[b._id] = 0; }
      }));
      setClassCounts(counts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const categorized = batches.map(b => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    let computedStatus = b.status;
    if (b.status === 'active' || (start <= now && end >= now)) computedStatus = 'active';
    else if (end < now || b.status === 'completed') computedStatus = 'completed';
    else computedStatus = 'upcoming';
    return { ...b, computedStatus };
  });

  const filtered = categorized.filter(b => {
    if (filter !== 'all' && b.computedStatus !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (b.name || b.id || '').toLowerCase();
      const course = (b.courseName || b.courseId?.title || '').toLowerCase();
      const mentor = (b.mentorId?.name || '').toLowerCase();
      if (!name.includes(q) && !course.includes(q) && !mentor.includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><FiLoader className="animate-spin text-violet-500" size={28} /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 outfit">All Batch Materials</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage materials, meeting links & recordings for all batches</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
          <FiSearch size={14} className="text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search batch, course, mentor..."
            className="text-sm text-slate-600 outline-none bg-transparent w-full placeholder:text-slate-400" />
        </div>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {['all', 'active', 'upcoming', 'completed'].map(key => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition
                ${filter === key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {key === 'active' ? 'Running' : key}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FiFolder className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No Batches Found</h3>
          <p className="text-sm text-slate-500">No batches match your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(batch => {
            const classCount = classCounts[batch._id] || 0;
            const mentor = typeof batch.mentorId === 'object' ? batch.mentorId : null;
            const statusColor = batch.computedStatus === 'active'
              ? 'from-emerald-500 to-teal-600'
              : batch.computedStatus === 'upcoming' ? 'from-blue-500 to-indigo-600' : 'from-slate-400 to-slate-500';
            const statusLabel = batch.computedStatus === 'active' ? 'Running' : batch.computedStatus === 'upcoming' ? 'Upcoming' : 'Completed';

            return (
              <Link key={batch._id} href={`/dashboard/mentor/batch-materials/${batch._id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Top Banner */}
                <div className={`bg-gradient-to-r ${statusColor} px-5 py-4 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20" />
                    <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/15" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <code className="text-white/70 text-[10px] font-mono">{batch.id}</code>
                      <span className="text-[9px] font-bold uppercase text-white/80 bg-white/20 px-2 py-0.5 rounded">{statusLabel}</span>
                    </div>
                    <h3 className="text-white font-bold text-base mt-1.5 group-hover:underline underline-offset-2">{batch.name || batch.courseName}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{batch.courseId?.title || batch.courseName}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  {/* Mentor Info */}
                  {mentor && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                        {mentor.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <p className="text-[11px] font-semibold text-violet-700">{mentor.name}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-1">
                        <FiFolder size={16} className="text-violet-600" />
                      </div>
                      <p className="text-lg font-bold text-slate-800">{classCount}</p>
                      <p className="text-[10px] text-slate-400">Classes</p>
                    </div>
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-1">
                        <FiClock size={16} className="text-blue-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{batch.classTime || '—'}</p>
                      <p className="text-[10px] text-slate-400">Time</p>
                    </div>
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-1">
                        <FiCalendar size={16} className="text-amber-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{batch.classDays?.length || 0}</p>
                      <p className="text-[10px] text-slate-400">Days/wk</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-violet-600 group-hover:text-violet-700 transition pt-2 border-t border-slate-100">
                    Open Materials <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
