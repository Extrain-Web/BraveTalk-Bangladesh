"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome, FiBookOpen, FiBook, FiInfo, FiLogIn } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

// App-style bottom navigation for mobile only (hidden on md+).
export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const { language } = useLanguage();
  const bn = language === "bn";
  const bc = bn ? "hind-siliguri" : "";
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
    } catch {
      setUser(null);
    }
  }, [pathname]);

  const dashPath = user
    ? ["admin", "superAdmin", "trainingManager"].includes(user.role)
      ? "/dashboard/admin"
      : user.role === "mentor"
        ? "/dashboard/mentor"
        : "/dashboard/user"
    : null;

  const initial = (user?.name || user?.firstName || user?.email || "U").charAt(0).toUpperCase();

  const items = [
    { href: "/", Icon: FiHome, label: bn ? "হোম" : "Home" },
    { href: "/courses", Icon: FiBookOpen, label: bn ? "কোর্স" : "Courses" },
    { href: "/books", Icon: FiBook, label: bn ? "বই" : "Books" },
    { href: "/about", Icon: FiInfo, label: bn ? "সম্পর্কে" : "About" },
    user
      ? { href: dashPath, avatar: true, label: bn ? "অ্যাকাউন্ট" : "Account" }
      : { href: `/login?redirect=${encodeURIComponent(pathname)}`, Icon: FiLogIn, label: bn ? "লগইন" : "Login" },
  ];

  const isActive = (href) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9000] bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map((it, i) => {
          const { href, Icon, label, avatar } = it;
          const active = isActive(href);
          return (
            <Link
              key={i}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${active ? "text-[#0142b2]" : "text-gray-500 hover:text-gray-700"}`}
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#0142b2]" />}
              {avatar ? (
                <span
                  className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-[#0142b2] to-[#01368f] ${active ? "ring-2 ring-[#0142b2] ring-offset-1" : ""}`}
                >
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </span>
              ) : (
                <Icon size={20} className={active ? "scale-110 transition-transform" : "transition-transform"} />
              )}
              <span className={`text-[10px] font-medium leading-none ${bc}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
