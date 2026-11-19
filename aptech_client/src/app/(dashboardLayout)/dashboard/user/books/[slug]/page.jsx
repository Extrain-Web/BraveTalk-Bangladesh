"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    LuArrowLeft, LuChevronLeft, LuChevronRight, LuCirclePlay, LuClock, LuDownload,
    LuFileText, LuListVideo, LuLock, LuBookOpen,
} from "react-icons/lu";
import { FiLoader, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import YouTubePlayer from "@/components/Books/YouTubePlayer";
import { booksApi } from "@/lib/booksApi";

const storageKey = (slug) => `bt_book_last_lesson_${slug}`;

const readLast = (slug) => {
    try {
        return localStorage.getItem(storageKey(slug));
    } catch {
        return null;
    }
};

const saveLast = (slug, id) => {
    try {
        localStorage.setItem(storageKey(slug), id);
    } catch {
        /* storage unavailable */
    }
};

export default function BookReaderPage() {
    const params = useParams();
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    const { language } = useLanguage();
    const bn = language === "bn" ? "hind-siliguri" : "";
    const L = (en, bnText) => (language === "bn" ? bnText : en);

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [current, setCurrent] = useState(0);

    const load = async () => {
        if (!slug) return;
        setLoading(true);
        setError("");
        try {
            const data = await booksApi.content(slug);
            setBook(data);
            const vids = [...(data?.videos || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const last = readLast(slug);
            const idx = last ? vids.findIndex((v) => String(v._id) === last) : -1;
            setCurrent(idx >= 0 ? idx : 0);
        } catch (e) {
            setError(e.message || "Failed to load book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const lessons = useMemo(
        () => [...(book?.videos || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [book]
    );
    const lesson = lessons[current];

    const goTo = (i) => {
        if (i < 0 || i >= lessons.length) return;
        setCurrent(i);
        if (lessons[i]?._id) saveLast(slug, String(lessons[i]._id));
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // ── Loading / error ──
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <FiLoader className="animate-spin text-[#F3A522]" size={28} />
                <p className={`ml-3 text-sm text-slate-500 ${bn}`}>{L("Loading book...", "বই লোড হচ্ছে...")}</p>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="poppins space-y-4">
                <BackLink L={L} bn={bn} />
                <div className="rounded-2xl border border-red-100 bg-white p-12 text-center">
                    <FiAlertCircle className="mx-auto mb-3 text-4xl text-red-300" />
                    <p className="text-sm font-semibold text-slate-700">{error || L("Book not found", "বইটি পাওয়া যায়নি")}</p>
                    <button
                        onClick={load}
                        className={`mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 ${bn}`}
                    >
                        <FiRefreshCw size={13} /> {L("Try again", "আবার চেষ্টা করুন")}
                    </button>
                </div>
            </div>
        );
    }

    const header = (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50 sm:h-24 sm:w-[76px]">
                    {book.coverImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={book.coverImage} alt={book.title} className="h-full w-full object-contain p-1" />
                    )}
                </div>
                <div className="min-w-0">
                    {book.category && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f]">{book.category}</p>}
                    <h1 className={`line-clamp-2 text-lg font-bold leading-snug text-slate-900 outfit sm:text-xl ${bn}`}>{book.title}</h1>
                    <p className="mt-0.5 text-xs text-slate-500">{book.author}</p>
                    {book.hasAccess !== false && lessons.length > 0 && (
                        <p className={`mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 ${bn}`}>
                            <LuListVideo className="text-[#0142b2]" /> {lessons.length} {L("lessons", "টি লেসন")}
                        </p>
                    )}
                </div>
            </div>
            {book.hasAccess !== false && book.pdfUrl && (
                <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0142b2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#01368f] sm:w-auto ${bn}`}
                >
                    <LuDownload size={15} /> {L("Download / Read full book (PDF)", "পুরো বই পড়ুন / ডাউনলোড (PDF)")}
                </a>
            )}
        </div>
    );

    // ── Locked ──
    if (book.hasAccess === false) {
        return (
            <div className="poppins space-y-5">
                <BackLink L={L} bn={bn} />
                {header}
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b1b4a] to-[#0142b2] text-white">
                        <LuLock className="text-2xl" />
                    </div>
                    <h2 className={`text-lg font-bold text-slate-800 ${bn}`}>{L("This book is locked", "এই বইটি লক করা আছে")}</h2>
                    <p className={`mx-auto mt-2 max-w-md text-sm text-slate-500 ${bn}`}>
                        {L(
                            "Get this book to unlock the full PDF and all video lessons. If you already ordered it, access opens once your payment is verified.",
                            "পুরো PDF ও সব ভিডিও লেসন আনলক করতে বইটি নিন। আগে অর্ডার করে থাকলে পেমেন্ট যাচাইয়ের পর অ্যাক্সেস চালু হবে।"
                        )}
                    </p>
                    <Link
                        href={`/books/${book.slug || slug}`}
                        className={`mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0142b2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#01368f] ${bn}`}
                    >
                        <LuBookOpen size={15} /> {L("View book details", "বইয়ের বিস্তারিত দেখুন")}
                    </Link>
                </div>
            </div>
        );
    }

    // ── Reader ──
    return (
        <div className="poppins space-y-5">
            <BackLink L={L} bn={bn} />
            {header}

            {lessons.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                        <LuFileText className="text-3xl text-[#0142b2]" />
                    </div>
                    <h2 className={`text-lg font-bold text-slate-800 ${bn}`}>{L("No video lessons for this book", "এই বইয়ের কোনো ভিডিও লেসন নেই")}</h2>
                    <p className={`mx-auto mt-2 max-w-md text-sm text-slate-500 ${bn}`}>
                        {book.pdfUrl
                            ? L("Use the button above to read or download the full book.", "পুরো বই পড়তে বা ডাউনলোড করতে উপরের বাটন ব্যবহার করুন।")
                            : L("Content will be added soon.", "শীঘ্রই কনটেন্ট যোগ করা হবে।")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
                    {/* Main: player + lesson details */}
                    <div className="min-w-0 space-y-4">
                        <YouTubePlayer
                            url={lesson?.youtubeUrl}
                            title={lesson?.title || book.title}
                            locked={!!lesson?.locked}
                            lockedText={L("This lesson is locked.", "এই লেসনটি লক করা আছে।")}
                        />

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className={`text-[11px] font-semibold uppercase tracking-wider text-[#c9871a] ${bn}`}>
                                        {L("Lesson", "লেসন")} {current + 1} / {lessons.length}
                                    </p>
                                    <h2 className={`mt-0.5 text-lg font-bold leading-snug text-slate-900 outfit ${bn}`}>{lesson?.title}</h2>
                                    {lesson?.duration && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                            <LuClock size={12} /> {lesson.duration}
                                        </p>
                                    )}
                                </div>
                                {lesson?.pdfUrl && (
                                    <a
                                        href={lesson.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 rounded-lg border border-[#0142b2]/20 bg-blue-50 px-3 py-2 text-xs font-bold text-[#0142b2] transition hover:bg-[#0142b2] hover:text-white ${bn}`}
                                    >
                                        <LuFileText size={14} /> {L("Lesson PDF", "লেসন PDF")}
                                    </a>
                                )}
                            </div>

                            {lesson?.notes && (
                                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className={`mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ${bn}`}>{L("Notes", "নোট")}</p>
                                    <p className={`whitespace-pre-line break-words text-sm leading-relaxed text-slate-600 ${bn}`}>{lesson.notes}</p>
                                </div>
                            )}

                            {/* Prev / Next */}
                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <button
                                    onClick={() => goTo(current - 1)}
                                    disabled={current === 0}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 ${bn}`}
                                >
                                    <LuChevronLeft size={15} /> {L("Previous", "আগের")}
                                </button>
                                <button
                                    onClick={() => goTo(current + 1)}
                                    disabled={current >= lessons.length - 1}
                                    className={`inline-flex items-center gap-1.5 rounded-lg bg-[#F3A522] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d88f13] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 ${bn}`}
                                >
                                    {L("Next", "পরের")} <LuChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Side: lesson list */}
                    <aside className="min-w-0">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-[84px]">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h3 className={`flex items-center gap-2 text-sm font-bold text-slate-800 ${bn}`}>
                                    <LuListVideo className="text-[#0142b2]" /> {L("Lessons", "লেসনসমূহ")}
                                </h3>
                                <span className="text-[11px] font-semibold text-slate-400">{current + 1}/{lessons.length}</span>
                            </div>
                            <ul className="max-h-[520px] divide-y divide-slate-50 overflow-y-auto">
                                {lessons.map((v, i) => {
                                    const active = i === current;
                                    return (
                                        <li key={v._id || i}>
                                            <button
                                                onClick={() => goTo(i)}
                                                className={`relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                                                    active ? "bg-[#FEF6E7]" : "hover:bg-slate-50"
                                                }`}
                                            >
                                                {active && <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-[#F3A522]" />}
                                                <span
                                                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                                        active ? "bg-[#F3A522] text-white" : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {v.locked ? <LuLock size={12} /> : active ? <LuCirclePlay size={14} /> : i + 1}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className={`line-clamp-2 text-[13px] leading-snug ${active ? "font-semibold text-[#a5680f]" : "font-medium text-slate-700"} ${bn}`}>
                                                        {v.title}
                                                    </span>
                                                    {v.duration && (
                                                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                                            <LuClock size={10} /> {v.duration}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

function BackLink({ L, bn }) {
    return (
        <Link
            href="/dashboard/user/books"
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#c9871a] ${bn}`}
        >
            <LuArrowLeft size={15} /> {L("Back to My Books", "আমার বইতে ফিরে যান")}
        </Link>
    );
}
