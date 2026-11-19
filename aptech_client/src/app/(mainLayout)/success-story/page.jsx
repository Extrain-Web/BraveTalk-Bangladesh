"use client";

import React, { useEffect, useState, useCallback } from "react";
import { LuArrowRight, LuPlus, LuQuote, LuStar, LuMessageSquareQuote } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import AddReviewModal from "@/components/Home/AddReviewModal";
import PhotoBanner from "@/components/Shared/PhotoBanner";
import { useSiteImage } from "@/lib/siteImages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const AVATAR_COLORS = ["bg-[#0142b2]", "bg-[#e5251f]", "bg-[#027a1e]", "bg-[#0b1b4a]"];

const SuccessStoryPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bengaliClass = isBn ? "hind-siliguri" : "";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const ctaPhoto = useSiteImage("ctaImage");

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setReviews(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadReviews();
  }, [loadReviews]);

  // Real numbers only — computed from the published reviews
  const rated = reviews.filter((r) => Number(r.rating) > 0);
  const avg = rated.length ? rated.reduce((s, r) => s + Number(r.rating), 0) / rated.length : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PhotoBanner
        slot="pageBanner"
        eyebrow={isBn ? "শিক্ষার্থীদের কথা" : "In our students' words"}
        crumbs={[{ label: isBn ? "সাফল্যের গল্প" : "Success stories" }]}
        title={
          isBn ? (
            <>শিক্ষার্থীদের <span className="text-[#ff6b63]">সাফল্যের গল্প</span></>
          ) : (
            <>Student <span className="text-[#ff6b63]">Success Stories</span></>
          )
        }
        subtitle={
          isBn
            ? "ব্রেভটক বাংলাদেশের শিক্ষার্থীরা নিজেরাই বলছে — কীভাবে তারা জড়তা কাটিয়ে আত্মবিশ্বাসের সাথে কথা বলতে শিখেছে।"
            : "Hear from BraveTalk Bangladesh students about how they overcame hesitation and learned to speak with confidence."
        }
      />

      {/* Toolbar: add review + rating summary */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-[1140px] 2xl:max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
          {rated.length > 0 ? (
            <span className={`inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 work ${bengaliClass}`}>
              <LuStar className="text-amber-500" />
              <strong className="font-bold text-[#0b1b4a]">{avg.toFixed(1)}</strong>
              <span>
                {isBn ? `· ${reviews.length}টি রিভিউ` : `· ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
              </span>
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work ${bengaliClass}`}
          >
            <LuPlus className="text-base" />
            {isBn ? "আপনার রিভিউ দিন" : "Add your review"}
          </button>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-60 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-2xl text-[#0142b2] shadow-sm">
              <LuMessageSquareQuote />
            </div>
            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bengaliClass}`}>
              {isBn ? "এখনো কোনো রিভিউ নেই" : "No reviews yet"}
            </h3>
            <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bengaliClass}`}>
              {isBn ? "প্রথম রিভিউটি আপনিই দিন!" : "Be the first to share your experience!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => {
              const color = AVATAR_COLORS[(review._id || review.name || "").length % AVATAR_COLORS.length];
              return (
                <motion.div
                  key={review._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                  className="relative flex flex-col rounded-md border border-slate-200 border-t-[3px] border-t-[#0142b2] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <LuQuote className="absolute right-5 top-5 text-4xl text-[#0142b2]/10" />

                  <div className="mb-4 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar key={i} className={`text-sm ${i <= review.rating ? "text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </div>

                  <p className={`mb-5 flex-1 text-sm leading-relaxed text-slate-600 work ${bengaliClass}`}>
                    &ldquo;{review.text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {review.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.image} alt={review.name} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}>
                          {(review.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold text-[#0b1b4a] ${bengaliClass}`}>{review.name}</p>
                        {review.role && <p className={`truncate text-xs text-slate-400 ${bengaliClass}`}>{review.role}</p>}
                      </div>
                    </div>
                    {review.courseTag && (
                      <span className="flex-shrink-0 whitespace-nowrap rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0142b2]">
                        {review.courseTag}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="relative mt-14 overflow-hidden rounded-md bg-[#0b1b4a] px-6 py-12 text-center sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ctaPhoto} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#0b1b4a]/80" />
          <div className="relative">
            <h3 className={`text-2xl sm:text-3xl font-bold text-white outfit ${bengaliClass}`}>
              {isBn ? "পরবর্তী সাফল্যের গল্প আপনার হতে পারে!" : "Your success story could be next!"}
            </h3>
            <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-[15px] text-white/80 work ${bengaliClass}`}>
              {isBn
                ? "আজই একটি কোর্সে যোগ দিন এবং আত্মবিশ্বাসের সাথে কথা বলার যাত্রা শুরু করুন।"
                : "Join a course today and start your journey to speaking with confidence."}
            </p>
            <Link
              href="/courses"
              className={`mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#e5251f] to-[#0142b2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md work ${bengaliClass}`}
            >
              {isBn ? "কোর্স দেখুন" : "Explore courses"} <LuArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <AddReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newReview) => setReviews((prev) => [newReview, ...prev])}
        bengaliClass={bengaliClass}
        language={language}
      />
    </div>
  );
};

export default SuccessStoryPage;
