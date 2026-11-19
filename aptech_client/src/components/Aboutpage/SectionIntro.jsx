"use client";

/** Shared section header for the About page: eyebrow pill + heading + optional text. */
export default function SectionIntro({ eyebrow, title, accent, text, dot = "bg-[#0142b2]", center = true, bn = "" }) {
    return (
        <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className={`text-xs font-medium text-slate-600 work ${bn}`}>{eyebrow}</span>
            </div>
            <h2 className={`mt-4 text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bn}`}>
                {title} {accent && <span className="text-[#e5251f]">{accent}</span>}
            </h2>
            {text && <p className={`mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${bn}`}>{text}</p>}
        </div>
    );
}
