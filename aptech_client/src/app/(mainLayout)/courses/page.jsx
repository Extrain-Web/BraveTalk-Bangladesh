"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchCoursesData } from "@/redux/CourseSlice";
import { fetchCategories } from "@/redux/categorySlice";
import { fetchMentorsData } from "@/redux/mentorSlice";
import LeftCategory from "@/components/coursepage/LeftCategory";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LuSearch, LuX, LuSlidersHorizontal, LuWifi, LuMapPin, LuCirclePlay, LuHouse, LuChevronRight } from "react-icons/lu";
import { useSiteImage } from "@/lib/siteImages";
import { useLanguage } from "@/context/LanguageContext";

const RightCoursesDetalis = dynamic(
  () => import("@/components/coursepage/RightCoursesDetalis"),
  { ssr: false }
);

const VALID_TYPES = ["Online", "Offline", "Recorded"];

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0142b2] border-t-transparent" />
  </div>
);

const CourseContent = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");
  const [searchQuery, setSearchQuery] = useState("");
  const typeFromUrl = urlType && VALID_TYPES.includes(urlType) ? urlType : "All";
  const [selectedType, setSelectedType] = useState(typeFromUrl);
  // ?type=Online|Offline|Recorded preselects the type filter (re-sync when the URL changes)
  const [prevTypeFromUrl, setPrevTypeFromUrl] = useState(typeFromUrl);
  if (prevTypeFromUrl !== typeFromUrl) {
    setPrevTypeFromUrl(typeFromUrl);
    setSelectedType(typeFromUrl);
  }
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const bannerImg = useSiteImage("coursesBanner");

  useEffect(() => {
    dispatch(fetchCoursesData());
    dispatch(fetchCategories());
    dispatch(fetchMentorsData());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Photo banner ---------- */}
      <section className="relative overflow-hidden bg-[#0b1b4a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerImg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0b1b4a]/75" />
        <div className="relative z-10 mx-auto flex min-h-[240px] max-w-[1140px] 2xl:max-w-[1280px] flex-col justify-center px-4 sm:px-6 py-10 sm:min-h-[300px]">
          <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-white/70 work ${bn}`}>
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white"><LuHouse /> {isBn ? "হোম" : "Home"}</Link>
            <LuChevronRight className="text-white/40" />
            <span className="font-medium text-white">{isBn ? "কোর্স" : "Courses"}</span>
          </nav>
          <h1 className={`mt-3 text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-white outfit ${bn}`}>
            {isBn ? "আমাদের কোর্সসমূহ" : "Explore our courses"}
          </h1>
          <p className={`mt-3 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-white/80 work ${bn}`}>
            {isBn
              ? "আত্মবিশ্বাসের সাথে কথা বলা, মঞ্চে বক্তৃতা আর নেতৃত্বের দক্ষতা — লাইভ ক্লাস, অফলাইন ব্যাচ অথবা রেকর্ডেড কোর্সে নিজের গতিতে শিখুন।"
              : "Speak with confidence, own the stage and lead — learn in live online classes, in-person batches or self-paced recorded courses."}
          </p>

          <div className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/80 work ${bn}`}>
            <span className="flex items-center gap-1.5"><LuWifi /> {isBn ? "অনলাইন লাইভ" : "Live online"}</span>
            <span className="flex items-center gap-1.5"><LuMapPin /> {isBn ? "অফলাইন ক্লাস" : "In-person classes"}</span>
            <span className="flex items-center gap-1.5"><LuCirclePlay /> {isBn ? "রেকর্ডেড কোর্স" : "Recorded courses"}</span>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? "কোর্সের নাম বা বিষয় লিখে খুঁজুন..." : "Search courses by title or topic..."}
                className={`w-full rounded-md border border-white/20 bg-white py-3 pl-10 pr-10 text-sm text-[#0b1b4a] shadow-sm outline-none transition focus:ring-2 focus:ring-[#0142b2]/40 work ${bn}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <LuX />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Filters + grid ---------- */}
      <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 lg:py-12">
        <button
          type="button"
          onClick={() => setShowMobileFilter((v) => !v)}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm lg:hidden work ${bn}`}
        >
          <LuSlidersHorizontal className="text-[#0142b2]" />
          {showMobileFilter
            ? (isBn ? "ফিল্টার লুকান" : "Hide filters")
            : (isBn ? "ক্যাটাগরি ও ফিল্টার" : "Categories & filters")}
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className={`shrink-0 lg:w-[260px] ${showMobileFilter ? "block" : "hidden lg:block"}`}>
            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<LoadingFallback />}>
                <LeftCategory
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                />
              </Suspense>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <RightCoursesDetalis
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const Course = () => (
  <Suspense fallback={<LoadingFallback />}>
    <CourseContent />
  </Suspense>
);

export default Course;
