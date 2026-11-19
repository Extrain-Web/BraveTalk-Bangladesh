"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuMonitorPlay, LuBuilding2, LuCirclePlay, LuMic, LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImages } from "@/lib/siteImages";
import SectionHeader from "./SectionHeader";

// Learning formats → course list filtered by type / category
const MODES = [
    {
        key: "online",
        slot: "homeOnline",
        Icon: LuMonitorPlay,
        tile: "bg-blue-50 text-[#0142b2]",
        bar: "bg-[#0142b2]",
        href: "/courses?type=Online",
        en: { title: "Online live classes", desc: "Join live classes with your mentor from anywhere — on phone or laptop." },
        bn: { title: "অনলাইন লাইভ ক্লাস", desc: "যেকোনো জায়গা থেকে ফোন বা ল্যাপটপে মেন্টরের সাথে লাইভ ক্লাস করুন।" },
    },
    {
        key: "offline",
        slot: "homeInPerson",
        Icon: LuBuilding2,
        tile: "bg-emerald-50 text-[#027a1e]",
        bar: "bg-[#027a1e]",
        href: "/courses?type=Offline",
        en: { title: "In-person at South Badda", desc: "Face-to-face classes and speaking practice at our Dhaka office." },
        bn: { title: "দক্ষিণ বাড্ডায় সরাসরি ক্লাস", desc: "আমাদের ঢাকা অফিসে সামনাসামনি ক্লাস ও স্পিকিং প্র্যাকটিস।" },
    },
    {
        key: "recorded",
        slot: "homeRecorded",
        Icon: LuCirclePlay,
        tile: "bg-red-50 text-[#e5251f]",
        bar: "bg-[#e5251f]",
        href: "/courses?type=Recorded",
        en: { title: "Recorded courses", desc: "Buy once and learn at your own pace — rewatch any lesson anytime." },
        bn: { title: "রেকর্ডেড কোর্স", desc: "একবার কিনুন, নিজের সময়মতো শিখুন — যেকোনো লেসন বারবার দেখুন।" },
    },
    {
        key: "speaking",
        slot: "homeSpeaking",
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
    const img = useSiteImages();

    return (
        <section className="relative bg-white py-12 lg:py-16">
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
                                    className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img[m.slot]}
                                            alt={c.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                        />
                                        <span className={`absolute inset-x-0 bottom-0 h-[3px] ${m.bar}`} />
                                        <span className={`absolute left-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-md shadow-sm ${m.tile}`}>
                                            <m.Icon className="text-lg" />
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-4 lg:p-5">
                                        <h3 className={`text-base lg:text-[17px] font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{c.title}</h3>
                                        <p className={`mt-1.5 flex-1 text-sm leading-relaxed text-slate-600 work ${bn}`}>{c.desc}</p>
                                        <span className={`mt-4 inline-flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm font-semibold text-[#0142b2] transition-all group-hover:gap-2.5 work ${bn}`}>
                                            {isBn ? "কোর্স দেখুন" : "See courses"} <LuArrowRight />
                                        </span>
                                    </div>
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
