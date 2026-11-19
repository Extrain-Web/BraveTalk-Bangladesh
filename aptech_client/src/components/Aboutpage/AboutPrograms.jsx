"use client";

import Link from "next/link";
import {
    LuLanguages,
    LuMic,
    LuUsers,
    LuMessagesSquare,
    LuHandshake,
    LuMonitor,
    LuMapPin,
    LuBookOpen,
    LuArrowRight,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import SectionIntro from "./SectionIntro";

const TINTS = [
    "bg-blue-50 text-[#0142b2]",
    "bg-red-50 text-[#e5251f]",
    "bg-emerald-50 text-[#027a1e]",
];

const COPY = {
    en: {
        eyebrow: "What we teach",
        title: "Skills that build",
        accent: "confident voices",
        text: "Every course is built around speaking and practice — so you leave each class having actually used what you learned.",
        programs: [
            { icon: LuLanguages, title: "Spoken English", text: "Everyday conversation, grammar that sticks, pronunciation and vocabulary you will really use." },
            { icon: LuMic, title: "Public Speaking", text: "Speeches, presentations and stage confidence — from the first nervous minute to a strong finish." },
            { icon: LuUsers, title: "Leadership", text: "Lead a team, run a meeting and inspire people with clear, honest communication." },
            { icon: LuMessagesSquare, title: "Debate", text: "Build arguments, respond under pressure and listen well in structured debates." },
            { icon: LuHandshake, title: "Communication skills", text: "Interviews, vivas, group discussions and everyday professional conversation." },
        ],
        formatsTitle: "Learn the way that suits you",
        formats: [
            { icon: LuMonitor, title: "Online classes", text: "Join live sessions from anywhere in Bangladesh." },
            { icon: LuMapPin, title: "In-person classes", text: "Practise face to face at our office in South Badda, Dhaka." },
            { icon: LuBookOpen, title: "Books & video lessons", text: "Study at your own pace with our books and their video lessons.", href: "/books", cta: "Browse books" },
        ],
        coursesCta: "See all courses",
    },
    bn: {
        eyebrow: "আমরা যা শেখাই",
        title: "দক্ষতা যা গড়ে তোলে",
        accent: "আত্মবিশ্বাসী কণ্ঠ",
        text: "প্রতিটি কোর্স কথা বলা ও প্র্যাকটিসকে কেন্দ্র করে তৈরি — তাই প্রতিটি ক্লাস শেষে আপনি যা শিখেছেন তা নিজে ব্যবহার করে যাবেন।",
        programs: [
            { icon: LuLanguages, title: "স্পোকেন ইংলিশ", text: "দৈনন্দিন কথোপকথন, মনে রাখার মতো গ্রামার, উচ্চারণ ও কাজের শব্দভান্ডার।" },
            { icon: LuMic, title: "পাবলিক স্পিকিং", text: "বক্তৃতা, প্রেজেন্টেশন ও মঞ্চের আত্মবিশ্বাস — প্রথম নার্ভাস মুহূর্ত থেকে শক্ত সমাপ্তি পর্যন্ত।" },
            { icon: LuUsers, title: "লিডারশিপ", text: "টিম পরিচালনা, মিটিং চালানো এবং স্পষ্ট ও সৎ যোগাযোগে মানুষকে অনুপ্রাণিত করা।" },
            { icon: LuMessagesSquare, title: "বিতর্ক", text: "যুক্তি তৈরি, চাপের মধ্যে উত্তর দেওয়া এবং মনোযোগ দিয়ে শোনা।" },
            { icon: LuHandshake, title: "কমিউনিকেশন স্কিল", text: "ইন্টারভিউ, ভাইভা, গ্রুপ ডিসকাশন ও দৈনন্দিন প্রফেশনাল কথোপকথন।" },
        ],
        formatsTitle: "আপনার সুবিধামতো শিখুন",
        formats: [
            { icon: LuMonitor, title: "অনলাইন ক্লাস", text: "বাংলাদেশের যেকোনো জায়গা থেকে লাইভ সেশনে যুক্ত হোন।" },
            { icon: LuMapPin, title: "সরাসরি ক্লাস", text: "দক্ষিণ বাড্ডা, ঢাকায় আমাদের অফিসে সামনাসামনি প্র্যাকটিস করুন।" },
            { icon: LuBookOpen, title: "বই ও ভিডিও লেসন", text: "আমাদের বই ও সাথের ভিডিও লেসনে নিজের গতিতে শিখুন।", href: "/books", cta: "বই দেখুন" },
        ],
        coursesCta: "সব কোর্স দেখুন",
    },
};

const AboutPrograms = () => {
    const { language } = useLanguage();
    const c = COPY[language === "bn" ? "bn" : "en"];
    const bn = language === "bn" ? "hind-siliguri" : "";

    return (
        <section className="bg-slate-50/60 py-14 lg:py-20">
            <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <SectionIntro eyebrow={c.eyebrow} title={c.title} accent={c.accent} text={c.text} bn={bn} />

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
                    {c.programs.map(({ icon: Icon, title, text }, i) => (
                        <div
                            key={title}
                            className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:col-span-2 ${
                                i === 3 ? "lg:col-start-2" : ""
                            }`}
                        >
                            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TINTS[i % 3]}`}>
                                <Icon className="text-2xl" />
                            </span>
                            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                            <p className={`mt-1.5 text-sm leading-relaxed text-slate-500 work ${bn}`}>{text}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h3 className={`text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{c.formatsTitle}</h3>
                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                        {c.formats.map(({ icon: Icon, title, text, href, cta }, i) => (
                            <div key={title} className="flex items-start gap-3.5">
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TINTS[i % 3]}`}>
                                    <Icon className="text-xl" />
                                </span>
                                <div>
                                    <p className={`font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</p>
                                    <p className={`mt-0.5 text-sm text-slate-500 work ${bn}`}>{text}</p>
                                    {href && (
                                        <Link href={href} className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0142b2] hover:gap-2 transition-all work ${bn}`}>
                                            {cta} <LuArrowRight />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <Link
                            href="/courses"
                            className={`inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#01368f] hover:gap-3 work ${bn}`}
                        >
                            {c.coursesCta} <LuArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutPrograms;
