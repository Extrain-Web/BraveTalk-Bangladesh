"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { LuChevronLeft, LuChevronRight, LuQuote, LuPlus, LuMessageSquareQuote } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionHeader from "./SectionHeader";
import AddReviewModal from "./AddReviewModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const AVATAR_COLORS = ["#0142b2", "#e5251f", "#027a1e", "#0b1b4a"];

const SuccesHistory = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const bengaliClass = isBn ? "hind-siliguri" : "";

  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Approved reviews from the backend (real student submissions only)
  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setReviews(data.data);
    } catch {
      /* keep whatever we have */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleItems(1);
      else if (window.innerWidth < 1024) setVisibleItems(2);
      else setVisibleItems(3);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-advance one card at a time; pauses on hover
  useEffect(() => {
    if (isPaused || reviews.length <= visibleItems) return;
    const timer = setInterval(() => setStartIndex((prev) => (prev + 1) % reviews.length), 4500);
    return () => clearInterval(timer);
  }, [isPaused, visibleItems, reviews.length]);

  const handlePrev = () => setStartIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  const handleNext = () => setStartIndex((prev) => (prev + 1) % reviews.length);

  const handleNewReview = (newReview) => {
    if (newReview) setReviews((prev) => [newReview, ...prev]);
    setStartIndex(0);
  };

  const visibleReviews = Array.from(
    { length: Math.min(visibleItems, reviews.length) },
    (_, i) => reviews[(startIndex + i) % reviews.length]
  ).filter(Boolean);
  const canSlide = reviews.length > visibleItems;

  const addButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01368f] work ${bengaliClass}`}
    >
      <LuPlus className="text-base" />
      {isBn ? "আপনার রিভিউ দিন" : "Add your review"}
    </button>
  );

  return (
    <section className="relative overflow-hidden bg-white py-12 lg:py-16">

      <div ref={sectionRef} className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            align="left"
            dot="green"
            className="mb-0"
            badge={isBn ? "শিক্ষার্থীদের মতামত" : "Student reviews"}
            title={isBn ? "আমাদের শিক্ষার্থীরা" : "What our students"}
            titleAccent={isBn ? "যা বলেন" : "say"}
            description={
              isBn
                ? "ব্রেভটক বাংলাদেশে শেখার অভিজ্ঞতা — শিক্ষার্থীদের নিজের ভাষায়।"
                : "Learning at BraveTalk Bangladesh — in our students' own words."
            }
            isInView={isInView}
            bengaliClass={bengaliClass}
          />
          <div className="flex items-center gap-2">
            {canSlide && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={isBn ? "আগের রিভিউ" : "Previous review"}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0142b2] hover:text-[#0142b2]"
                >
                  <LuChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={isBn ? "পরের রিভিউ" : "Next review"}
                  className="mr-1 flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0142b2] hover:text-[#0142b2]"
                >
                  <LuChevronRight />
                </button>
              </>
            )}
            {addButton}
          </div>
        </div>

        {!loaded ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].slice(0, visibleItems).map((i) => (
              <div key={i} className="h-[230px] animate-pulse rounded-md border border-slate-200 bg-slate-50" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-2xl text-[#0142b2] shadow-sm">
              <LuMessageSquareQuote />
            </div>
            <h3 className={`mt-4 text-lg font-bold text-[#0b1b4a] outfit ${bengaliClass}`}>
              {isBn ? "এখনো কোনো রিভিউ নেই" : "No reviews yet"}
            </h3>
            <p className={`mx-auto mt-1 max-w-sm text-sm text-slate-500 work ${bengaliClass}`}>
              {isBn
                ? "আপনি কি আমাদের সাথে শিখেছেন? আপনার অভিজ্ঞতা লিখে প্রথম রিভিউটি দিন।"
                : "Have you learned with us? Share your experience and be the first to leave a review."}
            </p>
          </div>
        ) : (
          <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleReviews.map((review) => {
                  const color = AVATAR_COLORS[(review._id || review.name || "").length % AVATAR_COLORS.length];
                  const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
                  return (
                    <motion.figure
                      key={review._id || review.name}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="relative flex h-full flex-col rounded-md border border-slate-200 border-t-[3px] border-t-[#0142b2] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                    >
                      <LuQuote className="absolute right-5 top-5 text-3xl text-slate-200" />

                      {rating > 0 && (
                        <div className="mb-4 flex gap-0.5" aria-label={`${rating} / 5`}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FaStar key={i} className={`text-sm ${i <= rating ? "text-amber-400" : "text-slate-200"}`} />
                          ))}
                        </div>
                      )}

                      <blockquote className={`flex-1 text-sm leading-relaxed text-slate-600 work line-clamp-6 ${bengaliClass}`}>
                        &ldquo;{review.text}&rdquo;
                      </blockquote>

                      <figcaption className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {review.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.image} alt={review.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {(review.name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-bold text-[#0b1b4a] outfit ${bengaliClass}`}>{review.name}</p>
                            {review.role && <p className={`truncate text-xs text-slate-500 work ${bengaliClass}`}>{review.role}</p>}
                          </div>
                        </div>
                        {review.courseTag && (
                          <span className="shrink-0 whitespace-nowrap rounded-sm bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#0142b2]">
                            {review.courseTag}
                          </span>
                        )}
                      </figcaption>
                    </motion.figure>
                  );
                })}
              </AnimatePresence>
            </div>

            {canSlide && (
              <div className="mt-8 flex justify-center gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${index + 1}`}
                    onClick={() => setStartIndex(index)}
                    className={`h-1.5 rounded-sm transition-all duration-300 ${startIndex === index ? "w-8 bg-[#0142b2]" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleNewReview}
        bengaliClass={bengaliClass}
        language={language}
      />
    </section>
  );
};

export default SuccesHistory;
