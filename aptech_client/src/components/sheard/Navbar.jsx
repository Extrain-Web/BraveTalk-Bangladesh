"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BiCategory, BiMenu, BiX } from "react-icons/bi";
import { LuBookOpenCheck, LuChevronDown, LuLogOut, LuLayoutDashboard } from "react-icons/lu";
import { HiOutlineSparkles, HiOutlineUserCircle } from "react-icons/hi2";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useDesignScale, scaleStyle } from "@/lib/useDesignScale";
import { OFFLINE_ENABLED } from "@/lib/features";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const scale = useDesignScale();
  const { settings } = useSettings();
  const logoSrc = settings?.logo || "/images/logo.png";
  const isCustomLogo = !!settings?.logo;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setTimeout(() => setUser(JSON.parse(storedUser)), 0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    closeMobileMenu();
    router.replace("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const courseTypes = [
    { key: "Online", label: t("navbar.onlineCourse") },
    ...(OFFLINE_ENABLED ? [{ key: "Offline", label: t("navbar.offlineCourse") }] : []),
    { key: "Recorded", label: t("navbar.recordedCourse") },
  ];

  const handleCourseTypeClick = (courseType) => {
    closeMobileMenu();
    router.push(`/courses?type=${courseType}`);
  };

  const menu = [
    { href: "/", label: t("navbar.home") },
    { href: "/courses", label: t("navbar.courses") },
    { href: "/books", label: language === "bn" ? "বই" : "Books" },

    // Mentors page still exists at /mentors — hidden from the menu bar for now
    // { href: "/mentors", label: t("navbar.mentors") },
    // { href: "/blogs", label: t("navbar.blogs") },
    { href: "/notice-board", label: language === "bn" ? "নোটিশ" : "Notices" },
    { href: "/about", label: t("navbar.about") },

    { href: "/contact", label: t("navbar.contact") },
  ];

  // Apply Bengali font class when language is Bengali
  const bengaliClass = language === "bn" ? "hind-siliguri" : "";

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed lg:hidden top-0 left-0 w-[80%] max-w-[320px] h-screen overflow-y-auto bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#0b1630]">
          <Link href="/" onClick={closeMobileMenu}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`h-9 w-auto shrink-0 cursor-pointer `} src={logoSrc} alt="Brave Talk Bangladesh" />
          </Link>
          <button
            onClick={closeMobileMenu}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <BiX className="text-2xl text-white" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-5 flex flex-col h-[calc(100%-80px)]">
          {/* Language Switcher for Mobile */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <LanguageSwitcher variant="compact" />
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {menu.map(({ href, label }, index) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center justify-between px-4 py-3.5 rounded-md transition-all duration-300 cursor-pointer ${pathname === href
                      ? "bg-gradient-to-r from-[#0142b2]/15 to-[#0142b2]/5 text-[#01368f] border-l-4 cursor-pointer border-[#0142b2]"
                      : "hover:bg-gray-100 text-gray-700 border-l-4 border-transparent hover:border-gray-200 cursor-pointer"
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className={`font-medium text-[15px] ${bengaliClass}`}>{label}</span>
                    {pathname === href && (
                      <span className="w-2 h-2 rounded-full bg-[#0142b2]"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile CTA Button / User Profile */}
          <div className="mt-6 space-y-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-md bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0142b2]">
                    {user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0142b2] to-[#027a1e] flex items-center justify-center text-white font-bold">
                        {(user.name || user.gmail || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || user.gmail?.split('@')[0]}</p>
                    <p className={`text-[11px] text-gray-500 truncate ${bengaliClass}`}>
                      {user.role === 'admin' ? t("navbar.administrator") : (user.role || t("navbar.studentAccount"))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={user.role === 'admin' ? "/dashboard/admin" : user.role === 'mentor' ? "/dashboard/mentor" : "/dashboard/user"}
                    onClick={closeMobileMenu}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-md border border-gray-100 bg-white hover:bg-gray-50 transition-colors group"
                  >
                    <LuLayoutDashboard className="text-xl text-[#0142b2] group-hover:scale-110 transition-transform" />
                    <span className={`text-xs font-bold text-gray-600 ${bengaliClass}`}>{t("navbar.dashboard")}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-md border border-red-100 bg-red-50/30 hover:bg-red-50 transition-colors group"
                  >
                    <LuLogOut className="text-xl text-red-500 group-hover:scale-110 transition-transform" />
                    <span className={`text-xs font-bold text-red-600 ${bengaliClass}`}>{t("navbar.logout")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} onClick={closeMobileMenu} className={`flex items-center justify-center gap-2 py-4 rounded-md border border-gray-100 bg-white text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors ${bengaliClass}`}>
                  <HiOutlineUserCircle className="text-xl" />
                  {t("navbar.signIn")}
                </Link>
                <Link href={`/register?redirect=${encodeURIComponent(pathname)}`} onClick={closeMobileMenu} className={`block text-center py-4 rounded-md bg-gradient-to-r from-[#0142b2] to-[#01368f] text-white text-[15px] font-bold shadow-sm ${bengaliClass}`}>
                  {t("navbar.getStarted")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`poppins sticky top-0 z-40 transition-all duration-500 ease-out ${isSticky
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
          }`}
      >
        {/* Gold hairline accent along the very top */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#0142b2] via-[#e5251f] to-[#027a1e]"></div>

        <div style={scaleStyle(scale)} className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-[80px]">
            {/* Left cluster: Logo + Category + Nav */}
            <div className="flex items-center gap-4 lg:gap-6">
            {/* Logo Section */}
            <div className="flex items-center gap-4 xl:gap-8">
              <Link href="/" className="relative group flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-10 lg:h-12 w-auto shrink-0 max-w-none transition-transform duration-300 group-hover:scale-105"
                  src={logoSrc}
                  alt="Brave Talk Bangladesh"
                />
              </Link>

              {/* Category Dropdown - Desktop */}
              <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

              <div className="relative group hidden md:flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md bg-[#eef3ff] hover:bg-[#e0e9ff] border border-[#c9d8fb] hover:border-[#0142b2]/50 transition-all duration-300">
                  <BiCategory className="text-2xl text-[#01368f]" />
                  <span className={`hidden xl:inline text-[15px] font-medium text-gray-700 ${bengaliClass}`}>{t("navbar.category")}</span>
                  <LuChevronDown className="text-gray-400 group-hover:rotate-180 transition-transform duration-300" />
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-full mt-3 left-0 w-56 bg-white rounded-md shadow-md border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-50 overflow-hidden">
                  <div className="p-2">
                    {courseTypes.map((type, index) => (
                      <button
                        key={type.key}
                        onClick={() => handleCourseTypeClick(type.key)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left hover:bg-gradient-to-r hover:from-[#0142b2]/10 hover:to-transparent transition-all duration-200 group/item"
                      >
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0142b2] to-[#027a1e] opacity-0 group-hover/item:opacity-100 transition-opacity"></span>
                        <span className={`text-[14px] text-gray-600 group-hover/item:text-gray-900 font-medium transition-colors ${bengaliClass}`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="h-1 bg-gradient-to-r from-[#0142b2] via-[#e5251f] to-[#027a1e]"></div>
                </div>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {menu.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group relative px-2 xl:px-3 py-2 font-medium text-[14px] whitespace-nowrap transition-all duration-300 cursor-pointer ${bengaliClass} ${pathname === href
                    ? "text-[#01368f]"
                    : "text-gray-600 hover:text-[#01368f]"
                    }`}
                >
                  {label}

                  {/* Underline Indicator */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#0142b2] transition-all duration-300 ${pathname === href ? "w-6" : "w-0 group-hover:w-4"
                      }`}
                  ></span>
                </Link>
              ))}
            </div>
            </div>
            {/* end left cluster */}

            {/* CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Desktop */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Login / User Profile - Desktop */}
              {user ? (
                <div className="hidden lg:block relative group">
                  <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0142b2] shadow-sm">
                      {user.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.image} alt={user.firstName || user.name || "User"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0142b2] to-[#027a1e] flex items-center justify-center text-white font-bold text-sm">
                          {(user.firstName || user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-gray-800 leading-tight max-w-[120px] truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.email?.split('@')[0])}
                      </p>
                      <p className={`text-[11px] text-gray-400 capitalize ${bengaliClass}`}>{user.role || 'student'}</p>
                    </div>
                    <LuChevronDown className="text-gray-400 group-hover:rotate-180 transition-transform duration-300 hidden xl:block" />
                  </button>

                  {/* User Dropdown */}
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-md shadow-md border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || 'User')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href={user.role === 'admin' || user.role === 'superAdmin' || user.role === 'trainingManager' ? "/dashboard/admin" : user.role === 'mentor' ? "/dashboard/mentor" : "/dashboard/user"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <LuLayoutDashboard className="text-[#0142b2]" />
                        <span className={`text-sm font-medium text-gray-700 ${bengaliClass}`}>{t("navbar.dashboard")}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <LuLogOut className="text-red-500" />
                        <span className={`text-sm font-medium text-red-600 ${bengaliClass}`}>{t("navbar.logout")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="hidden lg:block">
                  <div className="relative group overflow-hidden rounded-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0142b2] via-[#01368f] to-[#0142b2] bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite] transition-all"></div>
                    <div className="relative flex gap-2 items-center px-5 py-2.5">
                      <HiOutlineUserCircle className="text-xl text-white group-hover:scale-110 transition-transform duration-300" />
                      <span className={`text-white font-semibold text-[14px] tracking-wide whitespace-nowrap ${bengaliClass}`}>
                        {t("navbar.signIn")}
                      </span>
                    </div>
                  </div>
                </Link>
              )}


              {/* Language toggle (mobile) — to the left of the hamburger */}
              <div className="lg:hidden">
                <LanguageSwitcher />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all duration-300"
                onClick={toggleMobileMenu}
              >
                <div className="relative w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                      }`}
                  ></span>
                  <span
                    className={`w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
                      }`}
                  ></span>
                  <span
                    className={`w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                      }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Shimmer Animation Keyframe */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
