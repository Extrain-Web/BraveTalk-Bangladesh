"use client";

import { useSettings } from "@/context/SettingsContext";

// Manual payment accounts (bKash / Nagad / Rocket / Upay "Send Money" numbers and bank
// accounts). Admin manages them in Dashboard → Payment Info (settings.paymentInfo);
// only the ones switched ON there are shown at checkout.

export const PAYMENT_CONTACT_PHONE = "01323878569";

export const MOBILE_METHODS = [
    { key: "bkash", name: "bKash", color: "#E2136E", logo: "/images/bkash.webp" },
    { key: "nagad", name: "Nagad", color: "#F6921E", logo: "/images/nagad.png" },
    { key: "rocket", name: "Rocket", color: "#8C3494", logo: "/images/rocket.png" },
    { key: "upay", name: "Upay", color: "#0054A6", logo: "" },
];

export const ACCOUNT_TYPES = ["Personal", "Agent", "Merchant"];

/** Normalises settings.paymentInfo into what checkout needs (enabled accounts only). */
export function buildPaymentInfo(raw) {
    const info = raw || {};
    const mobileRaw = info.mobile || {};
    const mobile = MOBILE_METHODS
        .map((m) => ({ ...m, ...(mobileRaw[m.key] || {}) }))
        .filter((m) => m.enabled && String(m.number || "").trim());
    const banks = (Array.isArray(info.banks) ? info.banks : [])
        .filter((b) => b && b.enabled && String(b.accountNumber || "").trim());
    // "Payment via" choices at checkout: each enabled mobile wallet + "Bank" when a bank is on
    const payVia = [
        ...mobile.map((m) => ({ key: m.key, label: m.name })),
        ...(banks.length ? [{ key: "bank", label: "Bank" }] : []),
    ];
    return { mobile, banks, payVia, note: info.note || "", hasAny: mobile.length > 0 || banks.length > 0 };
}

/** Hook: enabled payment accounts from the live site settings. */
export function usePaymentInfo() {
    const { settings } = useSettings() || {};
    return buildPaymentInfo(settings?.paymentInfo);
}
