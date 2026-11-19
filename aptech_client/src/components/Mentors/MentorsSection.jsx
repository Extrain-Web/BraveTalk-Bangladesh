"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuArrowRight, LuAward, LuUsers, LuUserX } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const MentorCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-slate-100" />
    <div className="space-y-2.5 p-5">
      <div className="h-4 w-2/3 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
      <div className="h-3 w-3/4 rounded bg-slate-100" />
    </div>
  </div>
);

export const MentorCard = ({ mentor }) => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const years = Number(mentor?.training_experience?.years || 0);
  const students = Number(String(mentor?.training_experience?.students || "").replace(/[^0-9]/g, "")) || 0;

  return (
    <Link
      href={`/mentors/${mentor._id || mentor.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl work ${bn}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        {mentor?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mentor.image}
            alt={mentor.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#0142b2]/30 outfit">
            {mentor?.name?.charAt(0)}
          </div>
        )}
        {years > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0142b2] shadow-sm backdrop-blur">
            <LuAward /> {years}+ {isBn ? "বছর" : years === 1 ? "year" : "years"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {mentor?.subject && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f] line-clamp-1">{mentor.subject}</p>
        )}
        <h3 className="mt-1 text-lg font-bold leading-snug text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">{mentor.name}</h3>
        {mentor?.designation && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{mentor.designation}</p>}

        {mentor?.specialized_area?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mentor.specialized_area.slice(0, 3).map((area, idx) => (
              <span key={idx} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-[#0142b2]">{area}</span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4 mt-4">
          {students > 0 ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <LuUsers className="text-[#0142b2]" /> {students.toLocaleString("en-US")}+ {isBn ? "শিক্ষার্থী" : "students trained"}
            </span>
          ) : <span />}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0142b2] transition-all group-hover:gap-2.5">
            {isBn ? "প্রোফাইল" : "View profile"} <LuArrowRight />
          </span>
        </div>
      </div>
    </Link>
  );
};

const MentorsSection = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  useEffect(() => {
    // ?published=true → only mentors marked visible on the public website
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/mentors?published=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mentors");
        return res.json();
      })
      .then((result) => {
        const list = result.data || result;
        setMentors(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching mentors:", err);
        setError(err.message || "Failed to load mentors");
        setLoading(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <MentorCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50/50 px-6 py-14 text-center">
          <p className={`text-sm font-semibold text-[#e5251f] work ${bn}`}>{isBn ? "মেন্টরদের তথ্য লোড করা যায়নি" : "Could not load mentors"}</p>
          <p className="mt-1 text-xs text-slate-500 work">{error}</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-[#0142b2] shadow-sm">
            <LuUserX />
          </div>
          <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "মেন্টরদের তথ্য শীঘ্রই আসছে" : "Mentor profiles coming soon"}</h3>
          <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bn}`}>
            {isBn ? "আমাদের মেন্টরদের প্রোফাইল শীঘ্রই এখানে যোগ করা হবে।" : "Our mentors' profiles will be added here soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mentors.map((mentor, index) => (
            <MentorCard key={mentor._id || mentor.id || index} mentor={mentor} />
          ))}
        </div>
      )}
    </section>
  );
};

export default MentorsSection;
