"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { LuMapPin, LuPhone, LuMail, LuNavigation, LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import SectionHeader from "./SectionHeader";

const FALLBACK = {
  phones: ["+880 1323-878569", "01957-501506"],
  email: "bravetalkbd@gmail.com",
  addressEn: "South Badda, Dhaka, Bangladesh",
  addressBn: "দক্ষিণ বাড্ডা, ঢাকা, বাংলাদেশ",
};

const telHref = (p) => `tel:${String(p).replace(/[^0-9+]/g, "")}`;

// "Visit us" strip — the single South Badda office, phones, email and a map.
const Concerns = () => {
  const { language } = useLanguage();
  const { settings, getSetting } = useSettings();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const mainPhone = settings?.phoneNumber || FALLBACK.phones[0];
  const digits = (p) => String(p).replace(/\D/g, "").slice(-10);
  const phones = [mainPhone, ...FALLBACK.phones.filter((p) => digits(p) !== digits(mainPhone))];
  const email = settings?.email || FALLBACK.email;
  const address = getSetting?.("address", language) || (isBn ? FALLBACK.addressBn : FALLBACK.addressEn);
  // Map always uses the English address (Google geocodes it reliably)
  const mapQuery = encodeURIComponent(settings?.address || FALLBACK.addressEn);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <section className="relative bg-white py-12 lg:py-16">
      <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
        <SectionHeader
          badge={isBn ? "আমাদের অফিস" : "Visit us"}
          dot="red"
          title={isBn ? "সরাসরি চলে আসুন" : "Come say hello in"}
          titleAccent={isBn ? "দক্ষিণ বাড্ডায়" : "South Badda"}
          description={
            isBn
              ? "সরাসরি ক্লাস, ভর্তি বা যেকোনো প্রশ্নের জন্য আমাদের অফিসে আসুন অথবা ফোন করুন।"
              : "Drop by for in-person classes, admission or any question — or just give us a call."
          }
          isInView={isInView}
          bengaliClass={bn}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]"
        >
          {/* Info */}
          <div className="flex flex-col p-6 sm:p-8">
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#e5251f]">
                  <LuMapPin className="text-xl" />
                </span>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>{isBn ? "ঠিকানা" : "Address"}</p>
                  <p className={`mt-0.5 text-[15px] font-semibold text-[#0b1b4a] work ${bn}`}>{address}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0142b2]">
                  <LuPhone className="text-xl" />
                </span>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>{isBn ? "ফোন" : "Phone"}</p>
                  <div className="mt-0.5 flex flex-col">
                    {phones.map((p) => (
                      <a key={p} href={telHref(p)} className="text-[15px] font-semibold text-[#0b1b4a] transition hover:text-[#0142b2] work">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[#027a1e]">
                  <LuMail className="text-xl" />
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>{isBn ? "ইমেইল" : "Email"}</p>
                  <a href={`mailto:${email}`} className="mt-0.5 block break-all text-[15px] font-semibold text-[#0b1b4a] transition hover:text-[#0142b2] work">
                    {email}
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-7 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work ${bn}`}
              >
                <LuNavigation /> {isBn ? "ম্যাপে দেখুন" : "Get directions"}
              </a>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-slate-300 hover:shadow work ${bn}`}
              >
                {isBn ? "মেসেজ পাঠান" : "Send a message"} <LuArrowRight />
              </Link>
            </div>
          </div>

          {/* Map */}
          <div className="relative min-h-[260px] border-t border-slate-200 bg-slate-100 lg:min-h-[360px] lg:border-l lg:border-t-0">
            <iframe
              title={isBn ? "ব্রেভটক বাংলাদেশ অফিসের ম্যাপ" : "Map of the BraveTalk Bangladesh office"}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Concerns;
