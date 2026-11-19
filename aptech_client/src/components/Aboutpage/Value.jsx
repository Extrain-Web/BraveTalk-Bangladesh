"use client";

import { LuShieldCheck, LuRepeat, LuHeart, LuLightbulb, LuMegaphone } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionIntro from "./SectionIntro";

const TINTS = [
    "bg-blue-50 text-[#0142b2]",
    "bg-red-50 text-[#e5251f]",
    "bg-emerald-50 text-[#027a1e]",
];

const COPY = {
    en: {
        eyebrow: "Our values",
        title: "What we",
        accent: "stand for",
        values: [
            { icon: LuShieldCheck, title: "Courage", text: "Mistakes are part of learning. We create a safe space to speak up." },
            { icon: LuRepeat, title: "Practice", text: "Confidence comes from doing. Every class is built around speaking." },
            { icon: LuHeart, title: "Respect", text: "We listen to every student and give honest, kind feedback." },
            { icon: LuLightbulb, title: "Clarity", text: "Simple explanations in Bangla and English — no confusion." },
            { icon: LuMegaphone, title: "Responsibility", text: "A strong voice should be used for the good of others." },
        ],
    },
    bn: {
        eyebrow: "আমাদের মূল্যবোধ",
        title: "আমরা যা",
        accent: "বিশ্বাস করি",
        values: [
            { icon: LuShieldCheck, title: "সাহস", text: "ভুল শেখারই অংশ। আমরা নির্ভয়ে কথা বলার পরিবেশ তৈরি করি।" },
            { icon: LuRepeat, title: "প্র্যাকটিস", text: "আত্মবিশ্বাস আসে করে দেখা থেকে। প্রতিটি ক্লাস কথা বলাকে ঘিরে।" },
            { icon: LuHeart, title: "সম্মান", text: "আমরা প্রত্যেক শিক্ষার্থীর কথা শুনি এবং সৎ ও সহানুভূতিশীল ফিডব্যাক দিই।" },
            { icon: LuLightbulb, title: "স্পষ্টতা", text: "বাংলা ও ইংরেজিতে সহজ ব্যাখ্যা — কোনো জটিলতা নেই।" },
            { icon: LuMegaphone, title: "দায়িত্ব", text: "শক্তিশালী কণ্ঠ অন্যের কল্যাণে ব্যবহার করা উচিত।" },
        ],
    },
};

const Value = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    return (
        <section className="bg-slate-50/60 py-14 lg:py-20">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionIntro eyebrow={c.eyebrow} title={c.title} accent={c.accent} dot="bg-[#e5251f]" bn={bn} />
                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {c.values.map(({ icon: Icon, title, text }, i) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${TINTS[i % 3]}`}>
                                <Icon className="text-2xl" />
                            </span>
                            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                            <p className={`mt-1.5 text-sm leading-relaxed text-slate-500 work ${bn}`}>{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Value;
