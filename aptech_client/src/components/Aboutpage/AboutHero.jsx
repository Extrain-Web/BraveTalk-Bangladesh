"use client";

import Link from "next/link";
import { LuArrowRight, LuMic, LuUsers, LuMegaphone, LuCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import PhotoBanner from "@/components/Shared/PhotoBanner";

const COPY = {
    en: {
        badge: "About BraveTalk Bangladesh",
        h1a: "Be a Speaker,",
        h1b: "Be a Leader!",
        desc: "BraveTalk Bangladesh is a learning platform that helps students speak English with confidence, stand on any stage and lead with their voice. Our mission: empowering students through public speaking, leadership & social advocacy.",
        ctaPrimary: "Explore courses",
        ctaSecondary: "Contact us",
        ticks: ["Live online classes", "Live practice with mentors", "Verifiable certificates"],
        panelHint: "Our mission",
        panelTitle: "Empowering students through",
        pillars: [
            { icon: LuMic, title: "Public speaking", text: "Speak clearly and confidently in front of anyone." },
            { icon: LuUsers, title: "Leadership", text: "Lead teams, ideas and conversations." },
            { icon: LuMegaphone, title: "Social advocacy", text: "Use your voice for causes that matter." },
        ],
    },
    bn: {
        badge: "ব্রেভটক বাংলাদেশ সম্পর্কে",
        h1a: "বক্তা হও,",
        h1b: "নেতা হও!",
        desc: "ব্রেভটক বাংলাদেশ একটি লার্নিং প্ল্যাটফর্ম, যেখানে শিক্ষার্থীরা আত্মবিশ্বাসের সাথে ইংরেজিতে কথা বলা, যেকোনো মঞ্চে দাঁড়ানো এবং নিজের কণ্ঠ দিয়ে নেতৃত্ব দেওয়া শেখে। আমাদের লক্ষ্য: পাবলিক স্পিকিং, লিডারশিপ ও সামাজিক অ্যাডভোকেসির মাধ্যমে শিক্ষার্থীদের ক্ষমতায়ন।",
        ctaPrimary: "কোর্স দেখুন",
        ctaSecondary: "যোগাযোগ করুন",
        ticks: ["অনলাইন লাইভ ক্লাস", "মেন্টরের সাথে লাইভ প্র্যাকটিস", "যাচাইযোগ্য সার্টিফিকেট"],
        panelHint: "আমাদের লক্ষ্য",
        panelTitle: "শিক্ষার্থীদের ক্ষমতায়ন যার মাধ্যমে",
        pillars: [
            { icon: LuMic, title: "পাবলিক স্পিকিং", text: "যে কারো সামনে স্পষ্ট ও আত্মবিশ্বাসী হয়ে কথা বলা।" },
            { icon: LuUsers, title: "লিডারশিপ", text: "টিম, আইডিয়া ও আলোচনায় নেতৃত্ব দেওয়া।" },
            { icon: LuMegaphone, title: "সামাজিক অ্যাডভোকেসি", text: "গুরুত্বপূর্ণ বিষয়ে নিজের কণ্ঠ ব্যবহার করা।" },
        ],
    },
};

const TINTS = ["text-[#0142b2]", "text-[#e5251f]", "text-[#027a1e]"];

const AboutHero = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    return (
        <>
            <PhotoBanner
                slot="aboutHero"
                tall
                eyebrow={c.badge}
                crumbs={[{ label: language === "bn" ? "আমাদের সম্পর্কে" : "About us" }]}
                title={
                    <>
                        {c.h1a} <span className="text-[#ff6b63]">{c.h1b}</span>
                    </>
                }
                subtitle={c.desc}
            >
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                        href="/courses"
                        className={`inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#e5251f] to-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md work ${bn}`}
                    >
                        {c.ctaPrimary} <LuArrowRight />
                    </Link>
                    <Link
                        href="/contact"
                        className={`inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 work ${bn}`}
                    >
                        {c.ctaSecondary}
                    </Link>
                </div>
                <ul className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-[13px] text-white/80 work ${bn}`}>
                    {c.ticks.map((tk) => (
                        <li key={tk} className="flex items-center gap-1.5">
                            <LuCheck className="text-[#4ade80]" /> {tk}
                        </li>
                    ))}
                </ul>
            </PhotoBanner>

            {/* Mission pillars strip */}
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                    <div className="grid divide-y divide-slate-200 md:grid-cols-[0.8fr_1fr_1fr_1fr] md:divide-x md:divide-y-0">
                        <div className="py-6 md:pr-6">
                            <p className={`text-xs font-semibold uppercase tracking-wider text-[#e5251f] work ${bn}`}>{c.panelHint}</p>
                            <h2 className={`mt-1 text-lg font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{c.panelTitle}</h2>
                        </div>
                        {c.pillars.map(({ icon: Icon, title, text }, i) => (
                            <div key={title} className="flex items-start gap-3 py-6 md:px-6">
                                <Icon className={`mt-0.5 shrink-0 text-2xl ${TINTS[i]}`} />
                                <div>
                                    <p className={`text-[15px] font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</p>
                                    <p className={`mt-0.5 text-sm text-slate-600 work ${bn}`}>{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutHero;
