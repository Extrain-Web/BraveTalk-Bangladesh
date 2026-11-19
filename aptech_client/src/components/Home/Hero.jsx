"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
    LuMic,
    LuArrowRight,
    LuCheck,
    LuSpellCheck,
    LuAudioLines,
    LuLanguages,
    LuTarget,
    LuUsers,
    LuBadgeCheck,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImage } from "@/lib/siteImages";

/* ---------- Content (English / Bangla) — kept short on purpose ---------- */
const COPY = {
    en: {
        badge: "Live classes · Real mentors",
        h1a: "Speak English",
        h1b: "with confidence.",
        desc: "Learn spoken English and public speaking with live practice and mentor feedback. Be a Speaker, Be a Leader!",
        ctaPrimary: "Explore courses",
        ctaSecondary: "Contact us",
        ticks: ["Online & offline", "Recorded classes", "Pay with bKash"],
        panelCta: "View courses",
        panelHint: "Popular right now",
        photoTag: "Be a Speaker, Be a Leader!",
        photoCardTitle: "Live practice",
        photoCardText: "Mentor feedback in every class",
        tabs: [
            { key: "speaking", label: "Speaking", icon: LuMic, title: "Speak without hesitation", text: "Daily live speaking practice with your mentor.", points: ["Live conversation rounds", "Mistakes corrected by mentors", "Real-life topics"] },
            { key: "grammar", label: "Grammar", icon: LuSpellCheck, title: "Grammar that sticks", text: "Simple rules, explained in Bangla and English.", points: ["Easy rules with examples", "Practice after each class", "Weekly progress check"] },
            { key: "pronunciation", label: "Pronunciation", icon: LuAudioLines, title: "Sound clear and natural", text: "Fix common accent problems step by step.", points: ["Sound drills", "Record and compare", "Stress and intonation"] },
            { key: "vocabulary", label: "Vocabulary", icon: LuLanguages, title: "Words you will use", text: "Build everyday and professional vocabulary.", points: ["Daily word sets", "Learn in sentences", "Interview & meeting phrases"] },
            { key: "public-speaking", label: "Public Speaking", icon: LuTarget, title: "Speak on any stage", text: "Build stage confidence, leadership and debate skills.", points: ["Speech & presentation practice", "Debate and leadership sessions", "Mentor feedback on every talk"] },
        ],
    },
    bn: {
        badge: "লাইভ ক্লাস · রিয়েল মেন্টর",
        h1a: "আত্মবিশ্বাসের সাথে",
        h1b: "ইংরেজিতে বলুন।",
        desc: "লাইভ প্র্যাকটিস ও মেন্টরের ফিডব্যাকে স্পোকেন ইংলিশ ও পাবলিক স্পিকিং শিখুন। বক্তা হও, নেতা হও!",
        ctaPrimary: "কোর্স দেখুন",
        ctaSecondary: "যোগাযোগ করুন",
        ticks: ["অনলাইন ও অফলাইন", "রেকর্ডেড ক্লাস", "বিকাশে পেমেন্ট"],
        panelCta: "কোর্স দেখুন",
        panelHint: "এখন জনপ্রিয়",
        photoTag: "বক্তা হও, নেতা হও!",
        photoCardTitle: "লাইভ প্র্যাকটিস",
        photoCardText: "প্রতিটি ক্লাসে মেন্টরের ফিডব্যাক",
        tabs: [
            { key: "speaking", label: "স্পিকিং", icon: LuMic, title: "জড়তা ছাড়াই কথা বলুন", text: "মেন্টরের সাথে প্রতিদিন লাইভ স্পিকিং প্র্যাকটিস।", points: ["লাইভ কথোপকথন রাউন্ড", "মেন্টর ভুল শুধরে দেবেন", "বাস্তব জীবনের টপিক"] },
            { key: "grammar", label: "গ্রামার", icon: LuSpellCheck, title: "গ্রামার যা মনে থাকে", text: "সহজ নিয়ম, বাংলা ও ইংরেজিতে বোঝানো।", points: ["উদাহরণসহ সহজ নিয়ম", "প্রতি ক্লাসের পর প্র্যাকটিস", "সাপ্তাহিক প্রগ্রেস চেক"] },
            { key: "pronunciation", label: "উচ্চারণ", icon: LuAudioLines, title: "স্পষ্ট ও স্বাভাবিক উচ্চারণ", text: "ধাপে ধাপে উচ্চারণের সমস্যা ঠিক করুন।", points: ["সাউন্ড ড্রিল", "রেকর্ড করে মিলিয়ে দেখুন", "স্ট্রেস ও ইন্টোনেশন"] },
            { key: "vocabulary", label: "ভোকাবুলারি", icon: LuLanguages, title: "কাজের শব্দভান্ডার", text: "দৈনন্দিন ও প্রফেশনাল শব্দ শিখুন।", points: ["দৈনিক ওয়ার্ড সেট", "বাক্যে শেখা", "ইন্টারভিউ ও মিটিং ফ্রেজ"] },
            { key: "public-speaking", label: "পাবলিক স্পিকিং", icon: LuTarget, title: "যেকোনো মঞ্চে কথা বলুন", text: "মঞ্চে আত্মবিশ্বাস, লিডারশিপ ও বিতর্কের দক্ষতা গড়ুন।", points: ["বক্তৃতা ও প্রেজেন্টেশন প্র্যাকটিস", "বিতর্ক ও লিডারশিপ সেশন", "প্রতিটি বক্তৃতায় মেন্টরের ফিডব্যাক"] },
        ],
    },
};

const Hero = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";
    const heroImage = useSiteImage("heroImage");

    const [activeTab, setActiveTab] = useState(0);
    const tab = c.tabs[activeTab];
    const TabIcon = tab.icon;

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    return (
        <section className="relative bg-white border-b border-slate-200 pt-8 sm:pt-10 pb-8 lg:min-h-[calc(100svh-132px)] lg:flex lg:flex-col">
            <div ref={sectionRef} className="relative w-full max-w-[1140px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:gap-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:flex-1">
                    {/* ---------------- LEFT: copy ---------------- */}
                    <motion.div
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded-sm bg-emerald-50 border border-emerald-200"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#027a1e]" />
                            <span className={`text-[11px] font-semibold uppercase tracking-wider text-[#027a1e] work ${bn}`}>{c.badge}</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className={`text-[34px] sm:text-5xl lg:text-[52px] 2xl:text-[60px] font-bold leading-[1.1] tracking-tight text-[#0b1b4a] outfit ${bn}`}
                        >
                            {c.h1a}
                            <br />
                            <span className="text-[#e5251f]">{c.h1b}</span>
                        </motion.h1>

                        <motion.span variants={fadeUp} aria-hidden="true" className="mt-5 block h-[3px] w-16 bg-[#e5251f]" />

                        <motion.p variants={fadeUp} className={`mt-5 max-w-md 2xl:max-w-lg text-sm sm:text-[15px] 2xl:text-base leading-relaxed text-slate-600 work ${bn}`}>
                            {c.desc}
                        </motion.p>

                        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/courses"
                                className={`inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#e5251f] to-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110 work ${bn}`}
                            >
                                {c.ctaPrimary} <LuArrowRight />
                            </Link>
                            <Link
                                href="/contact"
                                className={`inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2] hover:text-[#0142b2] work ${bn}`}
                            >
                                {c.ctaSecondary}
                            </Link>
                        </motion.div>

                        <motion.ul variants={fadeUp} className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-[13px] text-slate-600 work ${bn}`}>
                            {c.ticks.map((tk) => (
                                <li key={tk} className="flex items-center gap-1.5">
                                    <LuCheck className="text-[#027a1e]" /> {tk}
                                </li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    {/* ---------------- RIGHT: photo ---------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="relative w-full"
                    >
                        <div className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm aspect-[4/3] lg:aspect-auto lg:h-[400px] 2xl:h-[480px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={heroImage} alt={c.photoTag} className="absolute inset-0 h-full w-full object-cover" />
                            <span className={`absolute left-3 top-3 rounded-sm bg-[#e5251f] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm work ${bn}`}>
                                {c.photoTag}
                            </span>
                        </div>

                        {/* small overlay stat card */}
                        <div className="absolute -bottom-4 right-3 sm:right-6 flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-md">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0142b2]">
                                <LuUsers className="text-lg" />
                            </span>
                            <div>
                                <p className={`flex items-center gap-1 text-sm font-bold text-[#0b1b4a] outfit ${bn}`}>
                                    {c.photoCardTitle} <LuBadgeCheck className="text-[#027a1e]" />
                                </p>
                                <p className={`text-xs text-slate-500 work ${bn}`}>{c.photoCardText}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ---------------- Tabs + content panel (always visible on the first screen) ---------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="mt-10 lg:mt-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 [scrollbar-width:none]" role="tablist">
                        {c.tabs.map((tb, i) => {
                            const Icon = tb.icon;
                            const active = i === activeTab;
                            return (
                                <button
                                    key={tb.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveTab(i)}
                                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 sm:px-5 py-3 text-[13px] font-semibold transition work ${bn} ${
                                        active
                                            ? "border-[#e5251f] bg-white text-[#0b1b4a]"
                                            : "border-transparent text-slate-500 hover:text-[#0b1b4a]"
                                    }`}
                                >
                                    <Icon className={`text-sm ${active ? "text-[#e5251f]" : ""}`} /> {tb.label}
                                </button>
                            );
                        })}
                    </div>

                    <motion.div
                        key={tab.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:items-center md:gap-6"
                    >
                        <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[#0142b2]">
                                <TabIcon className="text-xl" />
                            </span>
                            <div>
                                <p className={`text-[11px] font-semibold uppercase tracking-wider text-[#e5251f] work ${bn}`}>{c.panelHint}</p>
                                <h3 className={`text-base sm:text-lg font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{tab.title}</h3>
                                <p className={`mt-0.5 text-sm text-slate-600 work ${bn}`}>{tab.text}</p>
                            </div>
                        </div>

                        <ul className="grid gap-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 md:border-l md:border-slate-200 md:pl-6">
                            {tab.points.map((p) => (
                                <li key={p} className={`flex items-center gap-2 text-sm font-medium text-slate-700 work ${bn}`}>
                                    <LuCheck className="shrink-0 text-[#027a1e]" />
                                    {p}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href={tab.href || "/courses"}
                            className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#01368f] work ${bn}`}
                        >
                            {c.panelCta} <LuArrowRight />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
