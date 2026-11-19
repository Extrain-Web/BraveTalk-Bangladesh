"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories, setSelectedCategories } from "@/redux/categorySlice";
import { useSearchParams } from "next/navigation";
import { LuLayers, LuX, LuCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const subscribeNoop = () => () => {};

function FilterSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="my-2 h-8 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

const Option = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
      active ? "bg-blue-50 font-semibold text-[#0142b2]" : "text-slate-600 hover:bg-slate-50 hover:text-[#0b1b4a]"
    }`}
  >
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
        active ? "border-[#0142b2] bg-[#0142b2] text-white" : "border-slate-300 bg-white"
      }`}
    >
      {active && <LuCheck className="text-[10px]" />}
    </span>
    {children}
  </button>
);

const LeftCategory = ({ searchQuery, setSearchQuery, selectedType, setSelectedType }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const { items: courseCategories = [], status, selectedCategories = [] } = useSelector(
    (state) => state.categories || {}
  );
  const initialUrlCategorySet = useRef(false);

  // The redux store can differ between server and client render — render a stable
  // skeleton until mounted so the first client render matches the server HTML.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // ?category=Name preselects a category — only once on initial load
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && !initialUrlCategorySet.current) {
      initialUrlCategorySet.current = true;
      dispatch(setSelectedCategories([urlCategory]));
    }
  }, [searchParams, dispatch]);

  if (!mounted) return <FilterSkeleton />;

  // Single-select: clicking a selected category clears it
  const handleCategoryChange = (categoryName) => {
    dispatch(setSelectedCategories(selectedCategories.includes(categoryName) ? [] : [categoryName]));
  };

  const clearAllFilters = () => {
    dispatch(setSelectedCategories([]));
    if (setSearchQuery) setSearchQuery("");
    if (setSelectedType) setSelectedType("All");
  };

  const filteredCategories = courseCategories.filter((category) => category.name !== "All");
  const hasActiveFilters = selectedCategories.length > 0 || !!searchQuery || (selectedType && selectedType !== "All");

  return (
    <div className={`space-y-4 work ${bn}`}>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-[#e5251f] transition hover:bg-red-100"
        >
          <LuX /> {isBn ? "সব ফিল্টার মুছুন" : "Clear all filters"}
        </button>
      )}

      {/* Categories */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 px-3 pb-2 pt-1">
          <LuLayers className="text-[#0142b2]" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isBn ? "ক্যাটাগরি" : "Categories"}
          </p>
          {selectedCategories.length > 0 && (
            <span className="ml-auto rounded-full bg-[#0142b2] px-2 py-0.5 text-[10px] font-bold text-white">
              {selectedCategories.length}
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          <Option active={selectedCategories.length === 0} onClick={() => dispatch(setSelectedCategories([]))}>
            <span>{isBn ? "সব ক্যাটাগরি" : "All categories"}</span>
          </Option>

          {status === "loading" && (
            <div className="py-4 text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#0142b2] border-t-transparent" />
            </div>
          )}

          {status === "succeeded" &&
            filteredCategories.map((category) => (
              <Option
                key={category._id || category.id || category.name}
                active={selectedCategories.includes(category.name)}
                onClick={() => handleCategoryChange(category.name)}
              >
                <span className="truncate">{category.name}</span>
              </Option>
            ))}

          {status === "succeeded" && filteredCategories.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">{isBn ? "কোনো ক্যাটাগরি নেই" : "No categories yet"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftCategory;
