"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  FiShoppingCart, FiCheck, FiArrowLeft, FiVideo,
  FiAward, FiShield, FiLoader, FiCopy, FiTag, FiX
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { LuBookOpen, LuUsers, LuClock } from "react-icons/lu";
import LoginRequiredModal from "@/components/sheard/LoginRequiredModal";
import { usePaymentInfo } from "@/lib/paymentNumbers";
import ManualPaymentAccounts from "@/components/Shared/ManualPaymentAccounts";
import { isFreeCourse } from "@/lib/coursePrice";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api";

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.courseid;
  const router = useRouter();
  const { t, language } = useLanguage();
  const bengaliClass = language === "bn" ? "hind-siliguri" : "";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [processing, setProcessing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Course coupon — applied once at first checkout (reduces the total fee)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, ... }
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null); // { type: 'ok' | 'err', text }

  // Manual payment form
  const [manualForm, setManualForm] = useState({
    senderNumber: "",
    transactionId: "",
    paymentType: "bkash",
  });

  // Enabled accounts from Admin → Payment Info; default "Payment via" to the first one
  const payInfo = usePaymentInfo();
  const firstPayVia = payInfo.payVia[0]?.key;
  useEffect(() => {
    if (firstPayVia && !payInfo.payVia.some((p) => p.key === manualForm.paymentType)) {
      setManualForm((f) => ({ ...f, paymentType: firstPayVia }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPayVia]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();
        if (data.success) {
          const found = data.data.find((c) => c.id == courseId);
          // Free courses have no checkout — enroll from the course page instead
          if (found && isFreeCourse(found)) {
            router.replace(`/courses/${found.id}`);
            return;
          }
          setCourse(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // চেকআউটের টাকার হিসাব — একবারেই পুরো টাকা (offer price থাকলে সেটা, না হলে fee), coupon ছাড় বাদ দিয়ে
  const computeAmounts = () => {
    const feeNum = parseInt(String(course?.fee || "").replace(/[^0-9]/g, "")) || 0;
    const offerNum = course?.offerPrice ? (parseInt(String(course.offerPrice).replace(/[^0-9]/g, "")) || 0) : 0;
    const baseTotal = offerNum > 0 && (feeNum === 0 || offerNum < feeNum) ? offerNum : feeNum; // offer ছাড় সহ base মোট
    const couponDiscount = appliedCoupon ? Math.min(Number(appliedCoupon.discountAmount) || 0, baseTotal) : 0;
    const totalNum = Math.max(0, baseTotal - couponDiscount);  // coupon-পরবর্তী চূড়ান্ত মোট ফি (পুরোটাই এখন দিতে হবে)
    return { feeNum, offerNum, baseTotal, couponDiscount, totalNum };
  };

  // ── Apply / remove coupon (validate against the base total) ──
  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const token = localStorage.getItem("token");
    if (!token) { setShowLoginModal(true); return; }
    const { baseTotal } = computeAmounts();
    setCouponChecking(true);
    setCouponMsg(null);
    try {
      const res = await fetch(`${API}/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, amount: baseTotal }),
      });
      const data = await res.json();
      if (data.success && data.data?.valid) {
        setAppliedCoupon(data.data);
        setCouponMsg({ type: "ok", text: language === "bn" ? `কুপন প্রয়োগ হয়েছে — ৳${data.data.discountAmount} ছাড়!` : `Applied — ৳${data.data.discountAmount} off!` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: "err", text: data.message || (language === "bn" ? "কুপন কাজ করেনি" : "Invalid coupon") });
      }
    } catch {
      setCouponMsg({ type: "err", text: language === "bn" ? "নেটওয়ার্ক সমস্যা" : "Network error" });
    } finally { setCouponChecking(false); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(""); setCouponMsg(null); };

  // After a purchase → shared success page (dashboard + home links)
  const goSuccess = (status, method, ref = "") => {
    const { totalNum } = computeAmounts();
    const p = new URLSearchParams({
      type: "course", status, title: course?.title || "", amount: String(totalNum),
      method: method || "", ref, item: `/courses/${course?.id}`,
    });
    router.push(`/order-success?${p.toString()}`);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setProcessing(true);
    const { totalNum } = computeAmounts();
    const payNow = totalNum; // full payment only — no installments

    try {
      if (paymentMethod === "bkash") {
        const res = await fetch(`${API}/payment/bkash/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId: course._id, amount: payNow, totalFee: totalNum, couponCode: appliedCoupon?.code, couponDiscount: appliedCoupon?.discountAmount }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.isDemo) {
            const execRes = await fetch(`${API}/payment/bkash/demo-complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ paymentID: data.data.paymentID, courseId: course._id, amount: payNow, totalFee: totalNum }),
            });
            const execData = await execRes.json();
            if (execData.success) {
              goSuccess("active", "bkash", data.data.paymentID || "");
            } else {
              alert(execData.message || "Payment failed");
            }
          } else if (data.data.bkashURL) {
            window.location.href = data.data.bkashURL;
          }
        } else {
          alert(data.message || "Payment initiation failed");
        }
      } else if (paymentMethod === "manual") {
        // Manual payment submission
        if (!manualForm.senderNumber || !manualForm.transactionId) {
          alert(language === "bn" ? "সব তথ্য দিন" : "Please fill all fields");
          setProcessing(false);
          return;
        }

        const res = await fetch(`${API}/payment/manual/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            courseId: course._id,
            amount: payNow,
            totalFee: totalNum,
            courseName: course.title,
            senderNumber: manualForm.senderNumber,
            transactionId: manualForm.transactionId,
            paymentType: manualForm.paymentType,
            couponCode: appliedCoupon?.code,
            couponDiscount: appliedCoupon?.discountAmount,
          }),
        });
        const data = await res.json();
        if (data.success) {
          goSuccess("pending", manualForm.paymentType, manualForm.transactionId);
        } else {
          alert(data.message || "Submission failed. Please contact support.");
        }
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-[#0142b2]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="text-center">
          <h2 className={`mb-2 text-2xl font-bold text-[#0b1b4a] outfit ${bengaliClass}`}>{language === "bn" ? "কোর্সটি পাওয়া যায়নি" : "Course not found"}</h2>
          <Link href="/courses" className={`mt-3 inline-flex items-center gap-2 rounded-md bg-[#0142b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01368f] ${bengaliClass}`}>{language === "bn" ? "সব কোর্স দেখুন" : "Browse courses"}</Link>
        </div>
      </div>
    );
  }

  const { feeNum, baseTotal, couponDiscount, totalNum } = computeAmounts();
  const payNow = totalNum;

  return (
    <div className="relative min-h-screen bg-slate-50 work">
      {/* Top bar */}
      <div className="relative z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-500 transition hover:text-[#0142b2]"
            >
              <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className={`font-medium text-sm ${bengaliClass}`}>
                {language === "bn" ? "ফিরে যান" : "Back to Course"}
              </span>
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#027a1e]">
                <FiShield size={15} />
                <span className={`text-xs font-semibold ${bengaliClass}`}>{language === "bn" ? "নিরাপদ চেকআউট" : "Secure checkout"}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                <FiCheck size={15} />
                <span className={`text-xs font-semibold ${bengaliClass}`}>{language === "bn" ? "অ্যাডমিন যাচাইকৃত পেমেন্ট" : "Admin-verified payment"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 lg:py-8">
        <div>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className={`border-l-4 border-[#e5251f] pl-3 text-2xl sm:text-3xl font-bold outfit text-[#0b1b4a] ${bengaliClass}`}>
              {language === "bn" ? "চেকআউট" : "Checkout"}
            </h1>
            <p className={`text-slate-500 mt-1 pl-4 text-sm ${bengaliClass}`}>
              {language === "bn" ? "একবার পুরো পেমেন্ট করে কোর্সে এনরোল করুন" : "One-time full payment — access opens once your payment is verified"}
            </p>
          </div>

          <div className="grid items-start lg:grid-cols-12 gap-6">

            {/* ═══════ LEFT COLUMN ═══════ */}
            <div className="lg:col-span-8 space-y-5">

              {/* Course Summary Card */}
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex gap-4">
                  <div className="w-28 h-20 rounded overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-sm bg-[#0142b2] px-2 py-0.5 text-[10px] font-bold text-white">
                        {course.type}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0b1b4a] outfit line-clamp-2 leading-snug">{course.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                      {Number(course.durationMonth) > 0 && <span className="flex items-center gap-1"><LuClock size={12} /> {course.durationMonth} {language === "bn" ? "মাস" : "months"}</span>}
                      {Number(course.lectures) > 0 && <span className="flex items-center gap-1"><FiVideo size={12} /> {course.lectures} {language === "bn" ? "লেকচার" : "lectures"}</span>}
                      {course.totalStudentsEnroll > 0 && <span className="flex items-center gap-1"><LuUsers size={12} /> {course.totalStudentsEnroll} enrolled</span>}
                    </div>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[#0b1b4a] outfit">{course.fee}</p>
                  </div>
                </div>
              </div>

              {/* ═══ Payment Method Selection ═══ */}
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className={`border-l-4 border-[#e5251f] pl-3 text-base font-bold text-[#0b1b4a] mb-4 outfit ${bengaliClass}`}>
                  {language === "bn" ? "পেমেন্ট মেথড নির্বাচন করুন" : "Select Payment Method"}
                </h3>

                {/* Method Tabs — bKash disabled until the payment API is live */}
                <div className="flex gap-3 mb-5">
                  {[
                    { id: "bkash", name: "bKash", desc: "Instant Payment", emoji: "🫰", disabled: true },
                    { id: "manual", name: "Manual", desc: "Send & Submit Info", emoji: "🏦", disabled: false },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        disabled={method.disabled}
                        onClick={() => !method.disabled && setPaymentMethod(method.id)}
                        className={`relative flex-1 flex items-center gap-3 p-4 rounded-md border-2 transition-all duration-200 ${
                          method.disabled
                            ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                            : active
                              ? "border-[#0142b2] bg-blue-50/60 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-2xl ${method.disabled ? "grayscale opacity-70" : ""}`}>{method.emoji}</span>
                        <div className="text-left">
                          <p className="font-bold text-[#0b1b4a] text-sm">{method.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {method.disabled ? (language === "bn" ? "শীঘ্রই আসছে" : "Coming soon") : method.desc}
                          </p>
                        </div>
                        {method.disabled ? (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-slate-200 text-slate-500">
                            {language === "bn" ? "শীঘ্রই" : "Soon"}
                          </span>
                        ) : (
                          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            active ? "border-[#0142b2] bg-[#0142b2]" : "border-slate-200"
                          }`}>
                            {active && <FiCheck className="text-white" size={11} />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* bKash Payment Content */}
                {paymentMethod === "bkash" && (
                  <div className="rounded-md border border-pink-100 bg-pink-50/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🫰</span>
                      <h4 className="font-bold text-slate-800 text-sm">bKash Payment</h4>
                    </div>
                    <p className={`text-xs text-slate-500 mb-4 ${bengaliClass}`}>
                      {language === "bn"
                        ? "bKash এর মাধ্যমে নিরাপদে পেমেন্ট করুন। বাটনে ক্লিক করলে bKash পেমেন্ট পেজে নিয়ে যাবে।"
                        : "You will be redirected to bKash secure payment page. Complete the payment there and you'll get instant course access."}
                    </p>
                    <div className="flex items-center gap-3 p-3 rounded bg-white border border-slate-200">
                      <FiCheck className="text-green-500" size={16} />
                      <span className="text-xs text-slate-600">Instant enrollment after successful payment</span>
                    </div>
                  </div>
                )}

                {/* Manual Payment Content */}
                {paymentMethod === "manual" && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-5 space-y-5">
                    {/* Step 1: Send Money */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-[#0142b2] text-white text-xs font-bold flex items-center justify-center">1</span>
                        <h4 className={`font-bold text-slate-800 text-sm ${bengaliClass}`}>
                          {language === "bn" ? "টাকা পাঠান" : "Send Money"}
                        </h4>
                      </div>
                      <ManualPaymentAccounts amount={payNow} isBn={language === "bn"} bn={bengaliClass} />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">then</span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Step 2: Fill Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-[#0142b2] text-white text-xs font-bold flex items-center justify-center">2</span>
                        <h4 className={`font-bold text-slate-800 text-sm ${bengaliClass}`}>
                          {language === "bn" ? "তথ্য দিন" : "Fill Payment Info"}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {/* Payment Type */}
                        <div>
                          <label className={`text-xs font-semibold text-slate-600 mb-1 block ${bengaliClass}`}>
                            {language === "bn" ? "পেমেন্ট মাধ্যম" : "Payment Via"}
                          </label>
                          <div className="flex gap-2">
                            {(payInfo.payVia.length ? payInfo.payVia : [{ key: "bkash", label: "bKash" }, { key: "nagad", label: "Nagad" }, { key: "rocket", label: "Rocket" }]).map(({ key: type, label }) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setManualForm({ ...manualForm, paymentType: type })}
                                className={`px-4 py-2 rounded-md text-xs font-bold border transition ${
                                  manualForm.paymentType === type
                                    ? "border-[#0142b2] bg-blue-50 text-[#0142b2]"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sender Number */}
                        <div>
                          <label className={`text-xs font-semibold text-slate-600 mb-1 block ${bengaliClass}`}>
                            {language === "bn" ? "যে নম্বর থেকে পাঠিয়েছেন" : "Sender Number"}
                          </label>
                          <input
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={manualForm.senderNumber}
                            onChange={(e) => setManualForm({ ...manualForm, senderNumber: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white text-sm focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10 outline-none transition"
                          />
                        </div>

                        {/* Transaction ID */}
                        <div>
                          <label className={`text-xs font-semibold text-slate-600 mb-1 block ${bengaliClass}`}>
                            {language === "bn" ? "ট্রানজেকশন আইডি" : "Transaction ID"}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. TXN8K4F2J9D"
                            value={manualForm.transactionId}
                            onChange={(e) => setManualForm({ ...manualForm, transactionId: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white text-sm focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10 outline-none transition font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════ RIGHT COLUMN — Order Summary ═══════ */}
            <div className="lg:col-span-4">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                <h3 className={`border-l-4 border-[#e5251f] pl-3 text-base font-bold text-[#0b1b4a] mb-4 outfit ${bengaliClass}`}>
                  {language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}
                </h3>

                {/* Course Title */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-[#0b1b4a] line-clamp-2">{course.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{course.type}{Number(course.durationMonth) > 0 ? ` • ${course.durationMonth} ${language === "bn" ? "মাস" : "months"}` : ""}</p>
                </div>

                {/* Coupon (applied once at checkout) */}
                <div className="py-4 border-b border-slate-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50/60 px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FiTag className="text-green-600 shrink-0" size={14} />
                        <span className="font-mono font-bold text-sm text-green-700 truncate">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-green-600 shrink-0">−৳{Number(appliedCoupon.discountAmount).toLocaleString("en-IN")}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-slate-400 hover:text-rose-500 transition shrink-0" title="Remove coupon">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder={language === "bn" ? "কুপন কোড থাকলে দিন" : "Coupon code"}
                        className="flex-1 min-w-0 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm font-mono uppercase focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10 outline-none transition"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponChecking || !couponInput.trim()}
                        className="px-4 py-2 rounded-md bg-[#0b1b4a] text-white text-xs font-bold hover:bg-[#0142b2] disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 flex items-center justify-center"
                      >
                        {couponChecking ? <FiLoader className="animate-spin" size={14} /> : (language === "bn" ? "প্রয়োগ" : "Apply")}
                      </button>
                    </div>
                  )}
                  {couponMsg && (
                    <p className={`text-[11px] mt-1.5 ${couponMsg.type === "ok" ? "text-green-600" : "text-rose-500"}`}>{couponMsg.text}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="py-4 space-y-2.5 border-b border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className={`text-slate-500 ${bengaliClass}`}>{language === "bn" ? "কোর্স ফি" : "Course fee"}</span>
                    <span className="font-semibold text-slate-700">{course.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={`text-slate-500 ${bengaliClass}`}>{language === "bn" ? "প্ল্যাটফর্ম ফি" : "Platform fee"}</span>
                    <span className="font-semibold text-[#027a1e]">{language === "bn" ? "ফ্রি" : "FREE"}</span>
                  </div>
                  {baseTotal < feeNum && (
                    <div className="flex justify-between text-sm">
                      <span className={`text-slate-500 ${bengaliClass}`}>{language === "bn" ? "ছাড়" : "Discount"}</span>
                      <span className="font-semibold text-green-600">
                        - ৳{(feeNum - baseTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        {language === "bn" ? "কুপন" : "Coupon"} <span className="font-mono text-[10px] text-slate-400">({appliedCoupon?.code})</span>
                      </span>
                      <span className="font-semibold text-green-600">- ৳{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                {/* Total / Pay now */}
                <div className="py-4 border-b border-slate-100 space-y-2">
                  <div className="flex justify-between items-center pt-1">
                    <span className={`text-base font-bold text-[#0b1b4a] ${bengaliClass}`}>
                      {language === "bn" ? "মোট (একবারেই পুরো পেমেন্ট)" : "Total (one-time full payment)"}
                    </span>
                    <span className="text-2xl font-bold text-[#0142b2] outfit">
                      ৳{payNow.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
                  <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                    agreed ? "bg-[#0142b2] border-[#0142b2]" : "border-slate-300"
                  }`}>
                    {agreed && <FiCheck className="text-white" size={10} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="hidden"
                  />
                  <span className={`text-[11px] text-slate-500 leading-relaxed ${bengaliClass}`}>
                    {language === "bn"
                      ? "আমি শর্তাবলী এবং রিফান্ড পলিসি মেনে নিচ্ছি"
                      : "I agree to the terms, conditions and refund policy"}
                  </span>
                </label>

                {/* Pay Button */}
                <button
                  onClick={handleCheckout}
                  disabled={!agreed || processing}
                  className={`w-full mt-5 py-3.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    !agreed || processing
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#e5251f] to-[#0142b2] text-white shadow-sm hover:shadow-md hover:brightness-105"
                  } ${bengaliClass}`}
                >
                  {processing ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      {language === "bn" ? "প্রসেসিং..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <FiShoppingCart size={16} />
                      {paymentMethod === "bkash"
                        ? (language === "bn" ? "bKash দিয়ে পেমেন্ট করুন" : "Pay with bKash")
                        : (language === "bn" ? "পেমেন্ট তথ্য জমা দিন" : "Submit Payment Info")}
                    </>
                  )}
                </button>

                {/* Trust */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-5">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <FiShield size={12} className="text-green-500" />
                    <span className={bengaliClass}>{language === "bn" ? "নিরাপদ" : "Secured"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <FiCheck size={12} className="text-green-500" />
                    <span className={bengaliClass}>{language === "bn" ? "মানি রিসিট" : "Money receipt"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <FiCheck size={12} className="text-green-500" />
                    <span className={bengaliClass}>{language === "bn" ? "যাচাইকৃত" : "Verified"}</span>
                  </div>
                </div>

                {/* WhatsApp Help */}
                <div className="mt-3 text-center">
                  <a
                    href={`https://wa.me/8801323878569?text=${encodeURIComponent(`আমি "${course.title}" কোর্সের পেমেন্ট করতে চাই।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-green-600 hover:text-green-700 font-medium transition"
                  >
                    <FaWhatsapp size={13} />
                    {language === "bn" ? "সাহায্য দরকার?" : "Need help?"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/checkout/${courseId}`}
      />

    </div>
  );
}
