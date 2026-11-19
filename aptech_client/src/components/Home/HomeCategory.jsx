"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuMonitorPlay, LuBuilding2, LuCirclePlay, LuMic, LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeader from "./SectionHeader";

// Learning formats → course list filtered by type / category
const MODES = [
    {
        key: "online",
        Icon: LuMonitorPlay,
        tile: "bg-blue-50 text-[#0142b2]",
        bar: "bg-[#0142b2]",
        href: "/courses?type=Online",
        en: { title: "Online live classes", desc: "Join live classes with your mentor from anywhere — on phone or laptop." },
        bn: { title: "অনলাইন লাইভ ক্লাস", desc: "যেকোনো জায়গা থেকে ফোন বা ল্যাপটপে মেন্টরের সাথে লাইভ ক্লাস করুন।" },
    },
    {
        key: "offline",
        Icon: LuBuilding2,
        tile: "bg-emerald-50 text-[#027a1e]",
        bar: "bg-[#027a1e]",
        href: "/courses?type=Offline",
        en: { title: "In-person at South Badda", desc: "Face-to-face classes and speaking practice at our Dhaka office." },
        bn: { title: "দক্ষিণ বাড্ডায় সরাসরি ক্লাস", desc: "আমাদের ঢাকা অফিসে সামনাসামনি ক্লাস ও স্পিকিং প্র্যাকটিস।" },
    },
    {
        key: "recorded",
        Icon: LuCirclePlay,
        tile: "bg-red-50 text-[#e5251f]",
        bar: "bg-[#e5251f]",
        href: "/courses?type=Recorded",
        en: { title: "Recorded courses", desc: "Buy once and learn at your own pace — rewatch any lesson anytime." },
        bn: { title: "রেকর্ডেড কোর্স", desc: "একবার কিনুন, নিজের সময়মতো শিখুন — যেকোনো লেসন বারবার দেখুন।" },
    },
    {
        key: "speaking",
        Icon: LuMic,
        tile: "bg-blue-50 text-[#0142b2]",
        bar: "bg-[#0142b2]",
        href: `/courses?category=${encodeURIComponent("Public Speaking")}`,
        en: { title: "Public speaking", desc: "Stage confidence, debate and leadership with feedback on every talk." },
        bn: { title: "পাবলিক স্পিকিং", desc: "মঞ্চে আত্মবিশ্বাস, বিতর্ক ও লিডারশিপ — প্রতিটি বক্তৃতায় ফিডব্যাক।" },
    },
];

const HomeCategory = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

    return (
        <section className="relative bg-white py-14 lg:py-20">
            <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionHeader
                    badge={isBn ? "শেখার ধরন" : "Learning formats"}
                    title={isBn ? "আপনি কীভাবে" : "How do you want"}
                    titleAccent={isBn ? "শিখতে চান?" : "to learn?"}
                    description={
                        isBn
                            ? "অনলাইনে, সরাসরি ক্লাসে বা রেকর্ডেড ভিডিওতে — আপনার সুবিধামতো পথ বেছে নিন।"
                            : "Online, in person or on video — pick the way that fits your day."
                    }
                    isInView={isInView}
                    bengaliClass={bn}
                />

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
                >
                    {MODES.map((m) => {
                        const c = isBn ? m.bn : m.en;
                        return (
                            <motion.div
                                key={m.key}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                            >
                                <Link
                                    href={m.href}
                                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0142b2]/30 hover:shadow-xl hover:shadow-slate-900/10"
                                >
                                    <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${m.bar}`} />
                                    <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${m.tile}`}>
                                        <m.Icon className="text-[22px]" />
                                    </span>
                                    <h3 className={`text-base lg:text-lg font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{c.title}</h3>
                                    <p className={`mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 work ${bn}`}>{c.desc}</p>
                                    <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0142b2] transition-all group-hover:gap-2.5 work ${bn}`}>
                                        {isBn ? "কোর্স দেখুন" : "See courses"} <LuArrowRight />
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default HomeCategory;
