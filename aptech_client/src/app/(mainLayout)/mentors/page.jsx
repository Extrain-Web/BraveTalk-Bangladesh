"use client";

import React from "react";
import Link from "next/link";
import MentorsSection from "@/components/Mentors/MentorsSection";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteImage } from "@/lib/siteImages";
import { LuMic, LuMessagesSquare, LuUsers, LuHouse, LuChevronRight } from "react-icons/lu";

const MentorsPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const bannerImg = useSiteImage("mentorsBanner");

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Photo banner ---------- */}
      <section className="relative overflow-hidden bg-[#0b1b4a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerImg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0b1b4a]/75" />
        <div className="relative z-10 mx-auto flex min-h-[240px] max-w-[1140px] 2xl:max-w-[1280px] flex-col justify-center px-4 sm:px-6 py-10 sm:min-h-[290px]">
          <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-white/70 work ${bn}`}>
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white"><LuHouse /> {isBn ? "হোম" : "Home"}</Link>
            <LuChevronRight className="text-white/40" />
            <span className="font-medium text-white">{isBn ? "মেন্টর" : "Mentors"}</span>
          </nav>
          <h1 className={`mt-3 text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-white outfit ${bn}`}>
            {isBn ? "যাদের কাছে শিখবেন" : "Learn from our mentors"}
          </h1>
          <p className={`mt-3 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-white/80 work ${bn}`}>
            {isBn
              ? "স্পোকেন ইংলিশ, পাবলিক স্পিকিং ও লিডারশিপে আপনাকে হাতে-কলমে গাইড করবেন আমাদের মেন্টররা — প্রতিটি ক্লাসে প্র্যাকটিস ও ফিডব্যাকসহ।"
              : "Our mentors guide you hands-on in spoken English, public speaking and leadership — with practice and feedback in every class."}
          </p>
          <div className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/80 work ${bn}`}>
            <span className="flex items-center gap-1.5"><LuMic /> {isBn ? "লাইভ প্র্যাকটিস" : "Live practice"}</span>
            <span className="flex items-center gap-1.5"><LuMessagesSquare /> {isBn ? "ব্যক্তিগত ফিডব্যাক" : "Personal feedback"}</span>
            <span className="flex items-center gap-1.5"><LuUsers /> {isBn ? "অনলাইন লাইভ ক্লাস" : "Live online classes"}</span>
          </div>
        </div>
      </section>

      <MentorsSection />
    </div>
  );
};

export default MentorsPage;
