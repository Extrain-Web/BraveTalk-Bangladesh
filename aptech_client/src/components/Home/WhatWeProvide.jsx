"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuMic, LuMessagesSquare, LuQrCode, LuBookOpen, LuLanguages, LuSmartphone } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeader from "./SectionHeader";
import CounterSection from "./CounterSection";
import { useSiteImage } from "@/lib/siteImages";

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
    const whyImage = useSiteImage("whyImage");

    return (
        <section className="relative bg-slate-50 py-12 lg:py-16 border-y border-slate-200">
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
                <div className="grid items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                    {/* Photo */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                        transition={{ duration: 0.5 }}
                        className="relative min-h-[260px] overflow-hidden rounded-md border border-slate-200 bg-slate-200 shadow-sm sm:min-h-[340px]"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={whyImage}
                            alt={isBn ? "ব্রেভটক বাংলাদেশের ক্লাস" : "A BraveTalk Bangladesh class"}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1b4a]/85 to-transparent p-5 pt-16">
                            <p className={`text-lg font-bold text-white outfit ${bn}`}>{isBn ? "বক্তা হও, নেতা হও!" : "Be a Speaker, Be a Leader!"}</p>
                            <p className={`mt-0.5 text-xs text-white/80 work ${bn}`}>
                                {isBn ? "পাবলিক স্পিকিং · লিডারশিপ · সোশ্যাল অ্যাডভোকেসি" : "Public speaking · Leadership · Social advocacy"}
                            </p>
                        </div>
                    </motion.div>

                    {/* Benefits */}
                    <div>

                        <motion.div
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
                            className="grid grid-cols-1 overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-2"
                        >
                            {BENEFITS.map((b, i) => {
                                const [title, desc] = isBn ? b.bn : b.en;
                                return (
                                    <motion.div
                                        key={b.en[0]}
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                                        className={`flex gap-3.5 border-slate-200 p-4 sm:p-5 ${i > 0 ? "border-t" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
                                    >
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${b.tile}`}>
                                            <b.Icon className="text-lg" />
                                        </span>
                                        <div>
                                            <h3 className={`text-[15px] font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                                            <p className={`mt-1 text-[13px] leading-relaxed text-slate-600 work ${bn}`}>{desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                <CounterSection />
            </div>
        </section>
    );
};

export default WhatWeProvide;
