"use client";

import React, { useEffect, useState } from "react";
import { IoMdCall } from "react-icons/io";
import { IoMailOutline } from "react-icons/io5";
import { SlSocialLinkedin } from "react-icons/sl";
import Link from "next/link";
import { FiYoutube } from "react-icons/fi";
import { LuFacebook, LuChevronDown, LuMapPin } from "react-icons/lu";
import { FaInstagram } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useDesignScale, scaleStyle } from "@/lib/useDesignScale";

const TopHeader = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  const scale = useDesignScale();

  // Dynamic values from settings with fallbacks
  const phoneNumber = settings?.phoneNumber || "+880 1323-878569";
  const email = settings?.email || "bravetalkbd@gmail.com";
  const facebookUrl = settings?.facebookUrl || "";
  const youtubeUrl = settings?.youtubeUrl || "";
  const linkedinUrl = settings?.linkedinUrl || "";

  // Apply Bengali font class when language is Bengali
  const bengaliClass = language === "bn" ? "hind-siliguri" : "";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setTimeout(() => setUser(JSON.parse(storedUser)), 0);
    }

    // Close dropdown on click away
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <div className="work relative hidden lg:block">
      {/* Premium Charcoal Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1630] via-[#101e40] to-[#0b1630]"></div>

      {/* Gold Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5251f] to-transparent opacity-80"></div>

      <div style={scaleStyle(scale)} className="relative w-full max-w-[1140px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between py-1.5">
          {/* Contact Info - Left Side */}
          <div className="flex items-center gap-4">
            {/* Phone */}
            <a
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
              className="group flex gap-2 items-center px-4 py-1.5 rounded-md bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#0142b2]/50 hover:bg-[#0142b2]/10 transition-all duration-300"
            >
              <span className="relative">
                <IoMdCall className="text-[18px] text-sky-300 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </span>
              <span className="text-[13px] font-medium text-white/90 group-hover:text-white tracking-wide">
                {phoneNumber}
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="group flex gap-2 items-center px-4 py-1.5 rounded-md bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#027a1e]/50 hover:bg-[#027a1e]/10 transition-all duration-300"
            >
              <IoMailOutline className="text-[18px] text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[13px] font-medium text-white/90 group-hover:text-white tracking-wide">
                {email}
              </span>
            </a>

            {/* Branches */}
            <div className="flex gap-2 items-center px-4 py-1.5 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
              <LuMapPin className="text-[16px] text-rose-400" />
              <span className="text-[13px] font-medium text-white/70 tracking-wide">
                {language === "bn" ? "দক্ষিণ বাড্ডা, ঢাকা" : "South Badda, Dhaka"}
              </span>
            </div>
          </div>

          <div className="flex gap-8 items-center">
            {/* Social Media Icons */}
            <div className="flex gap-2 items-center">
              {/* Facebook */}
              <a
                href={facebookUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-9 h-9 flex items-center justify-center rounded-md bg-white/5 border border-white/10 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/20 transition-all duration-300 overflow-hidden"
              >
                <LuFacebook className="text-[16px] text-white/80 group-hover:text-[#1877F2] group-hover:scale-110 transition-all duration-300 z-10" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#1877F2]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>

              {/* YouTube */}
              <a
                href={youtubeUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-9 h-9 flex items-center justify-center rounded-md bg-white/5 border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/20 transition-all duration-300 overflow-hidden"
              >
                <FiYoutube className="text-[16px] text-white/80 group-hover:text-[#FF0000] group-hover:scale-110 transition-all duration-300 z-10" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#FF0000]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-9 h-9 flex items-center justify-center rounded-md bg-white/5 border border-white/10 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/20 transition-all duration-300 overflow-hidden"
              >
                <SlSocialLinkedin className="text-[14px] text-white/80 group-hover:text-[#0A66C2] group-hover:scale-110 transition-all duration-300 z-10" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0A66C2]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>

              {/* Instagram */}
              <a
                href={settings?.instagramUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-9 h-9 flex items-center justify-center rounded-md bg-white/5 border border-white/10 hover:border-[#E4405F]/50 hover:bg-[#E4405F]/20 transition-all duration-300 overflow-hidden"
              >
                <FaInstagram className="text-[16px] text-white/80 group-hover:text-[#E4405F] group-hover:scale-110 transition-all duration-300 z-10" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#E4405F]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
