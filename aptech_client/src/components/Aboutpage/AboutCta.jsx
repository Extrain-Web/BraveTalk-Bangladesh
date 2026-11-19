"use client";

import Link from "next/link";
import { LuArrowRight, LuPhone } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useSiteImage } from "@/lib/siteImages";

const AboutCta = () => {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const phone = settings?.phoneNumber || "01323878569";
    const ctaPhoto = useSiteImage("ctaImage");

    return (
        <section className="relative overflow-hidden bg-[#0b1b4a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ctaPhoto} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#0b1b4a]/80" />
            <div className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <div className="px-2 py-14 text-center lg:py-20">
                    <div className="relative">
                        <h2 className={`text-3xl sm:text-4xl font-bold leading-tight text-white outfit ${bn}`}>
                            {isBn ? "আপনার কণ্ঠ খুঁজে পাওয়ার সময় এখনই" : "Ready to find your voice?"}
                        </h2>
                        <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/80 work ${bn}`}>
                            {isBn
                                ? "একটি কোর্স বেছে নিন অথবা আমাদের সাথে কথা বলুন — কোন কোর্স আপনার জন্য ঠিক, তা বুঝতে আমরা সাহায্য করব।"
                                : "Pick a course or talk to us — we will help you choose the one that fits you best."}
                        </p>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/courses"
                                className={`inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#e5251f] to-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md work ${bn}`}
                            >
                                {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
                            </Link>
                            <a
                                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                                className={`inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 work ${bn}`}
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
