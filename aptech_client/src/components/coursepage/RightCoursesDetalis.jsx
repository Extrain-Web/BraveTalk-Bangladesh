"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedCategories } from "@/redux/categorySlice";
import CourseCard from "../sheard/CourseCard";
import { LuArrowUpDown, LuSearchX } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { getCoursePricing } from "@/lib/coursePrice";

const TYPE_FILTERS = [
  { key: "All", en: "All", bn: "সব" },
  { key: "Online", en: "Online", bn: "অনলাইন" },
  { key: "Offline", en: "Offline", bn: "অফলাইন" },
  { key: "Recorded", en: "Recorded", bn: "রেকর্ডেড" },
];

const CourseCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm animate-pulse">
    <div className="aspect-video bg-slate-100" />
    <div className="space-y-2.5 p-4">
      <div className="h-2.5 w-16 rounded bg-slate-100" />
      <div className="h-4 w-4/5 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-5 w-20 rounded bg-slate-200" />
    </div>
  </div>
);

const RightCoursesDetalis = ({ searchQuery, setSearchQuery, selectedType = "All", setSelectedType }) => {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  const { courses = [], loading = false, error = null } = useSelector((state) => state.courses || {});
  const { items: categories = [], selectedCategories = [] } = useSelector((state) => state.categories || {});
  const [sortBy, setSortBy] = useState("default");

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "";
    if (typeof categoryId === "object") return categoryId.name || "";
    if (typeof categoryId === "string" && categoryId.length < 20) return categoryId;
    const category = categories.find((cat) => cat._id === categoryId || cat.id === categoryId);
    return category?.name || "";
  };

  const q = (searchQuery || "").trim().toLowerCase();
  const filteredCourses = (Array.isArray(courses) ? courses : []).filter((course) => {
    if (!course) return false;
    const typeMatch = selectedType === "All" || course?.type === selectedType;
    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(getCategoryName(course.category));
    const searchMatch =
      q === "" ||
      (course.title && course.title.toLowerCase().includes(q)) ||
      (course.technology && course.technology.toLowerCase().includes(q)) ||
      getCategoryName(course.category).toLowerCase().includes(q);
    return typeMatch && categoryMatch && searchMatch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return getCoursePricing(a).price - getCoursePricing(b).price;
      case "price-high":
        return getCoursePricing(b).price - getCoursePricing(a).price;
      case "students":
        return (b.totalStudentsEnroll || 0) - (a.totalStudentsEnroll || 0);
      default:
        return 0;
    }
  });

  const hasFilters = !!q || selectedType !== "All" || selectedCategories.length > 0;
  const resetFilters = () => {
    if (setSearchQuery) setSearchQuery("");
    if (setSelectedType) setSelectedType("All");
    dispatch(setSelectedCategories([]));
  };

  return (
    <div className={`space-y-6 work ${bn}`}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSelectedType && setSelectedType(f.key)}
              className={`shrink-0 rounded-md border px-4 py-2 text-xs sm:text-[13px] font-semibold transition ${
                selectedType === f.key
                  ? "border-[#0142b2] bg-[#0142b2] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#0142b2]/40 hover:text-[#0142b2]"
              }`}
            >
              {isBn ? f.bn : f.en}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {!loading && (
            <p className="text-xs text-slate-500">
              {isBn
                ? `${sortedCourses.length}টি কোর্স`
                : `${sortedCourses.length} ${sortedCourses.length === 1 ? "course" : "courses"}`}
            </p>
          )}
          <div className="relative">
            <LuArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label={isBn ? "সাজান" : "Sort courses"}
              className="cursor-pointer appearance-none rounded-md border border-slate-200 bg-white py-2 pl-8 pr-4 text-xs sm:text-[13px] font-medium text-slate-600 outline-none transition focus:border-[#0142b2]"
            >
              <option value="default">{isBn ? "ডিফল্ট ক্রম" : "Sort: Default"}</option>
              <option value="students">{isBn ? "সবচেয়ে জনপ্রিয়" : "Most popular"}</option>
              <option value="price-low">{isBn ? "দাম: কম থেকে বেশি" : "Price: low to high"}</option>
              <option value="price-high">{isBn ? "দাম: বেশি থেকে কম" : "Price: high to low"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading && courses.length === 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : error && courses.length === 0 ? (
        <div className="rounded-md border border-red-100 bg-red-50/50 px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#e5251f]">{isBn ? "কোর্স লোড করা যায়নি" : "Could not load courses"}</p>
          <p className="mt-1 text-xs text-slate-500">{error}</p>
        </div>
      ) : sortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedCourses.map((course) => (
            <CourseCard key={course?._id || course?.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-2xl text-[#0142b2] shadow-sm">
            <LuSearchX />
          </div>
          <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
            {isBn ? "কোনো কোর্স পাওয়া যায়নি" : "No courses found"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {hasFilters
              ? isBn ? "অন্য কিছু লিখে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।" : "Try a different search or change the filters."
              : isBn ? "নতুন কোর্স শীঘ্রই আসছে। আবার দেখুন!" : "New courses are coming soon. Check back later!"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#01368f]"
            >
              {isBn ? "সব কোর্স দেখুন" : "Show all courses"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RightCoursesDetalis;
