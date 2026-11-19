"use client";

import Link from "next/link";
import { LuArrowRight, LuBookOpen } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImage } from "@/lib/siteImages";

// The one dark section on the home page: photo band with a navy overlay.
const HomeCTA = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const ctaImage = useSiteImage("ctaImage");

    return (
        <section className="relative overflow-hidden bg-[#0b1b4a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ctaImage} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#0b1b4a]/80" />
            <div className="absolute inset-x-0 bottom-0 flex h-1">
                <span className="flex-1 bg-[#0142b2]" />
                <span className="flex-1 bg-[#e5251f]" />
                <span className="flex-1 bg-[#027a1e]" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-14 lg:py-20">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <p className={`mb-3 border-l-4 border-[#e5251f] pl-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 work ${bn}`}>
                            {isBn ? "ব্রেভটক বাংলাদেশ" : "BraveTalk Bangladesh"}
                        </p>
                        <h2 className={`text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-white outfit ${bn}`}>
                            {isBn ? "বক্তা হও, নেতা হও!" : "Be a Speaker, Be a Leader!"}
                        </h2>
                        <p className={`mt-4 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/75 work ${bn}`}>
                            {isBn
                                ? "আজই আপনার কোর্স বেছে নিন — অথবা আমাদের বই ও ভিডিও লেসন দিয়ে নিজে নিজে শুরু করুন।"
                                : "Pick your course today — or start on your own with our books and video lessons."}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                        <Link
                            href="/courses"
                            className={`inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:gap-3 hover:bg-blue-50 work ${bn}`}
                        >
                            {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
                        </Link>
                        <Link
                            href="/books"
                            className={`inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 work ${bn}`}
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
