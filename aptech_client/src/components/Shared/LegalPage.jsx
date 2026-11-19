"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuMail, LuPhone, LuArrowRight, LuCalendar, LuListOrdered, LuMessageCircle } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

/**
 * Bilingual legal page (Terms, Privacy).
 * content = { en: { title, updated, intro, sections: [{ h, p: [..] }], contactLead, contactPage }, bn: {...} }
 * related = optional { href, en, bn } link to the sibling legal page.
 */
export default function LegalPage({ content, related }) {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const isBn = language === "bn";
    const c = content[isBn ? "bn" : "en"];
    const bn = isBn ? "hind-siliguri" : "";

    const email = settings?.email || "bravetalkbd@gmail.com";
    const phone = settings?.phoneNumber || "01323878569";

    const [active, setActive] = useState(0);

    // Highlight the section currently in view in the table of contents
    useEffect(() => {
        const els = c.sections.map((_, i) => document.getElementById(`section-${i + 1}`)).filter(Boolean);
        if (!els.length || typeof IntersectionObserver === "undefined") return;
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(Number(visible[0].target.dataset.index));
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        );
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [c.sections]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero band */}
            <section className="relative overflow-hidden border-b border-slate-100 bg-white">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -left-24 h-[380px] w-[380px] rounded-full bg-red-100/60 blur-[120px]" />
                    <div className="absolute -top-10 right-[-80px] h-[380px] w-[380px] rounded-full bg-blue-200/60 blur-[120px]" />
                    <div className="absolute bottom-[-200px] left-1/3 h-[340px] w-[340px] rounded-full bg-emerald-100/60 blur-[120px]" />
                </div>
                <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0142b2]" />
                        <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{isBn ? "আইনি তথ্য" : "Legal"}</span>
                    </div>
                    <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>{c.title}</h1>
                    <p className={`mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500 work ${bn}`}>
                        <LuCalendar className="text-[#0142b2]" /> {c.updated}
                    </p>
                    <p className={`mt-4 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>{c.intro}</p>
                </div>
            </section>

            <div className="mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] gap-8 px-4 sm:px-6 py-10 lg:grid-cols-[260px_1fr] lg:gap-12 lg:py-14">
                {/* Table of contents */}
                <aside className="lg:sticky lg:top-28 lg:self-start">
                    <nav className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                        <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>
                            <LuListOrdered className="text-sm" /> {isBn ? "সূচিপত্র" : "On this page"}
                        </p>
                        <ol className="space-y-1">
                            {c.sections.map((s, i) => (
                                <li key={i}>
                                    <a
                                        href={`#section-${i + 1}`}
                                        className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition work ${bn} ${
                                            active === i ? "bg-white font-semibold text-[#0142b2] shadow-sm" : "text-slate-600 hover:bg-white hover:text-[#0b1b4a]"
                                        }`}
                                    >
                                        <span className={`mt-px text-xs font-bold tabular-nums ${active === i ? "text-[#0142b2]" : "text-slate-400"}`}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        {s.h}
                                    </a>
                                </li>
                            ))}
                        </ol>
                        {related && (
                            <Link
                                href={related.href}
                                className={`mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-semibold text-[#0142b2] work ${bn}`}
                            >
                                {isBn ? related.bn : related.en} <LuArrowRight />
                            </Link>
                        )}
                    </nav>
                </aside>

                {/* Sections */}
                <div className="min-w-0">
                    <div className="space-y-5">
                        {c.sections.map((s, i) => (
                            <section
                                key={i}
                                id={`section-${i + 1}`}
                                data-index={i}
                                className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-[#0142b2] outfit">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className={`pt-1.5 text-lg sm:text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{s.h}</h2>
                                        <div className="mt-3 space-y-3">
                                            {s.p.map((para, j) => (
                                                <p key={j} className={`text-[15px] leading-relaxed text-slate-600 work ${bn}`}>{para}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Contact card */}
                    <div className="mt-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 sm:p-8">
                        <div className="flex items-start gap-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0142b2] shadow-sm">
                                <LuMessageCircle className="text-xl" />
                            </span>
                            <div>
                                <h3 className={`text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "প্রশ্ন আছে?" : "Have a question?"}</h3>
                                <p className={`mt-0.5 text-sm text-slate-500 work ${bn}`}>{c.contactLead}</p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <a
                                href={`mailto:${email}`}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work"
                            >
                                <LuMail className="text-[#e5251f]" /> {email}
                            </a>
                            <a
                                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work"
                            >
                                <LuPhone className="text-[#0142b2]" /> {phone}
                            </a>
                            <Link
                                href="/contact"
                                className={`inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#01368f] hover:gap-3 work ${bn}`}
                            >
                                {c.contactPage} <LuArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
