"use client";

import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { LuClock, LuUsers, LuCirclePlay, LuWifi, LuMapPin, LuStar, LuArrowRight, LuGift } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { getCoursePricing } from "@/lib/coursePrice";

export const COURSE_TYPE_META = {
  Online: { en: "Online", bn: "অনলাইন", Icon: LuWifi, cls: "bg-blue-50 text-[#0142b2] border-blue-100" },
  Offline: { en: "Offline", bn: "অফলাইন", Icon: LuMapPin, cls: "bg-red-50 text-[#e5251f] border-red-100" },
  Recorded: { en: "Recorded", bn: "রেকর্ডেড", Icon: LuCirclePlay, cls: "bg-emerald-50 text-[#027a1e] border-emerald-100" },
};

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;

// isGridView is accepted for backwards compatibility; the card always renders as a grid card.
const CourseCard = ({ course }) => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const courseId = course.id || course._id;
  const { items: categories = [] } = useSelector((state) => state.categories || {});
  const { mentors = [] } = useSelector((state) => state.mentors || {});
  const pricing = getCoursePricing(course);
  const { isFree, fee, hasDiscount, percentOff, price } = pricing;
  // Free courses enroll with one click on the details page (no checkout)
  const enrollHref = isFree ? `/courses/${courseId}` : `/checkout/${courseId}`;
  const detailHref = `/courses/${courseId}`;

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "";
    if (typeof categoryId === "object") return categoryId.name || "";
    if (typeof categoryId === "string" && categoryId.length < 20) return categoryId;
    const category = categories.find((cat) => cat._id === categoryId || cat.id === categoryId);
    return category?.name || "";
  };

  const mentorObj =
    course.mentor && typeof course.mentor === "object"
      ? course.mentor
      : mentors.find((m) => m._id === course.mentor || m.id === course.mentor);
  const mentorName = mentorObj?.name || course.instructorName || "";

  const typeMeta = COURSE_TYPE_META[course.type];
  const categoryName = getCategoryName(course.category);
  const shortDesc = course.shortDescription || course.courseOverview || course.summary || "";
  const students = Number(course.totalStudentsEnroll || 0);
  const lectures = Number(course.lectures || 0);
  const duration =
    course.type !== "Recorded" && course.durationMonth
      ? isBn ? `${course.durationMonth} মাস` : `${course.durationMonth} ${Number(course.durationMonth) === 1 ? "month" : "months"}`
      : null;

  return (
    <div className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl work ${bn}`}>
      {/* Thumbnail */}
      <Link href={detailHref} className="relative block aspect-video overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        {course.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {typeMeta && (
            <span className={`inline-flex items-center gap-1 rounded-full border bg-white/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${typeMeta.cls}`}>
              <typeMeta.Icon className="text-xs" /> {isBn ? typeMeta.bn : typeMeta.en}
            </span>
          )}
        </div>
        {isFree ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#027a1e] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            {isBn ? "ফ্রি" : "Free"}
          </span>
        ) : hasDiscount ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#e5251f] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            -{percentOff}%
          </span>
        ) : null}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {categoryName && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f]">{categoryName}</p>
        )}
        <Link href={detailHref}>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">
            {course.title}
          </h3>
        </Link>
        {shortDesc && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{shortDesc}</p>}

        {mentorName && (
          <div className="mt-3 flex items-center gap-2">
            {mentorObj?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentorObj.image} alt={mentorName} className="h-6 w-6 rounded-full border border-slate-200 object-cover" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-[#0142b2]">
                {mentorName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate text-xs font-medium text-slate-600">{mentorName}</span>
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
          {lectures > 0 && (
            <span className="flex items-center gap-1"><LuCirclePlay className="text-[#0142b2]" /> {lectures} {isBn ? "লেকচার" : "lectures"}</span>
          )}
          {duration && (
            <span className="flex items-center gap-1"><LuClock className="text-[#0142b2]" /> {duration}</span>
          )}
          {students > 0 && (
            <span className="flex items-center gap-1"><LuUsers className="text-[#0142b2]" /> {students.toLocaleString("en-US")} {isBn ? "শিক্ষার্থী" : students === 1 ? "student" : "students"}</span>
          )}
          {Number(course.totalRating) > 0 && Number(course.rating) > 0 && (
            <span className="flex items-center gap-1"><LuStar className="fill-amber-400 text-amber-400" /> {Number(course.rating).toFixed(1)}</span>
          )}
        </div>

        {/* Price + actions */}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-4">
            <div>
              {isFree ? (
                <span className="text-xl font-extrabold text-[#027a1e] outfit">{isBn ? "ফ্রি" : "Free"}</span>
              ) : (
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-extrabold text-[#0b1b4a] outfit">{taka(price)}</span>
                  {hasDiscount && <span className="pb-0.5 text-xs text-slate-400 line-through">{taka(fee)}</span>}
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                {isFree ? (isBn ? "কোনো পেমেন্ট লাগবে না" : "No payment needed") : (isBn ? "একবার পেমেন্ট" : "One-time payment")}
              </p>
            </div>
            <Link
              href={enrollHref}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md transition ${
                isFree ? "bg-[#027a1e] shadow-emerald-900/20 hover:bg-[#026318]" : "bg-[#0142b2] shadow-blue-900/20 hover:bg-[#01368f]"
              }`}
            >
              {isFree ? <LuGift /> : null}
              {isFree ? (isBn ? "ফ্রি এনরোল" : "Enroll free") : (isBn ? "এনরোল করুন" : "Enroll")}
              {!isFree && <LuArrowRight />}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
