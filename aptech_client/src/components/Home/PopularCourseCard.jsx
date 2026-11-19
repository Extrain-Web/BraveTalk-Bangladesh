"use client";

import Link from "next/link";
import { LuCirclePlay, LuUsers, LuMonitorPlay, LuBuilding2 } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { getCoursePricing } from "@/lib/coursePrice";

const TYPE_LABEL = {
    Online: { en: "Online", bn: "অনলাইন", Icon: LuMonitorPlay },
    Offline: { en: "In-person", bn: "সরাসরি", Icon: LuBuilding2 },
    Recorded: { en: "Recorded", bn: "রেকর্ডেড", Icon: LuCirclePlay },
};

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-IN")}`;

/** Course card for the home page — same visual language as BookCard. */
export default function PopularCourseCard({ course, categoryName }) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";
    const courseId = course.id || course._id;
    const pricing = getCoursePricing(course);
    const type = TYPE_LABEL[course.type];
    const TypeIcon = type?.Icon;
    const summary = course.courseOverview || course.details || "";
    const students = Number(course.totalStudentsEnroll) || 0;
    const lectures = Number(course.lectures) || 0;

    return (
        <Link
            href={`/courses/${courseId}`}
            className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0142b2]/30 hover:shadow-md"
        >
            {/* Cover */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                {course.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={course.image}
                        alt={course.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                )}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                    {pricing.isFree && (
                        <span className="rounded-sm bg-[#027a1e] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                            {isBn ? "ফ্রি" : "Free"}
                        </span>
                    )}
                    {type && (
                        <span className={`inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0b1b4a] shadow-sm work ${bn}`}>
                            <TypeIcon className="text-[#0142b2]" /> {isBn ? type.bn : type.en}
                        </span>
                    )}
                </div>
                {pricing.hasDiscount && (
                    <span className="absolute right-3 top-3 rounded-sm bg-[#e5251f] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        -{pricing.percentOff}%
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4">
                {categoryName && (
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f] work">{categoryName}</p>
                )}
                <h3 className={`mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[#0b1b4a] transition-colors group-hover:text-[#0142b2] outfit ${bn}`}>
                    {course.title}
                </h3>
                {summary && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 work">{summary}</p>}

                <div className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 work ${bn}`}>
                    {lectures > 0 && (
                        <span className="flex items-center gap-1">
                            <LuCirclePlay className="text-[#0142b2]" /> {lectures} {isBn ? "লেসন" : "lessons"}
                        </span>
                    )}
                    {students > 0 && (
                        <span className="flex items-center gap-1">
                            <LuUsers className="text-[#0142b2]" /> {students} {isBn ? "শিক্ষার্থী" : students === 1 ? "student" : "students"}
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                    <div>
                        <span className={`text-lg font-bold outfit ${pricing.isFree ? "text-[#027a1e]" : "text-[#0b1b4a]"}`}>
                            {pricing.isFree ? (isBn ? "ফ্রি" : "Free") : taka(pricing.price)}
                        </span>
                        {pricing.hasDiscount && <span className="ml-2 text-xs text-slate-400 line-through">{taka(pricing.fee)}</span>}
                    </div>
                    <span className={`text-xs font-semibold text-[#0142b2] work ${bn}`}>
                        {pricing.isFree ? (isBn ? "শুরু করুন →" : "Start free →") : isBn ? "বিস্তারিত →" : "View course →"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
