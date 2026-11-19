'use client';

import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiUsers, FiClock, FiBook, FiLoader, FiSearch,
  FiChevronDown, FiUserCheck, FiMapPin,
} from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

export default function AllBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get ALL batches (not just mentor's)
      const batchRes = await fetch(`${API}/batches`, { headers }).then(r => r.json());
      const allBatches = Array.isArray(batchRes) ? batchRes : (batchRes.data || []);
      setBatches(allBatches);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
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

  const statusCounts = {
    all: categorized.length,
    active: categorized.filter(b => b.computedStatus === 'active').length,
    upcoming: categorized.filter(b => b.computedStatus === 'upcoming').length,
    completed: categorized.filter(b => b.computedStatus === 'completed').length,
  };

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

  const statusDot = {
    active: 'bg-emerald-500', upcoming: 'bg-blue-500', completed: 'bg-slate-400',
  };
  const statusText = {
    active: 'text-emerald-700', upcoming: 'text-blue-700', completed: 'text-slate-500',
  };
  const statusLabel = {
    active: 'Running', upcoming: 'Upcoming', completed: 'Completed',
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiLoader className="animate-spin text-violet-500" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 outfit">All Batches</h1>
        <p className="text-sm text-slate-500 mt-0.5">All running, upcoming & completed batches across all mentors</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: statusCounts.all, bg: 'from-violet-500 to-purple-600', icon: FiBook },
          { label: 'Running', count: statusCounts.active, bg: 'from-emerald-500 to-teal-600', icon: FiClock },
          { label: 'Upcoming', count: statusCounts.upcoming, bg: 'from-blue-500 to-indigo-600', icon: FiCalendar },
          { label: 'Completed', count: statusCounts.completed, bg: 'from-slate-400 to-slate-500', icon: FiBook },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">{s.count}</p>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-wider mt-0.5">{s.label.toUpperCase()}</p>
                </div>
              </div>
            </div>
          );
        })}
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
          {Object.entries(statusCounts).map(([key, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition
                ${filter === key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {key === 'active' ? 'Running' : key} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Batch Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FiBook className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No Batches Found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? 'Try different search keywords' : 'No batches match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(batch => {
            const mentor = typeof batch.mentorId === 'object' ? batch.mentorId : null;
            const enrolledCount = batch.enrolledStudents || batch.currentStudents || 0;

            return (
              <div key={batch._id} className="bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusDot[batch.computedStatus] || 'bg-slate-400'}`} />
                    <span className={`text-[10px] font-bold uppercase ${statusText[batch.computedStatus] || 'text-slate-500'}`}>
                      {statusLabel[batch.computedStatus] || batch.computedStatus}
                    </span>
                  </div>
                  <code className="text-[10px] text-slate-400 font-mono">{batch.id || batch._id?.slice(-6)}</code>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition">
                      {batch.name || batch.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{batch.courseId?.title || batch.courseName}</p>
                  </div>

                  {/* Mentor Info */}
                  {mentor && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                        {mentor.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-violet-700">{mentor.name}</p>
                        <p className="text-[9px] text-violet-500">{mentor.designation || 'Mentor'}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCalendar size={12} className="text-blue-500" />
                      <span>{formatDate(batch.startDate)} → {formatDate(batch.endDate)}</span>
                    </div>

                    {batch.classTime && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FiClock size={12} className="text-amber-500" />
                        <span className="font-medium text-amber-700">{batch.classTime}</span>
                      </div>
                    )}

                    {batch.classDays?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {batch.classDays.map(day => (
                          <span key={day} className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <FiUsers size={12} className="text-violet-500" />
                      <span className="font-bold text-violet-700">{enrolledCount}</span>
                      <span className="text-slate-400">/ {batch.maxStudents || 50} students</span>
                    </div>
                    {batch.maxStudents && (
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (enrolledCount / batch.maxStudents) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
