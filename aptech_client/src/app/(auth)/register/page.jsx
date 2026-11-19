"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { FiUser, FiMail, FiPhone, FiLock, FiCheck, FiAward, FiUsers, FiBookOpen, FiMapPin } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const Register = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { language } = useLanguage();
  const bengaliClass = language === "bn" ? "hind-siliguri" : "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const p = formData.password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPasswordStrength(score);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + "/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          gender: formData.gender,
          password: formData.password,
          role: "student",
          status: "active",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto-login after registration
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
      }

      // Redirect to previous page or home
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FiBookOpen, text: language === "bn" ? "স্পোকেন ইংলিশ, পাবলিক স্পিকিং ও লিডারশিপ কোর্স" : "Spoken English, public speaking & leadership courses" },
    { icon: FiUsers, text: language === "bn" ? "লাইভ প্র্যাকটিস ও মেন্টরের ফিডব্যাক" : "Live practice with mentor feedback" },
    { icon: FiAward, text: language === "bn" ? "QR যাচাইযোগ্য সার্টিফিকেট" : "QR-verified certificates" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f4] via-white to-[#fdf3e2] py-12">
      <div className="container mx-auto px-4 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

            {/* Left Side - Premium Dark Info Panel */}
            <div className="lg:col-span-2 bg-[#0d0a06] p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: "radial-gradient(rgba(243,165,34,0.14) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
              <div className="absolute -top-20 -right-10 w-64 h-64 bg-[#0142b2]/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-[#01368f]/15 rounded-full blur-[90px]"></div>

              <div className="relative z-10">
                {/* Logo/Brand */}
                <div className="mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="Brave Talk Bangladesh" className="h-14 w-auto mb-5" />
                  <h2 className={`text-3xl font-bold mb-2 outfit ${bengaliClass}`}>
                    {language === "bn" ? "ব্রেভটক বাংলাদেশ" : "BraveTalk Bangladesh"}
                  </h2>
                  <p className={`text-white/60 text-sm ${bengaliClass}`}>
                    {language === "bn" ? "বাংলাদেশের অগ্রণী আইটি প্রশিক্ষণ প্রতিষ্ঠান" : "Bangladesh's Leading IT Training Institute"}
                  </p>
                </div>

                {/* Welcome Message */}
                <div className="mb-10">
                  <h3 className={`text-xl font-semibold mb-3 ${bengaliClass}`}>
                    {language === "bn" ? "আপনার ক্যারিয়ার যাত্রা শুরু করুন" : "Start Your Career Journey"}
                  </h3>
                  <p className={`text-white/60 text-sm leading-relaxed ${bengaliClass}`}>
                    {language === "bn"
                      ? "একটি অ্যাকাউন্ট তৈরি করুন এবং প্রিমিয়াম কোর্স, লাইভ ক্লাস ও ক্যারিয়ার সাপোর্টে অ্যাক্সেস পান।"
                      : "Create an account and get access to premium courses, live classes, and career support."}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0142b2]/15 border border-[#0142b2]/20 rounded-xl flex items-center justify-center">
                          <Icon size={18} className="text-[#0142b2]" />
                        </div>
                        <span className={`text-sm font-medium text-white/80 ${bengaliClass}`}>{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tagline */}
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className={`text-xl font-bold outfit text-white ${bengaliClass}`}>
                    {language === "bn" ? "বক্তা হও, নেতা হও!" : "Be a Speaker, Be a Leader!"}
                  </p>
                  <p className={`mt-1 text-xs text-white/60 ${bengaliClass}`}>
                    {language === "bn" ? "ফ্রি অ্যাকাউন্ট খুলে আজই শুরু করুন।" : "Create your free account and start today."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold text-gray-800 mb-2 outfit ${bengaliClass}`}>
                    {language === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}
                  </h3>
                  <p className={`text-gray-500 text-sm ${bengaliClass}`}>
                    {language === "bn" ? "মাত্র এক মিনিট সময় লাগবে!" : "It only takes a minute!"}
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <FiUser className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input
                        name="firstName"
                        placeholder={language === "bn" ? "নামের প্রথম অংশ" : "First name"}
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                      />
                    </div>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input
                        name="lastName"
                        placeholder={language === "bn" ? "নামের শেষ অংশ" : "Last name"}
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <FiMail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      name="email"
                      type="email"
                      placeholder={language === "bn" ? "ইমেইল ঠিকানা" : "Email address"}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      name="phoneNumber"
                      placeholder={language === "bn" ? "ফোন নম্বর" : "Phone number"}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                    />
                  </div>

                  {/* Location + Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input
                        name="location"
                        placeholder={language === "bn" ? "লোকেশন / এলাকা" : "Location / Area"}
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                      />
                    </div>
                    <div className="relative">
                      <FiUsers className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition appearance-none ${!formData.gender ? "text-gray-400" : "text-gray-800"} ${bengaliClass}`}
                      >
                        <option value="">{language === "bn" ? "লিঙ্গ নির্বাচন করুন" : "Select gender"}</option>
                        <option value="male">{language === "bn" ? "পুরুষ" : "Male"}</option>
                        <option value="female">{language === "bn" ? "মহিলা" : "Female"}</option>
                        <option value="other">{language === "bn" ? "অন্যান্য" : "Other"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={language === "bn" ? "পাসওয়ার্ড" : "Password"}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-[#0142b2] transition"
                        >
                          {showPassword ? <MdOutlineVisibilityOff size={18} /> : <MdOutlineRemoveRedEye size={18} />}
                        </button>
                      </div>
                      {/* Password Strength */}
                      <div className="mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength === 0 ? "w-0" :
                              passwordStrength === 1 ? "w-1/3 bg-red-400" :
                                passwordStrength === 2 ? "w-2/3 bg-yellow-400" :
                                  "w-full bg-green-500"
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={language === "bn" ? "পাসওয়ার্ড আবার লিখুন" : "Confirm password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/20 outline-none transition ${bengaliClass}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-[#0142b2] transition"
                      >
                        {showConfirmPassword ? <MdOutlineVisibilityOff size={18} /> : <MdOutlineRemoveRedEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${termsAccepted ? 'bg-[#0142b2] border-[#0142b2]' : 'border-gray-300'}`}>
                      {termsAccepted && <FiCheck className="text-white" size={12} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="hidden"
                    />
                    <span className={`text-sm text-gray-600 ${bengaliClass}`}>
                      {language === "bn" ? "আমি " : "I agree to the "}
                      <Link href="/terms" className="text-[#0142b2] font-medium hover:underline">
                        {language === "bn" ? "শর্তাবলি" : "Terms & Conditions"}
                      </Link>
                      {language === "bn" ? " ও " : " and "}
                      <Link href="/privacy" className="text-[#0142b2] font-medium hover:underline">
                        {language === "bn" ? "প্রাইভেসি পলিসি" : "Privacy Policy"}
                      </Link>
                      {language === "bn" ? "-এ সম্মত।" : "."}
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !termsAccepted}
                    className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition text-base ${loading || !termsAccepted
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0142b2] to-[#01368f] hover:shadow-xl hover:-translate-y-0.5"
                      } ${bengaliClass}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                        {language === "bn" ? "তৈরি হচ্ছে..." : "Creating..."}
                      </span>
                    ) : (
                      language === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className={`text-sm text-gray-400 ${bengaliClass}`}>
                      {language === "bn" ? "অথবা" : "or"}
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Google Signup Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                      if (!clientId) { setError("Google login is not configured."); return; }
                      const redirectUri = `${window.location.origin}/auth/google/callback`;
                      const scope = "openid email profile";
                      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
                    }}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 font-medium text-gray-700 shadow-sm transition flex items-center justify-center gap-3 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className={bengaliClass}>
                      {language === "bn" ? "গুগল দিয়ে সাইন আপ" : "Sign up with Google"}
                    </span>
                  </button>

                  {/* Login Link */}
                  <p className={`text-sm text-gray-500 text-center ${bengaliClass}`}>
                    {language === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already have an account? "}
                    <Link href="/login" className="text-[#0142b2] font-semibold hover:underline">
                      {language === "bn" ? "সাইন ইন" : "Sign in"}
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div></div>}>
      <Register />
    </Suspense>
  );
}
