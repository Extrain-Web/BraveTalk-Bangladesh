"use client";

import { useEffect, useState } from "react";
import { LuSearch, LuX, LuBookX, LuCirclePlay, LuTruck, LuFileText } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import BookCard from "@/components/Books/BookCard";
import { booksApi } from "@/lib/booksApi";

const FILTERS = [
    { key: "", en: "All", bn: "সব" },
    { key: "free", en: "Free", bn: "ফ্রি" },
    { key: "paid", en: "Paid", bn: "পেইড" },
    { key: "printed", en: "Printed", bn: "ছাপা বই" },
    { key: "digital", en: "Digital", bn: "ডিজিটাল" },
];

function CardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="space-y-2.5 p-4">
                <div className="h-2.5 w-16 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="h-5 w-20 rounded bg-slate-200 mt-4" />
            </div>
        </div>
    );
}

export default function BooksPage() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    // Debounced load whenever the search text or filter changes
    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const data = await booksApi.list({ search: search.trim(), type });
                if (!cancelled) setBooks(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) {
                    setBooks([]);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, search ? 350 : 0);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, type]);

    const resetFilters = () => {
        setSearch("");
        setType("");
    };

    return (
        <div className="bg-white min-h-screen">
            {/* ---------- Hero strip ---------- */}
            <section className="relative overflow-hidden border-b border-slate-100 bg-white">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-red-100/60 blur-[120px]" />
                    <div className="absolute -top-10 right-[-80px] h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-[120px]" />
                    <div className="absolute bottom-[-180px] left-1/3 h-[380px] w-[380px] rounded-full bg-emerald-100/60 blur-[120px]" />
                    <div className="absolute top-10 right-[22%] hidden h-2.5 w-2.5 rounded-full bg-[#0142b2] md:block" />
                </div>

                <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#027a1e]" />
                        <span className={`text-xs font-medium text-slate-600 work ${bn}`}>
                            {isBn ? "বই · পিডিএফ · ভিডিও লেসন" : "Books · PDFs · Video lessons"}
                        </span>
                    </div>
                    <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
                        {isBn ? (
                            <>বই ও <span className="text-[#e5251f]">ভিডিও লেসন</span></>
                        ) : (
                            <>Books & <span className="text-[#e5251f]">Video Lessons</span></>
                        )}
                    </h1>
                    <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
                        {isBn
                            ? "স্পোকেন ইংলিশ ও পাবলিক স্পিকিং শেখার জন্য বাছাই করা বই — প্রতিটি বইয়ের সাথে ভিডিও লেসন। ডিজিটাল কপি অথবা ঘরে বসে ছাপা বই।"
                            : "Hand-picked books for spoken English and public speaking — each one comes with video lessons. Read digitally or get a printed copy delivered home."}
                    </p>

                    <div className={`mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 work ${bn}`}>
                        <span className="flex items-center gap-1.5"><LuCirclePlay className="text-[#0142b2]" /> {isBn ? "ভিডিও লেসন" : "Video lessons"}</span>
                        <span className="flex items-center gap-1.5"><LuFileText className="text-[#0142b2]" /> {isBn ? "পিডিএফ" : "PDF reader"}</span>
                        <span className="flex items-center gap-1.5"><LuTruck className="text-[#0142b2]" /> {isBn ? "হোম ডেলিভারি" : "Home delivery"}</span>
                    </div>

                    {/* Search */}
                    <div className="mx-auto mt-7 max-w-xl">
                        <div className="relative">
                            <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isBn ? "বই বা লেখকের নাম লিখে খুঁজুন..." : "Search by book title or author..."}
                                className={`w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-[#0b1b4a] shadow-sm outline-none transition focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 work ${bn}`}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <LuX />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Filters + grid ---------- */}
            <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key || "all"}
                                type="button"
                                onClick={() => setType(f.key)}
                                className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-[13px] font-semibold transition work ${bn} ${
                                    type === f.key
                                        ? "border-[#0142b2] bg-[#0142b2] text-white shadow-md shadow-blue-900/20"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                                }`}
                            >
                                {isBn ? f.bn : f.en}
                            </button>
                        ))}
                    </div>
                    {!loading && !error && (
                        <p className={`text-xs text-slate-500 work ${bn}`}>
                            {isBn ? `${books.length}টি বই পাওয়া গেছে` : `${books.length} ${books.length === 1 ? "book" : "books"} found`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50/50 px-6 py-14 text-center">
                        <p className={`text-sm font-semibold text-[#e5251f] work ${bn}`}>
                            {isBn ? "বই লোড করা যায়নি" : "Could not load books"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 work">{error}</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-[#0142b2] shadow-sm">
                            <LuBookX />
                        </div>
                        <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                            {isBn ? "কোনো বই পাওয়া যায়নি" : "No books found"}
                        </h3>
                        <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bn}`}>
                            {search || type
                                ? isBn ? "অন্য কিছু লিখে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।" : "Try a different search or change the filter."
                                : isBn ? "নতুন বই শীঘ্রই আসছে। আবার দেখুন!" : "New books are coming soon. Check back later!"}
                        </p>
                        {(search || type) && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className={`mt-5 inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#01368f] work ${bn}`}
                            >
                                {isBn ? "সব বই দেখুন" : "Show all books"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {books.map((book) => <BookCard key={book._id || book.slug} book={book} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
