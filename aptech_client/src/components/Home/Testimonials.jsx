"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuQuote, LuStar } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeader from "./SectionHeader";

// Sample student feedback — replace with real student quotes (name, course, text).
const ITEMS = [
    {
        name: "Student name",
        course: "Spoken English Foundation",
        color: "#0142b2",
        en: "I used to freeze whenever I had to speak English. After the live practice sessions I can now introduce myself and hold a conversation with confidence.",
        bn: "আগে ইংরেজিতে কথা বলতে গেলে আটকে যেতাম। লাইভ প্র্যাকটিসের পর এখন আত্মবিশ্বাসের সাথে নিজের পরিচয় দিতে ও কথা চালিয়ে যেতে পারি।",
    },
    {
        name: "Student name",
        course: "Public Speaking & Leadership",
        color: "#e5251f",
        en: "The mentors give honest feedback in every class. My presentations at university are clearer, and I finally enjoy speaking in front of people.",
        bn: "মেন্টররা প্রতিটি ক্লাসে সৎ ফিডব্যাক দেন। এখন বিশ্ববিদ্যালয়ের প্রেজেন্টেশন অনেক পরিষ্কার হয়, মানুষের সামনে কথা বলতে ভালো লাগে।",
    },
    {
        name: "Student name",
        course: "Spoken English (Recorded)",
        color: "#027a1e",
        en: "The recorded lessons fit around my job. Short, practical videos and a certificate at the end — exactly what I needed.",
        bn: "রেকর্ডেড লেসনগুলো চাকরির পাশাপাশি দেখতে পারি। ছোট, কাজের ভিডিও আর শেষে সার্টিফিকেট — ঠিক যা দরকার ছিল।",
    },
];

const Testimonials = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

    return (
        <section className="relative bg-slate-50 py-12 lg:py-16 border-b border-slate-200">
            <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionHeader
                    badge={isBn ? "শিক্ষার্থীদের কথা" : "Testimonials"}
                    dot="green"
                    title={isBn ? "আমাদের শিক্ষার্থীরা" : "What our students"}
                    titleAccent={isBn ? "যা বলছে" : "say"}
                    description={
                        isBn
                            ? "ব্রেভটকের ক্লাস শেষে শিক্ষার্থীরা তাদের অভিজ্ঞতা জানিয়েছেন।"
                            : "Real words from learners who built their confidence with BraveTalk."
                    }
                    isInView={isInView}
                    bengaliClass={bn}
                />

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-3"
                >
                    {ITEMS.map((t, i) => (
                        <motion.figure
                            key={i}
                            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                            className="relative flex h-full flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-md" style={{ backgroundColor: t.color }} />
                            <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: `${t.color}14`, color: t.color }}>
                                    <LuQuote className="text-lg" />
                                </span>
                                <span className="flex gap-0.5 text-amber-400" aria-label="5 out of 5">
                                    {Array.from({ length: 5 }).map((_, s) => <LuStar key={s} className="fill-current text-sm" />)}
                                </span>
                            </div>

                            <blockquote className={`mt-4 flex-1 text-[14.5px] leading-relaxed text-slate-600 work ${bn}`}>
                                “{isBn ? t.bn : t.en}”
                            </blockquote>

                            <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: t.color }}>
                                    {t.name.charAt(0)}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-[15px] font-bold text-[#0b1b4a] outfit">{t.name}</span>
                                    <span className="block truncate text-xs text-slate-500 work">{t.course}</span>
                                </span>
                            </figcaption>
                        </motion.figure>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
