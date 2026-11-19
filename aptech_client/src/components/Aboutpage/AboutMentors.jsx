"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionIntro from "./SectionIntro";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Teaser of up to 4 published mentors. Renders nothing when there are none. */
const AboutMentors = () => {
    const { language } = useLanguage();
    const bn = language === "bn" ? "hind-siliguri" : "";
    const isBn = language === "bn";
    const [mentors, setMentors] = useState([]);

    useEffect(() => {
        let cancelled = false;
        fetch(`${API_URL}/api/mentors?published=true`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (cancelled) return;
                const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
                setMentors(list.filter((m) => m && m.isPublished !== false).slice(0, 4));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    if (mentors.length === 0) return null;

    return (
        <section className="border-t border-slate-200 bg-white py-12 lg:py-16">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <SectionIntro
                        eyebrow={isBn ? "আমাদের মেন্টর" : "Our mentors"}
                        title={isBn ? "যাদের কাছে" : "Learn from people who"}
                        accent={isBn ? "শিখবেন" : "guide you"}
                        text={isBn ? "প্রতিটি ক্লাসে আপনার কথা শুনে ফিডব্যাক দেন আমাদের মেন্টররা।" : "Our mentors listen to you in every class and tell you exactly what to improve."}
                        center={false}
                        bn={bn}
                    />
                    <Link
                        href="/mentors"
                        className={`inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2] hover:text-[#0142b2] work ${bn}`}
                    >
                        {isBn ? "সব মেন্টর" : "All mentors"} <LuArrowRight />
                    </Link>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {mentors.map((m) => {
                        const tags = Array.isArray(m.specialized_area) ? m.specialized_area.slice(0, 2) : [];
                        return (
                            <Link
                                key={m._id || m.id}
                                href={`/mentors/${m._id || m.id}`}
                                className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                    {m.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={m.image} alt={m.name || "Mentor"} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-blue-50 text-4xl font-bold text-[#0142b2] outfit">
                                            {(m.name || "?").replace(/\[.*?\]\s*/, "").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-bold text-[#0b1b4a] outfit">{m.name}</h3>
                                    {m.designation && <p className="mt-0.5 text-sm text-slate-500 work line-clamp-2">{m.designation}</p>}
                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {tags.map((tg) => (
                                                <span key={tg} className="rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#0142b2]">
                                                    {tg}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default AboutMentors;
