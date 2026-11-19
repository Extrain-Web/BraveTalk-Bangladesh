"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogsData } from "@/redux/blogSlice";
import Link from "next/link";
import {
    LuArrowLeft, LuArrowRight, LuCalendar, LuClock, LuNewspaper, LuShare2, LuLink, LuCheck,
    LuCircleAlert, LuSparkles, LuHouse, LuChevronRight,
} from "react-icons/lu";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";

const stripHtml = (html = "") => String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const readMinutes = (text) => Math.max(1, Math.round(stripHtml(text).split(" ").filter(Boolean).length / 200));

function ArticleSkeleton() {
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 animate-pulse">
            <div className="mb-6 h-4 w-24 rounded bg-slate-100" />
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="mt-3 h-9 w-4/5 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
            <div className="mt-8 aspect-video rounded-md bg-slate-100" />
            <div className="mt-8 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-3 rounded bg-slate-100" />)}
            </div>
        </div>
    );
}

const SingleBlog = () => {
    const params = useParams();
    const blogId = params.blogId;
    const dispatch = useDispatch();
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const { blogs = [] } = useSelector((state) => state.blogs || {});
    const [fetched, setFetched] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pageUrl, setPageUrl] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.resolve(dispatch(fetchBlogsData())).finally(() => {
            if (!cancelled) {
                setFetched(true);
                setPageUrl(window.location.href);
            }
        });
        return () => { cancelled = true; };
    }, [dispatch]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [blogId]);

    const list = Array.isArray(blogs) ? blogs : [];
    const blog = list.find((b) => b._id === blogId || b.id === blogId) || null;
    const relatedBlogs = blog
        ? list
            .filter((b) => b.status !== "draft" && b._id !== blog._id && (b.id === undefined || b.id !== blog.id))
            .sort((a, b) => (a.category === blog.category ? -1 : 0) - (b.category === blog.category ? -1 : 0))
            .slice(0, 3)
        : [];

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(isBn ? "bn-BD" : "en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const copyToClipboard = () => {
        navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!blog) {
        if (!fetched) return <ArticleSkeleton />;
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-50 text-2xl text-[#e5251f]">
                    <LuCircleAlert />
                </div>
                <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "আর্টিকেলটি পাওয়া যায়নি" : "Article not found"}</h1>
                <Link href="/blogs" className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
                    <LuArrowLeft /> {isBn ? "সব আর্টিকেল" : "All articles"}
                </Link>
            </div>
        );
    }

    const title = isBn && blog.titleBn ? blog.titleBn : blog.title;
    const content = isBn && blog.contentBn ? blog.contentBn : blog.content;
    const excerpt = isBn && blog.excerptBn ? blog.excerptBn : blog.excerpt;
    const author = blog.author || (isBn ? "ব্রেভটক বাংলাদেশ" : "BraveTalk Bangladesh");
    const shareText = encodeURIComponent(title || "");
    const shareUrl = encodeURIComponent(pageUrl);
    const shareLinks = [
        { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, Icon: FaFacebookF, label: "Facebook" },
        { key: "x", href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, Icon: FaXTwitter, label: "X" },
        { key: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, Icon: FaLinkedinIn, label: "LinkedIn" },
        { key: "whatsapp", href: `https://wa.me/?text=${shareText}%20${shareUrl}`, Icon: FaWhatsapp, label: "WhatsApp" },
    ];

    return (
        <div className="bg-white">
            {/* ---------- Header ---------- */}
            <section className="border-b border-slate-200 bg-slate-50 pb-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 sm:pt-8">
                    <nav aria-label="Breadcrumb" className={`mb-6 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 work ${bn}`}>
                        <Link href="/" className="inline-flex shrink-0 items-center gap-1 transition hover:text-[#0142b2]"><LuHouse /> {isBn ? "হোম" : "Home"}</Link>
                        <LuChevronRight className="shrink-0 text-slate-300" />
                        <Link href="/blogs" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "ব্লগ" : "Blog"}</Link>
                        <LuChevronRight className="shrink-0 text-slate-300" />
                        <span className="truncate font-medium text-[#0b1b4a]">{title}</span>
                    </nav>

                    <div className="flex flex-wrap items-center gap-2">
                        {blog.category && <span className="rounded-sm bg-[#0142b2] px-2 py-0.5 text-[11px] font-semibold text-white work">{blog.category}</span>}
                        {blog.featured && (
                            <span className={`inline-flex items-center gap-1 rounded-sm bg-[#e5251f] px-2 py-0.5 text-[11px] font-bold text-white work ${bn}`}>
                                <LuSparkles /> {isBn ? "ফিচার্ড" : "Featured"}
                            </span>
                        )}
                    </div>
                    <h1 className={`mt-3 text-[28px] sm:text-4xl lg:text-[42px] font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{title}</h1>
                    {excerpt && <p className={`mt-4 text-base sm:text-lg leading-relaxed text-slate-600 work ${bn}`}>{excerpt}</p>}

                    <div className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 work ${bn}`}>
                        <span className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#0142b2]">{author.charAt(0)}</span>
                            <span className="font-medium text-slate-700">{author}</span>
                        </span>
                        {(blog.createdAt || blog.date) && <span className="flex items-center gap-1.5"><LuCalendar className="text-[#0142b2]" /> {formatDate(blog.createdAt || blog.date)}</span>}
                        <span className="flex items-center gap-1.5"><LuClock className="text-[#0142b2]" /> {readMinutes(content || "")} {isBn ? "মিনিট পড়া" : "min read"}</span>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
                    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                        {blog.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={blog.image} alt={title} className="aspect-video w-full object-cover" />
                        ) : (
                            <div className="flex aspect-video w-full items-center justify-center bg-slate-100">
                                <LuNewspaper className="text-6xl text-[#0142b2]/30" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- Article ---------- */}
            <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-12">
                <div className={`space-y-5 text-[15px] sm:text-base leading-relaxed sm:leading-8 text-slate-700 work ${bn}`}>
                    {content?.split("\n").map((paragraph, idx) => (
                        paragraph.trim() && <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                {blog.tags?.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-8">
                        {blog.tags.map((tag, idx) => (
                            <span key={idx} className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className={`mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-8 work ${bn}`}>
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#0b1b4a]"><LuShare2 className="text-[#0142b2]" /> {isBn ? "শেয়ার করুন" : "Share"}</span>
                    {shareLinks.map(({ key, href, Icon, label }) => (
                        <a
                            key={key}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                        >
                            <Icon />
                        </a>
                    ))}
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                    >
                        {copied ? <LuCheck className="text-[#027a1e]" /> : <LuLink />}
                        {copied ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "লিংক কপি" : "Copy link")}
                    </button>
                </div>

                {/* Course CTA */}
                <div className="mt-10 rounded-md border border-slate-200 border-l-4 border-l-[#e5251f] bg-slate-50 p-6 sm:p-8">
                    <h2 className={`text-xl sm:text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>
                        {isBn ? "আত্মবিশ্বাসের সাথে কথা বলতে চান?" : "Ready to speak with confidence?"}
                    </h2>
                    <p className={`mt-2 text-sm text-slate-500 work ${bn}`}>
                        {isBn ? "স্পোকেন ইংলিশ ও পাবলিক স্পিকিং কোর্সে মেন্টরের সাথে প্র্যাকটিস করুন। বক্তা হও, নেতা হও!" : "Practise with a mentor in our spoken English and public speaking courses. Be a Speaker, Be a Leader!"}
                    </p>
                    <Link href="/courses" className={`mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#e5251f] to-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition hover:bg-[#01368f] work ${bn}`}>
                        {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
                    </Link>
                </div>
            </article>

            {/* ---------- Related ---------- */}
            {relatedBlogs.length > 0 && (
                <section className="border-t border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16">
                        <h2 className={`border-l-4 border-[#e5251f] pl-3 text-2xl sm:text-[28px] font-bold text-[#0b1b4a] outfit ${bn}`}>
                            {isBn ? "আরও পড়ুন" : "Keep reading"}
                        </h2>
                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedBlogs.map((rb) => {
                                const rTitle = isBn && rb.titleBn ? rb.titleBn : rb.title;
                                return (
                                    <Link
                                        key={rb._id || rb.id}
                                        href={`/blogs/${rb._id || rb.id}`}
                                        className={`group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md work ${bn}`}
                                    >
                                        <div className="aspect-[16/9] overflow-hidden bg-slate-50">
                                            {rb.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={rb.image} alt={rTitle} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                                    <LuNewspaper className="text-4xl text-[#0142b2]/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            {rb.category && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f]">{rb.category}</p>}
                                            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">{rTitle}</h3>
                                            {(rb.createdAt || rb.date) && <p className="mt-auto pt-3 text-xs text-slate-400">{formatDate(rb.createdAt || rb.date)}</p>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default SingleBlog;
