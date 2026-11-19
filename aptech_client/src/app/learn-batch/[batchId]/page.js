'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight,
    FiVideo, FiFileText, FiPlay,
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
    if (!videoId) {
        const m = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (m) videoId = m[1];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1` : null;
}
function getDriveEmbedUrl(url) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
    return null;
}
function getVimeoEmbedUrl(url) {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : null;
}
function getContentType(url) {
    if (!url) return 'unknown';
    const l = url.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('drive.google.com')) return 'gdrive';
    if (l.includes('vimeo.com')) return 'vimeo';
    if (l.endsWith('.mp4') || l.endsWith('.webm') || l.endsWith('.ogg')) return 'video';
    if (l.endsWith('.mp3') || l.endsWith('.wav')) return 'audio';
    if (l.includes('cloudinary') && (l.includes('/video/') || l.includes('.mp4'))) return 'video';
    return 'link';
}

// Extract the class number from a title like "Class 03" -> "03".
// Falls back to position-based numbering if title has no digits.
const classNumberFrom = (title, fallbackIdx) => {
    if (title) {
        const m = String(title).match(/(\d+)/);
        if (m) return m[1].padStart(2, '0');
    }
    return String((fallbackIdx ?? 0) + 1).padStart(2, '0');
};

const normalizeRecordings = (cls) => {
    if (Array.isArray(cls.recordings) && cls.recordings.length > 0) return cls.recordings;
    if (cls.recordingUrl) return [{ title: 'Recording', url: cls.recordingUrl }];
    return [];
};

export default function BatchPlayerPage({ params }) {
    const { batchId } = use(params);
    const router = useRouter();
    const videoRef = useRef(null);

    const [batch, setBatch] = useState(null);
    const [course, setCourse] = useState(null);
    const [classes, setClasses] = useState([]);         // class folders (modules)
    const [allLessons, setAllLessons] = useState([]);   // flat playlist (recordings)
    const [currentLesson, setCurrentLesson] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = getToken();

                const enrollRes = await fetch(`${API}/enrollments/my-enrollments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const enrollData = await enrollRes.json();
                const enrollment = (enrollData.data || []).find(e => {
                    const id = typeof e.batchId === 'object' ? e.batchId?._id : e.batchId;
                    return id === batchId;
                });
                if (!enrollment) {
                    router.push('/dashboard/user/materials');
                    return;
                }
                setBatch(typeof enrollment.batchId === 'object' ? enrollment.batchId : null);
                setCourse(typeof enrollment.courseId === 'object' ? enrollment.courseId : null);

                const classRes = await fetch(`${API}/classes/student/schedule?batchIds=${batchId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const cData = await classRes.json();
                const all = cData.success ? cData.data || [] : [];
                all.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

                const mods = [];
                const flat = [];
                all.forEach((cls, classIdx) => {
                    const recs = normalizeRecordings(cls);
                    const lessons = recs.map((rec, recIdx) => ({
                        _id: `${cls._id}-r${recIdx}`,
                        classId: cls._id,
                        moduleId: cls._id,
                        moduleTitle: cls.title || `Class ${classIdx + 1}`,
                        title: rec.title || `Recording ${recIdx + 1}`,
                        type: 'video',
                        videoUrl: rec.url,
                        videoDuration: 0,
                        description: cls.topic || '',
                        date: cls.date,
                        partIndex: recIdx,
                        partTotal: recs.length,
                        materials: cls.materials || [],
                        notes: cls.notes,
                        meetingLink: cls.meetingLink,
                        venue: cls.venue,
                    }));
                    flat.push(...lessons);
                    mods.push({
                        _id: cls._id,
                        title: cls.title || `Class ${classIdx + 1}`,
                        date: cls.date,
                        lessons,
                    });
                });

                setClasses(mods);
                setAllLessons(flat);

                const exp = {};
                mods.forEach(m => { exp[m._id] = true; });
                setExpandedModules(exp);

                if (flat.length > 0) setCurrentLesson(flat[0]);
            } catch (err) {
                console.error('Failed to load player:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [batchId, router]);

    const currentIndex = allLessons.findIndex(l => l._id === currentLesson?._id);
    const goToLesson = (lesson) => { setCurrentLesson(lesson); };
    const goNext = () => { if (currentIndex < allLessons.length - 1) goToLesson(allLessons[currentIndex + 1]); };
    const goPrev = () => { if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1]); };

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-11 h-11">
                        <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
                        <div className="absolute inset-0 border-[3px] border-transparent border-t-teal-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Loading recordings...</p>
                </div>
            </div>
        );
    }

    if (!course || allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center px-6">
                <FiVideo size={44} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">No Recordings Yet</h2>
                <p className="text-slate-400 mb-6 text-center max-w-sm">Your mentor hasn&apos;t uploaded any class recordings for this batch.</p>
                <Link href={`/dashboard/user/materials/${batchId}`} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition">
                    Back to Class Folders
                </Link>
            </div>
        );
    }

    const groupedByModule = classes.map(cls => ({
        ...cls,
        lessons: allLessons.filter(l => l.moduleId === cls._id),
    }));

    const type = getContentType(currentLesson?.videoUrl);
    const youtubeUrl = type === 'youtube' ? getYouTubeEmbedUrl(currentLesson?.videoUrl) : null;
    const driveUrl = type === 'gdrive' ? getDriveEmbedUrl(currentLesson?.videoUrl) : null;
    const vimeoUrl = type === 'vimeo' ? getVimeoEmbedUrl(currentLesson?.videoUrl) : null;
    const iframeUrl = youtubeUrl || driveUrl || vimeoUrl;

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            {/* ═══════ Top Navigation Bar ═══════ */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm">
              <div className="max-w-[1440px] mx-auto h-[56px] flex items-center px-4 lg:px-6 gap-3">
                <Link
                    href={`/dashboard/user/materials/${batchId}`}
                    className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition text-sm font-medium"
                >
                    <FiArrowLeft size={18} />
                    <span className="hidden sm:inline">Back</span>
                </Link>

                <div className="w-px h-6 bg-slate-200" />

                <div className="flex-1 min-w-0">
                    <h1 className="text-slate-800 font-semibold text-sm truncate max-w-[300px] lg:max-w-[500px]">
                        {course?.title || 'Class Recordings'}
                    </h1>
                </div>

                {/* Position Pill */}
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 rounded-full px-4 py-1.5 border border-slate-200/60">
                    <span className="text-xs text-slate-500 font-semibold tabular-nums">
                        Recording {currentIndex + 1} / {allLessons.length}
                    </span>
                    {batch?.id && (
                        <span className="text-[11px] text-teal-600 font-mono font-bold">
                            {batch.id}
                        </span>
                    )}
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
                        {iframeUrl ? (
                            <div className="aspect-video w-full max-h-[calc(100vh-280px)]">
                                <iframe
                                    key={currentLesson._id}
                                    src={iframeUrl}
                                    title={currentLesson.title}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    frameBorder="0"
                                />
                            </div>
                        ) : type === 'video' ? (
                            <div className="aspect-video w-full max-h-[calc(100vh-280px)]">
                                <video
                                    ref={videoRef}
                                    key={currentLesson._id}
                                    src={currentLesson.videoUrl}
                                    controls
                                    controlsList="nodownload noremoteplayback"
                                    disablePictureInPicture
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="w-full h-full"
                                    autoPlay
                                    onEnded={() => goNext()}
                                />
                            </div>
                        ) : type === 'audio' ? (
                            <div className="bg-white aspect-video w-full max-h-[calc(100vh-280px)] flex flex-col items-center justify-center gap-4">
                                <FiPlay size={42} className="text-teal-500" />
                                <audio src={currentLesson.videoUrl} controls autoPlay className="w-full max-w-md" onEnded={() => goNext()} />
                            </div>
                        ) : (
                            <div className="bg-white aspect-video w-full max-h-[calc(100vh-280px)] flex flex-col items-center justify-center gap-3">
                                <FiVideo className="text-slate-400" size={42} />
                                <p className="text-slate-700 font-medium">{currentLesson?.title}</p>
                                <a href={currentLesson?.videoUrl} target="_blank" rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition">
                                    Open externally
                                </a>
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
                                        {currentLesson?.partTotal > 1 && (
                                            <span className="ml-2 text-amber-600 font-bold">
                                                · Part {currentLesson.partIndex + 1} of {currentLesson.partTotal}
                                            </span>
                                        )}
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
                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1.5">
                                    <FiPlay size={11} /> Recording {currentIndex + 1} of {allLessons.length}
                                </span>
                                {currentLesson?.date && (
                                    <span className="flex items-center gap-1.5">
                                        <FiClock size={11} />
                                        {new Date(currentLesson.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                )}
                                <Link
                                    href={`/dashboard/user/materials/${batchId}/${currentLesson.classId}`}
                                    className="text-teal-600 hover:text-teal-700 font-semibold transition"
                                >
                                    View full class →
                                </Link>
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
                                <div className="max-w-3xl space-y-4">
                                    <div>
                                        <h3 className="text-slate-800 font-semibold mb-2">About this class</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {currentLesson?.description || 'No description available for this class.'}
                                        </p>
                                    </div>
                                    {currentLesson?.notes && (
                                        <div>
                                            <h3 className="text-slate-800 font-semibold mb-2">Notes</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{currentLesson.notes}</p>
                                        </div>
                                    )}
                                    {(currentLesson?.meetingLink || currentLesson?.venue) && (
                                        <div className="flex gap-3 flex-wrap pt-2">
                                            {currentLesson.meetingLink && (
                                                <a href={currentLesson.meetingLink} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition">
                                                    🔗 Meeting Link
                                                </a>
                                            )}
                                            {currentLesson.venue && (
                                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                                                    📍 {currentLesson.venue}
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                                        <p className="text-slate-400 text-sm">No materials available for this class.</p>
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
                                {allLessons.length} videos
                            </span>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <FiX size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Modules (Classes) */}
                    <div className="flex-1 overflow-y-auto course-sidebar-scroll">
                        {groupedByModule.map((mod, modIdx) => {
                            const modLessons = mod.lessons || [];
                            return (
                                <div key={mod._id} className="border-b border-slate-100">
                                    <button
                                        onClick={() => setExpandedModules(prev => ({ ...prev, [mod._id]: !prev[mod._id] }))}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 group-hover:bg-teal-50 group-hover:text-teal-600 transition">
                                            {classNumberFrom(mod.title, modIdx)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-slate-700 font-semibold truncate">{mod.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-slate-400">
                                                    {modLessons.length > 0
                                                        ? `${modLessons.length} recording${modLessons.length > 1 ? 's' : ''}`
                                                        : 'No recording yet'}
                                                </span>
                                                {mod.date && (
                                                    <>
                                                        <span className="text-[11px] text-slate-300">·</span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {new Date(mod.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {expandedModules[mod._id] ? <FiChevronUp className="text-slate-400" size={14} /> : <FiChevronDown className="text-slate-400" size={14} />}
                                    </button>

                                    {expandedModules[mod._id] && modLessons.length > 0 && (
                                        <div className="bg-slate-50/30">
                                            {modLessons.map((lesson, lesIdx) => {
                                                const isActive = currentLesson?._id === lesson._id;
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
                                                            ${isActive
                                                                ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                                                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                            }`}>
                                                            {isActive ? <FiPlay size={11} /> : lesIdx + 1}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[13px] truncate ${isActive ? 'text-teal-700 font-semibold' : 'text-slate-600'}`}>
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <FiVideo size={10} className="text-slate-300" />
                                                                <span className="text-[11px] text-slate-400">
                                                                    {lesson.partTotal > 1 ? `Part ${lesson.partIndex + 1}/${lesson.partTotal}` : 'Video'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {expandedModules[mod._id] && modLessons.length === 0 && (
                                        <div className="bg-slate-50/30 px-4 py-3">
                                            <p className="text-[11px] text-slate-400 italic">No recording uploaded yet</p>
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
