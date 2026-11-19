"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchCoursesData } from "@/redux/CourseSlice";
import { fetchCategories } from "@/redux/categorySlice";
import { fetchMentorsData } from "@/redux/mentorSlice";
import LeftCategory from "@/components/coursepage/LeftCategory";
import dynamic from "next/dynamic";
import { LuSearch, LuX, LuSlidersHorizontal, LuWifi, LuMapPin, LuCirclePlay } from "react-icons/lu";
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

  useEffect(() => {
    dispatch(fetchCoursesData());
    dispatch(fetchCategories());
    dispatch(fetchMentorsData());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Hero strip ---------- */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-[120px]" />
          <div className="absolute -top-10 right-[-80px] h-[420px] w-[420px] rounded-full bg-red-100/60 blur-[120px]" />
          <div className="absolute bottom-[-180px] left-1/3 h-[380px] w-[380px] rounded-full bg-emerald-100/60 blur-[120px]" />
          <div className="absolute top-10 right-[22%] hidden h-2.5 w-2.5 rounded-full bg-[#e5251f] md:block" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0142b2]" />
            <span className={`text-xs font-medium text-slate-600 work ${bn}`}>
              {isBn ? "স্পোকেন ইংলিশ · পাবলিক স্পিকিং · লিডারশিপ" : "Spoken English · Public Speaking · Leadership"}
            </span>
          </div>
          <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
            {isBn ? (
              <>আমাদের <span className="text-[#e5251f]">কোর্সসমূহ</span></>
            ) : (
              <>Explore our <span className="text-[#e5251f]">courses</span></>
            )}
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
            {isBn
              ? "আত্মবিশ্বাসের সাথে কথা বলা, মঞ্চে বক্তৃতা আর নেতৃত্বের দক্ষতা — লাইভ ক্লাস, অফলাইন ব্যাচ অথবা রেকর্ডেড কোর্সে নিজের গতিতে শিখুন।"
              : "Speak with confidence, own the stage and lead — learn in live online classes, in-person batches or self-paced recorded courses."}
          </p>

          <div className={`mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 work ${bn}`}>
            <span className="flex items-center gap-1.5"><LuWifi className="text-[#0142b2]" /> {isBn ? "অনলাইন লাইভ" : "Live online"}</span>
            <span className="flex items-center gap-1.5"><LuMapPin className="text-[#0142b2]" /> {isBn ? "অফলাইন ক্লাস" : "In-person classes"}</span>
            <span className="flex items-center gap-1.5"><LuCirclePlay className="text-[#0142b2]" /> {isBn ? "রেকর্ডেড কোর্স" : "Recorded courses"}</span>
          </div>

          {/* Search */}
          <div className="mx-auto mt-7 max-w-xl">
            <div className="relative">
              <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? "কোর্সের নাম বা বিষয় লিখে খুঁজুন..." : "Search courses by title or topic..."}
                className={`w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-[#0b1b4a] shadow-sm outline-none transition focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 work ${bn}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <LuX />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Filters + grid ---------- */}
      <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
        <button
          type="button"
          onClick={() => setShowMobileFilter((v) => !v)}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm lg:hidden work ${bn}`}
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
