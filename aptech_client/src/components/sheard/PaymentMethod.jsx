"use client";

import React, { useState, useRef } from "react";
import { LuCopy, LuCheck, LuShieldCheck, LuPhoneCall, LuCircleCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import SectionHeader from "@/components/Home/SectionHeader";
import { PAYMENT_NUMBERS, PAYMENT_CONTACT_PHONE } from "@/lib/paymentNumbers";

const METHODS = [
  { key: "bkash", name: "bKash", logo: "/images/bkash.webp", color: "#E2136E" },
  { key: "nagad", name: "Nagad", logo: "/images/nagad.png", color: "#F6921E" },
  { key: "rocket", name: "Rocket", logo: "/images/rocket.png", color: "#8C3494" },
];

const PaymentMethod = () => {
  const [copiedKey, setCopiedKey] = useState(null);
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const withNumbers = METHODS.filter((m) => PAYMENT_NUMBERS[m.key]);
  // Until real numbers are configured, show the two wallets we take payments through
  const logos = withNumbers.length ? withNumbers : METHODS.slice(0, 2);

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
    <section className="relative bg-slate-50/60 py-14 lg:py-20 border-t border-slate-100">
      <div ref={sectionRef} className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
        <SectionHeader
          badge={isBn ? "পেমেন্ট" : "Payment"}
          dot="blue"
          title={isBn ? "সহজ" : "Simple, secure"}
          titleAccent={isBn ? "পেমেন্ট" : "payment"}
          description={
            isBn
              ? "বিকাশ বা নগদে Send Money করে ভর্তি সম্পন্ন করুন।"
              : "Complete your enrolment by sending money with bKash or Nagad."
          }
          isInView={isInView}
          bengaliClass={bn}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:grid-cols-2 md:items-center"
        >
          {/* How it works */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {logos.map((m) => (
                <span key={m.key} className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
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
            {withNumbers.length > 0 ? (
              withNumbers.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => copyToClipboard(m.key, PAYMENT_NUMBERS[m.key])}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#0142b2]/30 hover:shadow-lg"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.logo} alt={m.name} className="h-7 w-7 object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-400 work">{m.name} · Send Money</span>
                    <span className="block text-lg font-extrabold tracking-wide outfit" style={{ color: m.color }}>
                      {PAYMENT_NUMBERS[m.key]}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-[#0142b2]">
                    {copiedKey === m.key ? <LuCheck className="text-[#027a1e]" /> : <LuCopy />}
                  </span>
                </button>
              ))
            ) : (
              <a
                href={`tel:${PAYMENT_CONTACT_PHONE}`}
                className="group flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-5 transition hover:border-[#0142b2]/30 hover:bg-blue-50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0142b2] text-white shadow-lg shadow-blue-900/20">
                  <LuPhoneCall className="text-xl" />
                </span>
                <span>
                  <span className={`block text-sm text-slate-600 work ${bn}`}>
                    {isBn ? "পেমেন্ট নম্বর জানতে কল করুন" : "Call us for our payment number"}
                  </span>
                  <span className="block text-xl font-extrabold text-[#0b1b4a] transition group-hover:text-[#0142b2] outfit">
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
