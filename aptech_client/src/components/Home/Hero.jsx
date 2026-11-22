"use client";

import Link from "next/link";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    LuArrowRight,
    LuCheck,
    LuBookOpen,
    LuMonitorPlay,
    LuCirclePlay,
    LuAward,
    LuMic,
    LuSparkles,
    LuStar,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useDesignScale, scaleStyle } from "@/lib/useDesignScale";

const WAVE = [30, 55, 80, 45, 95, 60, 35, 70, 100, 50, 75, 40, 85, 55, 30, 65, 90, 45, 25, 60];
const SKILL_COLORS = ["#0142b2", "#027a1e", "#e5251f"];

/* ---------- Content (English / Bangla) — kept short on purpose ---------- */
const COPY = {
    en: {
        badge: "Live classes · Real mentors",
        h1a: "Speak English",
        h1b: "with confidence.",
        desc: "Learn spoken English and public speaking with live practice and mentor feedback. Be a Speaker, Be a Leader!",
        ctaPrimary: "Explore courses",
        ctaSecondary: "Contact us",
        ticks: ["Live online classes", "Recorded classes", "Pay with bKash"],
        photoTag: "Be a Speaker, Be a Leader!",
        panelTitle: "Speaking practice",
        panelSub: "Public Speaking · Live class",
        chatQ: "Great start! Now tell us about your dream job in one minute.",
        youSpeaking: "you're speaking",
        you: "Y",
        feedbackTitle: "Mentor feedback",
        skills: [["Fluency", 86], ["Confidence", 92], ["Pronunciation", 78]],
        cardCta: "Explore",
        cards: [
            { key: "books", title: "Books", text: "Printed & digital books with video lessons.", href: "/books", icon: LuBookOpen, color: "#e5251f", tint: "#fdeceb" },
            { key: "online", title: "Online Courses", text: "Live classes with mentors — join from anywhere.", href: "/courses?type=Online", icon: LuMonitorPlay, color: "#0142b2", tint: "#e8effc" },
            { key: "recorded", title: "Recorded Courses", text: "Learn at your own pace, watch anytime.", href: "/courses?type=Recorded", icon: LuCirclePlay, color: "#027a1e", tint: "#e6f4ea" },
            { key: "certification", title: "Certification", text: "QR-verified certificates you can share.", href: "/certification", icon: LuAward, color: "#0b1b4a", tint: "#e9ebf2" },
        ],
    },
    bn: {
        badge: "লাইভ ক্লাস · রিয়েল মেন্টর",
        h1a: "আত্মবিশ্বাসের সাথে",
        h1b: "ইংরেজিতে বলুন।",
        desc: "লাইভ প্র্যাকটিস ও মেন্টরের ফিডব্যাকে স্পোকেন ইংলিশ ও পাবলিক স্পিকিং শিখুন। বক্তা হও, নেতা হও!",
        ctaPrimary: "কোর্স দেখুন",
        ctaSecondary: "যোগাযোগ করুন",
        ticks: ["অনলাইন লাইভ ক্লাস", "রেকর্ডেড ক্লাস", "বিকাশে পেমেন্ট"],
        photoTag: "বক্তা হও, নেতা হও!",
        panelTitle: "স্পিকিং প্র্যাকটিস",
        panelSub: "পাবলিক স্পিকিং · লাইভ ক্লাস",
        chatQ: "দারুণ শুরু! এবার এক মিনিটে তোমার স্বপ্নের চাকরি নিয়ে বলো।",
        youSpeaking: "তুমি বলছ",
        you: "আ",
        feedbackTitle: "মেন্টরের ফিডব্যাক",
        skills: [["সাবলীলতা", 86], ["আত্মবিশ্বাস", 92], ["উচ্চারণ", 78]],
        cardCta: "দেখুন",
        cards: [
            { key: "books", title: "বই", text: "ছাপা ও ডিজিটাল বই, সাথে ভিডিও লেসন।", href: "/books", icon: LuBookOpen, color: "#e5251f", tint: "#fdeceb" },
            { key: "online", title: "অনলাইন কোর্স", text: "মেন্টরের সাথে লাইভ ক্লাস, যেকোনো জায়গা থেকে।", href: "/courses?type=Online", icon: LuMonitorPlay, color: "#0142b2", tint: "#e8effc" },
            { key: "recorded", title: "রেকর্ডেড কোর্স", text: "নিজের সময়ে শিখুন, যখন খুশি দেখুন।", href: "/courses?type=Recorded", icon: LuCirclePlay, color: "#027a1e", tint: "#e6f4ea" },
            { key: "certification", title: "সার্টিফিকেশন", text: "QR দিয়ে যাচাইযোগ্য সার্টিফিকেট।", href: "/certification", icon: LuAward, color: "#0b1b4a", tint: "#e9ebf2" },
        ],
    },
};

const Hero = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
    const scale = useDesignScale();
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    const fadeUp = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    return (
        <section style={{ "--hs": scale }} className="relative bg-white border-b border-slate-200 pt-8 sm:pt-10 pb-8 lg:min-h-[calc(100svh-132px*var(--hs,1))] lg:flex lg:flex-col">
            <div ref={sectionRef} style={scaleStyle(scale)} className="relative w-full max-w-[1140px] mx-auto px-4 sm:px-6 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:gap-8">
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
                            className={`text-[34px] sm:text-5xl lg:text-[52px] font-bold leading-[1.1] tracking-tight text-[#0b1b4a] outfit ${bn}`}
                        >
                            {c.h1a}
                            <br />
                            <span className="text-[#e5251f]">{c.h1b}</span>
                        </motion.h1>

                        <motion.span variants={fadeUp} aria-hidden="true" className="mt-5 block h-[3px] w-16 bg-[#e5251f]" />

                        <motion.p variants={fadeUp} className={`mt-5 max-w-md text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>
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
                        <div className="relative overflow-hidden rounded-md bg-[#0b1b4a] shadow-xl lg:h-[400px]">
                            {/* background pattern + glows */}
                            <div aria-hidden="true" className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                            <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#0142b2] opacity-40 blur-3xl" />
                            <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#e5251f] opacity-25 blur-3xl" />
                            <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1">
                                <span className="flex-1 bg-[#0142b2]" /><span className="flex-1 bg-[#e5251f]" /><span className="flex-1 bg-[#027a1e]" />
                            </div>

                            <div className="relative flex h-full flex-col gap-4 p-5 sm:p-7">
                                {/* session header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white"><LuMic /></span>
                                        <div>
                                            <p className={`text-sm font-bold text-white outfit ${bn}`}>{c.panelTitle}</p>
                                            <p className={`text-[11px] text-blue-200/80 work ${bn}`}>{c.panelSub}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#e5251f] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                                    </span>
                                </div>

                                {/* conversation */}
                                <div className="space-y-2.5">
                                    <div className="flex items-end gap-2">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#027a1e] text-[11px] font-bold text-white">M</span>
                                        <p className={`max-w-[80%] rounded-md rounded-bl-none bg-white/10 px-3 py-2 text-[13px] text-white work ${bn}`}>{c.chatQ}</p>
                                    </div>
                                    <div className="flex items-end justify-end gap-2">
                                        <div className="rounded-md rounded-br-none bg-[#0142b2] px-3 py-2">
                                            <div className="flex h-6 items-center gap-[3px]" aria-hidden="true">
                                                {WAVE.map((h, i) => (
                                                    <span key={i} className="hero-wave w-[3px] rounded-full bg-white/90" style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.11}s` }} />
                                                ))}
                                            </div>
                                            <p className={`mt-1 text-[10px] text-blue-100/80 work ${bn}`}>0:18 · {c.youSpeaking}</p>
                                        </div>
                                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#0142b2] ${bn}`}>{c.you}</span>
                                    </div>
                                </div>

                                {/* mentor feedback */}
                                <div className="mt-auto rounded-md bg-white p-4 shadow-lg">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className={`flex items-center gap-1.5 text-[13px] font-bold text-[#0b1b4a] outfit ${bn}`}>
                                            <LuSparkles className="text-[#e5251f]" /> {c.feedbackTitle}
                                        </p>
                                        <span className="flex items-center gap-0.5 text-amber-400">
                                            {Array.from({ length: 5 }).map((_, s) => <LuStar key={s} className="fill-current text-[11px]" />)}
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {c.skills.map(([label, val], i) => (
                                            <div key={label}>
                                                <div className={`mb-1 flex justify-between text-[11px] font-medium text-slate-600 work ${bn}`}>
                                                    <span>{label}</span><span className="font-bold" style={{ color: SKILL_COLORS[i] }}>{val}%</span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: SKILL_COLORS[i] }}
                                                        initial={{ width: 0 }}
                                                        animate={isInView ? { width: `${val}%` } : { width: 0 }}
                                                        transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <style jsx>{`
                                .hero-wave { animation: heroWave 1.1s ease-in-out infinite alternate; }
                                @keyframes heroWave { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }
                            `}</style>
                        </div>
                    </motion.div>
                </div>

                {/* ---------------- 4 category cards ---------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="mt-10 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                >
                    {c.cards.map(({ key, title, text, href, icon: Icon, color, tint }) => (
                        <Link
                            key={key}
                            href={href}
                            className="group relative flex flex-col rounded-md border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                        >
                            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-md" style={{ backgroundColor: color }} />
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: tint, color }}>
                                    <Icon className="text-xl" />
                                </span>
                                <h3 className={`text-[15px] sm:text-base font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                            </div>
                            <p className={`mt-3 hidden sm:block text-[13px] leading-relaxed text-slate-600 work ${bn}`}>{text}</p>
                            <span className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold work ${bn}`} style={{ color }}>
                                {c.cardCta} <LuArrowRight className="transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
