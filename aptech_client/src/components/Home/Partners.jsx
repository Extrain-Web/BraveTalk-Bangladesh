"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api";

// Partners band — renders only when the API returns partners (no placeholder logos).
// Scrolls as a marquee when there are enough logos, otherwise sits as a centred row.
const Partners = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API}/partners/public`);
                const data = await res.json();
                if (!cancelled && data.success) setPartners((data.data || []).filter((p) => p?.logoUrl));
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!partners.length) return null;

    const marquee = partners.length >= 5;
    const items = marquee ? [...partners, ...partners] : partners;

    const renderLogo = (p, i) => {
        const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={p.logoUrl}
                alt={p.name}
                title={p.name}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
                className="h-9 md:h-11 w-auto max-w-[150px] object-contain opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            />
        );
        const cls = "group flex h-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 md:px-8 shadow-sm transition hover:shadow-md";
        return p.websiteUrl ? (
            <a key={i} href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className={cls}>
                {img}
            </a>
        ) : (
            <div key={i} className={cls}>
                {img}
            </div>
        );
    };

    return (
        <section className="overflow-hidden bg-slate-50/60 py-12 lg:py-16 border-y border-slate-100">
            <div className="mx-auto mb-8 max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0142b2]" />
                    <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{isBn ? "আমাদের পার্টনার" : "Our partners"}</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1b4a] outfit ${bn}`}>
                    {isBn ? "যাদের সাথে আমরা কাজ করি" : "Organisations we work with"}
                </h2>
            </div>

            {marquee ? (
                <div className="marquee-wrap relative">
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 md:w-32 bg-gradient-to-r from-[#f8fafc] to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 md:w-32 bg-gradient-to-l from-[#f8fafc] to-transparent" />
                    <div className="marquee-track flex items-center gap-4 py-1">{items.map(renderLogo)}</div>
                </div>
            ) : (
                <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-center gap-4 px-4 sm:px-6">{items.map(renderLogo)}</div>
            )}

            <style jsx>{`
                .marquee-track {
                    width: max-content;
                    animation: partners-marquee 36s linear infinite;
                }
                .marquee-wrap:hover .marquee-track {
                    animation-play-state: paused;
                }
                @keyframes partners-marquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(calc(-50% - 0.5rem));
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .marquee-track {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default Partners;
