"use client";

import { useState } from "react";
import { FiCopy, FiCheck, FiPhone } from "react-icons/fi";
import { LuLandmark, LuSmartphone } from "react-icons/lu";
import { usePaymentInfo, PAYMENT_CONTACT_PHONE } from "@/lib/paymentNumbers";

/**
 * "Send money to" box used on the course and book checkouts.
 * Shows only the accounts the admin switched ON in Dashboard → Payment Info.
 */
export default function ManualPaymentAccounts({ amount, isBn = false, bn = "" }) {
    const { mobile, banks, note, hasAny } = usePaymentInfo();
    const [copied, setCopied] = useState("");

    const copy = (key, value) => {
        try {
            navigator.clipboard?.writeText(String(value).replace(/\s/g, ""));
            setCopied(key);
            setTimeout(() => setCopied(""), 1500);
        } catch { /* clipboard not available */ }
    };

    const CopyBtn = ({ k, v }) => (
        <button type="button" onClick={() => copy(k, v)} title="Copy"
            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            {copied === k ? <FiCheck size={14} className="text-green-600" /> : <FiCopy size={14} />}
        </button>
    );

    if (!hasAny) {
        return (
            <p className={`flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ${bn}`}>
                <FiPhone className="shrink-0" />
                {isBn ? `পেমেন্ট নম্বর জানতে কল করুন: ${PAYMENT_CONTACT_PHONE}` : `Call ${PAYMENT_CONTACT_PHONE} to get our payment number.`}
            </p>
        );
    }

    const amountText = amount != null ? `৳${Number(amount).toLocaleString("en-IN")}` : "";

    return (
        <div className="space-y-3">
            {mobile.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {mobile.map((m) => (
                        <div key={m.key} className="rounded-md border border-slate-200 bg-white p-3" style={{ borderLeft: `3px solid ${m.color}` }}>
                            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <LuSmartphone size={12} style={{ color: m.color }} /> {m.name}{m.accountType ? ` (${m.accountType})` : ""}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-base font-bold text-slate-800">{m.number}</span>
                                <CopyBtn k={m.key} v={m.number} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {banks.map((b, i) => (
                <div key={`bank-${i}`} className="rounded-md border border-slate-200 border-l-[3px] border-l-[#0b1b4a] bg-white p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <LuLandmark size={12} className="text-[#0b1b4a]" /> {isBn ? "ব্যাংক ট্রান্সফার" : "Bank transfer"}{b.bankName ? ` — ${b.bankName}` : ""}
                    </p>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                        {b.accountName && <div><dt className="text-[11px] text-slate-400">Account name</dt><dd className="font-semibold text-slate-800">{b.accountName}</dd></div>}
                        <div>
                            <dt className="text-[11px] text-slate-400">Account number</dt>
                            <dd className="flex items-center gap-1 font-mono font-bold text-slate-800">{b.accountNumber}<CopyBtn k={`bank-${i}`} v={b.accountNumber} /></dd>
                        </div>
                        {b.branch && <div><dt className="text-[11px] text-slate-400">Branch</dt><dd className="text-slate-700">{b.branch}</dd></div>}
                        {b.routingNumber && <div><dt className="text-[11px] text-slate-400">Routing number</dt><dd className="font-mono text-slate-700">{b.routingNumber}</dd></div>}
                    </dl>
                </div>
            ))}

            <p className={`text-xs text-slate-500 ${bn}`}>
                {isBn
                    ? `উপরের যেকোনো অ্যাকাউন্টে ${amountText} পাঠান, তারপর নিচে Sender নম্বর ও Transaction ID দিন।`
                    : `Send ${amountText} to any account above (mobile: "Send Money"), then enter the sender number and transaction ID below.`}
            </p>
            {note && <p className={`whitespace-pre-line rounded-md bg-[#eef3fc] px-3 py-2 text-xs text-[#0b1b4a] ${bn}`}>{note}</p>}
        </div>
    );
}
