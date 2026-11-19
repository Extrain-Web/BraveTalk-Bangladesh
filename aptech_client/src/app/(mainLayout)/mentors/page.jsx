"use client";

import React from "react";
import MentorsSection from "@/components/Mentors/MentorsSection";
import { useLanguage } from "@/context/LanguageContext";
import { LuMic, LuMessagesSquare, LuUsers } from "react-icons/lu";

const MentorsPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-100/60 blur-[120px]" />
          <div className="absolute -top-10 right-[-80px] h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-[120px]" />
          <div className="absolute bottom-[-180px] left-1/3 h-[380px] w-[380px] rounded-full bg-red-100/60 blur-[120px]" />
          <div className="absolute top-10 right-[22%] hidden h-2.5 w-2.5 rounded-full bg-[#027a1e] md:block" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5251f]" />
            <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{isBn ? "আমাদের মেন্টর" : "Our mentors"}</span>
          </div>
          <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
            {isBn ? (
              <>যাদের কাছে <span className="text-[#0142b2]">শিখবেন</span></>
            ) : (
              <>Learn from <span className="text-[#0142b2]">our mentors</span></>
            )}
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
            {isBn
              ? "স্পোকেন ইংলিশ, পাবলিক স্পিকিং ও লিডারশিপে আপনাকে হাতে-কলমে গাইড করবেন আমাদের মেন্টররা — প্রতিটি ক্লাসে প্র্যাকটিস ও ফিডব্যাকসহ।"
              : "Our mentors guide you hands-on in spoken English, public speaking and leadership — with practice and feedback in every class."}
          </p>
          <div className={`mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 work ${bn}`}>
            <span className="flex items-center gap-1.5"><LuMic className="text-[#0142b2]" /> {isBn ? "লাইভ প্র্যাকটিস" : "Live practice"}</span>
            <span className="flex items-center gap-1.5"><LuMessagesSquare className="text-[#0142b2]" /> {isBn ? "ব্যক্তিগত ফিডব্যাক" : "Personal feedback"}</span>
            <span className="flex items-center gap-1.5"><LuUsers className="text-[#0142b2]" /> {isBn ? "অনলাইন ও অফলাইন" : "Online & in-person"}</span>
          </div>
        </div>
      </section>

      <MentorsSection />
    </div>
  );
};

export default MentorsPage;
