"use client";

import Link from "next/link";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    LuArrowRight,
    LuCheck,
    LuUsers,
    LuBookOpen,
    LuMonitorPlay,
    LuCirclePlay,
    LuAward,
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
        photoTag: "Be a Speaker, Be a Leader!",
        photoCardTitle: "Live practice",
        photoCardText: "Mentor feedback in every class",
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
        ticks: ["অনলাইন ও অফলাইন", "রেকর্ডেড ক্লাস", "বিকাশে পেমেন্ট"],
        photoTag: "বক্তা হও, নেতা হও!",
        photoCardTitle: "লাইভ প্র্যাকটিস",
        photoCardText: "প্রতিটি ক্লাসে মেন্টরের ফিডব্যাক",
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
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";
    const heroImage = useSiteImage("heroImage");

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
