"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { motion, useInView } from "framer-motion";
import { LuArrowRight, LuGraduationCap } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import PopularCourseCard from "./PopularCourseCard";
import SectionHeader from "./SectionHeader";

const MAX_CARDS = 8;

function CardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="aspect-[16/10] bg-slate-100" />
            <div className="space-y-2.5 p-4">
                <div className="h-2.5 w-16 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="mt-4 h-5 w-20 rounded bg-slate-200" />
            </div>
        </div>
    );
}

const PopularCourse = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
    const [selected, setSelected] = useState("all");

    const { items: categories = [] } = useSelector((state) => state.categories || {});
    const { courses = [], loading, error } = useSelector((state) => state.courses || {});

    const catIdOf = (course) => course.category?._id || course.category;
    const catNameOf = (course) => {
        if (course.category?.name) return course.category.name;
        const id = catIdOf(course);
        return categories.find((c) => c._id === id || c.id === id)?.name || "";
    };

    const list = Array.isArray(courses) ? courses : [];
    // Only offer filter pills for categories that actually have courses
    const usedIds = new Set(list.map((c) => String(catIdOf(c))));
    const usedCategories = categories.filter((c) => usedIds.has(String(c._id || c.id)));

    const filtered = selected === "all" ? list : list.filter((c) => String(catIdOf(c)) === selected);
    const shown = filtered.slice(0, MAX_CARDS);

    return (
        <section className="relative bg-slate-50/60 py-14 lg:py-20 border-y border-slate-100">
            <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeader
                        align="left"
                        dot="blue"
                        className="mb-0"
                        badge={isBn ? "জনপ্রিয় কোর্স" : "Popular courses"}
                        title={isBn ? "আজই শুরু করুন" : "Start learning"}
                        titleAccent={isBn ? "সেরা কোর্সে" : "today"}
                        description={
                            isBn
                                ? "স্পোকেন ইংলিশ, পাবলিক স্পিকিং ও লিডারশিপ — একবার পূর্ণ মূল্যে কিনুন, অথবা ফ্রি কোর্স দিয়ে শুরু করুন।"
                                : "Spoken English, public speaking and leadership — buy once at full price, or start with a free course."
                        }
                        isInView={isInView}
                        bengaliClass={bn}
                    />
                    <Link
                        href="/courses"
                        className={`hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2]/40 hover:text-[#0142b2] lg:inline-flex work ${bn}`}
                    >
                        {isBn ? "সব কোর্স দেখুন" : "View all courses"} <LuArrowRight />
                    </Link>
                </div>

                {usedCategories.length > 1 && (
                    <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [scrollbar-width:none]">
                        {[{ _id: "all", name: isBn ? "সব" : "All" }, ...usedCategories].map((cat) => {
                            const id = String(cat._id || cat.id);
                            const active = selected === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelected(id)}
                                    className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-[13px] font-semibold transition work ${id === "all" ? bn : ""} ${
                                        active
                                            ? "border-[#0142b2] bg-[#0142b2] text-white shadow-md shadow-blue-900/20"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    {loading && list.length === 0 ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    ) : error && list.length === 0 ? (
                        <div className="rounded-3xl border border-red-100 bg-red-50/50 px-6 py-12 text-center">
                            <p className={`text-sm font-semibold text-[#e5251f] work ${bn}`}>
                                {isBn ? "কোর্স লোড করা যায়নি" : "Could not load courses"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 work">{String(error)}</p>
                        </div>
                    ) : shown.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#0142b2]">
                                <LuGraduationCap />
                            </div>
                            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                                {isBn ? "নতুন কোর্স শীঘ্রই আসছে" : "New courses are coming soon"}
                            </h3>
                            <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bn}`}>
                                {isBn ? "আপডেট পেতে আমাদের সাথে যোগাযোগ করুন।" : "Get in touch and we'll let you know when enrolment opens."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((course) => (
                                <PopularCourseCard key={course._id || course.id} course={course} categoryName={catNameOf(course)} />
                            ))}
                        </div>
                    )}
                </motion.div>

                <div className="mt-8 flex justify-center lg:hidden">
                    <Link
                        href="/courses"
                        className={`inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#01368f] work ${bn}`}
                    >
                        {isBn ? "সব কোর্স দেখুন" : "View all courses"} <LuArrowRight />
                    </Link>
                </div>
                {filtered.length > MAX_CARDS && (
                    <p className={`mt-5 hidden text-center text-xs text-slate-500 lg:block work ${bn}`}>
                        {isBn ? `আরও ${filtered.length - MAX_CARDS}টি কোর্স আছে — ` : `${filtered.length - MAX_CARDS} more courses — `}
                        <Link href="/courses" className="font-semibold text-[#0142b2] hover:underline">
                            {isBn ? "সব দেখুন" : "see all"}
                        </Link>
                    </p>
                )}
            </div>
        </section>
    );
};

export default PopularCourse;
