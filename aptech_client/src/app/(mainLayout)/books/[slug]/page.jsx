"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    LuArrowLeft, LuBookOpen, LuCirclePlay, LuFileText, LuTruck, LuLock, LuLockOpen,
    LuLoader, LuLibrary, LuShoppingCart, LuHourglass, LuExternalLink, LuGift, LuCircleAlert,
    LuPackage, LuClock, LuChevronRight, LuBadgeCheck, LuLanguages, LuEye, LuCircleCheck,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import YouTubePlayer from "@/components/Books/YouTubePlayer";
import { booksApi, formatTaka, isLoggedIn, FORMAT_LABEL } from "@/lib/booksApi";

function DetailSkeleton() {
    return (
        <div className="bg-slate-50">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-8 animate-pulse">
                <div className="h-3 w-48 rounded bg-slate-200" />
                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-4">
                        <div className="h-5 w-40 rounded bg-slate-200" />
                        <div className="h-9 w-4/5 rounded bg-slate-200" />
                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                        <div className="h-16 w-full rounded bg-slate-200" />
                        <div className="flex gap-3">
                            <div className="h-16 w-28 rounded-md bg-slate-200" />
                            <div className="h-16 w-28 rounded-md bg-slate-200" />
                            <div className="h-16 w-28 rounded-md bg-slate-200" />
                        </div>
                    </div>
                    <div className="h-[460px] rounded-md bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

/** Section heading with the red left accent, used inside the content panels. */
function PanelTitle({ children, bn }) {
    return <h2 className={`border-l-4 border-[#e5251f] pl-3 text-lg sm:text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{children}</h2>;
}

export default function BookDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState("");
    const [status, setStatus] = useState(null); // { hasAccess, pendingOrder, orders }
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [actionError, setActionError] = useState("");
    const [activeSection, setActiveSection] = useState("overview");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await booksApi.get(slug);
                if (cancelled) return;
                setBook(data);
                const firstPreview = (data?.videos || []).find((v) => v.isPreview && v.youtubeUrl);
                setActiveVideoId(firstPreview?._id || null);
                if (isLoggedIn() && !data.isFree) {
                    try {
                        const s = await booksApi.myStatus(slug);
                        if (!cancelled) setStatus(s);
                    } catch { /* status is optional — page still works without it */ }
                }
            } catch (err) {
                if (!cancelled) setNotFound(err.message || "Book not found");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [slug]);

    const handleReadFree = async () => {
        setActionError("");
        if (!isLoggedIn()) {
            router.push(`/login?redirect=/books/${slug}`);
            return;
        }
        setClaiming(true);
        try {
            await booksApi.claimFree(slug);
            const p = new URLSearchParams({ type: "book", status: "active", title: book?.title || "", amount: "0", method: "free", item: `/books/${slug}` });
            router.push(`/order-success?${p.toString()}`);
        } catch (err) {
            setActionError(err.message);
            setClaiming(false);
        }
    };

    if (loading) return <DetailSkeleton />;

    if (!book) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-50 text-2xl text-[#e5251f]">
                    <LuCircleAlert />
                </div>
                <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>
                    {isBn ? "বইটি পাওয়া যায়নি" : "Book not found"}
                </h1>
                <p className="mt-1 text-sm text-slate-500 work">{notFound}</p>
                <Link href="/books" className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
                    <LuArrowLeft /> {isBn ? "সব বই দেখুন" : "Browse books"}
                </Link>
            </div>
        );
    }

    const price = book.finalPrice ?? (book.isFree ? 0 : book.offerPrice || book.price);
    const hasOffer = !book.isFree && book.offerPrice > 0 && book.offerPrice < book.price;
    const percentOff = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
    const printed = book.format === "printed" || book.format === "both";
    const digital = book.format === "digital" || book.format === "both";
    const stock = Number(book.stock || 0);
    const outOfStock = printed && stock <= 0;
    const videos = [...(book.videos || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const activeVideo = videos.find((v) => v._id === activeVideoId) || null;
    const hasAccess = !!status?.hasAccess;
    const pendingOrder = status?.pendingOrder || null;
    // Can a new order still be placed? Digital-only books can't be re-ordered once owned/pending;
    // printed copies can always be ordered while in stock.
    const canOrderPrinted = printed && !outOfStock;
    const canOrderDigital = digital && !hasAccess && !pendingOrder;
    const canOrder = canOrderPrinted || canOrderDigital;
    const formatLabel = FORMAT_LABEL[book.format]?.[isBn ? "bn" : "en"] || book.format;

    const stockBadge = printed && (
        stock <= 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-2 py-1 text-[11px] font-semibold text-[#e5251f]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e5251f]" /> {isBn ? "স্টকে নেই" : "Out of stock"}
            </span>
        ) : stock <= 5 ? (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {isBn ? `মাত্র ${stock}টি বাকি` : `Only ${stock} left`}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-[#027a1e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#027a1e]" /> {isBn ? "স্টকে আছে" : "In stock"}
            </span>
        )
    );

    const orderLabel = hasAccess || pendingOrder
        ? (isBn ? "ছাপা কপি অর্ডার করুন" : "Order a printed copy")
        : (isBn ? `এখনই অর্ডার করুন ${formatTaka(price)}` : `Order now ${formatTaka(price)}`);

    // Small bordered stat boxes under the title (only real values)
    const stats = [
        book.pages > 0 && { Icon: LuBookOpen, value: book.pages, label: isBn ? "পৃষ্ঠা" : "Pages" },
        videos.length > 0 && { Icon: LuCirclePlay, value: videos.length, label: isBn ? "ভিডিও লেসন" : "Video lessons" },
        book.previewCount > 0 && { Icon: LuEye, value: book.previewCount, label: isBn ? "ফ্রি প্রিভিউ" : "Free previews" },
        book.language && { Icon: LuLanguages, value: book.language, label: isBn ? "ভাষা" : "Language" },
    ].filter(Boolean);

    // "This book includes" list in the sticky card
    const includes = [
        digital && { Icon: LuFileText, text: isBn ? "ডিজিটাল কপি (PDF রিডার)" : "Digital copy (PDF reader)" },
        printed && { Icon: LuTruck, text: isBn ? "ছাপা বই · হোম ডেলিভারি" : "Printed book · Home delivery" },
        book.videoCount > 0 && { Icon: LuCirclePlay, text: isBn ? `${book.videoCount}টি ভিডিও লেসন` : `${book.videoCount} video lessons` },
        book.pages > 0 && { Icon: LuBookOpen, text: isBn ? `${book.pages} পৃষ্ঠা` : `${book.pages} pages` },
        book.samplePdfUrl && { Icon: LuEye, text: isBn ? "নমুনা পৃষ্ঠা পড়ার সুযোগ" : "Free sample pages" },
    ].filter(Boolean);

    const sections = [
        { id: "overview", label: isBn ? "বিবরণ" : "Overview" },
        { id: "lessons", label: isBn ? `ভিডিও লেসন (${videos.length})` : `Video lessons (${videos.length})` },
        { id: "details", label: isBn ? "বিস্তারিত" : "Details" },
    ];

    const goTo = (id) => {
        setActiveSection(id);
        document.getElementById(`book-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const primaryBtn = "inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition work";

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* ---------- Breadcrumb ---------- */}
            <div className="border-b border-slate-200 bg-white">
                <nav
                    aria-label="Breadcrumb"
                    className={`mx-auto flex max-w-[1140px] 2xl:max-w-[1280px] items-center gap-1.5 overflow-hidden px-4 sm:px-6 py-3 text-xs text-slate-500 work ${bn}`}
                >
                    <Link href="/" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "হোম" : "Home"}</Link>
                    <LuChevronRight className="shrink-0 text-slate-400" />
                    <Link href="/books" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "বই" : "Books"}</Link>
                    <LuChevronRight className="shrink-0 text-slate-400" />
                    <span className="truncate font-medium text-[#0b1b4a]">{book.title}</span>
                </nav>
            </div>

            <div className="mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] gap-6 px-4 sm:px-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
                {/* ---------- Header info (left) ---------- */}
                <section className="lg:col-start-1 lg:row-start-1">
                    {/* Rectangular badges */}
                    <div className={`flex flex-wrap gap-1.5 work ${bn}`}>
                        <span className={`rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${book.isFree ? "bg-[#027a1e]" : "bg-[#0b1b4a]"}`}>
                            {book.isFree ? (isBn ? "ফ্রি" : "Free") : isBn ? "পেইড" : "Paid"}
                        </span>
                        {book.category && (
                            <span className="rounded-sm bg-[#0142b2] px-2 py-1 text-[11px] font-semibold text-white">{book.category}</span>
                        )}
                        {hasOffer && (
                            <span className="rounded-sm bg-[#e5251f] px-2 py-1 text-[11px] font-bold text-white">
                                {isBn ? "অফার" : "Offer"} -{percentOff}%
                            </span>
                        )}
                        <span className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">{formatLabel}</span>
                    </div>

                    <h1 className={`mt-3 text-[28px] sm:text-4xl font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{book.title}</h1>

                    {book.shortDescription && (
                        <p className={`mt-3 max-w-3xl text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>{book.shortDescription}</p>
                    )}

                    {/* Author chip */}
                    {book.author && (
                        <div className={`mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm work ${bn}`}>
                            <span className="text-slate-500">{isBn ? "লেখক" : "Author"}:</span>
                            <span className="font-semibold text-[#0b1b4a]">{book.author}</span>
                            <LuBadgeCheck className="text-[#0142b2]" />
                        </div>
                    )}

                    {/* Stat boxes */}
                    {stats.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                            {stats.map((s) => (
                                <div key={s.label} className="flex min-w-[112px] items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2.5">
                                    <s.Icon className="shrink-0 text-lg text-[#0142b2]" />
                                    <div className="leading-tight">
                                        <p className="text-sm font-bold text-[#0b1b4a] outfit">{s.value}</p>
                                        <p className={`text-[11px] text-slate-500 work ${bn}`}>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ---------- Sticky purchase card (right) ---------- */}
                <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
                    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
                        <div className="relative border-b border-slate-200 bg-slate-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={book.coverImage} alt={book.title} className="mx-auto aspect-[4/3] w-full object-contain p-4" />
                        </div>

                        <div className="p-5">
                            <div className="flex flex-wrap items-end gap-2">
                                <span className={`text-3xl font-bold outfit ${book.isFree ? "text-[#027a1e]" : "text-[#0b1b4a]"}`}>
                                    {book.isFree ? (isBn ? "ফ্রি" : "Free") : formatTaka(price)}
                                </span>
                                {hasOffer && <span className="pb-1 text-sm text-slate-400 line-through">{formatTaka(book.price)}</span>}
                            </div>
                            {hasOffer && (
                                <p className={`mt-1 text-xs font-semibold text-[#e5251f] work ${bn}`}>
                                    {isBn ? `নিয়মিত মূল্য থেকে ${percentOff}% ছাড়` : `${percentOff}% off the regular price`}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={`text-xs text-slate-500 work ${bn}`}>{formatLabel}</span>
                                {stockBadge}
                            </div>

                            {/* Pending notice */}
                            {pendingOrder && (
                                <div className={`mt-4 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-700 work ${bn}`}>
                                    <LuHourglass className="mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold">{isBn ? "অর্ডার পেন্ডিং — পেমেন্ট যাচাইয়ের অপেক্ষায়" : "Order pending — waiting for payment verification"}</p>
                                        <p className="mt-0.5 text-xs text-amber-600">
                                            {isBn ? "পেমেন্ট যাচাই হলে বইটি আপনার লাইব্রেরিতে যোগ হবে।" : "The book will be added to your library once the payment is verified."}
                                            {pendingOrder.orderNo ? ` (#${pendingOrder.orderNo})` : ""}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex flex-col gap-2.5">
                                {book.isFree ? (
                                    <button
                                        type="button"
                                        onClick={handleReadFree}
                                        disabled={claiming}
                                        className={`${primaryBtn} bg-[#027a1e] text-white shadow-sm hover:bg-[#026318] disabled:cursor-not-allowed disabled:opacity-70 ${bn}`}
                                    >
                                        {claiming ? <LuLoader className="animate-spin" /> : <LuGift />}
                                        {isBn ? "ফ্রি পড়ুন" : "Read for free"}
                                    </button>
                                ) : (
                                    <>
                                        {hasAccess && (
                                            <Link
                                                href={`/dashboard/user/books/${slug}`}
                                                className={`${primaryBtn} bg-[#027a1e] text-white shadow-sm hover:bg-[#026318] ${bn}`}
                                            >
                                                <LuLibrary /> {isBn ? "আমার বইয়ে খুলুন" : "Open in My Books"}
                                            </Link>
                                        )}
                                        {canOrder && (
                                            <Link
                                                href={`/books/checkout/${slug}`}
                                                className={`${primaryBtn} ${bn} ${
                                                    hasAccess || pendingOrder
                                                        ? "border border-slate-300 bg-white text-[#0b1b4a] hover:border-[#0142b2] hover:text-[#0142b2]"
                                                        : "bg-gradient-to-r from-[#e5251f] to-[#0142b2] text-white shadow-sm hover:shadow-md hover:brightness-110"
                                                }`}
                                            >
                                                {hasAccess || pendingOrder ? <LuPackage /> : <LuShoppingCart />} {orderLabel}
                                            </Link>
                                        )}
                                        {!canOrder && !hasAccess && !pendingOrder && outOfStock && (
                                            <span className={`${primaryBtn} bg-slate-100 text-slate-400 ${bn}`}>
                                                {isBn ? "বর্তমানে স্টকে নেই" : "Currently out of stock"}
                                            </span>
                                        )}
                                    </>
                                )}
                                {book.samplePdfUrl && (
                                    <a
                                        href={book.samplePdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2] hover:text-[#0142b2] work ${bn}`}
                                    >
                                        <LuExternalLink /> {isBn ? "নমুনা পড়ুন" : "Read sample"}
                                    </a>
                                )}
                            </div>
                            {actionError && <p className={`mt-3 text-sm font-medium text-[#e5251f] work ${bn}`}>{actionError}</p>}

                            {includes.length > 0 && (
                                <div className="mt-5 border-t border-slate-200 pt-4">
                                    <p className={`text-sm font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "এই বইয়ে যা পাচ্ছেন" : "This book includes"}</p>
                                    <ul className="mt-2.5 space-y-2">
                                        {includes.map((it) => (
                                            <li key={it.text} className={`flex items-center gap-2.5 text-sm text-slate-600 work ${bn}`}>
                                                <it.Icon className="shrink-0 text-[#0142b2]" /> {it.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ---------- Tab strip + content panels (left) ---------- */}
                <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-2">
                    <div className="flex overflow-x-auto rounded-md border border-slate-200 bg-white [scrollbar-width:none]">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => goTo(s.id)}
                                className={`shrink-0 border-b-2 px-4 sm:px-5 py-3 text-sm font-semibold transition work ${bn} ${
                                    activeSection === s.id ? "border-[#e5251f] text-[#0b1b4a]" : "border-transparent text-slate-500 hover:text-[#0b1b4a]"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    <section id="book-overview" className="scroll-mt-24 rounded-md border border-slate-200 bg-white p-5 sm:p-6">
                        <PanelTitle bn={bn}>{isBn ? "বইটি সম্পর্কে" : "About this book"}</PanelTitle>
                        <div className={`mt-4 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>
                            {book.description}
                        </div>
                    </section>

                    {/* Lessons */}
                    <section id="book-lessons" className="scroll-mt-24 rounded-md border border-slate-200 bg-white p-5 sm:p-6">
                        <PanelTitle bn={bn}>{isBn ? "ভেতরে যা আছে" : "What's inside"}</PanelTitle>
                        <p className={`mt-2 text-xs text-slate-500 work ${bn}`}>
                            {videos.length > 0
                                ? isBn
                                    ? `${videos.length}টি ভিডিও লেসন${book.previewCount ? ` · ${book.previewCount}টি ফ্রি প্রিভিউ` : ""}`
                                    : `${videos.length} video lessons${book.previewCount ? ` · ${book.previewCount} free preview${book.previewCount > 1 ? "s" : ""}` : ""}`
                                : isBn ? "এই বইয়ের সাথে কোনো ভিডিও লেসন নেই।" : "This book has no video lessons."}
                        </p>

                        {videos.length > 0 && (
                            <div className="mt-4 space-y-4">
                                {activeVideo && (
                                    <div>
                                        <YouTubePlayer
                                            url={activeVideo.youtubeUrl}
                                            title={activeVideo.title}
                                            locked={!activeVideo.youtubeUrl}
                                            lockedText={isBn ? "বইটি পাওয়ার পর এই লেসনটি আনলক হবে।" : "This lesson unlocks after you get the book."}
                                        />
                                        <p className={`mt-2 text-sm font-semibold text-[#0b1b4a] work ${bn}`}>{activeVideo.title}</p>
                                    </div>
                                )}

                                <ul className="overflow-hidden rounded-md border border-slate-200 bg-white divide-y divide-slate-200">
                                    {videos.map((v, i) => {
                                        const playable = v.isPreview && !!v.youtubeUrl;
                                        const active = v._id === activeVideoId;
                                        return (
                                            <li key={v._id || i}>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveVideoId(v._id)}
                                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active ? "bg-blue-50/70" : "hover:bg-slate-50"}`}
                                                >
                                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${active ? "bg-[#0142b2] text-white" : "bg-slate-100 text-slate-500"}`}>
                                                        {i + 1}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className={`block truncate text-sm font-medium ${playable ? "text-[#0b1b4a]" : "text-slate-500"} work ${bn}`}>{v.title}</span>
                                                        {v.duration && (
                                                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 work">
                                                                <LuClock /> {v.duration}
                                                            </span>
                                                        )}
                                                    </span>
                                                    {playable ? (
                                                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-sm bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-[#027a1e] work ${bn}`}>
                                                            <LuLockOpen /> {isBn ? "প্রিভিউ" : "Preview"}
                                                        </span>
                                                    ) : (
                                                        <LuLock className="shrink-0 text-slate-400" />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* Details */}
                    <section id="book-details" className="scroll-mt-24 rounded-md border border-slate-200 bg-white p-5 sm:p-6">
                        <PanelTitle bn={bn}>{isBn ? "বইয়ের তথ্য" : "Book details"}</PanelTitle>
                        <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                        <dl className={`-mb-px grid text-sm sm:grid-cols-2 work ${bn}`}>
                            {[
                                [isBn ? "লেখক" : "Author", book.author],
                                [isBn ? "ক্যাটাগরি" : "Category", book.category],
                                [isBn ? "ফরম্যাট" : "Format", formatLabel],
                                [isBn ? "ভাষা" : "Language", book.language],
                                [isBn ? "পৃষ্ঠা" : "Pages", book.pages > 0 ? book.pages : null],
                                [isBn ? "ভিডিও লেসন" : "Video lessons", videos.length > 0 ? videos.length : null],
                            ]
                                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                                .map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 sm:odd:border-r">
                                        <dt className="text-slate-500">{k}</dt>
                                        <dd className="flex items-center gap-1.5 text-right font-semibold text-[#0b1b4a]">
                                            <LuCircleCheck className="hidden text-[#027a1e] sm:block" /> {v}
                                        </dd>
                                    </div>
                                ))}
                        </dl>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
