"use client";

import { useSiteImage } from "@/lib/siteImages";

/**
 * Photo side panel for the login / register cards: admin-uploadable photo
 * (site image slot) with a navy overlay, logo, heading, feature list and tagline.
 */
export default function AuthPhotoPanel({ slot = "aboutClass", title, subtitle, features = [], tagline, taglineNote, bn = "" }) {
    const photo = useSiteImage(slot);

    return (
        <div className="relative overflow-hidden bg-[#0b1b4a] text-white lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1b4a]/80 via-[#0b1b4a]/75 to-[#0b1b4a]/95" />

            <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="BraveTalk Bangladesh" className="mb-6 h-12 w-auto self-start rounded-sm bg-white/95 p-1.5" />
                <h2 className={`text-2xl lg:text-3xl font-bold outfit ${bn}`}>{title}</h2>
                {subtitle && <p className={`mt-2 text-sm leading-relaxed text-white/75 work ${bn}`}>{subtitle}</p>}

                {features.length > 0 && (
                    <ul className="mt-8 hidden space-y-3 lg:block">
                        {features.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
                                    <Icon size={16} className="text-white" />
                                </span>
                                <span className={`text-sm font-medium text-white/90 work ${bn}`}>{text}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {tagline && (
                    <div className="mt-auto pt-6 lg:pt-10">
                        <div className="border-l-4 border-[#e5251f] pl-3">
                            <p className={`text-lg font-bold text-white outfit ${bn}`}>{tagline}</p>
                            {taglineNote && <p className={`mt-1 text-xs text-white/70 work ${bn}`}>{taglineNote}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
