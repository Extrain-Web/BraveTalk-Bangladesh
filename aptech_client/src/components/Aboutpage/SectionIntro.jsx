"use client";

/** Shared section header for the About page: small eyebrow + heading (red accent bar) + optional text. */
export default function SectionIntro({ eyebrow, title, accent, text, center = true, bn = "" }) {
    return (
        <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
            <p className={`text-xs font-semibold uppercase tracking-wider text-[#e5251f] work ${bn}`}>{eyebrow}</p>
            <h2
                className={`mt-2 text-2xl sm:text-3xl font-bold leading-tight text-[#0b1b4a] outfit ${bn} ${
                    center ? "" : "border-l-4 border-[#e5251f] pl-3"
                }`}
            >
                {title} {accent && <span className="text-[#0142b2]">{accent}</span>}
            </h2>
            {center && <span className="mx-auto mt-3 block h-[3px] w-12 bg-[#e5251f]" />}
            {text && <p className={`mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${bn}`}>{text}</p>}
        </div>
    );
}
