"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    LuCircleCheck, LuHourglass, LuLayoutDashboard, LuHouse, LuBell, LuReceipt,
    LuShieldCheck, LuBookOpen, LuGraduationCap, LuX,
} from "react-icons/lu";

/**
 * Shared "thank you" page after any purchase / enrolment.
 * Query: type=course|book · status=pending|active · title · amount · ref · method · format · item (link back)
 */
const METHOD_LABEL = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket", upay: "Upay", bank: "Bank transfer", manual: "Manual payment", free: "Free" };

function SuccessContent() {
    const q = useSearchParams();
    const type = q.get("type") === "book" ? "book" : "course";
    const active = q.get("status") === "active";
    const title = q.get("title") || (type === "book" ? "Your book" : "Your course");
    const amount = Number(q.get("amount") || 0);
    const ref = q.get("ref") || "";
    const method = q.get("method") || "";
    const format = q.get("format") || "";
    const item = q.get("item") || "";

    const [toast, setToast] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setToast(false), 6000);
        return () => clearTimeout(t);
    }, []);

    const dashHref = type === "book" ? "/dashboard/user/books" : "/dashboard/user/courses";
    const dashLabel = type === "book" ? "Go to My Books" : "Go to My Courses";
    const ItemIcon = type === "book" ? LuBookOpen : LuGraduationCap;

    const heading = active
        ? (type === "book" ? "Your book is ready!" : "You're enrolled!")
        : "Order placed successfully!";
    const sub = active
        ? (type === "book" ? "The book has been added to your library." : "The course is now unlocked in your dashboard.")
        : "Thank you! We've received your payment details and will verify them shortly.";

    const steps = active
        ? [
            ["Order confirmed", "Your access is active right now."],
            [type === "book" ? "Open your library" : "Start learning", type === "book" ? "Read the book and watch its video lessons." : "Open the course from My Courses."],
            ["Get certified", type === "book" ? "Pair it with a course for a certificate." : "Finish the course to earn a verifiable certificate."],
        ]
        : [
            ["Order received", "Your order and payment info are saved."],
            ["Payment verification", "Our team checks the transaction — usually within a few hours."],
            [type === "book" ? "Book unlocked" : "Course unlocked", type === "book"
                ? (format === "printed" ? "We'll ship the printed copy and notify you." : "It appears in My Books and you'll get a notification.")
                : "You'll get a notification and the course appears in My Courses."],
        ];

    return (
        <div className="relative min-h-[80vh] overflow-hidden bg-slate-50">
            {/* Toast */}
            <div
                className={`fixed right-4 top-24 z-[90] w-[calc(100%-2rem)] max-w-sm transition-all duration-500 ${toast ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"}`}
                role="status"
            >
                <div className="flex items-start gap-3 rounded-md border border-slate-200 border-l-4 border-l-[#027a1e] bg-white p-4 shadow-lg">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#027a1e]"><LuBell /></span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0b1b4a] outfit">{active ? "Access granted 🎉" : "Order received 🧾"}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 work">
                            {active ? `"${title}" is ready for you.` : `We've sent you a notification about "${title}".`}
                        </p>
                    </div>
                    <button type="button" onClick={() => setToast(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><LuX /></button>
                </div>
            </div>

            {/* Decorative top band */}
            <div className="absolute inset-x-0 top-0 h-56 bg-[#0b1b4a]">
                <div className="absolute inset-x-0 bottom-0 flex h-1">
                    <span className="flex-1 bg-[#0142b2]" /><span className="flex-1 bg-[#e5251f]" /><span className="flex-1 bg-[#027a1e]" />
                </div>
            </div>

            <div className="relative mx-auto max-w-2xl px-4 pb-16 pt-12 sm:pt-16">
                <div className="success-pop overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                    {/* Header */}
                    <div className="px-6 pb-6 pt-8 text-center sm:px-10">
                        <div className="relative mx-auto mb-5 h-20 w-20">
                            <span className={`absolute inset-0 animate-ping rounded-full ${active ? "bg-emerald-400/25" : "bg-blue-400/25"}`} />
                            <span className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg ${active ? "bg-[#027a1e] shadow-emerald-200" : "bg-[#0142b2] shadow-blue-200"}`}>
                                <LuCircleCheck className="text-[40px]" />
                            </span>
                        </div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${active ? "text-[#027a1e]" : "text-[#0142b2]"} work`}>
                            {active ? "Success" : "Thank you"}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#0b1b4a] sm:text-[30px] outfit">{heading}</h1>
                        <span className="mx-auto mt-3 block h-[3px] w-14 bg-[#e5251f]" />
                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 work">{sub}</p>
                    </div>

                    {/* Order summary */}
                    <div className="mx-6 rounded-md border border-slate-200 bg-slate-50/70 sm:mx-10">
                        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#eef3fc] text-xl text-[#0142b2]"><ItemIcon /></span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{type === "book" ? "Book" : "Course"}{format ? ` · ${format}` : ""}</p>
                                <p className="truncate font-bold text-[#0b1b4a] outfit">{title}</p>
                            </div>
                            <span className={`shrink-0 rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${active ? "bg-emerald-50 text-[#027a1e]" : "bg-amber-50 text-amber-700"}`}>
                                {active ? "Active" : "Pending"}
                            </span>
                        </div>
                        <dl className="grid grid-cols-2 gap-px bg-slate-200 text-sm sm:grid-cols-3">
                            <div className="bg-white p-3.5">
                                <dt className="text-[11px] text-slate-400">Amount</dt>
                                <dd className="mt-0.5 font-bold text-[#0b1b4a] outfit">{amount > 0 ? `৳${amount.toLocaleString("en-IN")}` : "Free"}</dd>
                            </div>
                            <div className="bg-white p-3.5">
                                <dt className="text-[11px] text-slate-400">Payment</dt>
                                <dd className="mt-0.5 font-semibold text-slate-700">{METHOD_LABEL[method] || method || (amount > 0 ? "Manual payment" : "Free")}</dd>
                            </div>
                            <div className="col-span-2 bg-white p-3.5 sm:col-span-1">
                                <dt className="text-[11px] text-slate-400">{ref ? "Reference" : "Date"}</dt>
                                <dd className="mt-0.5 truncate font-mono text-[13px] font-semibold text-slate-700">{ref ? `#${ref}` : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* What happens next */}
                    <div className="px-6 py-6 sm:px-10">
                        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0b1b4a] outfit">
                            {active ? <LuShieldCheck className="text-[#027a1e]" /> : <LuHourglass className="text-[#0142b2]" />} What happens next
                        </p>
                        <ol className="relative space-y-4 border-l-2 border-dashed border-slate-200 pl-6">
                            {steps.map(([h, d], i) => {
                                const done = active || i === 0;
                                return (
                                    <li key={h} className="relative">
                                        <span className={`absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-[#027a1e] text-white" : "border-2 border-slate-300 bg-white text-slate-400"}`}>
                                            {done ? "✓" : i + 1}
                                        </span>
                                        <p className={`text-sm font-semibold ${done ? "text-[#0b1b4a]" : "text-slate-600"}`}>{h}</p>
                                        <p className="text-xs leading-relaxed text-slate-500 work">{d}</p>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:px-10">
                        <Link href={dashHref} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0142b2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work">
                            <LuLayoutDashboard /> {dashLabel}
                        </Link>
                        <Link href="/" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2] hover:text-[#0142b2] work">
                            <LuHouse /> Back to Home
                        </Link>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 work">
                    <Link href="/dashboard/user/payments" className="inline-flex items-center gap-1.5 hover:text-[#0142b2]"><LuReceipt /> Payment history</Link>
                    <Link href="/dashboard/user/notifications" className="inline-flex items-center gap-1.5 hover:text-[#0142b2]"><LuBell /> Notifications</Link>
                    {item && <Link href={item} className="inline-flex items-center gap-1.5 hover:text-[#0142b2]"><ItemIcon /> View {type}</Link>}
                </div>
            </div>

            <style jsx>{`
                .success-pop { animation: pop 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
                @keyframes pop { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-[80vh] bg-slate-50" />}>
            <SuccessContent />
        </Suspense>
    );
}
