"use client";

import Link from "next/link";
import { LuArrowRight, LuPhone } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const AboutCta = () => {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const phone = settings?.phoneNumber || "01323878569";

    return (
        <section className="bg-white pb-14 lg:pb-20">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-[#0b1b4a] px-6 py-12 text-center sm:px-10 lg:py-16">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-20 -top-24 h-[320px] w-[320px] rounded-full bg-[#0142b2]/50 blur-[110px]" />
                        <div className="absolute -right-16 top-0 h-[280px] w-[280px] rounded-full bg-[#e5251f]/30 blur-[110px]" />
                        <div className="absolute -bottom-28 left-1/3 h-[280px] w-[280px] rounded-full bg-[#027a1e]/30 blur-[110px]" />
                    </div>
                    <div className="relative">
                        <h2 className={`text-3xl sm:text-4xl font-extrabold leading-tight text-white outfit ${bn}`}>
                            {isBn ? "আপনার কণ্ঠ খুঁজে পাওয়ার সময় এখনই" : "Ready to find your voice?"}
                        </h2>
                        <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/70 work ${bn}`}>
                            {isBn
                                ? "একটি কোর্স বেছে নিন অথবা আমাদের সাথে কথা বলুন — কোন কোর্স আপনার জন্য ঠিক, তা বুঝতে আমরা সাহায্য করব।"
                                : "Pick a course or talk to us — we will help you choose the one that fits you best."}
                        </p>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/courses"
                                className={`inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] shadow-lg transition hover:gap-3 work ${bn}`}
                            >
                                {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
                            </Link>
                            <a
                                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                                className={`inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 work ${bn}`}
                            >
                                <LuPhone /> {phone}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutCta;
