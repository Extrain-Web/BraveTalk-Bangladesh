"use client";

import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";

// Floating contact shortcuts — Messenger + WhatsApp (bottom-right stack).
const WhatsAppButton = () => {
    const [hovered, setHovered] = useState(null); // 'wa' | 'msg' | null
    const { settings } = useSettings();

    // WhatsApp number from settings (fallback to the default business number)
    const whatsappNumber = String(settings?.whatsappNumber || "8801323878569").replace(/[^0-9]/g, "");
    const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello BraveTalk Bangladesh! I want to know more about your courses.")}`;

    // Messenger link derived from the Facebook page URL (fallback slug)
    const fbUrl = settings?.facebookUrl || "";
    const pageSlug = (() => {
        try {
            const slug = new URL(fbUrl).pathname.replace(/\//g, "").trim();
            return slug;
        } catch { return ""; }
    })();
    const msgHref = pageSlug ? `https://m.me/${pageSlug}` : undefined;

    const Btn = ({ href, id, label, color, hoverColor, Icon, tooltip }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-3 justify-end group"
            aria-label={label}
        >
            <span
                className={`px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg transition-all duration-300 whitespace-nowrap ${hovered === id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}
            >
                {tooltip}
            </span>
            <span className="relative">
                <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />
                <span
                    className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    style={{ background: color }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = color)}
                >
                    <Icon className="text-white text-3xl" />
                </span>
            </span>
        </a>
    );

    return (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
            <Btn href={msgHref} id="msg" label="Chat on Messenger" color="#0084FF" hoverColor="#006fd6" Icon={FaFacebookMessenger} tooltip="Message us" />
            <Btn href={waHref} id="wa" label="Chat on WhatsApp" color="#25D366" hoverColor="#20bd5a" Icon={FaWhatsapp} tooltip="Chat with us!" />
        </div>
    );
};

export default WhatsAppButton;
