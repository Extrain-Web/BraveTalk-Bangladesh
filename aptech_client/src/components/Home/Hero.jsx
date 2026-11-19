"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
    LuMic,
    LuHeadphones,
    LuBookOpen,
    LuPenLine,
    LuArrowRight,
    LuCheck,
    LuSpellCheck,
    LuAudioLines,
    LuLanguages,
    LuTarget,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

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
        tabs: [
            { key: "speaking", label: "স্পিকিং", icon: LuMic, title: "জড়তা ছাড়াই কথা বলুন", text: "মেন্টরের সাথে প্রতিদিন লাইভ স্পিকিং প্র্যাকটিস।", points: ["লাইভ কথোপকথন রাউন্ড", "মেন্টর ভুল শুধরে দেবেন", "বাস্তব জীবনের টপিক"] },
            { key: "grammar", label: "গ্রামার", icon: LuSpellCheck, title: "গ্রামার যা মনে থাকে", text: "সহজ নিয়ম, বাংলা ও ইংরেজিতে বোঝানো।", points: ["উদাহরণসহ সহজ নিয়ম", "প্রতি ক্লাসের পর প্র্যাকটিস", "সাপ্তাহিক প্রগ্রেস চেক"] },
            { key: "pronunciation", label: "উচ্চারণ", icon: LuAudioLines, title: "স্পষ্ট ও স্বাভাবিক উচ্চারণ", text: "ধাপে ধাপে উচ্চারণের সমস্যা ঠিক করুন।", points: ["সাউন্ড ড্রিল", "রেকর্ড করে মিলিয়ে দেখুন", "স্ট্রেস ও ইন্টোনেশন"] },
            { key: "vocabulary", label: "ভোকাবুলারি", icon: LuLanguages, title: "কাজের শব্দভান্ডার", text: "দৈনন্দিন ও প্রফেশনাল শব্দ শিখুন।", points: ["দৈনিক ওয়ার্ড সেট", "বাক্যে শেখা", "ইন্টারভিউ ও মিটিং ফ্রেজ"] },
            { key: "public-speaking", label: "পাবলিক স্পিকিং", icon: LuTarget, title: "যেকোনো মঞ্চে কথা বলুন", text: "মঞ্চে আত্মবিশ্বাস, লিডারশিপ ও বিতর্কের দক্ষতা গড়ুন।", points: ["বক্তৃতা ও প্রেজেন্টেশন প্র্যাকটিস", "বিতর্ক ও লিডারশিপ সেশন", "প্রতিটি বক্তৃতায় মেন্টরের ফিডব্যাক"] },
        ],
    },
};

const FLOATERS = [
    { icon: LuMic, bg: "from-emerald-100 to-emerald-50", fg: "text-[#027a1e]", pos: "-top-4 -left-4", delay: 0 },
    { icon: LuHeadphones, bg: "from-red-100 to-red-50", fg: "text-[#e5251f]", pos: "top-6 -right-4 sm:-right-7", delay: 0.8 },
    { icon: LuBookOpen, bg: "from-blue-100 to-blue-50", fg: "text-[#0142b2]", pos: "bottom-16 -left-4 sm:-left-8", delay: 1.4 },
    { icon: LuPenLine, bg: "from-amber-100 to-amber-50", fg: "text-amber-500", pos: "-bottom-3 -right-3 sm:-right-5", delay: 0.4 },
];

const Hero = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    const [activeTab, setActiveTab] = useState(0);
    const tab = c.tabs[activeTab];
    const TabIcon = tab.icon;

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    return (
        <section className="relative overflow-hidden bg-white pt-8 sm:pt-10 pb-8 lg:min-h-[calc(100svh-132px)] lg:flex lg:flex-col">
            {/* ---------- Soft background glows ---------- */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-red-100/60 blur-[120px]" />
                <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full bg-blue-200/60 blur-[120px]" />
                <div className="absolute bottom-[-140px] left-1/3 w-[420px] h-[420px] rounded-full bg-emerald-100/60 blur-[120px]" />
                <div className="hidden lg:block absolute top-1/2 right-[6%] -translate-y-1/2 w-[560px] h-[560px] rounded-full border border-slate-200/70" />
                <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 w-[760px] h-[760px] rounded-full border border-slate-200/50" />
                <div className="absolute top-10 right-[22%] w-2.5 h-2.5 rounded-full bg-[#0142b2] hidden md:block" />
            </div>

            <div ref={sectionRef} className="relative z-10 w-full max-w-[1140px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:gap-8">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-10 items-center lg:flex-1">
                    {/* ---------------- LEFT ---------------- */}
                    <motion.div
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                    >
                        <motion.div
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#027a1e]" />
                            <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{c.badge}</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className={`text-[34px] sm:text-5xl lg:text-[52px] 2xl:text-[64px] font-extrabold leading-[1.1] tracking-tight text-[#0b1b4a] outfit ${bn}`}
                        >
                            {c.h1a}
                            <br />
                            <span
                                className="text-[#e5251f] italic font-bold"
                                style={language === "bn" ? undefined : { fontFamily: "var(--font-caveat), cursive", fontSize: "1.1em" }}
                            >
                                {c.h1b}
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className={`mt-4 max-w-md 2xl:max-w-lg text-sm sm:text-[15px] 2xl:text-base leading-relaxed text-slate-500 work ${bn}`}>
                            {c.desc}
                        </motion.p>

                        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/courses"
                                className={`inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:bg-[#01368f] hover:gap-3 work ${bn}`}
                            >
                                {c.ctaPrimary} <LuArrowRight />
                            </Link>
                            <Link
                                href="/contact"
                                className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-slate-300 hover:shadow work ${bn}`}
                            >
                                {c.ctaSecondary}
                            </Link>
                        </motion.div>

                        <motion.ul variants={fadeUp} className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-[13px] text-slate-500 work ${bn}`}>
                            {c.ticks.map((tk) => (
                                <li key={tk} className="flex items-center gap-1.5">
                                    <LuCheck className="text-[#027a1e]" /> {tk}
                                </li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    {/* ---------------- RIGHT ---------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="relative mx-auto w-full max-w-[420px] lg:max-w-[430px] 2xl:max-w-[480px] lg:ml-auto"
                    >
                        {FLOATERS.map(({ icon: Icon, bg, fg, pos, delay }, i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
                                className={`absolute z-20 ${pos} w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${bg} ${fg} border border-white shadow-xl shadow-slate-900/10 flex items-center justify-center`}
                            >
                                <Icon className="text-xl" />
                            </motion.div>
                        ))}

                        <div className="relative z-10 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 2xl:p-8 shadow-2xl shadow-slate-900/10">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-[#0142b2]">
                                    <TabIcon className="text-xl" />
                                </div>
                                <div>
                                    <p className={`text-xs uppercase tracking-wider text-slate-400 work ${bn}`}>{c.panelHint}</p>
                                    <h3 className={`text-lg font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{tab.title}</h3>
                                </div>
                            </div>

                            <div className="my-4 h-px bg-slate-100" />

                            <motion.div key={tab.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                                <p className={`text-sm text-slate-500 work ${bn}`}>{tab.text}</p>
                                <ul className="mt-3 space-y-2">
                                    {tab.points.map((p) => (
                                        <li key={p} className={`flex items-center gap-2.5 text-sm font-medium text-slate-700 work ${bn}`}>
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#027a1e]">
                                                <LuCheck className="text-xs" />
                                            </span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            <Link
                                href={tab.href || "/courses"}
                                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0142b2] py-3 text-sm font-semibold text-white transition hover:bg-[#01368f] work ${bn}`}
                            >
                                {c.panelCta} <LuArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* ---------------- Tab pill (always visible on the first screen) ---------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 lg:mt-0 flex justify-center"
                >
                    <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5 [scrollbar-width:none]">
                        {c.tabs.map((tb, i) => {
                            const Icon = tb.icon;
                            const active = i === activeTab;
                            return (
                                <button
                                    key={tb.key}
                                    type="button"
                                    onClick={() => setActiveTab(i)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition work ${bn} ${
                                        active ? "bg-[#0142b2] text-white shadow" : "text-slate-500 hover:text-[#0b1b4a]"
                                    }`}
                                >
                                    <Icon className="text-sm" /> {tb.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
