"use client";

import { motion } from "framer-motion";

const ACCENTS = { green: "text-[#027a1e]", blue: "text-[#0142b2]", red: "text-[#e5251f]" };

/**
 * Shared section header in the classic BraveTalk look: a small uppercase eyebrow,
 * a navy bold title (optional red accent word), a short red underline bar and a short description.
 * Pass `isInView` from the parent section's useInView so the stagger animation syncs with scroll.
 * `align="left"` left-aligns it (used next to side actions); `dot` = green | blue | red (eyebrow colour).
 */
const SectionHeader = ({
    badge,
    BadgeIcon,
    title,
    titleAccent,
    description,
    isInView = true,
    bengaliClass = "",
    align = "center",
    dot = "red",
    className = "",
}) => {
    const centered = align === "center";
    const item = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    return (
        <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
            className={`${centered ? "text-center mx-auto" : "text-left"} max-w-2xl ${className || "mb-8 lg:mb-10"}`}
        >
            {badge && (
                <motion.p
                    variants={item}
                    className={`mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${ACCENTS[dot] || ACCENTS.red} work ${bengaliClass}`}
                >
                    {BadgeIcon && <BadgeIcon className="text-sm" />}
                    {badge}
                </motion.p>
            )}

            <motion.h2
                variants={item}
                className={`text-[26px] sm:text-3xl lg:text-[34px] font-bold leading-tight text-[#0b1b4a] outfit ${bengaliClass}`}
            >
                {title}
                {titleAccent && <span className="text-[#e5251f]"> {String(titleAccent).trim()}</span>}
            </motion.h2>

            <motion.span
                variants={item}
                aria-hidden="true"
                className={`mt-3 block h-[3px] w-14 bg-[#e5251f] ${centered ? "mx-auto" : ""}`}
            />

            {description && (
                <motion.p
                    variants={item}
                    className={`mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-600 work ${centered ? "mx-auto max-w-xl" : "max-w-xl"} ${bengaliClass}`}
                >
                    {description}
                </motion.p>
            )}
        </motion.div>
    );
};

export default SectionHeader;
