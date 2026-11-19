"use client";

import Link from "next/link";
import { LuArrowRight, LuBookOpen } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

// The one dark section on the home page: navy brand CTA band.
const HomeCTA = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    return (
        <section className="bg-white px-4 sm:px-6 py-10 lg:py-14">
            <div className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] overflow-hidden rounded-3xl bg-[#0b1b4a] px-6 py-12 text-center sm:px-10 lg:py-16">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-24 h-[320px] w-[320px] rounded-full bg-[#0142b2]/60 blur-[110px]" />
                    <div className="absolute -right-16 top-0 h-[260px] w-[260px] rounded-full bg-[#e5251f]/35 blur-[110px]" />
                    <div className="absolute -bottom-28 left-1/3 h-[280px] w-[280px] rounded-full bg-[#027a1e]/35 blur-[110px]" />
                    <div className="absolute inset-x-0 bottom-0 flex h-1">
                        <span className="flex-1 bg-[#0142b2]" />
                        <span className="flex-1 bg-[#e5251f]" />
                        <span className="flex-1 bg-[#027a1e]" />
                    </div>
                </div>

                <div className="relative z-10 mx-auto max-w-2xl">
                    <p className={`mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 work ${bn}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e5251f]" />
                        {isBn ? "ব্রেভটক বাংলাদেশ" : "BraveTalk Bangladesh"}
                    </p>
                    <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white outfit ${bn}`}>
                        {isBn ? "বক্তা হও, নেতা হও!" : "Be a Speaker, Be a Leader!"}
                    </h2>
                    <p className={`mx-auto mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/70 work ${bn}`}>
                        {isBn
                            ? "আজই আপনার কোর্স বেছে নিন — অথবা আমাদের বই ও ভিডিও লেসন দিয়ে নিজে নিজে শুরু করুন।"
                            : "Pick your course today — or start on your own with our books and video lessons."}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/courses"
                            className={`inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-lg transition hover:gap-3 hover:bg-blue-50 work ${bn}`}
                        >
                            {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
                        </Link>
                        <Link
                            href="/books"
                            className={`inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 work ${bn}`}
                        >
                            <LuBookOpen /> {isBn ? "বই দেখুন" : "Browse books"}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeCTA;
