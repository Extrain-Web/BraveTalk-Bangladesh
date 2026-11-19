"use client";

import { LuCircleCheck, LuQuote } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionIntro from "./SectionIntro";

const COPY = {
    en: {
        eyebrow: "Our story",
        title: "Why we",
        accent: "exist",
        paras: [
            "Many students learn English for years, yet freeze when it is time to speak — in class, in a viva, at an interview or on a stage. Knowing the words is not the same as having the confidence to use them.",
            "BraveTalk Bangladesh was started to close that gap. We focus on speaking, not just studying: small live sessions, real practice every class and honest feedback from mentors, so that students slowly turn hesitation into confidence.",
            "We believe every young person has something worth saying. Our goal is to help them say it clearly, lead others with it and use it to make a positive difference in their community.",
        ],
        quote: "Be a Speaker, Be a Leader!",
        quoteNote: "The idea behind everything we teach.",
        pointsTitle: "What we want for every student",
        points: [
            "Speak English without fear of mistakes",
            "Present ideas clearly in front of any audience",
            "Think on their feet in debates and discussions",
            "Lead teams and stand up for causes they believe in",
        ],
    },
    bn: {
        eyebrow: "আমাদের গল্প",
        title: "আমরা কেন",
        accent: "আছি",
        paras: [
            "অনেক শিক্ষার্থী বছরের পর বছর ইংরেজি পড়ে, কিন্তু কথা বলার সময় এলেই আটকে যায় — ক্লাসে, ভাইভায়, ইন্টারভিউতে বা মঞ্চে। শব্দ জানা আর সেগুলো আত্মবিশ্বাসের সাথে ব্যবহার করা এক জিনিস নয়।",
            "এই দূরত্ব কমাতেই ব্রেভটক বাংলাদেশের শুরু। আমরা শুধু পড়ার উপর নয়, বলার উপর জোর দিই: ছোট লাইভ সেশন, প্রতি ক্লাসে বাস্তব প্র্যাকটিস এবং মেন্টরের সৎ ফিডব্যাক — যাতে শিক্ষার্থীরা ধীরে ধীরে জড়তা কাটিয়ে আত্মবিশ্বাসী হয়।",
            "আমরা বিশ্বাস করি প্রত্যেক তরুণের বলার মতো কিছু আছে। আমাদের লক্ষ্য তাদের সেটা স্পষ্টভাবে বলতে, অন্যদের নেতৃত্ব দিতে এবং সমাজে ইতিবাচক পরিবর্তন আনতে সাহায্য করা।",
        ],
        quote: "বক্তা হও, নেতা হও!",
        quoteNote: "আমাদের প্রতিটি শিক্ষার মূল ভাবনা।",
        pointsTitle: "প্রত্যেক শিক্ষার্থীর জন্য আমাদের চাওয়া",
        points: [
            "ভুলের ভয় ছাড়াই ইংরেজিতে কথা বলা",
            "যেকোনো শ্রোতার সামনে স্পষ্টভাবে আইডিয়া উপস্থাপন",
            "বিতর্ক ও আলোচনায় তাৎক্ষণিক চিন্তা করে উত্তর দেওয়া",
            "টিমকে নেতৃত্ব দেওয়া ও বিশ্বাসের পক্ষে দাঁড়ানো",
        ],
    },
};

const Mission = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    return (
        <section className="bg-white py-14 lg:py-20">
            <div className="mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                <div>
                    <SectionIntro eyebrow={c.eyebrow} title={c.title} accent={c.accent} center={false} dot="bg-[#e5251f]" bn={bn} />
                    <div className={`mt-6 space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
                        {c.paras.map((p) => <p key={p}>{p}</p>)}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-red-50 p-6 shadow-sm">
                        <LuQuote className="absolute right-5 top-5 text-5xl text-[#0142b2]/10" />
                        <p
                            className={`text-3xl font-bold text-[#e5251f] ${bn}`}
                            style={language === "bn" ? undefined : { fontFamily: "var(--font-caveat), cursive" }}
                        >
                            {c.quote}
                        </p>
                        <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>{c.quoteNote}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className={`text-base font-bold text-[#0b1b4a] outfit ${bn}`}>{c.pointsTitle}</h3>
                        <ul className="mt-4 space-y-3">
                            {c.points.map((p) => (
                                <li key={p} className={`flex items-start gap-2.5 text-sm text-slate-600 work ${bn}`}>
                                    <LuCircleCheck className="mt-0.5 shrink-0 text-base text-[#027a1e]" />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Mission;
