"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuUpload, LuStar, LuLoaderCircle } from "react-icons/lu";
import { FaStar } from "react-icons/fa";

const COURSE_TAGS = [
    "Spoken English",
    "Public Speaking",
    "Leadership",
    "Debate",
    "Communication Skills",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Read a file and downscale it to a small JPEG data URL (keeps payload tiny)
const fileToCompressedDataUrl = (file, maxSize = 240) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const AddReviewModal = ({ open, onClose, onSuccess, bengaliClass = "", language = "en" }) => {
    const bn = language === "bn";
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ name: "", role: "", courseTag: "", rating: 5, text: "" });
    const [imagePreview, setImagePreview] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    // Portal only after mount (avoids SSR hydration mismatch)
    useEffect(() => setMounted(true), []);

    // Lock body scroll while the modal is open
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, [open]);

    const reset = () => {
        setForm({ name: "", role: "", courseTag: "", rating: 5, text: "" });
        setImagePreview("");
        setError("");
    };

    const handleImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError(bn ? "শুধু ছবি ফাইল আপলোড করুন।" : "Please upload an image file.");
            return;
        }
        try {
            const dataUrl = await fileToCompressedDataUrl(file);
            setImagePreview(dataUrl);
            setError("");
        } catch {
            setError(bn ? "ছবি প্রসেস করা যায়নি।" : "Could not process the image.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.text.trim()) {
            setError(bn ? "নাম এবং রিভিউ লিখুন।" : "Please enter your name and review.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/reviews/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, image: imagePreview }),
            });
            const data = await res.json();
            if (data.success) {
                reset();
                onSuccess?.(data.data);
                onClose();
            } else {
                setError(data.message || (bn ? "কিছু ভুল হয়েছে।" : "Something went wrong."));
            }
        } catch {
            setError(bn ? "সাবমিট করা যায়নি। আবার চেষ্টা করুন।" : "Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#0b1b4a]/50 backdrop-blur-sm z-[9998]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[92%] max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h3 className={`text-lg font-extrabold text-[#0b1b4a] outfit ${bengaliClass}`}>
                                {bn ? "আপনার রিভিউ দিন" : "Add Your Review"}
                            </h3>
                            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <LuX className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {/* Photo upload */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    {imagePreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <LuStar className="text-[#0142b2] text-xl" />
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#0142b2] hover:text-[#0142b2] transition-colors ${bengaliClass}`}
                                    >
                                        <LuUpload className="text-base" />
                                        {bn ? "ছবি আপলোড করুন" : "Upload Photo"}
                                    </button>
                                    <p className={`text-[11px] text-gray-400 mt-1 ${bengaliClass}`}>{bn ? "ঐচ্ছিক · JPG/PNG" : "Optional · JPG/PNG"}</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                                </div>
                            </div>

                            {/* Name + Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-xs font-medium text-gray-600 mb-1.5 ${bengaliClass}`}>{bn ? "আপনার নাম *" : "Your Name *"}</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 transition-colors"
                                        placeholder={bn ? "যেমন: রাকিবুল হাসান" : "e.g. Rakibul Hasan"}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium text-gray-600 mb-1.5 ${bengaliClass}`}>{bn ? "পদবি / অবস্থা" : "Role / Title"}</label>
                                    <input
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 transition-colors"
                                        placeholder={bn ? "যেমন: শিক্ষার্থী, ঢাকা বিশ্ববিদ্যালয়" : "e.g. Student, University of Dhaka"}
                                    />
                                </div>
                            </div>

                            {/* Course tag */}
                            <div>
                                <label className={`block text-xs font-medium text-gray-600 mb-1.5 ${bengaliClass}`}>{bn ? "কোন কোর্স?" : "Which course?"}</label>
                                <select
                                    value={form.courseTag}
                                    onChange={(e) => setForm({ ...form, courseTag: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 transition-colors bg-white"
                                >
                                    <option value="">{bn ? "নির্বাচন করুন" : "Select a course"}</option>
                                    {COURSE_TAGS.map((tag) => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className={`block text-xs font-medium text-gray-600 mb-1.5 ${bengaliClass}`}>{bn ? "রেটিং" : "Rating"}</label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setForm({ ...form, rating: i })}
                                            onMouseEnter={() => setHoverRating(i)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-2xl transition-transform hover:scale-110"
                                        >
                                            <FaStar className={(hoverRating || form.rating) >= i ? "text-amber-400" : "text-slate-200"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Review text */}
                            <div>
                                <label className={`block text-xs font-medium text-gray-600 mb-1.5 ${bengaliClass}`}>{bn ? "আপনার রিভিউ *" : "Your Review *"}</label>
                                <textarea
                                    value={form.text}
                                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                                    rows={4}
                                    className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-[#0142b2] focus:ring-4 focus:ring-[#0142b2]/10 transition-colors ${bengaliClass}`}
                                    placeholder={bn ? "BraveTalk Bangladesh-এ আপনার অভিজ্ঞতা লিখুন..." : "Share your experience at BraveTalk Bangladesh..."}
                                    required
                                />
                            </div>

                            {error && (
                                <div className={`text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 ${bengaliClass}`}>{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0142b2] text-white rounded-full font-semibold shadow-lg shadow-blue-900/20 hover:bg-[#01368f] transition-all disabled:opacity-60 ${bengaliClass}`}
                            >
                                {loading ? (
                                    <>
                                        <LuLoaderCircle className="animate-spin" />
                                        {bn ? "সাবমিট হচ্ছে..." : "Submitting..."}
                                    </>
                                ) : (
                                    bn ? "রিভিউ সাবমিট করুন" : "Submit Review"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AddReviewModal;
