"use client";

import Link from "next/link";
import { LuUserPlus, LuCalendarDays, LuMic, LuQrCode, LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionIntro from "./SectionIntro";
import { useSiteImage } from "@/lib/siteImages";

const STEP_STYLES = [
    { tile: "bg-blue-50 text-[#0142b2]", num: "text-[#0142b2]" },
    { tile: "bg-red-50 text-[#e5251f]", num: "text-[#e5251f]" },
    { tile: "bg-emerald-50 text-[#027a1e]", num: "text-[#027a1e]" },
    { tile: "bg-blue-50 text-[#0142b2]", num: "text-[#0142b2]" },
];

const COPY = {
    en: {
        eyebrow: "How learning works",
        title: "From your first class to your",
        accent: "certificate",
        text: "A simple, clear path — you always know what comes next.",
        steps: [
            { icon: LuUserPlus, title: "Enroll", text: "Pick a course, create your account and complete a one-time payment (or join free courses instantly)." },
            { icon: LuCalendarDays, title: "Join your batch", text: "We place you in a batch. Class days and times appear in your student dashboard." },
            { icon: LuMic, title: "Practise live", text: "Speak in every class and get direct feedback from your mentor on what to improve." },
            { icon: LuQrCode, title: "Get certified", text: "Complete the course and receive a certificate with a unique ID and QR code anyone can verify." },
        ],
        verify: "Verify a certificate",
    },
    bn: {
        eyebrow: "যেভাবে শেখা হয়",
        title: "প্রথম ক্লাস থেকে",
        accent: "সার্টিফিকেট পর্যন্ত",
        text: "একটি সহজ ও স্পষ্ট পথ — পরের ধাপ কী, তা সবসময় জানবেন।",
        steps: [
            { icon: LuUserPlus, title: "ভর্তি হোন", text: "কোর্স বেছে নিন, অ্যাকাউন্ট খুলুন এবং একবারে পেমেন্ট করুন (ফ্রি কোর্সে সাথে সাথে যুক্ত হোন)।" },
            { icon: LuCalendarDays, title: "ব্যাচে যুক্ত হোন", text: "আমরা আপনাকে একটি ব্যাচে দেব। ক্লাসের দিন ও সময় আপনার ড্যাশবোর্ডে দেখা যাবে।" },
            { icon: LuMic, title: "লাইভ প্র্যাকটিস", text: "প্রতি ক্লাসে কথা বলুন এবং কোথায় উন্নতি দরকার তা নিয়ে মেন্টরের সরাসরি ফিডব্যাক পান।" },
            { icon: LuQrCode, title: "সার্টিফিকেট নিন", text: "কোর্স শেষ করে ইউনিক আইডি ও QR কোডসহ সার্টিফিকেট পান, যা যে কেউ যাচাই করতে পারে।" },
        ],
        verify: "সার্টিফিকেট যাচাই করুন",
    },
};

const AboutJourney = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";
    const classPhoto = useSiteImage("aboutClass");

    return (
        <section className="bg-white py-12 lg:py-16">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionIntro eyebrow={c.eyebrow} title={c.title} accent={c.accent} text={c.text} bn={bn} />

                <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative min-h-[260px] overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={classPhoto} alt={c.eyebrow} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    </div>

                    <ol className="grid gap-4 sm:grid-cols-2">
                        {c.steps.map(({ icon: Icon, title, text }, i) => (
                            <li key={title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <span className={`flex h-11 w-11 items-center justify-center rounded-md ${STEP_STYLES[i].tile}`}>
                                        <Icon className="text-xl" />
                                    </span>
                                    <span className={`text-2xl font-bold opacity-30 outfit ${STEP_STYLES[i].num}`}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <h3 className={`mt-3 text-base font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                                <p className={`mt-1 text-sm leading-relaxed text-slate-600 work ${bn}`}>{text}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/verify-certificate"
                        className={`inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2] hover:text-[#0142b2] work ${bn}`}
                    >
                        {c.verify} <LuArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AboutJourney;
