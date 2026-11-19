"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LuArrowRight, LuMic, LuUsers, LuMegaphone, LuCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const COPY = {
    en: {
        badge: "About BraveTalk Bangladesh",
        h1a: "Be a Speaker,",
        h1b: "Be a Leader!",
        desc: "BraveTalk Bangladesh is a learning platform that helps students speak English with confidence, stand on any stage and lead with their voice. Our mission: empowering students through public speaking, leadership & social advocacy.",
        ctaPrimary: "Explore courses",
        ctaSecondary: "Contact us",
        ticks: ["Online & in-person classes", "Live practice with mentors", "Verifiable certificates"],
        panelHint: "Our mission",
        panelTitle: "Empowering students through",
        pillars: [
            { icon: LuMic, title: "Public speaking", text: "Speak clearly and confidently in front of anyone." },
            { icon: LuUsers, title: "Leadership", text: "Lead teams, ideas and conversations." },
            { icon: LuMegaphone, title: "Social advocacy", text: "Use your voice for causes that matter." },
        ],
    },
    bn: {
        badge: "ব্রেভটক বাংলাদেশ সম্পর্কে",
        h1a: "বক্তা হও,",
        h1b: "নেতা হও!",
        desc: "ব্রেভটক বাংলাদেশ একটি লার্নিং প্ল্যাটফর্ম, যেখানে শিক্ষার্থীরা আত্মবিশ্বাসের সাথে ইংরেজিতে কথা বলা, যেকোনো মঞ্চে দাঁড়ানো এবং নিজের কণ্ঠ দিয়ে নেতৃত্ব দেওয়া শেখে। আমাদের লক্ষ্য: পাবলিক স্পিকিং, লিডারশিপ ও সামাজিক অ্যাডভোকেসির মাধ্যমে শিক্ষার্থীদের ক্ষমতায়ন।",
        ctaPrimary: "কোর্স দেখুন",
        ctaSecondary: "যোগাযোগ করুন",
        ticks: ["অনলাইন ও সরাসরি ক্লাস", "মেন্টরের সাথে লাইভ প্র্যাকটিস", "যাচাইযোগ্য সার্টিফিকেট"],
        panelHint: "আমাদের লক্ষ্য",
        panelTitle: "শিক্ষার্থীদের ক্ষমতায়ন যার মাধ্যমে",
        pillars: [
            { icon: LuMic, title: "পাবলিক স্পিকিং", text: "যে কারো সামনে স্পষ্ট ও আত্মবিশ্বাসী হয়ে কথা বলা।" },
            { icon: LuUsers, title: "লিডারশিপ", text: "টিম, আইডিয়া ও আলোচনায় নেতৃত্ব দেওয়া।" },
            { icon: LuMegaphone, title: "সামাজিক অ্যাডভোকেসি", text: "গুরুত্বপূর্ণ বিষয়ে নিজের কণ্ঠ ব্যবহার করা।" },
        ],
    },
};

const TINTS = [
    "bg-blue-50 text-[#0142b2]",
    "bg-red-50 text-[#e5251f]",
    "bg-emerald-50 text-[#027a1e]",
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const AboutHero = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    return (
        <section className="relative overflow-hidden border-b border-slate-100 bg-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-red-100/60 blur-[120px]" />
                <div className="absolute top-10 right-[-80px] h-[480px] w-[480px] rounded-full bg-blue-200/60 blur-[120px]" />
                <div className="absolute bottom-[-160px] left-1/3 h-[420px] w-[420px] rounded-full bg-emerald-100/60 blur-[120px]" />
                <div className="absolute top-10 right-[22%] hidden h-2.5 w-2.5 rounded-full bg-[#0142b2] md:block" />
            </div>

            <div className="relative z-10 mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] items-center gap-10 px-4 sm:px-6 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                >
                    <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#027a1e]" />
                        <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{c.badge}</span>
                    </motion.div>

                    <motion.h1 variants={fadeUp} className={`text-[34px] sm:text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight text-[#0b1b4a] outfit ${bn}`}>
                        {c.h1a}{" "}
                        <span
                            className="text-[#e5251f] italic font-bold"
                            style={language === "bn" ? undefined : { fontFamily: "var(--font-caveat), cursive", fontSize: "1.1em" }}
                        >
                            {c.h1b}
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className={`mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
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

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mx-auto w-full max-w-[460px] lg:ml-auto"
                >
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-900/10">
                        <p className={`text-xs uppercase tracking-wider text-slate-400 work ${bn}`}>{c.panelHint}</p>
                        <h3 className={`mt-1 text-lg font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{c.panelTitle}</h3>
                        <div className="my-4 h-px bg-slate-100" />
                        <ul className="space-y-4">
                            {c.pillars.map(({ icon: Icon, title, text }, i) => (
                                <li key={title} className="flex items-start gap-3.5">
                                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TINTS[i]}`}>
                                        <Icon className="text-xl" />
                                    </span>
                                    <div>
                                        <p className={`text-[15px] font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</p>
                                        <p className={`text-sm text-slate-500 work ${bn}`}>{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutHero;
