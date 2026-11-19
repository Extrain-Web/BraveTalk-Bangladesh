"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuSearch,
  LuShieldCheck,
  LuQrCode,
  LuAward,
  LuCalendarCheck,
  LuClipboardCheck,
  LuWallet,
  LuLayoutDashboard,
  LuArrowRight,
  LuHash,
  LuUser,
  LuBookOpen,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import PhotoBanner from "@/components/Shared/PhotoBanner";

const TINTS = ["bg-blue-50 text-[#0142b2]", "bg-red-50 text-[#e5251f]", "bg-emerald-50 text-[#027a1e]"];

const COPY = {
  en: {
    badge: "Certificates",
    h1a: "Certificates you can",
    h1b: "prove",
    desc: "When you complete a BraveTalk Bangladesh course you receive a certificate with a unique ID and QR code — anyone can check it online in seconds.",
    searchLabel: "Have a certificate ID?",
    searchBtn: "Verify",
    searchHint: "You will be taken to the verification page.",
    earnEyebrow: "How to earn it",
    earnTitle: "What you need to",
    earnAccent: "complete",
    earn: [
      { icon: LuCalendarCheck, title: "Attend your classes", text: "Join your batch's live classes and practise regularly." },
      { icon: LuClipboardCheck, title: "Finish the work", text: "Complete the assignments and assessments of your course." },
      { icon: LuWallet, title: "Complete payment", text: "Paid courses must be fully paid. Free courses need no payment." },
    ],
    onCertEyebrow: "On every certificate",
    onCertTitle: "Clear details,",
    onCertAccent: "easy to check",
    onCert: [
      { icon: LuUser, text: "Student name" },
      { icon: LuBookOpen, text: "Course and batch" },
      { icon: LuCalendarCheck, text: "Course dates and issue date" },
      { icon: LuHash, text: "Unique certificate ID" },
      { icon: LuQrCode, text: "QR code that opens the verification page" },
    ],
    dashTitle: "Already a student?",
    dashText: "Your certificates appear in your student dashboard as soon as they are issued.",
    dashCta: "My certificates",
    helpTitle: "Need help with a certificate?",
    helpText: "Message us on WhatsApp and our team will help you.",
    helpCta: "Chat on WhatsApp",
  },
  bn: {
    badge: "সার্টিফিকেট",
    h1a: "যে সার্টিফিকেট আপনি",
    h1b: "প্রমাণ করতে পারবেন",
    desc: "ব্রেভটক বাংলাদেশের কোর্স শেষ করলে আপনি ইউনিক আইডি ও QR কোডসহ একটি সার্টিফিকেট পাবেন — যে কেউ কয়েক সেকেন্ডে অনলাইনে তা যাচাই করতে পারবে।",
    searchLabel: "সার্টিফিকেট আইডি আছে?",
    searchBtn: "যাচাই করুন",
    searchHint: "আপনাকে যাচাই পেজে নিয়ে যাওয়া হবে।",
    earnEyebrow: "যেভাবে পাবেন",
    earnTitle: "যা",
    earnAccent: "সম্পন্ন করতে হবে",
    earn: [
      { icon: LuCalendarCheck, title: "ক্লাসে উপস্থিত থাকুন", text: "আপনার ব্যাচের লাইভ ক্লাসে যুক্ত হোন এবং নিয়মিত প্র্যাকটিস করুন।" },
      { icon: LuClipboardCheck, title: "কাজ শেষ করুন", text: "কোর্সের অ্যাসাইনমেন্ট ও মূল্যায়ন সম্পন্ন করুন।" },
      { icon: LuWallet, title: "পেমেন্ট সম্পন্ন করুন", text: "পেইড কোর্সের পুরো ফি পরিশোধ করতে হবে। ফ্রি কোর্সে কোনো পেমেন্ট লাগে না।" },
    ],
    onCertEyebrow: "প্রতিটি সার্টিফিকেটে",
    onCertTitle: "স্পষ্ট তথ্য,",
    onCertAccent: "সহজ যাচাই",
    onCert: [
      { icon: LuUser, text: "শিক্ষার্থীর নাম" },
      { icon: LuBookOpen, text: "কোর্স ও ব্যাচ" },
      { icon: LuCalendarCheck, text: "কোর্সের সময়কাল ও প্রদানের তারিখ" },
      { icon: LuHash, text: "ইউনিক সার্টিফিকেট আইডি" },
      { icon: LuQrCode, text: "যাচাই পেজ খোলার QR কোড" },
    ],
    dashTitle: "ইতিমধ্যে শিক্ষার্থী?",
    dashText: "সার্টিফিকেট প্রদান হলেই তা আপনার স্টুডেন্ট ড্যাশবোর্ডে দেখা যাবে।",
    dashCta: "আমার সার্টিফিকেট",
    helpTitle: "সার্টিফিকেট নিয়ে সাহায্য দরকার?",
    helpText: "WhatsApp-এ মেসেজ দিন, আমাদের টিম আপনাকে সাহায্য করবে।",
    helpCta: "WhatsApp-এ চ্যাট করুন",
  },
};

const Eyebrow = ({ children, bn }) => (
  <p className={`text-xs font-semibold uppercase tracking-wider text-[#e5251f] work ${bn}`}>{children}</p>
);

const CertificationPage = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { settings } = useSettings();
  const c = COPY[language === "bn" ? "bn" : "en"];
  const bn = language === "bn" ? "hind-siliguri" : "";
  const whatsappNumber = String(settings?.whatsappNumber || "8801323878569").replace(/[^0-9]/g, "");

  const [certId, setCertId] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const id = certId.trim();
    if (id) router.push(`/verify-certificate?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PhotoBanner
        slot="pageBanner"
        eyebrow={c.badge}
        crumbs={[{ label: c.badge }]}
        title={<>{c.h1a} <span className="text-[#ff6b63]">{c.h1b}</span></>}
        subtitle={c.desc}
      />

      {/* Verify search + certificate preview */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] items-center gap-10 px-4 sm:px-6 py-12 lg:py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-md border border-slate-200 border-t-[3px] border-t-[#0142b2] bg-white p-5 sm:p-6 shadow-sm">
            <h2 className={`border-l-4 border-[#e5251f] pl-3 text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{c.searchLabel}</h2>
            <form onSubmit={handleSearch} className="mt-5">
              <label htmlFor="certId" className={`mb-2 block text-sm font-medium text-slate-700 work ${bn}`}>{language === "bn" ? "সার্টিফিকেট আইডি" : "Certificate ID"}</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                  <input
                    id="certId"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="e.g. BT-CERT-0001"
                    className="w-full rounded-md border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-medium uppercase text-[#0b1b4a] outline-none transition placeholder:normal-case focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10 work"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!certId.trim()}
                  className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0142b2] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] disabled:cursor-not-allowed disabled:opacity-60 work ${bn}`}
                >
                  <LuShieldCheck /> {c.searchBtn}
                </button>
              </div>
              <p className={`mt-2 text-xs text-slate-400 work ${bn}`}>{c.searchHint}</p>
            </form>
          </div>

          {/* Certificate preview card (illustrative, no real data) */}
          <div className="mx-auto w-full max-w-[420px] lg:ml-auto">
            <div className="relative rounded-md border border-slate-200 bg-slate-50 p-6 shadow-md">
              <div className="rounded-sm border-2 border-double border-[#0b1b4a]/30 bg-white p-5 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0142b2]">
                  <LuAward className="text-3xl" />
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 work">BraveTalk Bangladesh</p>
                <p className={`mt-1 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{language === "bn" ? "কোর্স সমাপনী সার্টিফিকেট" : "Certificate of Completion"}</p>
                <div className="mx-auto mt-4 h-2 w-3/4 rounded-sm bg-slate-100" />
                <div className="mx-auto mt-2 h-2 w-1/2 rounded-sm bg-slate-100" />
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="rounded-sm bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-500">BT-CERT-XXXX</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 text-[#0b1b4a]">
                    <LuQrCode className="text-2xl" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to earn */}
      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow bn={bn}>{c.earnEyebrow}</Eyebrow>
            <h2 className={`mt-2 text-2xl sm:text-3xl font-bold text-[#0b1b4a] outfit ${bn}`}>
              {c.earnTitle} <span className="text-[#e5251f]">{c.earnAccent}</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {c.earn.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <span className={`flex h-11 w-11 items-center justify-center rounded-md ${TINTS[i % 3]}`}>
                  <Icon className="text-2xl" />
                </span>
                <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{title}</h3>
                <p className={`mt-1.5 text-sm leading-relaxed text-slate-600 work ${bn}`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* On every certificate + dashboard */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1140px] 2xl:max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
          <div>
            <Eyebrow bn={bn}>{c.onCertEyebrow}</Eyebrow>
            <h2 className={`mt-2 border-l-4 border-[#e5251f] pl-3 text-2xl sm:text-3xl font-bold text-[#0b1b4a] outfit ${bn}`}>
              {c.onCertTitle} <span className="text-[#0142b2]">{c.onCertAccent}</span>
            </h2>
            <ul className="mt-6 space-y-3">
              {c.onCert.map(({ icon: Icon, text }, i) => (
                <li key={text} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${TINTS[i % 3]}`}>
                    <Icon className="text-base" />
                  </span>
                  <span className={`text-sm font-medium text-slate-700 work ${bn}`}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-slate-200 border-l-4 border-l-[#0142b2] bg-slate-50 p-6 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#0142b2] shadow-sm">
                <LuLayoutDashboard className="text-2xl" />
              </span>
              <h3 className={`mt-4 text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{c.dashTitle}</h3>
              <p className={`mt-1 text-sm text-slate-600 work ${bn}`}>{c.dashText}</p>
              <Link
                href="/dashboard/user/certificates"
                className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work ${bn}`}
              >
                {c.dashCta} <LuArrowRight />
              </Link>
            </div>

            <div className="rounded-md border border-emerald-200 border-l-4 border-l-[#027a1e] bg-emerald-50/70 p-6 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#25D366] shadow-sm">
                <FaWhatsapp className="text-2xl" />
              </span>
              <h3 className={`mt-4 text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{c.helpTitle}</h3>
              <p className={`mt-1 text-sm text-slate-600 work ${bn}`}>{c.helpText}</p>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#027a1e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#026318] work ${bn}`}
              >
                <FaWhatsapp /> {c.helpCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CertificationPage;
