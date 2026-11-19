"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    LuArrowLeft, LuBookOpen, LuCirclePlay, LuFileText, LuTruck, LuLock, LuLockOpen,
    LuLoader, LuLibrary, LuShoppingCart, LuHourglass, LuExternalLink, LuGift, LuCircleAlert,
    LuPackage, LuClock,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import YouTubePlayer from "@/components/Books/YouTubePlayer";
import { booksApi, formatTaka, isLoggedIn, FORMAT_LABEL } from "@/lib/booksApi";

function DetailSkeleton() {
    return (
        <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 animate-pulse">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="aspect-[4/5] rounded-3xl bg-slate-100" />
                <div className="space-y-4 py-4">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-8 w-4/5 rounded bg-slate-200" />
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-16 w-full rounded bg-slate-100" />
                    <div className="h-10 w-40 rounded bg-slate-200" />
                    <div className="h-12 w-56 rounded-full bg-slate-200" />
                </div>
            </div>
        </div>
    );
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
            router.push(`/dashboard/user/books/${slug}`);
        } catch (err) {
            setActionError(err.message);
            setClaiming(false);
        }
    };

    if (loading) return <DetailSkeleton />;

    if (!book) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-[#e5251f]">
                    <LuCircleAlert />
                </div>
                <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>
                    {isBn ? "বইটি পাওয়া যায়নি" : "Book not found"}
                </h1>
                <p className="mt-1 text-sm text-slate-500 work">{notFound}</p>
                <Link href="/books" className={`mt-5 inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
                    <LuArrowLeft /> {isBn ? "সব বই দেখুন" : "Browse books"}
                </Link>
            </div>
        );
    }

    const price = book.finalPrice ?? (book.isFree ? 0 : book.offerPrice || book.price);
    const hasOffer = !book.isFree && book.offerPrice > 0 && book.offerPrice < book.price;
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#e5251f]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e5251f]" /> {isBn ? "স্টকে নেই" : "Out of stock"}
            </span>
        ) : stock <= 5 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {isBn ? `মাত্র ${stock}টি বাকি` : `Only ${stock} left`}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#027a1e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#027a1e]" /> {isBn ? "স্টকে আছে" : "In stock"}
            </span>
        )
    );

    const orderLabel = hasAccess || pendingOrder
        ? (isBn ? "ছাপা কপি অর্ডার করুন" : "Order a printed copy")
        : (isBn ? `এখনই অর্ডার করুন ${formatTaka(price)}` : `Order now ${formatTaka(price)}`);

    return (
        <div className="bg-white">
            {/* ---------- Top ---------- */}
            <section className="relative overflow-hidden border-b border-slate-100">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-blue-100/70 blur-[120px]" />
                    <div className="absolute top-20 right-[-100px] h-[380px] w-[380px] rounded-full bg-red-100/50 blur-[120px]" />
                    <div className="absolute bottom-[-160px] left-1/2 h-[340px] w-[340px] rounded-full bg-emerald-100/50 blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10">
                    <Link href="/books" className={`mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0142b2] work ${bn}`}>
                        <LuArrowLeft /> {isBn ? "সব বই" : "All books"}
                    </Link>

                    <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                        {/* Cover */}
                        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl shadow-slate-900/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={book.coverImage} alt={book.title} className="aspect-[4/5] w-full object-contain p-6 sm:p-8" />
                            </div>
                            <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${book.isFree ? "bg-[#027a1e] text-white" : "border border-slate-200 bg-white text-[#0b1b4a]"}`}>
                                {book.isFree ? (isBn ? "ফ্রি" : "Free") : isBn ? "পেইড" : "Paid"}
                            </span>
                        </div>

                        {/* Info */}
                        <div>
                            {book.category && <p className="text-xs font-semibold uppercase tracking-wider text-[#e5251f] work">{book.category}</p>}
                            <h1 className={`mt-2 text-[28px] sm:text-4xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>{book.title}</h1>
                            <p className={`mt-2 text-sm text-slate-500 work ${bn}`}>
                                {isBn ? "লেখক" : "by"} <span className="font-semibold text-slate-700">{book.author}</span>
                            </p>
                            {book.shortDescription && (
                                <p className={`mt-4 text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>{book.shortDescription}</p>
                            )}

                            {/* Badges */}
                            <div className={`mt-5 flex flex-wrap gap-2 text-xs work ${bn}`}>
                                {digital && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                                        <LuFileText className="text-[#0142b2]" /> {isBn ? "ডিজিটাল (PDF)" : "Digital (PDF)"}
                                    </span>
                                )}
                                {printed && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                                        <LuTruck className="text-[#0142b2]" /> {isBn ? "ছাপা বই · হোম ডেলিভারি" : "Printed · Home delivery"}
                                    </span>
                                )}
                                {book.pages > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                                        <LuBookOpen className="text-[#0142b2]" /> {book.pages} {isBn ? "পৃষ্ঠা" : "pages"}
                                    </span>
                                )}
                                {book.videoCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                                        <LuCirclePlay className="text-[#0142b2]" /> {book.videoCount} {isBn ? "ভিডিও লেসন" : "video lessons"}
                                    </span>
                                )}
                                {book.language && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                                        {book.language}
                                    </span>
                                )}
                            </div>

                            {/* Price card */}
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <p className={`text-[11px] font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>{isBn ? "মূল্য" : "Price"}</p>
                                        <div className="mt-1 flex items-end gap-2">
                                            <span className={`text-3xl font-extrabold outfit ${book.isFree ? "text-[#027a1e]" : "text-[#0b1b4a]"}`}>
                                                {book.isFree ? (isBn ? "ফ্রি" : "Free") : formatTaka(price)}
                                            </span>
                                            {hasOffer && <span className="pb-1 text-sm text-slate-400 line-through">{formatTaka(book.price)}</span>}
                                            {hasOffer && (
                                                <span className="mb-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-[#e5251f]">
                                                    -{Math.round(((book.price - book.offerPrice) / book.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-1 text-xs text-slate-500 work ${bn}`}>{formatLabel}</p>
                                    </div>
                                    {stockBadge}
                                </div>

                                {/* Pending notice */}
                                {pendingOrder && (
                                    <div className={`mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 work ${bn}`}>
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
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    {book.isFree ? (
                                        <button
                                            type="button"
                                            onClick={handleReadFree}
                                            disabled={claiming}
                                            className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#027a1e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#026318] disabled:cursor-not-allowed disabled:opacity-70 work ${bn}`}
                                        >
                                            {claiming ? <LuLoader className="animate-spin" /> : <LuGift />}
                                            {isBn ? "ফ্রি পড়ুন" : "Read for free"}
                                        </button>
                                    ) : (
                                        <>
                                            {hasAccess && (
                                                <Link
                                                    href={`/dashboard/user/books/${slug}`}
                                                    className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#027a1e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#026318] work ${bn}`}
                                                >
                                                    <LuLibrary /> {isBn ? "আমার বইয়ে খুলুন" : "Open in My Books"}
                                                </Link>
                                            )}
                                            {canOrder && (
                                                <Link
                                                    href={`/books/checkout/${slug}`}
                                                    className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition work ${bn} ${
                                                        hasAccess || pendingOrder
                                                            ? "border border-slate-200 bg-white text-[#0b1b4a] shadow-sm hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                                                            : "bg-[#0142b2] text-white shadow-lg shadow-blue-900/25 hover:bg-[#01368f]"
                                                    }`}
                                                >
                                                    {hasAccess || pendingOrder ? <LuPackage /> : <LuShoppingCart />} {orderLabel}
                                                </Link>
                                            )}
                                            {!canOrder && !hasAccess && !pendingOrder && outOfStock && (
                                                <span className={`inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-7 py-3.5 text-sm font-semibold text-slate-400 work ${bn}`}>
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
                                            className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-slate-300 hover:shadow work ${bn}`}
                                        >
                                            <LuExternalLink /> {isBn ? "নমুনা পড়ুন" : "Read sample"}
                                        </a>
                                    )}
                                </div>
                                {actionError && <p className={`mt-3 text-sm font-medium text-[#e5251f] work ${bn}`}>{actionError}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Description + lessons ---------- */}
            <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
                <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
                    {/* Description */}
                    <div className="order-2 lg:order-1">
                        <h2 className={`text-xl sm:text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "বইটি সম্পর্কে" : "About this book"}</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-[#e5251f]" />
                        <div className={`mt-5 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>
                            {book.description}
                        </div>
                    </div>

                    {/* Lessons */}
                    <div className="order-1 lg:order-2">
                        <h2 className={`text-xl sm:text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "ভেতরে যা আছে" : "What's inside"}</h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-[#0142b2]" />
                        <p className={`mt-3 text-xs text-slate-500 work ${bn}`}>
                            {videos.length > 0
                                ? isBn
                                    ? `${videos.length}টি ভিডিও লেসন${book.previewCount ? ` · ${book.previewCount}টি ফ্রি প্রিভিউ` : ""}`
                                    : `${videos.length} video lessons${book.previewCount ? ` · ${book.previewCount} free preview${book.previewCount > 1 ? "s" : ""}` : ""}`
                                : isBn ? "এই বইয়ের সাথে কোনো ভিডিও লেসন নেই।" : "This book has no video lessons."}
                        </p>

                        {videos.length > 0 && (
                            <div className="mt-4 space-y-3">
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

                                <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
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
                                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[#0142b2] text-white" : "bg-slate-100 text-slate-500"}`}>
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
                                                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#027a1e] work ${bn}`}>
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
                    </div>
                </div>
            </section>
        </div>
    );
}
