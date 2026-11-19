"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuMic, LuMessagesSquare, LuQrCode, LuBookOpen, LuLanguages, LuSmartphone } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeader from "./SectionHeader";
import CounterSection from "./CounterSection";

const BENEFITS = [
    {
        Icon: LuMic,
        tile: "bg-blue-50 text-[#0142b2]",
        en: ["Live speaking practice", "Speak in every class — conversation rounds, speeches and real-life topics."],
        bn: ["লাইভ স্পিকিং প্র্যাকটিস", "প্রতিটি ক্লাসে কথা বলুন — কথোপকথন, বক্তৃতা ও বাস্তব জীবনের টপিক।"],
    },
    {
        Icon: LuMessagesSquare,
        tile: "bg-red-50 text-[#e5251f]",
        en: ["Mentor feedback", "Your mentor corrects mistakes and tells you exactly what to improve next."],
        bn: ["মেন্টরের ফিডব্যাক", "মেন্টর ভুল শুধরে দেবেন এবং পরের ধাপে কী উন্নত করতে হবে বলে দেবেন।"],
    },
    {
        Icon: LuQrCode,
        tile: "bg-emerald-50 text-[#027a1e]",
        en: ["Verifiable certificates", "Finish a course and get a certificate anyone can verify with its QR code."],
        bn: ["যাচাইযোগ্য সার্টিফিকেট", "কোর্স শেষে সার্টিফিকেট পান — QR কোড দিয়ে যে কেউ যাচাই করতে পারবেন।"],
    },
    {
        Icon: LuBookOpen,
        tile: "bg-blue-50 text-[#0142b2]",
        en: ["Books & video lessons", "Study between classes with our books, PDFs and recorded video lessons."],
        bn: ["বই ও ভিডিও লেসন", "ক্লাসের ফাঁকে আমাদের বই, পিডিএফ ও রেকর্ডেড ভিডিও লেসনে পড়ুন।"],
    },
    {
        Icon: LuLanguages,
        tile: "bg-red-50 text-[#e5251f]",
        en: ["Bangla + English support", "Every rule is explained in simple Bangla and English, so nothing is confusing."],
        bn: ["বাংলা + ইংরেজিতে সহায়তা", "প্রতিটি নিয়ম সহজ বাংলা ও ইংরেজিতে বোঝানো হয় — কোনো জটিলতা নেই।"],
    },
    {
        Icon: LuSmartphone,
        tile: "bg-emerald-50 text-[#027a1e]",
        en: ["Learn on your phone", "Join live classes, watch lessons and track progress right from your phone."],
        bn: ["ফোনেই শিখুন", "ফোন থেকেই লাইভ ক্লাসে যোগ দিন, লেসন দেখুন ও প্রগ্রেস দেখুন।"],
    },
];

const WhatWeProvide = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

    return (
        <section className="relative overflow-hidden bg-slate-50/60 py-14 lg:py-20 border-y border-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/4 h-[380px] w-[380px] rounded-full bg-blue-100/60 blur-[120px]" />
                <div className="absolute bottom-[-120px] right-[10%] h-[360px] w-[360px] rounded-full bg-emerald-100/50 blur-[120px]" />
            </div>

            <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionHeader
                    badge={isBn ? "কেন ব্রেভটক" : "Why BraveTalk"}
                    title={isBn ? "শুধু শেখা নয়," : "More than lessons —"}
                    titleAccent={isBn ? "বলতে শেখা" : "you actually speak"}
                    description={
                        isBn
                            ? "পাবলিক স্পিকিং, লিডারশিপ ও সোশ্যাল অ্যাডভোকেসির মাধ্যমে আমরা শিক্ষার্থীদের আত্মবিশ্বাসী করে তুলি।"
                            : "We empower students through public speaking, leadership and social advocacy. Here's what you get."
                    }
                    isInView={isInView}
                    bengaliClass={bn}
                />

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
                >
                    {BENEFITS.map((b) => {
                        const [title, desc] = isBn ? b.bn : b.en;
                        return (
                            <motion.div
                                key={b.en[0]}
                                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                            >
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${b.tile}`}>
                                    <b.Icon className="text-xl" />
                                </span>
                                <div>
                                    <h3 className={`text-[15px] font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                                    <p className={`mt-1 text-sm leading-relaxed text-slate-500 work ${bn}`}>{desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <CounterSection />
            </div>
        </section>
    );
};

export default WhatWeProvide;
