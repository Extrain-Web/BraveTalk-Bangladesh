"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { LuGraduationCap, LuLibrary, LuUsers } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { booksApi, API_BASE } from "@/lib/booksApi";

/**
 * Real, live counts from the API (published courses, books, mentors).
 * No invented numbers: a count that is 0 or failed to load is hidden; if none load, nothing renders.
 */
const CounterSection = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const { courses = [] } = useSelector((state) => state.courses || {});
    const [books, setBooks] = useState(0);
    const [mentors, setMentors] = useState(0);

    useEffect(() => {
        let cancelled = false;
        booksApi
            .list()
            .then((d) => !cancelled && setBooks(Array.isArray(d) ? d.length : 0))
            .catch(() => {});
        fetch(`${API_BASE}/mentors`)
            .then((r) => r.json())
            .then((j) => !cancelled && setMentors(Array.isArray(j?.data) ? j.data.length : 0))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const fmt = (n) => (isBn ? n.toLocaleString("bn-BD") : n.toLocaleString("en-US"));
    const stats = [
        { n: Array.isArray(courses) ? courses.length : 0, Icon: LuGraduationCap, tile: "bg-blue-50 text-[#0142b2]", en: "Courses to choose from", bn: "কোর্স থেকে বেছে নিন", href: "/courses" },
        { n: books, Icon: LuLibrary, tile: "bg-red-50 text-[#e5251f]", en: "Books with video lessons", bn: "ভিডিও লেসনসহ বই", href: "/books" },
        { n: mentors, Icon: LuUsers, tile: "bg-emerald-50 text-[#027a1e]", en: "Mentors teaching now", bn: "মেন্টর এখন পড়াচ্ছেন", href: "/mentors" },
    ].filter((s) => s.n > 0);

    if (!stats.length) return null;

    return (
        <div className="mt-10 lg:mt-12 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className={`grid divide-y divide-slate-100 sm:divide-y-0 sm:divide-x ${stats.length === 3 ? "sm:grid-cols-3" : stats.length === 2 ? "sm:grid-cols-2" : ""}`}>
                {stats.map((s) => (
                    <Link key={s.href} href={s.href} className="group flex items-center gap-4 rounded-xl px-4 py-4 transition hover:bg-slate-50">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.tile}`}>
                            <s.Icon className="text-[22px]" />
                        </span>
                        <span>
                            <span className={`block text-2xl font-extrabold leading-none text-[#0b1b4a] outfit ${bn}`}>{fmt(s.n)}</span>
                            <span className={`mt-1 block text-xs text-slate-500 transition group-hover:text-[#0142b2] work ${bn}`}>{isBn ? s.bn : s.en}</span>
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CounterSection;
