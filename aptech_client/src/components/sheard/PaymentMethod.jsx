"use client";

import React, { useState, useRef } from "react";
import { LuCopy, LuCheck, LuShieldCheck, LuPhoneCall, LuCircleCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import SectionHeader from "@/components/Home/SectionHeader";
import { LuLandmark } from "react-icons/lu";
import { PAYMENT_CONTACT_PHONE, MOBILE_METHODS, usePaymentInfo } from "@/lib/paymentNumbers";

const PaymentMethod = () => {
  const [copiedKey, setCopiedKey] = useState(null);
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Accounts switched ON in Admin → Payment Info
  const { mobile: withNumbers, banks } = usePaymentInfo();
  // Until real numbers are configured, show the two wallets we take payments through
  const logos = (withNumbers.length ? withNumbers : MOBILE_METHODS.slice(0, 2)).filter((m) => m.logo);

  const copyToClipboard = async (key, number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const points = isBn
    ? ["একবার পূর্ণ মূল্যে কিনুন — কোনো কিস্তি নেই", "ফ্রি কোর্সে কোনো পেমেন্ট লাগে না", "পেমেন্ট যাচাইয়ের পর কোর্স চালু হয়"]
    : ["Pay once at full price — no instalments", "Free courses need no payment at all", "Your course unlocks once payment is verified"];

  return (
    <section className="relative bg-slate-50 py-12 lg:py-16 border-t border-slate-200">
      <div ref={sectionRef} className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
        <SectionHeader
          badge={isBn ? "পেমেন্ট" : "Payment"}
          dot="blue"
          title={isBn ? "সহজ" : "Simple, secure"}
          titleAccent={isBn ? "পেমেন্ট" : "payment"}
          description={
            isBn
              ? "মোবাইল ব্যাংকিং বা ব্যাংকে টাকা পাঠিয়ে ভর্তি সম্পন্ন করুন।"
              : "Complete your enrolment by sending money through mobile banking or bank transfer."
          }
          isInView={isInView}
          bengaliClass={bn}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto grid max-w-4xl gap-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:grid-cols-2 md:items-center"
        >
          {/* How it works */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {logos.map((m) => (
                <span key={m.key} className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.logo} alt={m.name} className="h-8 w-8 object-contain" />
                </span>
              ))}
            </div>
            <ul className="space-y-2.5">
              {points.map((p) => (
                <li key={p} className={`flex items-start gap-2.5 text-sm text-slate-600 work ${bn}`}>
                  <LuCircleCheck className="mt-0.5 shrink-0 text-[#027a1e]" /> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Numbers / call box */}
          <div className="space-y-3">
            {withNumbers.length + banks.length > 0 ? (
              <>
              {withNumbers.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => copyToClipboard(m.key, m.number)}
                  className="group flex w-full items-center gap-4 rounded-md border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-[#0142b2]/30 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-50">
                    {m.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.logo} alt={m.name} className="h-7 w-7 object-contain" />
                      : <span className="text-xs font-bold" style={{ color: m.color }}>{m.name}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-400 work">{m.name}{m.accountType ? ` (${m.accountType})` : ""} · Send Money</span>
                    <span className="block text-lg font-bold tracking-wide outfit" style={{ color: m.color }}>
                      {m.number}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-[#0142b2]">
                    {copiedKey === m.key ? <LuCheck className="text-[#027a1e]" /> : <LuCopy />}
                  </span>
                </button>
              ))}
              {banks.map((b, i) => (
                <div key={`bank-${i}`} className="flex w-full items-center gap-4 rounded-md border border-slate-200 bg-white px-4 py-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-50 text-[#0b1b4a]"><LuLandmark className="text-xl" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-400 work">{b.bankName || "Bank"}{b.branch ? ` · ${b.branch}` : ""}</span>
                    <span className="block text-base font-bold text-[#0b1b4a] outfit">{b.accountNumber}</span>
                    {b.accountName && <span className="block text-xs text-slate-500">{b.accountName}</span>}
                  </span>
                  <button type="button" onClick={() => copyToClipboard(`bank-${i}`, b.accountNumber)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-[#0142b2]">
                    {copiedKey === `bank-${i}` ? <LuCheck className="text-[#027a1e]" /> : <LuCopy />}
                  </button>
                </div>
              ))}
              </>
            ) : (
              <a
                href={`tel:${PAYMENT_CONTACT_PHONE}`}
                className="group flex items-center gap-4 rounded-md border border-blue-100 bg-blue-50/60 px-5 py-5 transition hover:border-[#0142b2]/30 hover:bg-blue-50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#0142b2] text-white shadow-sm">
                  <LuPhoneCall className="text-xl" />
                </span>
                <span>
                  <span className={`block text-sm text-slate-600 work ${bn}`}>
                    {isBn ? "পেমেন্ট নম্বর জানতে কল করুন" : "Call us for our payment number"}
                  </span>
                  <span className="block text-xl font-bold text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">
                    {PAYMENT_CONTACT_PHONE}
                  </span>
                </span>
              </a>
            )}

            <p className={`flex items-center gap-2 text-xs text-slate-500 work ${bn}`}>
              <LuShieldCheck className="shrink-0 text-[#0142b2]" />
              <span>{t("paymentMethod.reference")}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentMethod;
