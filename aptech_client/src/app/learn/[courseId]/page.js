'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight,
    FiVideo, FiFileText, FiPlay, FiCheck, FiCheckCircle,
    FiDownload, FiArrowLeft, FiX,
    FiBook, FiClock, FiList,
} from 'react-icons/fi';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let videoId = null;
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtube.com')) videoId = u.searchParams.get('v');
        else if (u.hostname.includes('youtu.be')) videoId = u.pathname.replace('/', '');
    } catch { }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
}

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const videoRef = useRef(null);
    const progressTimer = useRef(null);

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [allLessons, setAllLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});
    const [lessonProgress, setLessonProgress] = useState({});
    const [overallProgress, setOverallProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const accessRes = await fetch(`${API}/enrollments/check-access/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const accessData = await accessRes.json();
                if (!accessData.success || !accessData.data?.hasAccess) {
                    router.push(`/courses/${courseId}`);
                    return;
                }

                const [courseRes, modRes] = await Promise.all([
                    fetch(`${API}/courses/${courseId}`),
                    fetch(`${API}/modules/course/${courseId}`),
                ]);
                const courseData = await courseRes.json();
                const modData = await modRes.json();
                setCourse(courseData.data || courseData);
                const mods = modData.data || [];
                setModules(mods);

                const lessonPromises = mods.map(async (mod) => {
                    const res = await fetch(`${API}/lessons/module/${mod._id}`);
                    const data = await res.json();
                    return (data.data || []).map(l => ({ ...l, moduleTitle: mod.title, moduleId: mod._id }));
                });
                const flatLessons = (await Promise.all(lessonPromises)).flat();
                setAllLessons(flatLessons);

                const expanded = {};
                mods.forEach(m => { expanded[m._id] = true; });
                setExpandedModules(expanded);

                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (storedUser._id) {
                    const progRes = await fetch(`${API}/lessons/progress/${courseId}/${storedUser._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const progData = await progRes.json();
                    if (progData.success && progData.data) {
                        const progMap = {};
                        (progData.data.progress || []).forEach(p => { progMap[p.lessonId] = p; });
                        setLessonProgress(progMap);
                        setOverallProgress(progData.data.overallPercent || 0);
                    }
                }

                const lessonParam = searchParams.get('lesson');
                if (lessonParam && flatLessons.length > 0) {
                    setCurrentLesson(flatLessons.find(l => l._id === lessonParam) || flatLessons[0]);
                } else if (flatLessons.length > 0) {
                    setCurrentLesson(flatLessons[0]);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [courseId, router, searchParams]);

    const saveProgress = useCallback(async () => {
        if (!videoRef.current || !currentLesson || currentLesson.type !== 'video') return;
        const video = videoRef.current;
        if (!video.duration) return;
        const watchedPercent = Math.round((video.currentTime / video.duration) * 100);
        const lastPosition = Math.round(video.currentTime);
        try {
            const token = getToken();
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch(`${API}/lessons/${currentLesson._id}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ courseId, studentId: storedUser._id, watchedPercent, lastPosition }),
            });
            setLessonProgress(prev => ({
                ...prev,
                [currentLesson._id]: { ...prev[currentLesson._id], watchedPercent, lastPosition, isCompleted: watchedPercent >= 90 },
            }));
            if (watchedPercent >= 90) {
                const progRes = await fetch(`${API}/lessons/progress/${courseId}/${storedUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const progData = await progRes.json();
                if (progData.success) setOverallProgress(progData.data.overallPercent || 0);
            }
        } catch { }
    }, [currentLesson, courseId]);

    useEffect(() => {
        if (currentLesson?.type === 'video' && !getYouTubeEmbedUrl(currentLesson.videoUrl)) {
            progressTimer.current = setInterval(saveProgress, 15000);
            return () => clearInterval(progressTimer.current);
        }
    }, [currentLesson, saveProgress]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const h = () => saveProgress();
        v.addEventListener('pause', h); v.addEventListener('ended', h);
        return () => { v.removeEventListener('pause', h); v.removeEventListener('ended', h); };
    }, [saveProgress]);

    useEffect(() => {
        if (!currentLesson || !videoRef.current) return;
        const p = lessonProgress[currentLesson._id];
        if (p?.lastPosition && p.lastPosition > 0 && !p.isCompleted) videoRef.current.currentTime = p.lastPosition;
    }, [currentLesson, lessonProgress]);

    const currentIndex = allLessons.findIndex(l => l._id === currentLesson?._id);
    const goToLesson = (lesson) => { saveProgress(); setCurrentLesson(lesson); };
    const goNext = () => { if (currentIndex < allLessons.length - 1) goToLesson(allLessons[currentIndex + 1]); };
    const goPrev = () => { if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1]); };
    const completedCount = Object.values(lessonProgress).filter(p => p.isCompleted).length;

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-11 h-11">
                        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
                        <div className="absolute inset-0 border-[3px] border-transparent border-t-teal-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course || allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center">
                <FiBook size={44} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">No Lessons Available</h2>
                <p className="text-slate-400 mb-6">This course doesn&apos;t have any lessons yet.</p>
                <Link href="/dashboard/user/courses" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition">
                    Back to Courses
                </Link>
            </div>
        );
    }

    const groupedByModule = modules.map(mod => ({
        ...mod,
        lessons: allLessons.filter(l => l.moduleId === mod._id),
    }));
    const youtubeUrl = getYouTubeEmbedUrl(currentLesson?.videoUrl);

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            {/* ═══════ Top Navigation Bar ═══════ */}
            {/* Sticky header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm">
              <div className="max-w-[1440px] mx-auto h-[56px] flex items-center px-4 lg:px-6 gap-3">
                <Link
                    href="/dashboard/user/courses"
                    className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition text-sm font-medium"
                >
                    <FiArrowLeft size={18} />
                    <span className="hidden sm:inline">My Courses</span>
                </Link>

                <div className="w-px h-6 bg-slate-200" />

                <div className="flex-1 min-w-0">
                    <h1 className="text-slate-800 font-semibold text-sm truncate max-w-[300px] lg:max-w-[500px]">
                        {course.title}
                    </h1>
                </div>

                {/* Progress Pill */}
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 rounded-full px-4 py-1.5 border border-slate-200/60">
                    <div className="w-28 h-[5px] bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold tabular-nums">
                        {overallProgress}%
                    </span>
                    <span className="text-[11px] text-slate-400">
                        ({completedCount}/{allLessons.length})
                    </span>
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                    title={sidebarOpen ? 'Hide content' : 'Show content'}
                >
                    <FiList size={18} />
                </button>
              </div>
            </header>

            {/* ═══════ Main Content ═══════ */}
            <div className="max-w-[1440px] mx-auto flex gap-5 px-4 lg:px-6 py-5">
                {/* ─── Video + Info ─── */}
                <main className="flex-1 min-w-0">
                    {/* Video Player — always dark bg for contrast */}
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm">
                        {currentLesson?.type === 'video' && youtubeUrl ? (
                            <div className="aspect-video w-full max-h-[calc(100vh-280px)]">
                                <iframe
                                    key={currentLesson._id}
                                    src={youtubeUrl}
                                    title={currentLesson.title}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    frameBorder="0"
                                />
                            </div>
                        ) : currentLesson?.type === 'video' && currentLesson.videoUrl ? (
                            <div className="aspect-video w-full max-h-[calc(100vh-280px)]">
                                <video ref={videoRef} key={currentLesson._id} src={currentLesson.videoUrl} controls controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} className="w-full h-full" autoPlay />
                            </div>
                        ) : currentLesson?.type === 'text' ? (
                            <div className="bg-white p-8 lg:p-12 min-h-[40vh]">
                                <div className="max-w-3xl mx-auto prose">
                                    <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                                        {currentLesson.textContent || 'No content available.'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-12 min-h-[40vh] flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <FiFileText className="text-slate-400" size={24} />
                                </div>
                                <h3 className="text-slate-800 text-lg font-bold mb-1">{currentLesson?.title}</h3>
                                <p className="text-slate-400 text-sm">{currentLesson?.type === 'quiz' ? 'Quiz' : 'Assignment'} — coming soon</p>
                            </div>
                        )}
                    </div>

                    {/* ─── Below Video ─── */}
                    <div className="bg-white rounded-xl border border-slate-200/60 mt-4 shadow-sm overflow-hidden">
                        {/* Lesson Info + Nav */}
                        <div className="px-5 lg:px-8 py-5 border-b border-slate-100">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-teal-600 text-xs font-semibold uppercase tracking-wider mb-1.5">
                                        {currentLesson?.moduleTitle}
                                    </p>
                                    <h2 className="text-slate-900 text-xl font-bold leading-tight">{currentLesson?.title}</h2>
                                    {currentLesson?.description && (
                                        <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl">
                                            {currentLesson.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={goPrev}
                                        disabled={currentIndex === 0}
                                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={goNext}
                                        disabled={currentIndex === allLessons.length - 1}
                                        className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm shadow-teal-600/20"
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <FiPlay size={11} /> Lesson {currentIndex + 1} of {allLessons.length}
                                </span>
                                {currentLesson?.videoDuration && (
                                    <span className="flex items-center gap-1.5">
                                        <FiClock size={11} /> {Math.round(currentLesson.videoDuration / 60)} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-5 lg:px-8 border-b border-slate-100">
                            <div className="flex gap-0">
                                {['Overview', 'Materials'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.toLowerCase()
                                            ? 'text-teal-600 border-teal-500'
                                            : 'text-slate-400 border-transparent hover:text-slate-600'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="px-5 lg:px-8 py-6">
                            {activeTab === 'overview' && (
                                <div className="max-w-3xl">
                                    <h3 className="text-slate-800 font-semibold mb-3">About this lesson</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {currentLesson?.description || 'No description available for this lesson.'}
                                    </p>
                                </div>
                            )}
                            {activeTab === 'materials' && (
                                <div>
                                    {currentLesson?.materials?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                                            {currentLesson.materials.map((mat, idx) => (
                                                <a
                                                    key={idx}
                                                    href={mat.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 transition group"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-teal-200 transition">
                                                        <FiFileText className="text-slate-400 group-hover:text-teal-500" size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-700 truncate font-medium">{mat.title}</p>
                                                        <p className="text-xs text-slate-400 uppercase">{mat.fileType}</p>
                                                    </div>
                                                    <FiDownload className="text-slate-300 group-hover:text-teal-500" size={14} />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm">No materials available for this lesson.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* ═══════ Sidebar ═══════ */}
                <aside className={`${sidebarOpen ? 'w-[350px]' : 'w-0 lg:hidden'} bg-white border border-slate-200/60 rounded-xl flex-shrink-0 overflow-hidden transition-all duration-300 flex flex-col fixed lg:relative lg:sticky lg:top-[76px] right-0 top-0 h-full lg:h-[calc(100vh-96px)] z-20 shadow-xl lg:shadow-sm`}>
                    {/* Header */}
                    <div className="h-[52px] px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0 bg-slate-50/50 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <FiBook size={15} className="text-teal-600" />
                            <h3 className="text-slate-800 font-semibold text-sm">Course Content</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                {completedCount}/{allLessons.length}
                            </span>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <FiX size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold tabular-nums">{overallProgress}%</span>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="flex-1 overflow-y-auto course-sidebar-scroll">
                        {groupedByModule.map((mod, modIdx) => {
                            const modLessons = mod.lessons || [];
                            const modCompleted = modLessons.filter(l => lessonProgress[l._id]?.isCompleted).length;

                            return (
                                <div key={mod._id} className="border-b border-slate-100">
                                    <button
                                        onClick={() => setExpandedModules(prev => ({ ...prev, [mod._id]: !prev[mod._id] }))}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 group-hover:bg-teal-50 group-hover:text-teal-600 transition">
                                            {String(modIdx + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-slate-700 font-semibold truncate">
                                                {mod.title?.replace(/Module \d+:\s*/, '')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-slate-400">{modLessons.length} lessons</span>
                                                {modCompleted > 0 && (
                                                    <>
                                                        <span className="text-[11px] text-slate-300">·</span>
                                                        <span className="text-[11px] text-teal-600 font-medium">{modCompleted} done</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {expandedModules[mod._id] ? <FiChevronUp className="text-slate-400" size={14} /> : <FiChevronDown className="text-slate-400" size={14} />}
                                    </button>

                                    {expandedModules[mod._id] && (
                                        <div className="bg-slate-50/30">
                                            {modLessons.map((lesson, lesIdx) => {
                                                const isActive = currentLesson?._id === lesson._id;
                                                const progress = lessonProgress[lesson._id];
                                                const isCompleted = progress?.isCompleted;

                                                return (
                                                    <button
                                                        key={lesson._id}
                                                        onClick={() => { goToLesson(lesson); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group
                                                            ${isActive
                                                                ? 'bg-teal-50 border-l-[3px] border-teal-500'
                                                                : 'hover:bg-slate-50 border-l-[3px] border-transparent'
                                                            }`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition
                                                            ${isCompleted
                                                                ? 'bg-teal-100 text-teal-600'
                                                                : isActive
                                                                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                                                                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                            }`}>
                                                            {isCompleted ? <FiCheck size={13} /> : isActive ? <FiPlay size={11} /> : lesIdx + 1}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[13px] truncate ${isActive ? 'text-teal-700 font-semibold' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <FiVideo size={10} className="text-slate-300" />
                                                                <span className="text-[11px] text-slate-400">
                                                                    {lesson.videoDuration ? `${Math.round(lesson.videoDuration / 60)} min` : 'Video'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isCompleted && <FiCheckCircle size={14} className="text-teal-500 flex-shrink-0" />}
                                                        {progress && !isCompleted && progress.watchedPercent > 0 && (
                                                            <div className="w-6 h-6 relative flex-shrink-0">
                                                                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                                                                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                                                                    <circle cx="12" cy="12" r="10" fill="none" stroke="#14b8a6" strokeWidth="2"
                                                                        strokeDasharray={`${progress.watchedPercent * 0.628} 62.8`} strokeLinecap="round" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-10" onClick={() => setSidebarOpen(false)} />
                )}
            </div>

            <style jsx global>{`
                .course-sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .course-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .course-sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .course-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
