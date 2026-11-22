"use client";

import { useEffect, useState } from "react";

// Large screens: header + hero are laid out for a ~1500px-wide window and scaled as one piece,
// so they keep the same proportions on any big screen and at any browser zoom.
export const DESIGN_WIDTH = 1500;
const MIN_SCALE = 0.82;

export function useDesignScale() {
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const fit = () => {
            const w = document.documentElement.clientWidth;
            setScale(w >= 1024 ? Math.max(MIN_SCALE, w / DESIGN_WIDTH) : 1);
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    }, []);
    return scale;
}

/** Inline style for the scaled container (nothing below lg). */
export const scaleStyle = (scale) => (scale !== 1 ? { zoom: scale } : undefined);
