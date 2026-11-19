"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchCoursesData } from "@/redux/CourseSlice";
import { fetchMentorsData } from "@/redux/mentorSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaWhatsapp, FaCheckCircle, FaStarHalfAlt } from "react-icons/fa";
import { MdVerified, MdOutlineQuiz, MdOutlineAssignment } from "react-icons/md";
import {
  LuVideo, LuTarget, LuFileText, LuMonitor, LuCalendarDays, LuInfinity, LuClock, LuUsers,
  LuArrowLeft, LuArrowRight, LuWifi, LuMapPin, LuCirclePlay, LuLanguages, LuShieldCheck,
  LuLoader, LuGift, LuShoppingCart, LuLayers, LuCircleCheck, LuChevronDown, LuLock, LuLockOpen,
  LuAward, LuGraduationCap, LuBriefcase, LuCheck,
} from "react-icons/lu";
import { RiLiveLine } from "react-icons/ri";
import { FiVideo, FiFileText, FiPlay } from "react-icons/fi";

import CourseCard from "@/components/sheard/CourseCard";
import LoginRequiredModal from "@/components/sheard/LoginRequiredModal";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { getCoursePricing, isFreeCourse } from "@/lib/coursePrice";

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

const SectionTitle = ({ children, accent = "bg-[#0142b2]", right = null, bn = "" }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className={`text-xl sm:text-2xl font-bold text-[#0b1b4a] outfit ${bn}`}>{children}</h2>
      <div className={`mt-2 h-1 w-12 rounded-full ${accent}`} />
    </div>
    {right}
  </div>
);

const SingleCourse = () => {
  const params = useParams();
  const courseId = params.courseid;
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, language } = useLanguage();
  const bengaliClass = language === "bn" ? "hind-siliguri" : "";

  const { courses = [] } = useSelector((state) => state.courses || {});
  const { mentors = [] } = useSelector((state) => state.mentors || {});
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [popularCourses, setPopularCourses] = useState([]);
  const { settings } = useSettings();

  // ── Curriculum State (new) ────────────────────────────────
  const [modules, setModules] = useState([]);
  const [moduleLessons, setModuleLessons] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // ── Enrollment State ──────────────────────────────────────
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const rawWhatsappNumber = '8801323878569';
  const whatsappNumber = rawWhatsappNumber.replace(/[^0-9]/g, '');

  useEffect(() => {
    dispatch(fetchCoursesData());
    dispatch(fetchMentorsData());
  }, [dispatch]);

  // Fetch THIS course directly by numeric id / slug — works no matter how many
  // courses exist (the Redux list is capped and can't be relied on at 200+ courses).
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/courses/${courseId}`);
        const data = await res.json();
        if (!cancelled && data.success && data.data) setCourse(data.data);
      } catch { /* falls back to the redux list below */ }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  // Recommended list (+ a fallback source for `course`) from the redux course list
  useEffect(() => {
    if (!courses || courses.length === 0) return;
    if (!course) {
      const found = courses.find((c) => c.id == courseId);
      if (found) setCourse(found);
    }
    setPopularCourses(courses.filter((c) => c.id != courseId).slice(0, 3));
  }, [courses, courseId, course]);

  // Instructor: populated mentor object (single-course API) or lookup in mentors list
  useEffect(() => {
    if (!course) return;
    if (course.mentor && typeof course.mentor === 'object' && course.mentor._id) {
      setInstructor(course.mentor);
    } else if (mentors.length > 0) {
      const foundMentor = mentors.find(m => m._id === course.mentor || m.id === course.mentor);
      if (foundMentor) setInstructor(foundMentor);
    }
  }, [course, mentors]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  // ── Fetch Curriculum (Modules + Lessons) — Recorded courses only ──
  useEffect(() => {
    if (!course?._id) return;
    // Live (Online/Offline) courses use the curriculum[] topic list instead
    if (course.type !== 'Recorded') {
      setModules([]);
      setModuleLessons({});
      return;
    }

    const fetchCurriculum = async () => {
      setLoadingCurriculum(true);
      try {
        const modRes = await fetch(`${API}/modules/course/${course._id}`);
        const modData = await modRes.json();
        const mods = modData.data || [];
        setModules(mods);

        // Fetch lessons for all modules in parallel
        const lessonPromises = mods.map(async (mod) => {
          const lesRes = await fetch(`${API}/lessons/module/${mod._id}`);
          const lesData = await lesRes.json();
          return { moduleId: mod._id, lessons: lesData.data || [] };
        });
        const lessonResults = await Promise.all(lessonPromises);
        const lessonsMap = {};
        lessonResults.forEach(r => { lessonsMap[r.moduleId] = r.lessons; });
        setModuleLessons(lessonsMap);
      } catch (err) {
        console.error('Failed to fetch curriculum:', err);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    fetchCurriculum();
  }, [course?._id, course?.type]);

  // ── Check Enrollment ───────────────────────────────────────
  useEffect(() => {
    if (!course?._id) return;
    const checkEnrollment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/enrollments/check-access/${course._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.hasAccess) {
          setIsEnrolled(true);
        }
      } catch { }
    };
    checkEnrollment();
  }, [course?._id]);

  // ── Toggle Module Accordion ────────────────────────────────
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // ── Lesson Type Info ──────────────────────────────────────
  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="text-[#0142b2]" size={14} />;
      case 'text': return <FiFileText className="text-[#027a1e]" size={14} />;
      case 'quiz': return <MdOutlineQuiz className="text-[#e5251f]" size={14} />;
      case 'assignment': return <MdOutlineAssignment className="text-amber-500" size={14} />;
      default: return <FiPlay className="text-slate-400" size={14} />;
    }
  };

  // ── Handle Enrollment ──────────────────────────────────────
  const handleEnroll = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    // Free course (fee = 0) → instant enrollment, no checkout
    if (isFreeCourse(course)) {
      handleFreeEnroll();
    } else {
      router.push(`/checkout/${course.id}`);
    }
  };

  // Where an enrolled student goes: Recorded → video player, live → dashboard course area
  const getContinueHref = (c) => (c?.type === "Recorded"
    ? `/learn/${c._id}`
    : `/dashboard/user/courses/${c._id}/details`);

  const handleFreeEnroll = async () => {
    if (enrolling) return;
    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/payment/free/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await res.json();
      const alreadyEnrolled = /already enrolled/i.test(data.message || '');
      if (data.success || alreadyEnrolled) {
        setIsEnrolled(true);
        alert(language === 'bn'
          ? '🎉 এনরোল সম্পন্ন! এখন আপনার কোর্সে নিয়ে যাওয়া হচ্ছে।'
          : '🎉 You are enrolled! Taking you to your course now.');
        router.push(getContinueHref(course));
      } else if (res.status === 401) {
        setShowLoginModal(true);
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch { alert('Network error'); }
    finally { setEnrolling(false); }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    const token = localStorage.getItem('token');
    const feeNum = parseInt(String(course.fee).replace(/[^0-9]/g, ''));

    try {
      if (paymentMethod === 'bkash') {
        const res = await fetch(`${API}/payment/bkash/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId: course._id, amount: feeNum }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.isDemo) {
            // Demo mode — auto complete
            const execRes = await fetch(`${API}/payment/bkash/demo-complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ paymentID: data.data.paymentID, courseId: course._id, amount: feeNum }),
            });
            const execData = await execRes.json();
            if (execData.success) {
              setIsEnrolled(true);
              setShowPaymentModal(false);
              alert('🎉 Payment successful! Course access activated.');
            } else {
              alert(execData.message || 'Payment failed');
            }
          } else if (data.data.bkashURL) {
            window.location.href = data.data.bkashURL;
          }
        } else {
          alert(data.message || 'Payment initiation failed');
        }
      } else if (paymentMethod === 'sslcommerz') {
        const res = await fetch(`${API}/payment/sslcommerz/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId: course._id, amount: feeNum, courseName: course.title }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.isDemo) {
            const execRes = await fetch(`${API}/payment/sslcommerz/demo-complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ tran_id: data.data.tran_id, courseId: course._id, amount: feeNum }),
            });
            const execData = await execRes.json();
            if (execData.success) {
              setIsEnrolled(true);
              setShowPaymentModal(false);
              alert('🎉 Payment successful! Course access activated.');
            }
          } else if (data.data.GatewayPageURL) {
            window.location.href = data.data.GatewayPageURL;
          }
        }
      } else if (paymentMethod === 'manual') {
        // Redirect to manual payment page
        setShowPaymentModal(false);
        router.push(`/dashboard/user/payments/manual?courseId=${course._id}&amount=${feeNum}&courseName=${encodeURIComponent(course.title)}`);
      }
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Calculate curriculum stats ─────────────────────────────
  const totalLessons = Object.values(moduleLessons).flat().length;
  const totalDuration = Object.values(moduleLessons).flat().reduce((acc, l) => acc + (l.videoDuration || 0), 0);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-200" />);
      }
    }
    return stars;
  };

  const renderIcon = (iconName) => {
    const iconClass = "text-xl";
    switch (iconName) {
      case "RiLiveLine": return <RiLiveLine className={iconClass} />;
      case "LuVideo": return <LuVideo className={iconClass} />;
      case "LuMonitor": return <LuMonitor className={iconClass} />;
      case "LuFileText": return <LuFileText className={iconClass} />;
      case "MdOutlineAssignment": return <MdOutlineAssignment className={iconClass} />;
      case "MdOutlineQuiz": return <MdOutlineQuiz className={iconClass} />;
      default: return <FaCheckCircle className={iconClass} />;
    }
  };


  if (!course) {
    return (
      <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-10 animate-pulse">
        <div className="mb-6 h-4 w-28 rounded bg-slate-100" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-9 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-20 w-full rounded-2xl bg-slate-100" />
            <div className="h-40 w-full rounded-2xl bg-slate-100" />
          </div>
          <div className="h-[420px] rounded-3xl bg-slate-100" />
        </div>
        <p className={`sr-only ${bengaliClass}`}>{t("courseDetails.loading")}</p>
      </div>
    );
  }

  const {
    isFree,
    fee: feeNumber,
    offer: offerNumber,
    hasDiscount: hasOffer,
    price: displayFee,
    percentOff,
  } = getCoursePricing(course);

  const isBn = language === "bn";
  const bn = bengaliClass;
  const taka = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;

  const enrollLabel = isFree
    ? (isBn ? "ফ্রি-তে এনরোল করুন" : "Enroll for free")
    : (isBn ? `এনরোল করুন · ${taka(displayFee)}` : `Enroll now · ${taka(displayFee)}`);

  // Recorded = self-paced (Modules & Lessons); Online/Offline = live batch (start date + topic curriculum)
  const isRecorded = course.type === "Recorded";
  // After enroll: Recorded → the self-paced video player; Live (Online/Offline) → the dashboard
  // course area (batch classes / recordings / materials). Recorded's /learn player has no lessons
  // for a live course, so live students must NOT be sent there.
  const continueHref = getContinueHref(course);
  const videoHours = totalDuration > 0
    ? `${Math.floor(totalDuration / 3600)}h ${Math.round((totalDuration % 3600) / 60)}m`
    : null;

  const typeLabel = {
    Online: { en: "Online · Live classes", bn: "অনলাইন · লাইভ ক্লাস", cls: "bg-blue-50 text-[#0142b2] border-blue-100", Icon: LuWifi },
    Offline: { en: "Offline · In-person", bn: "অফলাইন · সরাসরি ক্লাস", cls: "bg-red-50 text-[#e5251f] border-red-100", Icon: LuMapPin },
    Recorded: { en: "Recorded · Self-paced", bn: "রেকর্ডেড · নিজের গতিতে", cls: "bg-emerald-50 text-[#027a1e] border-emerald-100", Icon: LuCirclePlay },
  }[course.type];

  const categoryName = course.category && typeof course.category === "object" ? course.category.name : "";
  const students = Number(course.totalStudentsEnroll || 0);
  const showRating = Number(course.totalRating) > 0 && Number(course.rating) > 0;
  const lessonCount = totalLessons || Number(course.lectures || 0);

  // Course facts — pattern-aware (Live vs Recorded); zero values are hidden
  const courseFacts = (isRecorded
    ? [
      lessonCount > 0 && { Icon: LuVideo, value: `${lessonCount}`, label: isBn ? "ভিডিও লেসন" : "Video lessons" },
      videoHours && { Icon: LuClock, value: videoHours, label: isBn ? "ভিডিও কন্টেন্ট" : "Video content" },
      { Icon: LuInfinity, value: isBn ? "লাইফটাইম" : "Lifetime", label: isBn ? "অ্যাক্সেস" : "Access" },
      Number(course.totalExam) > 0 && { Icon: MdOutlineQuiz, value: `${course.totalExam}`, label: isBn ? "কুইজ ও পরীক্ষা" : "Quizzes & exams" },
      Number(course.totalProject) > 0 && { Icon: LuTarget, value: `${course.totalProject}`, label: isBn ? "প্র্যাকটিস টাস্ক" : "Practice tasks" },
    ]
    : [
      { Icon: LuCalendarDays, value: course.courseStart || (isBn ? "শীঘ্রই" : "TBA"), label: isBn ? "কোর্স শুরু" : "Course starts" },
      Number(course.durationMonth) > 0 && { Icon: LuClock, value: `${course.durationMonth} ${isBn ? "মাস" : Number(course.durationMonth) === 1 ? "month" : "months"}`, label: isBn ? "সময়কাল" : "Duration" },
      lessonCount > 0 && { Icon: LuVideo, value: `${lessonCount}`, label: isBn ? "ক্লাস / লেকচার" : "Classes" },
      Number(course.totalExam) > 0 && { Icon: MdOutlineQuiz, value: `${course.totalExam}`, label: isBn ? "পরীক্ষা" : "Exams" },
      Number(course.totalProject) > 0 && { Icon: LuTarget, value: `${course.totalProject}`, label: isBn ? "প্র্যাকটিস টাস্ক" : "Practice tasks" },
    ]).filter(Boolean);

  const skills = [
    ...(course.technology ? String(course.technology).split(",") : []),
    ...(Array.isArray(course.softwareYoullLearn) ? course.softwareYoullLearn : String(course.softwareYoullLearn || "").split(",")),
  ].map((s) => String(s).trim()).filter((s, i, arr) => s && arr.indexOf(s) === i);

  const waNumber = String(settings?.whatsappNumber || rawWhatsappNumber).replace(/[^0-9]/g, "") || whatsappNumber;
  const waText = encodeURIComponent(isBn ? `হ্যালো, "${course.title}" কোর্স সম্পর্কে জানতে চাই।` : `Hi, I'd like to know more about the course "${course.title}".`);

  const enrollButton = isEnrolled ? (
    <Link
      href={continueHref}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#027a1e] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#026318] work ${bn}`}
    >
      <LuCirclePlay /> {isBn ? "কোর্স চালিয়ে যান" : "Continue learning"} <LuArrowRight />
    </Link>
  ) : (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={enrolling}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 work ${bn} ${isFree ? "bg-[#027a1e] shadow-emerald-900/20 hover:bg-[#026318]" : "bg-[#0142b2] shadow-blue-900/25 hover:bg-[#01368f]"}`}
    >
      {enrolling ? <LuLoader className="animate-spin" /> : isFree ? <LuGift /> : <LuShoppingCart />}
      {enrollLabel}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px]">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-blue-100/70 blur-[120px]" />
          <div className="absolute top-20 right-[-100px] h-[380px] w-[380px] rounded-full bg-red-100/50 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[340px] w-[340px] rounded-full bg-emerald-100/50 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10">
          <Link href="/courses" className={`mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0142b2] work ${bn}`}>
            <LuArrowLeft /> {isBn ? "সব কোর্স" : "All courses"}
          </Link>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 2xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* ---------- Header info ---------- */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-start-1 lg:row-start-1">
              <div className={`flex flex-wrap items-center gap-2 text-xs work ${bn}`}>
                {typeLabel && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${typeLabel.cls}`}>
                    <typeLabel.Icon /> {isBn ? typeLabel.bn : typeLabel.en}
                  </span>
                )}
                {isFree && (
                  <span className="rounded-full bg-[#027a1e] px-3 py-1 font-bold uppercase tracking-wide text-white">{isBn ? "ফ্রি কোর্স" : "Free course"}</span>
                )}
                {categoryName && <span className="font-semibold uppercase tracking-wider text-[#e5251f]">{categoryName}</span>}
              </div>

              <h1 className={`mt-3 text-[28px] sm:text-4xl lg:text-[42px] font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
                {course.title}
              </h1>

              {(course.courseOverview || course.details) && (
                <p className={`mt-4 max-w-3xl text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>
                  {course.courseOverview || (course.details?.length > 180 ? `${course.details.substring(0, 180)}...` : course.details)}
                </p>
              )}

              <div className={`mt-5 flex flex-wrap items-center gap-2 text-xs work ${bn}`}>
                {showRating && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                    <span className="flex text-[11px]">{renderStars(Number(course.rating))}</span>
                    <span className="font-bold text-[#0b1b4a]">{Number(course.rating).toFixed(1)}</span>
                    <span className="text-slate-400">({course.totalRating})</span>
                  </span>
                )}
                {students > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                    <LuUsers className="text-[#0142b2]" /> {students.toLocaleString("en-US")} {isBn ? "শিক্ষার্থী এনরোল করেছেন" : students === 1 ? "student enrolled" : "students enrolled"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                  <LuLanguages className="text-[#0142b2]" /> {isBn ? "বাংলা ও ইংরেজি" : "Bangla & English"}
                </span>
              </div>

              {instructor && (
                <a href="#mentor" className="mt-5 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 py-1.5 pl-1.5 pr-4 shadow-sm transition hover:border-[#0142b2]/40">
                  {instructor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={instructor.image} alt={instructor.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0142b2]">{instructor.name?.charAt(0)}</span>
                  )}
                  <span className={`text-left text-xs leading-tight work ${bn}`}>
                    <span className="block text-slate-400">{isBn ? "মেন্টর" : "Your mentor"}</span>
                    <span className="flex items-center gap-1 font-semibold text-[#0b1b4a]">{instructor.name} <MdVerified className="text-[#0142b2]" /></span>
                  </span>
                </a>
              )}
            </motion.div>

            {/* ---------- Sticky price / enroll card ---------- */}
            <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
              <div className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-50 to-blue-50">
                    {course.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                    )}
                    {hasOffer && offerNumber && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#e5251f] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">-{percentOff}%</span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider text-slate-400 work ${bn}`}>{isBn ? "কোর্স ফি" : "Course fee"}</p>
                    <div className="mt-1 flex flex-wrap items-end gap-2">
                      <span className={`text-3xl font-extrabold leading-none outfit ${isFree ? "text-[#027a1e]" : "text-[#0b1b4a]"} ${bn}`}>
                        {isFree ? (isBn ? "ফ্রি" : "Free") : taka(displayFee)}
                      </span>
                      {hasOffer && <span className="pb-0.5 text-sm text-slate-400 line-through">{taka(feeNumber)}</span>}
                    </div>
                    <p className={`mt-2 flex items-center gap-1.5 text-xs text-slate-500 work ${bn}`}>
                      <LuShieldCheck className={isFree ? "text-[#027a1e]" : "text-[#0142b2]"} />
                      {isFree
                        ? (isBn ? "সম্পূর্ণ ফ্রি — কোনো পেমেন্ট লাগবে না" : "Completely free — no payment needed")
                        : (isBn ? "একবার পেমেন্ট — পুরো কোর্সে অ্যাক্সেস" : "One-time payment — full course access")}
                    </p>

                    <div className="mt-5">
                      {enrollButton}
                    </div>
                    {isEnrolled && (
                      <p className={`mt-2 text-center text-xs font-medium text-[#027a1e] work ${bn}`}>
                        {isBn ? "আপনি এই কোর্সে এনরোল করেছেন" : "You are enrolled in this course"}
                      </p>
                    )}

                    <a
                      href={`https://wa.me/${waNumber}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4a] transition hover:border-emerald-300 hover:text-[#027a1e] work ${bn}`}
                    >
                      <FaWhatsapp className="text-base text-[#25D366]" /> {isBn ? "হোয়াটসঅ্যাপে প্রশ্ন করুন" : "Ask on WhatsApp"}
                    </a>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className={`text-sm font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "এই কোর্সে যা পাচ্ছেন" : "This course includes"}</p>
                      <ul className={`mt-3 space-y-2.5 text-sm text-slate-600 work ${bn}`}>
                        {lessonCount > 0 && (
                          <li className="flex items-center gap-2.5"><LuCirclePlay className="shrink-0 text-[#0142b2]" /> {lessonCount} {isRecorded ? (isBn ? "ভিডিও লেসন" : lessonCount === 1 ? "video lesson" : "video lessons") : (isBn ? "ক্লাস" : lessonCount === 1 ? "class" : "classes")}</li>
                        )}
                        {modules.length > 0 && (
                          <li className="flex items-center gap-2.5"><LuLayers className="shrink-0 text-[#0142b2]" /> {modules.length} {isBn ? "মডিউল" : modules.length === 1 ? "module" : "modules"}</li>
                        )}
                        {isRecorded ? (
                          <>
                            {videoHours && <li className="flex items-center gap-2.5"><LuClock className="shrink-0 text-[#0142b2]" /> {videoHours} {isBn ? "ভিডিও কন্টেন্ট" : "of video"}</li>}
                            <li className="flex items-center gap-2.5"><LuInfinity className="shrink-0 text-[#0142b2]" /> {isBn ? "লাইফটাইম অ্যাক্সেস" : "Lifetime access"}</li>
                          </>
                        ) : (
                          <>
                            {course.courseStart && <li className="flex items-center gap-2.5"><LuCalendarDays className="shrink-0 text-[#0142b2]" /> {isBn ? "শুরু: " : "Starts: "}{course.courseStart}</li>}
                            {Number(course.durationMonth) > 0 && <li className="flex items-center gap-2.5"><LuClock className="shrink-0 text-[#0142b2]" /> {course.durationMonth} {isBn ? "মাস" : Number(course.durationMonth) === 1 ? "month" : "months"}</li>}
                          </>
                        )}
                        {Number(course.totalProject) > 0 && (
                          <li className="flex items-center gap-2.5"><LuTarget className="shrink-0 text-[#0142b2]" /> {course.totalProject} {isBn ? "প্র্যাকটিস টাস্ক" : Number(course.totalProject) === 1 ? "practice task" : "practice tasks"}</li>
                        )}
                        {course.courseIncludes?.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2.5"><LuCircleCheck className="shrink-0 text-[#027a1e]" /> {item.text || item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ---------- Body ---------- */}
            <div className="min-w-0 space-y-12 lg:col-start-1 lg:row-start-2">
              {/* Facts */}
              {courseFacts.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {courseFacts.slice(0, 4).map((fact, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0142b2]">
                        <fact.Icon className="text-lg" />
                      </span>
                      <p className={`mt-3 text-sm font-bold leading-tight text-[#0b1b4a] outfit ${bn}`}>{fact.value}</p>
                      <p className={`mt-0.5 text-[11px] text-slate-500 work ${bn}`}>{fact.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* About */}
              {course.details && (
                <div>
                  <SectionTitle bn={bn} accent="bg-[#e5251f]">{isBn ? "কোর্সটি সম্পর্কে" : "About this course"}</SectionTitle>
                  <div className={`whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>{course.details}</div>
                </div>
              )}

              {/* What's included */}
              {course.courseIncludes?.length > 0 && (
                <div>
                  <SectionTitle bn={bn} accent="bg-[#027a1e]">{isBn ? "কোর্সে যা যা থাকছে" : "What you get"}</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {course.courseIncludes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#027a1e]">
                          {renderIcon(item.icon)}
                        </span>
                        <span className={`text-sm font-semibold text-[#0b1b4a] work ${bn}`}>{item.text || item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div id="curriculum">
                <SectionTitle
                  bn={bn}
                  right={isRecorded && modules.length > 0 ? (
                    <p className={`text-xs text-slate-500 work ${bn}`}>
                      {modules.length} {isBn ? "মডিউল" : "modules"} · {totalLessons} {isBn ? "লেসন" : "lessons"}{videoHours ? ` · ${videoHours}` : ""}
                    </p>
                  ) : null}
                >
                  {isBn ? "কোর্স কারিকুলাম" : "Course curriculum"}
                </SectionTitle>

                {isRecorded && loadingCurriculum ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100" />)}
                  </div>
                ) : isRecorded && modules.length > 0 ? (
                  <div className="space-y-3">
                    {modules.map((mod, idx) => {
                      const lessons = moduleLessons[mod._id] || [];
                      const isExpanded = expandedModules[mod._id];
                      const moduleDuration = lessons.reduce((acc, l) => acc + (l.videoDuration || 0), 0);
                      const freeCount = lessons.filter((l) => l.isFree).length;

                      return (
                        <div key={mod._id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${isExpanded ? "border-[#0142b2]/30" : "border-slate-200"}`}>
                          <button
                            type="button"
                            onClick={() => toggleModule(mod._id)}
                            aria-expanded={!!isExpanded}
                            className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
                          >
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold outfit ${isExpanded ? "bg-[#0142b2] text-white" : "bg-blue-50 text-[#0142b2]"}`}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block font-semibold text-[#0b1b4a] work ${bn}`}>{mod.title}</span>
                              <span className={`mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-400 work ${bn}`}>
                                <span>{lessons.length} {isBn ? "লেসন" : lessons.length === 1 ? "lesson" : "lessons"}</span>
                                {moduleDuration > 0 && <span>{Math.round(moduleDuration / 60)} {isBn ? "মিনিট" : "min"}</span>}
                                {freeCount > 0 && !isEnrolled && <span className="font-semibold text-[#027a1e]">{freeCount} {isBn ? "ফ্রি প্রিভিউ" : "free preview"}</span>}
                              </span>
                            </span>
                            <LuChevronDown className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden border-t border-slate-100"
                              >
                                <ul className="divide-y divide-slate-100">
                                  {lessons.length === 0 && (
                                    <li className={`px-5 py-3.5 text-sm text-slate-400 work ${bn}`}>{isBn ? "লেসন শীঘ্রই যোগ হবে" : "Lessons coming soon"}</li>
                                  )}
                                  {lessons.map((lesson) => {
                                    const canOpen = (lesson.isFree || isEnrolled) && lesson.type === "video";
                                    return (
                                      <li key={lesson._id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                          {getLessonIcon(lesson.type)}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className={`block truncate text-sm font-medium ${lesson.isFree || isEnrolled ? "text-[#0b1b4a]" : "text-slate-500"} work ${bn}`}>{lesson.title}</span>
                                          {lesson.videoDuration > 0 && (
                                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 work"><LuClock /> {Math.round(lesson.videoDuration / 60)} min</span>
                                          )}
                                        </span>
                                        {lesson.isFree && !isEnrolled && (
                                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#027a1e] work ${bn}`}>
                                            <LuLockOpen /> {isBn ? "ফ্রি প্রিভিউ" : "Free preview"}
                                          </span>
                                        )}
                                        {!lesson.isFree && !isEnrolled && <LuLock className="shrink-0 text-slate-300" />}
                                        {canOpen && isEnrolled && (
                                          <Link
                                            href={`/learn/${course._id}?lesson=${lesson._id}`}
                                            aria-label={isBn ? "লেসন দেখুন" : "Play lesson"}
                                            className="shrink-0 rounded-full p-1.5 text-[#0142b2] transition hover:bg-blue-50"
                                          >
                                            <FiPlay size={14} />
                                          </Link>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ) : isRecorded || !(course.curriculum?.length > 0) ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[#0142b2] shadow-sm">
                      <LuVideo />
                    </div>
                    <h4 className={`mt-3 font-bold text-[#0b1b4a] outfit ${bn}`}>{isBn ? "কারিকুলাম শীঘ্রই আসছে" : "Curriculum coming soon"}</h4>
                    <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>
                      {isRecorded
                        ? (isBn ? "মডিউল ও লেসনগুলো যোগ করা হচ্ছে" : "Modules and lessons are being added")
                        : (isBn ? "ক্লাসের বিষয়গুলো শীঘ্রই যোগ করা হবে" : "Class topics will be added soon")}
                    </p>
                  </div>
                ) : (
                  /* Live (Online/Offline): curriculum topic list */
                  <ol className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    {course.curriculum.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-[#0142b2] outfit">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={`text-sm font-medium text-[#0b1b4a] work ${bn}`}>{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <SectionTitle bn={bn} accent="bg-[#e5251f]">{isBn ? "যেসব দক্ষতা গড়বেন" : "Skills you'll build"}</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 work ${bn}`}>
                        <LuCircleCheck className="text-[#027a1e]" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Where these skills help */}
              {course.jobPositions?.length > 0 && (
                <div>
                  <SectionTitle bn={bn}>{isBn ? "যেখানে কাজে লাগবে" : "Where these skills help"}</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {course.jobPositions.map((job, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0142b2]">
                          <LuTarget />
                        </span>
                        <span className={`text-sm font-semibold text-[#0b1b4a] work ${bn}`}>{job}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor */}
              <div id="mentor" className="scroll-mt-24">
                <SectionTitle bn={bn} accent="bg-[#027a1e]">{isBn ? "আপনার মেন্টর" : "Your mentor"}</SectionTitle>
                {instructor ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {instructor.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={instructor.image} alt={instructor.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-[#0b1b4a] outfit">
                          {instructor.name} <MdVerified className="text-[#0142b2]" />
                        </h3>
                        {(instructor.designation || instructor.subject) && (
                          <p className={`mt-1 text-sm font-medium text-[#0142b2] work ${bn}`}>
                            {[instructor.designation, instructor.subject].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {Number(instructor.training_experience?.years) > 0 && (
                          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0142b2] work ${bn}`}>
                            <LuAward /> {instructor.training_experience.years}+ {isBn ? "বছরের অভিজ্ঞতা" : "years of experience"}
                          </span>
                        )}
                        {instructor.details && (
                          <p className={`mt-3 text-sm leading-relaxed text-slate-600 work ${bn}`}>{instructor.details}</p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(instructor._id || instructor.id) && (
                            <Link
                              href={`/mentors/${instructor._id || instructor.id}`}
                              className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work ${bn}`}
                            >
                              {isBn ? "পুরো প্রোফাইল দেখুন" : "View full profile"} <LuArrowRight />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {(instructor.education_qualification?.length > 0 || instructor.work_experience?.length > 0) && (
                      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                        {instructor.education_qualification?.length > 0 && (
                          <div>
                            <p className={`flex items-center gap-2 text-sm font-bold text-[#0b1b4a] outfit ${bn}`}><LuGraduationCap className="text-[#0142b2]" /> {isBn ? "শিক্ষাগত যোগ্যতা" : "Education"}</p>
                            <ul className={`mt-2 space-y-1.5 text-sm text-slate-600 work ${bn}`}>
                              {instructor.education_qualification.map((item, idx) => (
                                <li key={idx} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0142b2]" /> {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {instructor.work_experience?.length > 0 && (
                          <div>
                            <p className={`flex items-center gap-2 text-sm font-bold text-[#0b1b4a] outfit ${bn}`}><LuBriefcase className="text-[#e5251f]" /> {isBn ? "অভিজ্ঞতা" : "Experience"}</p>
                            <ul className={`mt-2 space-y-1.5 text-sm text-slate-600 work ${bn}`}>
                              {instructor.work_experience.slice(0, 5).map((item, idx) => (
                                <li key={idx} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5251f]" /> {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                    <LuUsers className="mx-auto text-3xl text-slate-300" />
                    <h4 className={`mt-2 font-bold text-[#0b1b4a] outfit ${bn}`}>{t("courseDetails.mentorNotAssigned")}</h4>
                    <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>{t("courseDetails.checkBack")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Related courses ---------- */}
      {popularCourses.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6 py-12 sm:py-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold text-[#0b1b4a] outfit ${bn}`}>
                  {isBn ? <>আরও <span className="text-[#e5251f]">কোর্স</span></> : <>More <span className="text-[#e5251f]">courses</span></>}
                </h2>
                <p className={`mt-1 text-sm text-slate-500 work ${bn}`}>{isBn ? "আপনার পছন্দ হতে পারে" : "You might also like"}</p>
              </div>
              <Link href="/courses" className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work ${bn}`}>
                {isBn ? "সব কোর্স দেখুন" : "View all courses"} <LuArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popularCourses.map((item) => <CourseCard key={item._id || item.id} course={item} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Payment Method Modal (legacy — not opened by the current enroll flow) ═══ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-[#0b1b4a] px-6 py-5 text-white">
              <h3 className="text-lg font-bold outfit">{isBn ? "পেমেন্ট মেথড বেছে নিন" : "Select payment method"}</h3>
              <p className="mt-1 text-sm text-white/70">{course.title} — {taka(displayFee)}</p>
            </div>
            <div className="space-y-3 p-6">
              {[
                { id: 'bkash', label: 'bKash', desc: 'Mobile banking payment' },
                { id: 'sslcommerz', label: 'Card / Net Banking', desc: 'VISA, MasterCard, Nagad via SSLCommerz' },
                { id: 'manual', label: 'Manual payment', desc: 'Admin verification required' },
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${paymentMethod === method.id ? 'border-[#0142b2] bg-blue-50/60' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-[#0b1b4a]">{method.label}</p>
                    <p className="text-xs text-slate-500">{method.desc}</p>
                  </div>
                  {paymentMethod === method.id && <LuCheck className="text-[#0142b2]" size={20} />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-full border border-slate-200 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0142b2] py-3 font-bold text-white shadow-lg transition hover:bg-[#01368f] disabled:opacity-50"
              >
                {paymentLoading ? <LuLoader className="animate-spin" /> : <LuShoppingCart />}
                {isBn ? "পেমেন্ট করুন" : "Pay now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/checkout/${course.id}`}
      />
    </div>
  );
};

export default SingleCourse;
