"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiBook, FiBookOpen, FiShoppingBag, FiLoader, FiClock, FiCheckCircle,
    FiXCircle, FiTruck, FiPackage, FiMapPin, FiAlertCircle, FiRefreshCw,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import BookCard from "@/components/Books/BookCard";
import { booksApi, formatTaka, FORMAT_LABEL } from "@/lib/booksApi";

const DELIVERY = {
    processing: { en: "Processing", bn: "প্রসেসিং চলছে", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: FiPackage },
    shipped: { en: "Shipped", bn: "পাঠানো হয়েছে", cls: "bg-blue-50 text-[#0142b2] border-blue-200", Icon: FiTruck },
    delivered: { en: "Delivered", bn: "ডেলিভারি সম্পন্ন", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: FiCheckCircle },
};

const STATUS = {
    pending: { en: "Waiting for payment verification", bn: "পেমেন্ট যাচাইয়ের অপেক্ষায়", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: FiClock },
    approved: { en: "Approved", bn: "অনুমোদিত", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: FiCheckCircle },
    cancelled: { en: "Cancelled", bn: "বাতিল", cls: "bg-red-50 text-red-700 border-red-200", Icon: FiXCircle },
};

const isPrintedFormat = (f) => f === "printed";

function DeliveryChip({ status, language }) {
    const d = DELIVERY[status];
    if (!d) return null;
    const { Icon } = d;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${d.cls} ${language === "bn" ? "hind-siliguri" : ""}`}>
            <Icon size={12} /> {language === "bn" ? d.bn : d.en}
        </span>
    );
}

function StatusBadge({ status, language }) {
    const s = STATUS[status] || { en: status, bn: status, cls: "bg-slate-50 text-slate-600 border-slate-200", Icon: FiClock };
    const { Icon } = s;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls} ${language === "bn" ? "hind-siliguri" : ""}`}>
            <Icon size={12} className="flex-shrink-0" /> {language === "bn" ? s.bn : s.en}
        </span>
    );
}

const formatDate = (d, language) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function MyBooksPage() {
    const { language } = useLanguage();
    const bn = language === "bn" ? "hind-siliguri" : "";
    const L = (en, bnText) => (language === "bn" ? bnText : en);

    const [tab, setTab] = useState("library");
    const [library, setLibrary] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [lib, ord] = await Promise.all([booksApi.myLibrary(), booksApi.myOrders()]);
            setLibrary(Array.isArray(lib) ? lib : []);
            setOrders(Array.isArray(ord) ? ord : []);
        } catch (e) {
            setError(e.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const pendingCount = orders.filter((o) => o.status === "pending").length;

    const stats = [
        { label: L("Books in Library", "লাইব্রেরিতে বই"), value: library.length, Icon: FiBookOpen, color: "text-[#0142b2]", bg: "bg-blue-50" },
        { label: L("Total Orders", "মোট অর্ডার"), value: orders.length, Icon: FiShoppingBag, color: "text-[#c9871a]", bg: "bg-[#FEF6E7]" },
        { label: L("Pending Verification", "যাচাইয়ের অপেক্ষায়"), value: pendingCount, Icon: FiClock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const tabs = [
        { id: "library", label: L("My Library", "আমার লাইব্রেরি"), count: library.length },
        { id: "orders", label: L("My Orders", "আমার অর্ডার"), count: orders.length },
    ];

    return (
        <div className="poppins space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className={`text-2xl font-bold text-slate-900 outfit ${bn}`}>{L("My Books", "আমার বই")}</h1>
                    <p className={`mt-1 text-sm text-slate-500 ${bn}`}>
                        {L("Read your books, watch lessons and track your orders", "আপনার বই পড়ুন, ভিডিও লেসন দেখুন এবং অর্ডার ট্র্যাক করুন")}
                    </p>
                </div>
                <Link
                    href="/books"
                    className={`inline-flex w-fit items-center gap-2 rounded-lg bg-[#0142b2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#01368f] ${bn}`}
                >
                    <FiBook size={14} /> {L("Browse Bookstore", "বইয়ের দোকান দেখুন")}
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                                <s.Icon className={`${s.color} text-xl`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
                                <p className={`text-sm text-slate-500 ${bn}`}>{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-fit">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:flex-none ${bn} ${
                            tab === t.id ? "bg-[#F3A522] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        {t.label}
                        {!loading && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-16">
                    <FiLoader className="animate-spin text-[#F3A522]" size={28} />
                    <p className={`ml-3 text-sm text-slate-500 ${bn}`}>{L("Loading your books...", "আপনার বই লোড হচ্ছে...")}</p>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-white p-12 text-center">
                    <FiAlertCircle className="mx-auto mb-3 text-4xl text-red-300" />
                    <p className="text-sm font-semibold text-slate-700">{error}</p>
                    <button
                        onClick={load}
                        className={`mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 ${bn}`}
                    >
                        <FiRefreshCw size={13} /> {L("Try again", "আবার চেষ্টা করুন")}
                    </button>
                </div>
            ) : tab === "library" ? (
                library.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center sm:p-16">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                            <FiBookOpen className="text-3xl text-[#0142b2]" />
                        </div>
                        <h3 className={`mb-2 text-lg font-bold text-slate-700 ${bn}`}>{L("Your library is empty", "আপনার লাইব্রেরি খালি")}</h3>
                        <p className={`mx-auto max-w-md text-sm text-slate-500 ${bn}`}>
                            {pendingCount > 0
                                ? L(
                                    "Your order is waiting for payment verification. The book will appear here once it is approved.",
                                    "আপনার অর্ডারটি পেমেন্ট যাচাইয়ের অপেক্ষায় আছে। অনুমোদনের পর বইটি এখানে দেখা যাবে।"
                                )
                                : L("Get a free or paid book from our bookstore to start reading.", "পড়া শুরু করতে আমাদের বইয়ের দোকান থেকে ফ্রি বা পেইড বই নিন।")}
                        </p>
                        <Link
                            href="/books"
                            className={`mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0142b2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#01368f] ${bn}`}
                        >
                            <FiBook size={15} /> {L("Explore Books", "বই দেখুন")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {library.map((book) => {
                            const showDelivery = (book.orderFormat === "printed" || (!book.orderFormat && book.format === "printed")) && book.deliveryStatus;
                            return (
                                <div key={book._id || book.slug} className="flex flex-col gap-2">
                                    <div className="flex-1">
                                        <BookCard book={book} owned href={`/dashboard/user/books/${book.slug}`} />
                                    </div>
                                    {showDelivery && (
                                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                                            <span className={`flex items-center gap-1.5 text-[11px] font-medium text-slate-500 ${bn}`}>
                                                <FiTruck size={12} /> {L("Printed copy", "ছাপা কপি")}
                                            </span>
                                            <DeliveryChip status={book.deliveryStatus} language={language} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center sm:p-16">
                    <FiShoppingBag className="mx-auto mb-4 text-4xl text-slate-300" />
                    <h3 className={`mb-2 text-lg font-bold text-slate-700 ${bn}`}>{L("No orders yet", "এখনও কোনো অর্ডার নেই")}</h3>
                    <p className={`text-sm text-slate-500 ${bn}`}>{L("Your book orders will appear here.", "আপনার বইয়ের অর্ডারগুলো এখানে দেখা যাবে।")}</p>
                    <Link
                        href="/books"
                        className={`mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0142b2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#01368f] ${bn}`}
                    >
                        <FiBook size={15} /> {L("Explore Books", "বই দেখুন")}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => {
                        const book = o.bookId && typeof o.bookId === "object" ? o.bookId : {};
                        const printed = isPrintedFormat(o.format);
                        const fmt = FORMAT_LABEL[o.format];
                        const ship = o.shipping || {};
                        const pay = o.payment || {};
                        const hasShip = printed && (ship.address || ship.name || ship.phone);
                        return (
                            <div key={o._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* Top row */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                        <span>
                                            <span className={`font-semibold text-slate-400 ${bn}`}>{L("Order", "অর্ডার")} </span>
                                            <span className="font-mono font-bold text-slate-700">#{o.orderNo || o._id?.slice(-6)}</span>
                                        </span>
                                        <span>{formatDate(o.createdAt, language)}</span>
                                    </div>
                                    <StatusBadge status={o.status} language={language} />
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50">
                                            {book.coverImage && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={book.coverImage} alt="" className="h-full w-full object-contain p-1" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`line-clamp-2 text-sm font-bold text-slate-800 ${bn}`}>{book.title || o.bookTitle || "Book"}</p>
                                            {book.author && <p className="mt-0.5 text-[11px] text-slate-400">{book.author}</p>}
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                                <span className={`rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 ${bn}`}>
                                                    {fmt ? (language === "bn" ? fmt.bn : fmt.en) : o.format}
                                                </span>
                                                {printed && (
                                                    <span className={`rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 ${bn}`}>
                                                        {L("Qty", "পরিমাণ")}: {o.quantity || 1}
                                                    </span>
                                                )}
                                                {printed && o.status === "approved" && o.deliveryStatus && (
                                                    <DeliveryChip status={o.deliveryStatus} language={language} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[12px] sm:w-[260px] sm:flex-shrink-0 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${bn}`}>{L("Amount", "মূল্য")}</p>
                                            <p className="mt-0.5 text-base font-bold text-slate-800 outfit">
                                                {Number(o.amount) > 0 ? formatTaka(o.amount) : L("Free", "ফ্রি")}
                                            </p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${bn}`}>{L("Payment", "পেমেন্ট")}</p>
                                            <p className="mt-0.5 font-semibold capitalize text-slate-600">{pay.paymentType || pay.method || "—"}</p>
                                            {pay.transactionId && (
                                                <p className="truncate font-mono text-[11px] text-slate-500" title={pay.transactionId}>
                                                    TrxID: {pay.transactionId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping */}
                                {hasShip && (
                                    <div className="flex items-start gap-2 border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500 sm:px-5">
                                        <FiMapPin className="mt-0.5 flex-shrink-0 text-slate-400" size={13} />
                                        <p className="min-w-0">
                                            <span className={`font-semibold text-slate-600 ${bn}`}>{L("Ship to", "ডেলিভারি ঠিকানা")}: </span>
                                            {[ship.name, ship.phone, ship.address, ship.city].filter(Boolean).join(", ")}
                                            {ship.note && <span className="block text-[11px] text-slate-400">{L("Note", "নোট")}: {ship.note}</span>}
                                        </p>
                                    </div>
                                )}

                                {/* Footer action */}
                                {o.status === "approved" && book.slug && (
                                    <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
                                        <Link
                                            href={`/dashboard/user/books/${book.slug}`}
                                            className={`inline-flex items-center gap-1.5 text-xs font-bold text-[#0142b2] hover:text-[#01368f] ${bn}`}
                                        >
                                            <FiBookOpen size={13} /> {L("Open book", "বই খুলুন")} →
                                        </Link>
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
