"use client";

import React, { useState, useEffect } from "react";
import { LuMail, LuPhone, LuMapPin, LuSend, LuClock, LuArrowRight, LuCircleCheck, LuExternalLink } from "react-icons/lu";
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { CONTACT_DEFAULTS } from "@/lib/siteContent/contactContent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// deep-merge saved content over defaults so missing fields always fall back
const mergeContent = (def, got) => {
  if (Array.isArray(def)) return Array.isArray(got) ? got : def;
  if (def && typeof def === "object") {
    const out = { ...def };
    for (const k of Object.keys(def)) out[k] = mergeContent(def[k], got?.[k]);
    return out;
  }
  return got === undefined || got === null || got === "" ? def : got;
};

const digits = (v) => String(v || "").replace(/[^0-9+]/g, "");

const ContactPage = () => {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const isBn = language === "bn";
  const bn = isBn ? "hind-siliguri" : "";
  const L = (en, bnText) => (isBn ? bnText : en);

  // ── Dynamic content (Site Content → Contact page) with default fallbacks ──
  const [content, setContent] = useState(CONTACT_DEFAULTS);
  useEffect(() => {
    fetch(`${API_URL}/api/site-content/contact`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.content) setContent(mergeContent(CONTACT_DEFAULTS, d.data.content));
      })
      .catch(() => {});
  }, []);
  const { hero, info, social, map } = content;
  const branches = content.branches || [];

  const email = info.email || settings?.email || "bravetalkbd@gmail.com";
  const phone = info.phone || settings?.phoneNumber || "01323878569";
  const whatsappNumber = digits(social.whatsapp || settings?.whatsappNumber || "8801323878569").replace(/^\+/, "");
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  // ── Contact form → POST /api/contacts/create ──
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/contacts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setMessageSent(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(data.message || L("Something went wrong. Please try again.", "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।"));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(L("Failed to send message. Please try again later.", "মেসেজ পাঠানো যায়নি। পরে আবার চেষ্টা করুন।"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const contactInfo = [
    { icon: LuPhone, title: L("Call us", "কল করুন"), value: phone, link: `tel:${digits(phone)}`, tint: "bg-blue-50 text-[#0142b2]" },
    { icon: FaWhatsapp, title: "WhatsApp", value: `+${whatsappNumber}`, link: whatsappLink, external: true, tint: "bg-emerald-50 text-[#027a1e]" },
    { icon: LuMail, title: L("Email us", "ইমেইল করুন"), value: email, link: `mailto:${email}`, tint: "bg-red-50 text-[#e5251f]" },
    { icon: LuMapPin, title: L("Visit us", "আমাদের ঠিকানা"), value: isBn ? info.visitTextBn : info.visitText, link: "#map", tint: "bg-blue-50 text-[#0142b2]" },
    { icon: LuClock, title: L("Office hours", "অফিস সময়"), value: isBn ? info.officeHoursBn : info.officeHours, link: null, tint: "bg-emerald-50 text-[#027a1e]" },
  ];

  // Empty links stay visible but inert (rendered as plain, dimmed tiles)
  const socialLinks = [
    { icon: FaFacebookF, href: social.facebook || settings?.facebookUrl, label: "Facebook", color: "text-[#1877F2]" },
    { icon: FaYoutube, href: social.youtube || settings?.youtubeUrl, label: "YouTube", color: "text-[#FF0000]" },
    { icon: FaLinkedinIn, href: social.linkedin || settings?.linkedinUrl, label: "LinkedIn", color: "text-[#0A66C2]" },
    { icon: FaWhatsapp, href: whatsappLink, label: "WhatsApp", color: "text-[#25D366]" },
  ];

  const inputClass = `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0b1b4a] outline-none transition focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 work ${bn}`;
  const labelClass = `mb-1.5 block text-sm font-medium text-slate-700 work ${bn}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Success modal */}
      {messageSent && (
        <>
          <div className="fixed inset-0 z-[9998] bg-[#0b1b4a]/50 backdrop-blur-sm" onClick={() => setMessageSent(false)} />
          <div className="fixed left-1/2 top-1/2 z-[9999] w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <LuCircleCheck className="text-3xl text-[#027a1e]" />
            </div>
            <h3 className={`mb-2 text-xl font-bold text-[#0b1b4a] outfit ${bn}`}>{L("Message sent!", "মেসেজ পাঠানো হয়েছে!")}</h3>
            <p className={`mb-6 text-sm text-slate-500 work ${bn}`}>
              {L("Thank you for reaching out. We will get back to you soon.", "যোগাযোগ করার জন্য ধন্যবাদ। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।")}
            </p>
            <button
              type="button"
              onClick={() => setMessageSent(false)}
              className={`rounded-full bg-[#0142b2] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#01368f] work ${bn}`}
            >
              {L("Close", "বন্ধ করুন")}
            </button>
          </div>
        </>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-red-100/60 blur-[120px]" />
          <div className="absolute -top-10 right-[-80px] h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-[120px]" />
          <div className="absolute bottom-[-180px] left-1/3 h-[380px] w-[380px] rounded-full bg-emerald-100/60 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 pt-10 pb-24 sm:pt-14 sm:pb-28 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#027a1e]" />
            <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{isBn ? hero.badgeBn : hero.badge}</span>
          </div>
          <h1 className={`text-[30px] sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
            {isBn ? hero.titleBn : hero.title}
            <span className="text-[#e5251f]">{isBn ? hero.highlightBn : hero.highlight}</span>
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>
            {isBn ? hero.subtitleBn : hero.subtitle}
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="relative z-10 mx-auto -mt-16 max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tint}`}>
                  <Icon className="text-xl" />
                </span>
                <p className={`mt-4 text-xs font-medium uppercase tracking-wider text-slate-400 work ${bn}`}>{item.title}</p>
                <p className={`mt-1 break-words text-sm font-semibold text-[#0b1b4a] outfit ${bn}`}>{item.value}</p>
              </>
            );
            const cls = "block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl";
            return item.link ? (
              <a
                key={item.title}
                href={item.link}
                className={cls}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {inner}
              </a>
            ) : (
              <div key={item.title} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* Form + office/map */}
      <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0142b2]" />
              <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{L("Send a message", "মেসেজ পাঠান")}</span>
            </div>
            <h2 className={`mt-4 text-2xl sm:text-3xl font-extrabold text-[#0b1b4a] outfit ${bn}`}>
              {L("How can we ", "কীভাবে ")}
              <span className="text-[#0142b2]">{L("help you?", "সাহায্য করতে পারি?")}</span>
            </h2>
            <p className={`mt-2 text-sm text-slate-500 work ${bn}`}>
              {L("Ask about courses, batches, books or anything else. We usually reply within office hours.", "কোর্স, ব্যাচ, বই বা যেকোনো বিষয়ে জানতে চান। আমরা সাধারণত অফিস সময়ের মধ্যে উত্তর দিই।")}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>{L("Your name", "আপনার নাম")}</label>
                  <input type="text" id="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder={L("Full name", "পুরো নাম")} required />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>{L("Email address", "ইমেইল ঠিকানা")}</label>
                  <input type="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className={labelClass}>{L("Subject", "বিষয়")}</label>
                <input type="text" id="subject" value={formData.subject} onChange={handleChange} className={inputClass} placeholder={L("What is it about?", "কী বিষয়ে?")} required />
              </div>
              <div>
                <label htmlFor="message" className={labelClass}>{L("Message", "মেসেজ")}</label>
                <textarea id="message" rows="5" value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder={L("Write your message here...", "আপনার মেসেজ এখানে লিখুন...")} required />
              </div>
              {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-[#e5251f] work">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#0142b2] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#01368f] disabled:cursor-not-allowed disabled:opacity-60 work ${bn}`}
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {L("Sending...", "পাঠানো হচ্ছে...")}
                  </>
                ) : (
                  <>
                    <LuSend className="text-base" /> {L("Send message", "মেসেজ পাঠান")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Office + map */}
          <div className="flex flex-col gap-6">
            {branches.map((branch, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#e5251f]">
                    <LuMapPin className="text-xl" />
                  </span>
                  <div className="min-w-0">
                    <h3 className={`text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? branch.nameBn : branch.nameEn}</h3>
                    <p className={`mt-0.5 text-sm text-slate-500 work ${bn}`}>{isBn ? branch.addressBn : branch.addressEn}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(branch.phones || []).filter(Boolean).map((p) => (
                        <a
                          key={p}
                          href={`tel:${digits(p)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2]"
                        >
                          <LuPhone className="text-[#0142b2]" /> {p}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {map?.embedUrl && (
              <div id="map" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  src={map.embedUrl}
                  width="100%"
                  height="300"
                  className="block border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BraveTalk Bangladesh location"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.visitText || "South Badda, Dhaka")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm font-semibold text-[#0142b2] transition hover:bg-slate-50 work ${bn}`}
                >
                  {L("Open in Google Maps", "গুগল ম্যাপে খুলুন")} <LuExternalLink />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Social + quick help */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className={`text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? social.followTitleBn : social.followTitle}</h3>
            <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>{isBn ? social.followDescBn : social.followDesc}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map(({ icon: Icon, href, label, color }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  >
                    <Icon className={`text-lg ${color}`} />
                  </a>
                ) : (
                  <span
                    key={label}
                    aria-label={`${label} (${L("coming soon", "শীঘ্রই আসছে")})`}
                    title={L("Coming soon", "শীঘ্রই আসছে")}
                    className="flex h-12 w-12 cursor-default items-center justify-center rounded-xl border border-slate-200 bg-slate-50 opacity-40"
                  >
                    <Icon className="text-lg text-slate-500" />
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/50 blur-[60px]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#25D366] shadow-sm">
                  <FaWhatsapp className="text-2xl" />
                </span>
                <div>
                  <h3 className={`text-lg font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? social.quickTitleBn : social.quickTitle}</h3>
                  <p className={`mt-0.5 text-sm text-slate-600 work ${bn}`}>{isBn ? social.quickDescBn : social.quickDesc}</p>
                </div>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#027a1e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#026318] hover:gap-3 work ${bn}`}
              >
                <FaWhatsapp /> {L("Chat on WhatsApp", "WhatsApp-এ চ্যাট করুন")} <LuArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
