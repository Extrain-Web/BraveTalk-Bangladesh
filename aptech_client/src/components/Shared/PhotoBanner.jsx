"use client";

import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImage } from "@/lib/siteImages";

/**
 * Classic photo page banner: admin-uploadable photo (site image slot) + navy overlay,
 * breadcrumb, white title and short subtitle.
 *   <PhotoBanner slot="contactBanner" title="Contact us" subtitle="…" crumbs={[{ label: "Contact" }]} />
 * crumbs: [{ label, href? }] — "Home" is added automatically.
 */
export default function PhotoBanner({ slot = "pageBanner", title, subtitle, crumbs = [], eyebrow, children, tall = false }) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const photo = useSiteImage(slot);

    return (
        <section className={`relative overflow-hidden bg-[#0b1b4a] ${tall ? "min-h-[300px] lg:min-h-[360px]" : "min-h-[220px] lg:min-h-[280px]"} flex items-center`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#0b1b4a]/70" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#e5251f] to-[#0142b2]" />

            <div className="relative z-10 mx-auto w-full max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 lg:py-14">
                <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-xs sm:text-[13px] text-white/70 work ${bn}`}>
                    <Link href="/" className="hover:text-white">{isBn ? "হোম" : "Home"}</Link>
                    {crumbs.map((c, i) => (
                        <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                            <LuChevronRight className="text-white/50" />
                            {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-white">{c.label}</span>}
                        </span>
                    ))}
                </nav>
                {eyebrow && (
                    <span className={`mt-4 inline-block rounded-sm bg-[#e5251f] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white work ${bn}`}>
                        {eyebrow}
                    </span>
                )}
                <h1 className={`mt-3 text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-white outfit ${bn}`}>{title}</h1>
                {subtitle && <p className={`mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80 work ${bn}`}>{subtitle}</p>}
                {children}
            </div>
        </section>
    );
}
