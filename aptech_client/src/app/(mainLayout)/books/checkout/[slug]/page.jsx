"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    LuArrowLeft, LuShieldCheck, LuCircleCheck, LuCopy, LuCheck, LuLoader, LuMinus, LuPlus,
    LuTruck, LuFileText, LuShoppingCart, LuLibrary, LuCircleAlert, LuHourglass,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { booksApi, formatTaka, isLoggedIn, FORMAT_LABEL } from "@/lib/booksApi";
import { PAYMENT_NUMBERS, PAYMENT_CONTACT_PHONE, hasPaymentNumbers } from "@/lib/paymentNumbers";

const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0b1b4a] outline-none transition focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/15";

function readUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

export default function BookCheckoutPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [format, setFormat] = useState("digital");
    const [quantity, setQuantity] = useState(1);
    const [shipping, setShipping] = useState({ name: "", phone: "", address: "", city: "", note: "" });
    const [payment, setPayment] = useState({ paymentType: "bkash", senderNumber: "", transactionId: "" });
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);
    const [copied, setCopied] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!isLoggedIn()) {
                router.replace(`/login?redirect=/books/checkout/${slug}`);
                return;
            }
            try {
                const data = await booksApi.get(slug);
                if (cancelled) return;
                if (data.isFree) {
                    router.replace(`/books/${slug}`);
                    return;
                }
                const u = readUser();
                const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.name || "";
                setShipping((s) => ({ ...s, name, phone: u?.phoneNumber || u?.phone || "" }));
                setBook(data);
                setFormat(data.format === "both" ? ((data.stock || 0) > 0 ? "printed" : "digital") : data.format);
                setLoading(false);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err.message || "Book not found");
                    setLoading(false);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [slug, router]);

    const copy = (key, value) => {
        navigator.clipboard?.writeText(value.replace(/[^0-9]/g, ""));
        setCopied(key);
        setTimeout(() => setCopied(""), 1500);
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-[#0142b2]" />
            </div>
        );
    }

    if (!book) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-50 text-2xl text-[#e5251f]"><LuCircleAlert /></div>
                <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "বইটি পাওয়া যায়নি" : "Book not found"}</h1>
                <p className="mt-1 text-sm text-slate-500 work">{loadError}</p>
                <Link href="/books" className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
                    <LuArrowLeft /> {isBn ? "সব বই দেখুন" : "Browse books"}
                </Link>
            </div>
        );
    }

    const unitPrice = book.finalPrice ?? (book.offerPrice || book.price);
    const hasOffer = book.offerPrice > 0 && book.offerPrice < book.price;
    const stock = Number(book.stock || 0);
    const isPrinted = format === "printed";
    const maxQty = Math.max(1, Math.min(10, stock));
    const qty = isPrinted ? Math.min(quantity, maxQty) : 1;
    const total = unitPrice * qty;
    const printedOut = (book.format === "printed" || book.format === "both") && stock <= 0;
    const blocked = isPrinted && printedOut;

    const accounts = [
        { key: "bkash", label: "bKash (Personal)", number: PAYMENT_NUMBERS.bkash },
        { key: "nagad", label: "Nagad (Personal)", number: PAYMENT_NUMBERS.nagad },
        { key: "rocket", label: "Rocket (Personal)", number: PAYMENT_NUMBERS.rocket },
    ].filter((a) => a.number);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (blocked) return;
        if (isPrinted && (!shipping.name.trim() || !shipping.phone.trim() || !shipping.address.trim())) {
            setError(isBn ? "ডেলিভারির জন্য নাম, ফোন ও ঠিকানা দিন।" : "Please enter delivery name, phone and address.");
            return;
        }
        if (!payment.senderNumber.trim() || !payment.transactionId.trim()) {
            setError(isBn ? "যে নম্বর থেকে পাঠিয়েছেন ও ট্রানজেকশন আইডি দিন।" : "Please enter the sender number and transaction ID.");
            return;
        }
        if (!agreed) {
            setError(isBn ? "শর্তাবলীতে সম্মতি দিন।" : "Please agree to the terms.");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                bookId: slug,
                format,
                payment: {
                    paymentType: payment.paymentType,
                    senderNumber: payment.senderNumber.trim(),
                    transactionId: payment.transactionId.trim(),
                },
            };
            if (isPrinted) {
                payload.quantity = qty;
                payload.shipping = {
                    name: shipping.name.trim(),
                    phone: shipping.phone.trim(),
                    address: shipping.address.trim(),
                    city: shipping.city.trim(),
                    note: shipping.note.trim(),
                };
            }
            const order = await booksApi.order(payload);
            setPlaced(order || {});
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- Success panel ---------- */
    if (placed) {
        return (
            <div className="relative overflow-hidden bg-slate-50 min-h-screen">
                <div className="relative z-10 mx-auto max-w-lg px-4 py-16 sm:py-24">
                    <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-[#027a1e]">
                            <LuCircleCheck />
                        </div>
                        <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "অর্ডার সম্পন্ন হয়েছে" : "Order placed"}</h1>
                        {placed.orderNo && <p className="mt-1 font-mono text-xs text-slate-400">#{placed.orderNo}</p>}
                        <div className={`mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700 work ${bn}`}>
                            <LuHourglass className="mt-0.5 shrink-0" />
                            <span>
                                {isBn
                                    ? "আপনার পেমেন্ট যাচাই করা হচ্ছে। যাচাই হলে বইটি আপনার লাইব্রেরিতে যোগ হবে এবং আপনাকে জানানো হবে।"
                                    : "Your payment is being verified. Once approved, the book will be added to your library and you'll be notified."}
                                {isPrinted && (isBn ? " ছাপা বইটি আপনার ঠিকানায় পাঠানো হবে।" : " The printed copy will be shipped to your address.")}
                            </span>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link href="/dashboard/user/books" className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work ${bn}`}>
                                <LuLibrary /> {isBn ? "আমার বই" : "Go to My Books"}
                            </Link>
                            <Link href={`/books/${slug}`} className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-slate-300 work ${bn}`}>
                                <LuArrowLeft /> {isBn ? "বইয়ে ফিরে যান" : "Back to the book"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-slate-50 min-h-screen">

            <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link href={`/books/${slug}`} className={`inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0142b2] work ${bn}`}>
                        <LuArrowLeft /> {isBn ? "বইয়ে ফিরে যান" : "Back to book"}
                    </Link>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#027a1e] work">
                        <LuShieldCheck /> {isBn ? "অ্যাডমিন-যাচাইকৃত পেমেন্ট" : "Admin-verified payment"}
                    </span>
                </div>

                <nav aria-label="Breadcrumb" className={`mb-2 flex items-center gap-1.5 overflow-hidden text-xs text-slate-500 work ${bn}`}>
                    <Link href="/" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "হোম" : "Home"}</Link>
                    <span className="text-slate-300">/</span>
                    <Link href="/books" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "বই" : "Books"}</Link>
                    <span className="text-slate-300">/</span>
                    <span className="truncate font-medium text-[#0b1b4a]">{isBn ? "চেকআউট" : "Checkout"}</span>
                </nav>
                <h1 className={`text-2xl sm:text-3xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "চেকআউট" : "Checkout"}</h1>
                <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>
                    {isBn ? "পেমেন্ট করে তথ্য জমা দিন — যাচাইয়ের পর বইটি আপনার হবে।" : "Send the payment and submit the details — the book is yours once verified."}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 grid items-start gap-6 lg:grid-cols-12">
                    {/* ---------- Left ---------- */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Format picker */}
                        {book.format === "both" && (
                            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className={`border-l-4 border-[#e5251f] pl-3 text-sm font-bold uppercase tracking-wide text-[#0b1b4a] work ${bn}`}>{isBn ? "ফরম্যাট বাছাই করুন" : "Choose format"}</h2>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {[
                                        { key: "printed", icon: LuTruck, en: "Printed book", bnL: "ছাপা বই", subEn: "Home delivery + video lessons", subBn: "হোম ডেলিভারি + ভিডিও লেসন", disabled: printedOut },
                                        { key: "digital", icon: LuFileText, en: "Digital (PDF)", bnL: "ডিজিটাল (PDF)", subEn: "Read instantly after approval", subBn: "অনুমোদনের পর সাথে সাথে পড়ুন", disabled: false },
                                    ].map((opt) => {
                                        const Icon = opt.icon;
                                        const active = format === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                disabled={opt.disabled}
                                                onClick={() => setFormat(opt.key)}
                                                className={`flex items-start gap-3 rounded-md border p-4 text-left transition ${
                                                    opt.disabled
                                                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                                                        : active
                                                            ? "border-[#0142b2] bg-blue-50/60 ring-4 ring-[#0142b2]/10"
                                                            : "border-slate-200 bg-white hover:border-[#0142b2]/40"
                                                }`}
                                            >
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? "bg-[#0142b2] text-white" : "bg-slate-100 text-[#0142b2]"}`}>
                                                    <Icon />
                                                </span>
                                                <span>
                                                    <span className={`block text-sm font-semibold text-[#0b1b4a] work ${bn}`}>{isBn ? opt.bnL : opt.en}</span>
                                                    <span className={`block text-xs text-slate-500 work ${bn}`}>
                                                        {opt.disabled ? (isBn ? "স্টকে নেই" : "Out of stock") : isBn ? opt.subBn : opt.subEn}
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Delivery */}
                        {isPrinted && (
                            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className={`border-l-4 border-[#e5251f] pl-3 text-sm font-bold uppercase tracking-wide text-[#0b1b4a] work ${bn}`}>{isBn ? "ডেলিভারি তথ্য" : "Delivery details"}</h2>
                                    {!printedOut && (
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-semibold text-slate-500 work ${bn}`}>{isBn ? "পরিমাণ" : "Quantity"}</span>
                                            <div className="flex items-center overflow-hidden rounded-md border border-slate-200">
                                                <button type="button" aria-label="Decrease" onClick={() => setQuantity(Math.max(1, qty - 1))} disabled={qty <= 1} className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40">
                                                    <LuMinus />
                                                </button>
                                                <span className="min-w-8 text-center text-sm font-bold text-[#0b1b4a]">{qty}</span>
                                                <button type="button" aria-label="Increase" onClick={() => setQuantity(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty} className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40">
                                                    <LuPlus />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {printedOut ? (
                                    <p className={`mt-3 text-sm font-medium text-[#e5251f] work ${bn}`}>{isBn ? "দুঃখিত, ছাপা বইটি এখন স্টকে নেই।" : "Sorry, the printed book is out of stock right now."}</p>
                                ) : (
                                    <>
                                        {stock <= 5 && <p className={`mt-2 text-xs font-medium text-amber-600 work ${bn}`}>{isBn ? `মাত্র ${stock}টি বাকি` : `Only ${stock} left`}</p>}
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "নাম" : "Full name"} *</label>
                                                <input className={inputCls} value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "ফোন নম্বর" : "Phone"} *</label>
                                                <input type="tel" placeholder="01XXXXXXXXX" className={inputCls} value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "পূর্ণ ঠিকানা" : "Full address"} *</label>
                                                <textarea rows={2} className={inputCls} value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder={isBn ? "বাড়ি, রোড, এলাকা" : "House, road, area"} />
                                            </div>
                                            <div>
                                                <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "শহর / জেলা" : "City / District"}</label>
                                                <input className={inputCls} value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "নোট (ঐচ্ছিক)" : "Note (optional)"}</label>
                                                <input className={inputCls} value={shipping.note} onChange={(e) => setShipping({ ...shipping, note: e.target.value })} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Payment */}
                        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                            <h2 className={`border-l-4 border-[#e5251f] pl-3 text-sm font-bold uppercase tracking-wide text-[#0b1b4a] work ${bn}`}>{isBn ? "পেমেন্ট" : "Payment"}</h2>

                            {/* Step 1 */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0142b2] text-xs font-bold text-white">1</span>
                                    <h3 className={`text-sm font-bold text-[#0b1b4a] work ${bn}`}>{isBn ? "টাকা পাঠান" : "Send Money"}</h3>
                                </div>
                                {!hasPaymentNumbers() && (
                                    <p className={`rounded-md border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600 work ${bn}`}>
                                        {isBn ? `পেমেন্ট নম্বর জানতে কল করুন: ${PAYMENT_CONTACT_PHONE}` : `Call ${PAYMENT_CONTACT_PHONE} to get our payment number.`}
                                    </p>
                                )}
                                {accounts.length > 0 && (
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {accounts.map((acc) => (
                                            <div key={acc.key} className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{acc.label}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-base font-bold text-[#0b1b4a]">{acc.number}</span>
                                                    <button type="button" onClick={() => copy(acc.key, acc.number)} className="rounded p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600" aria-label="Copy number">
                                                        {copied === acc.key ? <LuCheck className="text-[#027a1e]" /> : <LuCopy />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className={`mt-2 text-[11px] text-slate-500 work ${bn}`}>
                                    {isBn ? `"Send Money" করে ${formatTaka(total)} পাঠান` : `Send ${formatTaka(total)} via "Send Money"`}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-[10px] font-bold uppercase text-slate-300">{isBn ? "তারপর" : "then"}</span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            {/* Step 2 */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0142b2] text-xs font-bold text-white">2</span>
                                    <h3 className={`text-sm font-bold text-[#0b1b4a] work ${bn}`}>{isBn ? "পেমেন্ট তথ্য দিন" : "Fill payment info"}</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "পেমেন্ট মাধ্যম" : "Payment via"}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[{ k: "bkash", l: "bKash" }, { k: "nagad", l: "Nagad" }, { k: "rocket", l: "Rocket" }].map((t) => (
                                                <button
                                                    key={t.k}
                                                    type="button"
                                                    onClick={() => setPayment({ ...payment, paymentType: t.k })}
                                                    className={`rounded-md border px-4 py-2 text-xs font-bold transition ${
                                                        payment.paymentType === t.k
                                                            ? "border-[#0142b2] bg-blue-50 text-[#0142b2]"
                                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                                    }`}
                                                >
                                                    {t.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "যে নম্বর থেকে পাঠিয়েছেন" : "Sender number"} *</label>
                                            <input type="tel" placeholder="01XXXXXXXXX" className={inputCls} value={payment.senderNumber} onChange={(e) => setPayment({ ...payment, senderNumber: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={`mb-1 block text-xs font-semibold text-slate-600 work ${bn}`}>{isBn ? "ট্রানজেকশন আইডি" : "Transaction ID"} *</label>
                                            <input placeholder="e.g. TXN8K4F2J9D" className={`${inputCls} font-mono`} value={payment.transactionId} onChange={(e) => setPayment({ ...payment, transactionId: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------- Right: summary ---------- */}
                    <div className="lg:col-span-4">
                        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                            <h2 className={`mb-4 border-l-4 border-[#e5251f] pl-3 text-sm font-bold uppercase tracking-wide text-[#0b1b4a] work ${bn}`}>{isBn ? "অর্ডার সারাংশ" : "Order summary"}</h2>
                            <div className="flex gap-3 border-b border-slate-100 pb-4">
                                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={book.coverImage} alt={book.title} className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`line-clamp-2 text-sm font-semibold text-[#0b1b4a] work ${bn}`}>{book.title}</p>
                                    <p className="mt-0.5 text-xs text-slate-500 work">{book.author}</p>
                                </div>
                            </div>

                            <dl className={`space-y-2 border-b border-slate-100 py-4 text-sm work ${bn}`}>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{isBn ? "ফরম্যাট" : "Format"}</dt>
                                    <dd className="font-medium text-[#0b1b4a]">{FORMAT_LABEL[format]?.[isBn ? "bn" : "en"]}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{isBn ? "পরিমাণ" : "Quantity"}</dt>
                                    <dd className="font-medium text-[#0b1b4a]">{qty}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">{isBn ? "মূল্য" : "Price"}</dt>
                                    <dd className="font-medium text-[#0b1b4a]">
                                        {hasOffer && <span className="mr-1.5 text-xs text-slate-400 line-through">{formatTaka(book.price)}</span>}
                                        {formatTaka(unitPrice)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="flex items-end justify-between pt-4">
                                <span className={`text-sm font-semibold text-slate-600 work ${bn}`}>{isBn ? "মোট" : "Total"}</span>
                                <span className="text-2xl font-bold text-[#0142b2] outfit">{formatTaka(total)}</span>
                            </div>

                            <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0142b2]" />
                                <span className={`text-[11px] leading-relaxed text-slate-500 work ${bn}`}>
                                    {isBn ? (
                                        <>আমি <Link href="/terms" target="_blank" className="font-semibold text-[#0142b2] hover:underline">শর্তাবলী</Link> ও রিফান্ড পলিসি মেনে নিচ্ছি</>
                                    ) : (
                                        <>I agree to the <Link href="/terms" target="_blank" className="font-semibold text-[#0142b2] hover:underline">terms, conditions</Link> and refund policy</>
                                    )}
                                </span>
                            </label>

                            {error && (
                                <p className={`mt-4 flex items-start gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-[#e5251f] work ${bn}`}>
                                    <LuCircleAlert className="mt-0.5 shrink-0" /> {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!agreed || submitting || blocked}
                                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-semibold transition work ${bn} ${
                                    !agreed || submitting || blocked
                                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                                        : "bg-gradient-to-r from-[#e5251f] to-[#0142b2] text-white shadow-sm hover:shadow-md hover:brightness-110"
                                }`}
                            >
                                {submitting ? <LuLoader className="animate-spin" /> : <LuShoppingCart />}
                                {submitting ? (isBn ? "জমা হচ্ছে..." : "Submitting...") : isBn ? "অর্ডার জমা দিন" : "Place order"}
                            </button>
                            <p className={`mt-3 text-center text-[11px] text-slate-400 work ${bn}`}>
                                {isBn ? "পেমেন্ট যাচাইয়ের পর অর্ডার অনুমোদিত হবে।" : "Your order is approved after the payment is verified."}
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
