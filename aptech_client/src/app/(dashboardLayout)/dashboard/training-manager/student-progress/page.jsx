'use client';

import React, { useState, useEffect } from 'react';
import {
  FiLoader, FiUsers, FiSearch, FiX, FiChevronDown, FiBook,
  FiCheckCircle, FiClipboard, FiFileText, FiAward, FiCalendar,
} from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
};

const PROGRESS_FIELDS = [
  { key: 'attendance', label: 'Attendance', icon: FiCheckCircle, color: 'emerald' },
  { key: 'assignment', label: 'Assignment', icon: FiClipboard, color: 'blue' },
  { key: 'classPractice', label: 'Class Practice', icon: FiBook, color: 'violet' },
  { key: 'task', label: 'Task', icon: FiFileText, color: 'amber' },
  { key: 'finalExam', label: 'Final Exam', icon: FiAward, color: 'rose' },
];

export default function StudentProgressPage() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(user.role || 'admin');
    fetchBatches(user.role);
  }, []);

  const fetchBatches = async (userRole) => {
    try {
      const headers = getHeaders();
      let url = `${API}/batches`;
      if (userRole === 'mentor') {
        url = `${API}/batches/my-batches`;
      }
      const res = await fetch(url, { headers });
      const data = await res.json();
      setBatches(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleBatch = async (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      setBatchStudents([]);
      return;
    }
    setExpandedBatch(batchId);
    setLoadingStudents(true);
    setSearchTerm('');
    try {
      const res = await fetch(`${API}/analytics/batch-details/${batchId}`, { headers: getHeaders() });
      const data = await res.json();
      setBatchStudents(data.success ? data.data?.students || [] : []);
    } catch (err) {
      console.error(err);
      setBatchStudents([]);
    }
    setLoadingStudents(false);
  };

  const filteredStudents = batchStudents.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.phone || '').includes(term);
  });

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 60) return 'text-blue-600 bg-blue-50';
    if (pct >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-500 bg-red-50';
  };

  const getBarColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-blue-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiLoader className="animate-spin text-teal-500" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 outfit">Student Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">Batch-wise student progress tracking — Attendance, Assignments, Tasks & Exams</p>
      </div>

      {/* Batch List */}
      {batches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FiBook className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No Batches Found</h3>
          <p className="text-sm text-slate-500">No batches available to show student progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map(batch => {
            const isExpanded = expandedBatch === batch._id;
            return (
              <div key={batch._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                {/* Batch Header */}
                <button onClick={() => toggleBatch(batch._id)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        batch.status === 'active' || batch.status === 'running' ? 'from-emerald-500 to-teal-600' :
                        batch.status === 'upcoming' ? 'from-blue-500 to-indigo-600' :
                        'from-slate-400 to-slate-500'
                      } flex items-center justify-center text-white shadow-sm`}>
                        <FiBook size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800">{batch.name || batch.courseName}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            batch.status === 'active' || batch.status === 'running' ? 'bg-emerald-50 text-emerald-600' :
                            batch.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>{batch.status}</span>
                          <code className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">{batch.id}</code>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={10} />
                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUsers size={10} />
                            {batch.maxStudents || '—'} students
                          </span>
                        </p>
                      </div>
                    </div>
                    <FiChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded: Student Progress Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30">
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-12">
                        <FiLoader className="animate-spin text-teal-500" size={22} />
                        <span className="ml-2 text-sm text-slate-400">Loading students...</span>
                      </div>
                    ) : batchStudents.length === 0 ? (
                      <div className="text-center py-12 text-sm text-slate-400">
                        <FiUsers className="mx-auto mb-2" size={28} />
                        No students enrolled in this batch
                      </div>
                    ) : (
                      <div className="p-4">
                        {/* Search + Count */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-600">{filteredStudents.length} Students</span>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-52">
                            <FiSearch size={12} className="text-slate-400" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Search students..."
                              className="text-sm text-slate-600 outline-none bg-transparent w-full placeholder:text-slate-400" />
                            {searchTerm && (
                              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                                <FiX size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Table */}
                        <div className="bg-white rounded-xl border border-slate-100 overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-3 py-3 text-[13px] font-semibold text-slate-600">#</th>
                                <th className="text-left px-3 py-3 text-[13px] font-semibold text-slate-600">Student</th>
                                <th className="text-left px-3 py-3 text-[13px] font-semibold text-slate-600">Contact</th>
                                {PROGRESS_FIELDS.map(f => (
                                  <th key={f.key} className="text-center px-3 py-3 text-[13px] font-semibold text-slate-600">
                                    <div className="flex items-center justify-center gap-1">
                                      <f.icon size={12} />
                                      {f.label}
                                    </div>
                                  </th>
                                ))}
                                <th className="text-center px-3 py-3 text-[13px] font-semibold text-slate-600">Overall</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s, i) => {
                                // Calculate progress values
                                const attendancePct = s.attendancePct || 0;
                                const assignmentPct = s.assignmentsTotal > 0 ? Math.round((s.assignmentsSubmitted / s.assignmentsTotal) * 100) : 0;
                                const classPracticePct = s.classPracticePct || Math.round(Math.random() * 40 + 50); // placeholder until real data
                                const taskPct = s.taskPct || Math.round(Math.random() * 40 + 40); // placeholder
                                const finalExamPct = s.finalExamPct || 0;
                                const allPcts = [attendancePct, assignmentPct, s.classPracticePct || 0, s.taskPct || 0, finalExamPct];
                                const activePcts = allPcts.filter(p => p > 0);
                                const overallPct = activePcts.length > 0 ? Math.round(activePcts.reduce((a, b) => a + b, 0) / activePcts.length) : 0;

                                const progressValues = [
                                  { pct: attendancePct, detail: `${s.attendancePresent || 0}/${s.attendanceSessions || s.attendanceTotal || 0}` },
                                  { pct: assignmentPct, detail: `${s.assignmentsSubmitted || 0}/${s.assignmentsTotal || 0}` },
                                  { pct: s.classPracticePct || 0, detail: `—` },
                                  { pct: s.taskPct || 0, detail: `—` },
                                  { pct: finalExamPct, detail: finalExamPct > 0 ? `${finalExamPct}%` : '—' },
                                ];

                                return (
                                  <tr key={s._id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                    <td className="px-3 py-3 text-sm text-slate-400 font-mono">{i + 1}</td>
                                    <td className="px-3 py-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {s.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{s.name}</p>
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            s.studentStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                            s.studentStatus === 'dropout' ? 'bg-red-50 text-red-500' :
                                            'bg-slate-100 text-slate-500'
                                          }`}>{s.studentStatus || 'active'}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-3">
                                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{s.email || '—'}</p>
                                      <p className="text-xs text-slate-400">{s.phone || '—'}</p>
                                    </td>
                                    {progressValues.map((pv, idx) => (
                                      <td key={idx} className="px-3 py-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="w-14 bg-slate-100 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full transition-all ${getBarColor(pv.pct)}`}
                                              style={{ width: `${Math.min(pv.pct, 100)}%` }} />
                                          </div>
                                          <span className={`text-xs font-bold ${pv.pct >= 60 ? 'text-slate-700' : pv.pct > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                            {pv.pct > 0 ? `${pv.pct}%` : '—'}
                                          </span>
                                          <span className="text-[10px] text-slate-400">{pv.detail}</span>
                                        </div>
                                      </td>
                                    ))}
                                    <td className="px-3 py-3 text-center">
                                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${getProgressColor(overallPct)}`}>
                                        {overallPct > 0 ? `${overallPct}%` : '—'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 80%+ Excellent</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 60-79% Good</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 40-59% Average</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Below 40%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
