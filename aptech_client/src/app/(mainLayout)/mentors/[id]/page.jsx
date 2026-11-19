"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuMail, LuPhone, LuAward, LuUsers, LuGraduationCap, LuBriefcase,
  LuSparkles, LuCircleAlert, LuArrowRight, LuHouse, LuChevronRight,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 animate-pulse">
      <div className="mb-6 h-4 w-28 rounded bg-slate-100" />
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="aspect-[4/5] rounded-md bg-slate-100" />
        <div className="space-y-4 py-2">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-9 w-3/5 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
          <div className="h-24 w-full rounded-md bg-slate-100" />
          <div className="h-40 w-full rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

const SingleMentor = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { settings } = useSettings();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/mentors/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load mentor");
        return res.json();
      })
      .then((result) => {
        if (result.success && result.data) {
          setMentor(result.data);
          window.scrollTo(0, 0);
        } else {
          setError("Mentor not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching mentor:", err);
        setError("Failed to load mentor profile.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ProfileSkeleton />;

  if (error || !mentor) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-50 text-2xl text-[#e5251f]">
          <LuCircleAlert />
        </div>
        <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "মেন্টর পাওয়া যায়নি" : "Mentor not found"}</h1>
        <p className="mt-1 text-sm text-slate-500 work">{error}</p>
        <Link href="/mentors" className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
          <LuArrowLeft /> {isBn ? "সব মেন্টর" : "All mentors"}
        </Link>
      </div>
    );
  }

  const years = Number(mentor.training_experience?.years || 0);
  const students = Number(String(mentor.training_experience?.students || "").replace(/[^0-9]/g, "")) || 0;
  const specialties = mentor.specialized_area || [];
  const education = mentor.education_qualification || [];
  const work = mentor.work_experience || [];
  // WhatsApp: the mentor's own number, falling back to the BraveTalk office number
  const mentorDigits = String(mentor.phone || "").replace(/[^0-9]/g, "");
  const waNumber = mentorDigits
    ? (mentorDigits.startsWith("88") ? mentorDigits : `88${mentorDigits}`)
    : String(settings?.whatsappNumber || "8801323878569").replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    isBn ? `হ্যালো, আমি মেন্টর ${mentor.name}-এর ক্লাস সম্পর্কে জানতে চাই।` : `Hello, I'd like to know about classes with mentor ${mentor.name}.`
  );

  const stats = [
    years > 0 && { Icon: LuAward, value: `${years}+`, label: isBn ? "বছরের অভিজ্ঞতা" : "Years of experience", tint: "bg-blue-50 text-[#0142b2]" },
    students > 0 && { Icon: LuUsers, value: `${students.toLocaleString("en-US")}+`, label: isBn ? "শিক্ষার্থী" : "Students trained", tint: "bg-red-50 text-[#e5251f]" },
    specialties.length > 0 && { Icon: LuSparkles, value: `${specialties.length}`, label: isBn ? "বিশেষ দক্ষতা" : "Specialisations", tint: "bg-emerald-50 text-[#027a1e]" },
  ].filter(Boolean);

  return (
    <div className="bg-slate-50">
      <section>
        <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 sm:py-8 lg:pb-16">
          <nav aria-label="Breadcrumb" className={`mb-6 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 work ${bn}`}>
            <Link href="/" className="inline-flex shrink-0 items-center gap-1 transition hover:text-[#0142b2]"><LuHouse /> {isBn ? "হোম" : "Home"}</Link>
            <LuChevronRight className="shrink-0 text-slate-300" />
            <Link href="/mentors" className="shrink-0 transition hover:text-[#0142b2]">{isBn ? "মেন্টর" : "Mentors"}</Link>
            <LuChevronRight className="shrink-0 text-slate-300" />
            <span className="truncate font-medium text-[#0b1b4a]">{mentor.name}</span>
          </nav>

          <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
            {/* ---------- Profile card ---------- */}
            <aside className="lg:sticky lg:top-24">
              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm sm:max-w-sm lg:max-w-none">
                <div className="aspect-square bg-slate-100 lg:aspect-[4/5]">
                  {mentor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mentor.image} alt={mentor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl font-bold text-[#0142b2]/30 outfit">{mentor.name?.charAt(0)}</div>
                  )}
                </div>
                <div className={`space-y-3 p-5 work ${bn}`}>
                  {mentor.email && (
                    <a href={`mailto:${mentor.email}`} className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-[#0142b2]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-50 text-[#0142b2]"><LuMail /></span>
                      <span className="truncate">{mentor.email}</span>
                    </a>
                  )}
                  {mentor.phone && (
                    <a href={`tel:${mentor.phone}`} className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-[#0142b2]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-50 text-[#e5251f]"><LuPhone /></span>
                      {mentor.phone}
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#027a1e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#026318]"
                  >
                    <FaWhatsapp className="text-base" /> {isBn ? "হোয়াটসঅ্যাপে যোগাযোগ" : "Contact on WhatsApp"}
                  </a>
                  <Link
                    href="/courses"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                  >
                    {isBn ? "কোর্স দেখুন" : "Browse courses"} <LuArrowRight />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ---------- Content ---------- */}
            <div className="min-w-0 space-y-5">
              <div className="rounded-md border border-slate-200 bg-white p-5 sm:p-6">
                {mentor.subject && <p className="text-xs font-semibold uppercase tracking-wider text-[#e5251f] work">{mentor.subject}</p>}
                <h1 className={`mt-2 flex flex-wrap items-center gap-2 text-[28px] sm:text-4xl font-bold leading-tight text-[#0b1b4a] outfit`}>
                  {mentor.name} <MdVerified className="text-2xl text-[#0142b2]" />
                </h1>
                {mentor.designation && <p className={`mt-2 text-base font-medium text-slate-600 work ${bn}`}>{mentor.designation}</p>}

                {specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialties.map((area, idx) => (
                      <span key={idx} className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 work">{area}</span>
                    ))}
                  </div>
                )}

                {mentor.details && (
                  <p className="mt-5 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work">{mentor.details}</p>
                )}
              </div>

              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {stats.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${s.tint}`}><s.Icon className="text-lg" /></span>
                      <span className="min-w-0">
                        <span className="block text-xl font-bold leading-tight text-[#0b1b4a] outfit">{s.value}</span>
                        <span className={`block text-xs text-slate-500 work ${bn}`}>{s.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(education.length > 0 || work.length > 0) && (
                <div className="grid gap-5 md:grid-cols-2">
                  {education.length > 0 && (
                    <div className="rounded-md border border-slate-200 bg-white p-5">
                      <h2 className={`flex items-center gap-2 border-l-4 border-[#e5251f] pl-3 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                        <LuGraduationCap className="text-[#0142b2]" />
                        {isBn ? "শিক্ষাগত যোগ্যতা" : "Education"}
                      </h2>
                      <ul className="mt-4 space-y-2.5 text-sm text-slate-600 work">
                        {education.map((edu, idx) => (
                          <li key={idx} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0142b2]" /> {edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {work.length > 0 && (
                    <div className="rounded-md border border-slate-200 bg-white p-5">
                      <h2 className={`flex items-center gap-2 border-l-4 border-[#e5251f] pl-3 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                        <LuBriefcase className="text-[#e5251f]" />
                        {isBn ? "অভিজ্ঞতা" : "Experience"}
                      </h2>
                      <ul className="mt-4 space-y-2.5 text-sm text-slate-600 work">
                        {work.map((w, idx) => (
                          <li key={idx} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5251f]" /> {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {mentor.lifeJourney && (
                <div className="rounded-md border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className={`border-l-4 border-[#e5251f] pl-3 text-lg sm:text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "জীবনের গল্প" : "Life journey"}</h2>
                  <p className="mt-4 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work">{mentor.lifeJourney}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SingleMentor;
