"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuMail, LuPhone, LuAward, LuUsers, LuGraduationCap, LuBriefcase,
  LuSparkles, LuCircleAlert, LuArrowRight,
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
        <div className="aspect-[4/5] rounded-3xl bg-slate-100" />
        <div className="space-y-4 py-2">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-9 w-3/5 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
          <div className="h-24 w-full rounded-2xl bg-slate-100" />
          <div className="h-40 w-full rounded-2xl bg-slate-100" />
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-[#e5251f]">
          <LuCircleAlert />
        </div>
        <h1 className={`mt-4 text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "মেন্টর পাওয়া যায়নি" : "Mentor not found"}</h1>
        <p className="mt-1 text-sm text-slate-500 work">{error}</p>
        <Link href="/mentors" className={`mt-5 inline-flex items-center gap-2 rounded-full bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] work ${bn}`}>
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
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px]">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-blue-100/70 blur-[120px]" />
          <div className="absolute top-20 right-[-100px] h-[380px] w-[380px] rounded-full bg-emerald-100/50 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[340px] w-[340px] rounded-full bg-red-100/40 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10">
          <Link href="/mentors" className={`mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0142b2] work ${bn}`}>
            <LuArrowLeft /> {isBn ? "সব মেন্টর" : "All mentors"}
          </Link>

          <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
            {/* ---------- Profile card ---------- */}
            <aside className="lg:sticky lg:top-24">
              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:max-w-sm lg:max-w-none">
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-blue-50 lg:aspect-[4/5]">
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
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0142b2]"><LuMail /></span>
                      <span className="truncate">{mentor.email}</span>
                    </a>
                  )}
                  {mentor.phone && (
                    <a href={`tel:${mentor.phone}`} className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-[#0142b2]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#e5251f]"><LuPhone /></span>
                      {mentor.phone}
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#027a1e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#026318]"
                  >
                    <FaWhatsapp className="text-base" /> {isBn ? "হোয়াটসঅ্যাপে যোগাযোগ" : "Contact on WhatsApp"}
                  </a>
                  <Link
                    href="/courses"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                  >
                    {isBn ? "কোর্স দেখুন" : "Browse courses"} <LuArrowRight />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ---------- Content ---------- */}
            <div className="min-w-0 space-y-10">
              <div>
                {mentor.subject && <p className="text-xs font-semibold uppercase tracking-wider text-[#e5251f] work">{mentor.subject}</p>}
                <h1 className={`mt-2 flex flex-wrap items-center gap-2 text-[28px] sm:text-4xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit`}>
                  {mentor.name} <MdVerified className="text-2xl text-[#0142b2]" />
                </h1>
                {mentor.designation && <p className={`mt-2 text-base font-medium text-slate-600 work ${bn}`}>{mentor.designation}</p>}

                {specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialties.map((area, idx) => (
                      <span key={idx} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 work">{area}</span>
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
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}><s.Icon className="text-lg" /></span>
                      <p className="mt-3 text-2xl font-extrabold text-[#0b1b4a] outfit">{s.value}</p>
                      <p className={`text-xs text-slate-500 work ${bn}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {(education.length > 0 || work.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {education.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className={`flex items-center gap-3 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0142b2]"><LuGraduationCap /></span>
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
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className={`flex items-center gap-3 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#e5251f]"><LuBriefcase /></span>
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
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "জীবনের গল্প" : "Life journey"}</h2>
                  <div className="mt-2 h-1 w-12 rounded-full bg-[#027a1e]" />
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6">
                    <p className="whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work">{mentor.lifeJourney}</p>
                  </div>
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
