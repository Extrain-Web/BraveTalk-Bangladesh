"use client";

import { motion } from "framer-motion";

const DOTS = { green: "bg-[#027a1e]", blue: "bg-[#0142b2]", red: "bg-[#e5251f]" };

/**
 * Shared section header in the BraveTalk look: a small pill eyebrow with a coloured dot,
 * a navy extrabold title (optional red accent word) and a short description.
 * Pass `isInView` from the parent section's useInView so the stagger animation syncs with scroll.
 * `align="left"` left-aligns it (used next to side actions); `dot` = green | blue | red.
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
    dot = "green",
    className = "",
}) => {
    const centered = align === "center";
    const item = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
    };

    return (
        <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            className={`${centered ? "text-center mx-auto" : "text-left"} max-w-2xl ${className || "mb-9 lg:mb-11"}`}
        >
            {badge && (
                <motion.div
                    variants={item}
                    className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm"
                >
                    {BadgeIcon ? (
                        <BadgeIcon className="text-sm text-[#0142b2]" />
                    ) : (
                        <span className={`h-1.5 w-1.5 rounded-full ${DOTS[dot] || DOTS.green}`} />
                    )}
                    <span className={`text-xs font-medium text-slate-600 work ${bengaliClass}`}>{badge}</span>
                </motion.div>
            )}

            <motion.h2
                variants={item}
                className={`text-[26px] sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-[#0b1b4a] outfit ${bengaliClass}`}
            >
                {title}
                {titleAccent && <span className="text-[#e5251f]"> {String(titleAccent).trim()}</span>}
            </motion.h2>

            {description && (
                <motion.p
                    variants={item}
                    className={`mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-500 work ${centered ? "mx-auto max-w-xl" : "max-w-xl"} ${bengaliClass}`}
                >
                    {description}
                </motion.p>
            )}
        </motion.div>
    );
};

export default SectionHeader;
