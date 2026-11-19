"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogsData } from "@/redux/blogSlice";
import Link from "next/link";
import { LuSearch, LuX, LuCalendar, LuClock, LuArrowRight, LuNewspaper, LuSparkles, LuChevronLeft, LuChevronRight, LuHouse } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImage } from "@/lib/siteImages";

const BLOGS_PER_PAGE = 9;

const stripHtml = (html = "") => String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const readMinutes = (blog) => {
    const words = stripHtml(blog?.content || blog?.contentBn || "").split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

const formatDate = (dateString, language) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
        year: "numeric", month: "short", day: "numeric",
    });
};

const getText = (blog, language) => {
    const title = language === "bn" && blog.titleBn ? blog.titleBn : blog.title;
    const rawExcerpt = language === "bn" && blog.excerptBn ? blog.excerptBn : blog.excerpt;
    const excerpt = rawExcerpt || (blog.content ? `${stripHtml(blog.content).substring(0, 160)}...` : "");
    return { title, excerpt };
};

const Cover = ({ blog, title, className = "" }) => (
    blog.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={blog.image} alt={title} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${className}`} />
    ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <LuNewspaper className="text-5xl text-[#0142b2]/30" />
        </div>
    )
);

function CardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="aspect-[16/9] bg-slate-100" />
            <div className="space-y-2.5 p-5">
                <div className="h-2.5 w-24 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
        </div>
    );
}

const BlogCard = ({ blog, language }) => {
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const { title, excerpt } = getText(blog, language);
    const href = `/blogs/${blog._id || blog.id}`;

    return (
        <Link href={href} className={`group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md work ${bn}`}>
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-50">
                <Cover blog={blog} title={title} />
                {blog.category && (
                    <span className="absolute left-2.5 top-2.5 rounded-sm bg-[#0142b2] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                        {blog.category}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    {(blog.createdAt || blog.date) && (
                        <span className="flex items-center gap-1"><LuCalendar /> {formatDate(blog.createdAt || blog.date, language)}</span>
                    )}
                    <span className="flex items-center gap-1"><LuClock /> {readMinutes(blog)} {isBn ? "মিনিট" : "min read"}</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">{title}</h3>
                {excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{excerpt}</p>}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-[#0142b2] transition-all group-hover:gap-2.5">
                    {isBn ? "আরও পড়ুন" : "Read article"} <LuArrowRight />
                </span>
            </div>
        </Link>
    );
};

const FeaturedBlogCard = ({ blog, language }) => {
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const { title, excerpt } = getText(blog, language);
    const href = `/blogs/${blog._id || blog.id}`;

    return (
        <Link href={href} className={`group grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md lg:grid-cols-2 work ${bn}`}>
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-50 lg:aspect-auto lg:min-h-[320px]">
                <Cover blog={blog} title={title} />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#e5251f] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                        <LuSparkles /> {isBn ? "ফিচার্ড" : "Featured"}
                    </span>
                    {blog.category && <span className="rounded-sm bg-[#0142b2] px-2 py-0.5 text-[11px] font-semibold text-white">{blog.category}</span>}
                </div>
                <h2 className="mt-4 text-2xl sm:text-3xl font-bold leading-tight text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">{title}</h2>
                {excerpt && <p className="mt-3 line-clamp-4 text-sm sm:text-[15px] leading-relaxed text-slate-500">{excerpt}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {blog.author && <span className="font-medium text-slate-600">{blog.author}</span>}
                    {(blog.createdAt || blog.date) && <span className="flex items-center gap-1"><LuCalendar /> {formatDate(blog.createdAt || blog.date, language)}</span>}
                    <span className="flex items-center gap-1"><LuClock /> {readMinutes(blog)} {isBn ? "মিনিট" : "min read"}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 self-start rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#01368f]">
                    {isBn ? "সম্পূর্ণ পড়ুন" : "Read full article"} <LuArrowRight />
                </span>
            </div>
        </Link>
    );
};

const BlogContent = () => {
    const dispatch = useDispatch();
    const { blogs = [], loading } = useSelector((state) => state.blogs || {});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const bannerImg = useSiteImage("blogBanner");

    useEffect(() => {
        dispatch(fetchBlogsData());
    }, [dispatch]);

    const list = Array.isArray(blogs) ? blogs : [];
    const categories = [...new Set(list.filter((b) => b.category).map((b) => b.category))];

    const q = searchQuery.trim().toLowerCase();
    const filteredBlogs = list.filter((blog) => {
        const matchesSearch = !q ||
            blog.title?.toLowerCase().includes(q) ||
            blog.titleBn?.includes(searchQuery.trim()) ||
            blog.excerpt?.toLowerCase().includes(q) ||
            blog.author?.toLowerCase().includes(q);
        const matchesCategory = !selectedCategory || blog.category === selectedCategory;
        const isPublished = blog.status !== "draft";
        return matchesSearch && matchesCategory && isPublished;
    });

    const featuredBlogs = filteredBlogs.filter((blog) => blog.featured).slice(0, 1);
    const regularBlogs = filteredBlogs.filter((blog) => !featuredBlogs.includes(blog));
    const totalPages = Math.ceil(regularBlogs.length / BLOGS_PER_PAGE);
    const page = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedBlogs = regularBlogs.slice((page - 1) * BLOGS_PER_PAGE, page * BLOGS_PER_PAGE);

    const setFilter = (fn) => { fn(); setCurrentPage(1); };
    const hasFilters = !!q || !!selectedCategory;

    return (
        <div className="min-h-screen bg-white">
            {/* ---------- Photo banner ---------- */}
            <section className="relative overflow-hidden bg-[#0b1b4a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerImg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#0b1b4a]/75" />
                <div className="relative z-10 mx-auto flex min-h-[240px] max-w-[1140px] 2xl:max-w-[1280px] flex-col justify-center px-4 sm:px-6 py-10 sm:min-h-[300px]">
                    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-white/70 work ${bn}`}>
                        <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white"><LuHouse /> {isBn ? "হোম" : "Home"}</Link>
                        <LuChevronRight className="text-white/40" />
                        <span className="font-medium text-white">{isBn ? "ব্লগ" : "Blog"}</span>
                    </nav>
                    <h1 className={`mt-3 text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-white outfit ${bn}`}>
                        {isBn ? "টিপস ও অনুপ্রেরণা" : "Tips & inspiration"}
                    </h1>
                    <p className={`mt-3 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-white/80 work ${bn}`}>
                        {isBn
                            ? "স্পোকেন ইংলিশ, পাবলিক স্পিকিং ও লিডারশিপ নিয়ে সহজ টিপস, গাইড আর গল্প।"
                            : "Practical tips, guides and stories on spoken English, public speaking and leadership."}
                    </p>

                    <div className="mt-6 max-w-xl">
                        <div className="relative">
                            <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setFilter(() => setSearchQuery(e.target.value))}
                                placeholder={isBn ? "আর্টিকেল খুঁজুন..." : "Search articles..."}
                                className={`w-full rounded-md border border-white/20 bg-white py-3 pl-10 pr-10 text-sm text-[#0b1b4a] shadow-sm outline-none transition focus:ring-2 focus:ring-[#0142b2]/40 work ${bn}`}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setFilter(() => setSearchQuery(""))}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <LuX />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- List ---------- */}
            <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 lg:py-14">
                {categories.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                            {["", ...categories].map((cat) => (
                                <button
                                    key={cat || "all"}
                                    type="button"
                                    onClick={() => setFilter(() => setSelectedCategory(cat))}
                                    className={`shrink-0 rounded-md border px-4 py-2 text-xs sm:text-[13px] font-semibold transition work ${bn} ${
                                        selectedCategory === cat
                                            ? "border-[#0142b2] bg-[#0142b2] text-white"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                                    }`}
                                >
                                    {cat || (isBn ? "সব" : "All")}
                                </button>
                            ))}
                        </div>
                        {!loading && (
                            <p className={`text-xs text-slate-500 work ${bn}`}>
                                {isBn ? `${filteredBlogs.length}টি আর্টিকেল` : `${filteredBlogs.length} ${filteredBlogs.length === 1 ? "article" : "articles"}`}
                            </p>
                        )}
                    </div>
                )}

                {loading && list.length === 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-2xl text-[#0142b2]">
                            <LuNewspaper />
                        </div>
                        <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                            {hasFilters ? (isBn ? "কোনো আর্টিকেল পাওয়া যায়নি" : "No articles found") : (isBn ? "নতুন আর্টিকেল শীঘ্রই আসছে" : "New articles are coming soon")}
                        </h3>
                        <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bn}`}>
                            {hasFilters
                                ? (isBn ? "অন্য শব্দ দিয়ে খুঁজুন অথবা ক্যাটাগরি পরিবর্তন করুন।" : "Try different keywords or another category.")
                                : (isBn ? "আমরা টিপস ও গাইড লিখছি — আবার দেখুন!" : "We're writing tips and guides — check back soon!")}
                        </p>
                        {hasFilters ? (
                            <button
                                type="button"
                                onClick={() => setFilter(() => { setSearchQuery(""); setSelectedCategory(""); })}
                                className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#01368f] work ${bn}`}
                            >
                                {isBn ? "সব আর্টিকেল দেখুন" : "Show all articles"}
                            </button>
                        ) : (
                            <Link href="/courses" className={`mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work ${bn}`}>
                                {isBn ? "কোর্স দেখুন" : "Browse courses"} <LuArrowRight />
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {featuredBlogs.length > 0 && page === 1 && (
                            <div className="mb-8">
                                <FeaturedBlogCard blog={featuredBlogs[0]} language={language} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedBlogs.map((blog) => (
                                <BlogCard key={blog._id || blog.id} blog={blog} language={language} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    aria-label="Previous page"
                                    className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <LuChevronLeft />
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    if (i === 0 || i === totalPages - 1 || (i >= page - 2 && i <= page)) {
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`h-10 w-10 rounded-md text-sm font-semibold transition ${page === i + 1
                                                    ? "bg-[#0142b2] text-white"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    }
                                    if (i === page - 3 || i === page + 1) return <span key={i} className="px-1 text-slate-400">…</span>;
                                    return null;
                                })}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    aria-label="Next page"
                                    className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <LuChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

const Blogs = () => (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0142b2] border-t-transparent" /></div>}>
        <BlogContent />
    </Suspense>
);

export default Blogs;
