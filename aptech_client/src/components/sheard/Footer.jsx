/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import React from "react";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { LuPhone, LuMail, LuMapPin, LuArrowUpRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const Footer = () => {
  const { t, language } = useLanguage();
  const { settings, getSetting } = useSettings();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";

  const phoneNumber = settings?.phoneNumber || "+880 1323-878569";
  const secondPhone = "01957-501506";
  const emailAddress = settings?.email || "bravetalkbd@gmail.com";
  const address = getSetting("address", language) || (isBn ? "দক্ষিণ বাড্ডা, ঢাকা, বাংলাদেশ" : "South Badda, Dhaka, Bangladesh");
  const whatsapp = String(settings?.whatsappNumber || "8801323878569").replace(/\D/g, "");
  const logoSrc = settings?.logo || "/images/logo.png";
  const tel = (p) => `tel:${String(p).replace(/[^0-9+]/g, "")}`;

  const year = new Date().getFullYear();
  const yearText = isBn ? year.toLocaleString("bn-BD", { useGrouping: false }) : String(year);
  const copyright = (t("footer.copyright") || "© {year} BraveTalk Bangladesh. All Rights Reserved.").replace("{year}", yearText);

  const quickLinks = [
    { to: "/", label: t("navbar.home") },
    { to: "/about", label: t("navbar.about") },
    { to: "/courses", label: t("navbar.courses") },
    { to: "/books", label: isBn ? "বই" : "Books" },
    { to: "/success-story", label: t("navbar.successHistory") },
    { to: "/mentors", label: t("navbar.mentors") },
    { to: "/notice-board", label: isBn ? "নোটিশ বোর্ড" : "Notice Board" },
    { to: "/verify-certificate", label: isBn ? "সার্টিফিকেট যাচাই" : "Verify Certificate" },
    { to: "/contact", label: t("navbar.contact") },
  ];

  const courseLinks = [
    { key: "Spoken English", label: isBn ? "স্পোকেন ইংলিশ" : "Spoken English" },
    { key: "Public Speaking", label: isBn ? "পাবলিক স্পিকিং" : "Public Speaking" },
    { key: "Leadership", label: isBn ? "লিডারশিপ" : "Leadership" },
  ];

  const formatLinks = [
    { to: "/courses?type=Online", label: isBn ? "অনলাইন লাইভ ক্লাস" : "Online live classes" },
    { to: "/courses?type=Offline", label: isBn ? "সরাসরি ক্লাস" : "In-person classes" },
    { to: "/courses?type=Recorded", label: isBn ? "রেকর্ডেড কোর্স" : "Recorded courses" },
  ];

  // Links that are still empty in settings render as inert icons
  const socialLinks = [
    { icon: FaFacebookF, href: settings?.facebookUrl || "", label: "Facebook" },
    { icon: FaYoutube, href: settings?.youtubeUrl || "", label: "YouTube" },
    { icon: FaLinkedinIn, href: settings?.linkedinUrl || "", label: "LinkedIn" },
    { icon: FaInstagram, href: settings?.instagramUrl || "", label: "Instagram" },
  ];

  const linkCls = `text-sm text-white/60 transition-colors hover:text-white work ${bn}`;
  const headCls = `mb-4 text-sm font-bold uppercase tracking-wider text-white outfit ${bn}`;

  return (
    <footer className="relative overflow-hidden bg-[#0b1b4a] text-white">
      {/* Brand accent line */}
      <div className="flex h-1 w-full">
        <span className="flex-1 bg-[#0142b2]" />
        <span className="flex-1 bg-[#e5251f]" />
        <span className="flex-1 bg-[#027a1e]" />
      </div>

      <div className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link href="/" className="inline-flex rounded-md bg-white px-4 py-3 shadow-sm" aria-label="BraveTalk Bangladesh">
              <img src={logoSrc} alt="BraveTalk Bangladesh" className="h-12 w-auto" />
            </Link>
            <p className={`mt-4 max-w-sm text-sm leading-relaxed text-white/60 work ${bn}`}>{t("footer.brandDescription")}</p>

            <div className="mt-5 flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/80 transition hover:border-white/30 hover:bg-white hover:text-[#0b1b4a]"
                  >
                    <Icon className="text-[15px]" />
                  </a>
                ) : (
                  <span
                    key={label}
                    title={label}
                    aria-label={label}
                    aria-disabled="true"
                    className="flex h-10 w-10 cursor-default items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/40"
                  >
                    <Icon className="text-[15px]" />
                  </span>
                )
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className={headCls}>{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link href={link.to} className={linkCls}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="lg:col-span-3">
            <h4 className={headCls}>{t("navbar.courses")}</h4>
            <ul className="space-y-2.5">
              {courseLinks.map((cat) => (
                <li key={cat.key}>
                  <Link href={`/courses?category=${encodeURIComponent(cat.key)}`} className={linkCls}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
              {formatLinks.map((f) => (
                <li key={f.to}>
                  <Link href={f.to} className={linkCls}>
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <h4 className={headCls}>{t("footer.contactUs")}</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                  <LuPhone className="text-sm" />
                </span>
                <span className="flex flex-col">
                  <a href={tel(phoneNumber)} className="text-sm text-white/80 transition hover:text-white work">{phoneNumber}</a>
                  <a href={tel(secondPhone)} className="text-sm text-white/80 transition hover:text-white work">{secondPhone}</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                  <LuMail className="text-sm" />
                </span>
                <a href={`mailto:${emailAddress}`} className="break-all text-sm text-white/80 transition hover:text-white work">{emailAddress}</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                  <LuMapPin className="text-sm" />
                </span>
                <span className={`pt-2 text-sm text-white/80 work ${bn}`}>{address}</span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center gap-2 rounded-md bg-[#027a1e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#026318] work ${bn}`}
            >
              <FaWhatsapp className="text-base" /> {isBn ? "হোয়াটসঅ্যাপে মেসেজ দিন" : "Chat on WhatsApp"}
              <LuArrowUpRight className="text-sm" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-[#0a1638]">
        <div className="mx-auto flex max-w-[1140px] 2xl:max-w-[1280px] flex-col items-center justify-between gap-3 px-4 sm:px-6 py-5 md:flex-row">
          <p className={`text-center text-xs sm:text-sm text-white/50 md:text-left work ${bn}`}>{copyright}</p>
          <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs sm:text-sm work ${bn}`}>
            <Link href="/terms" className="text-white/50 transition hover:text-white">
              {isBn ? "শর্তাবলি" : "Terms & Conditions"}
            </Link>
            <Link href="/privacy" className="text-white/50 transition hover:text-white">
              {isBn ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
