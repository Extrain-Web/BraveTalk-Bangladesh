"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { LuLock, LuPlay } from "react-icons/lu";

/**
 * 16:9 YouTube player. Pass `locked` to show a lock screen instead of a video.
 * The video link is never rendered for locked lessons (the API doesn't send it either).
 */
export default function YouTubePlayer({ url, title = "Video lesson", locked = false, lockedText, autoplay = false, className = "" }) {
    const src = !locked ? getYouTubeEmbedUrl(url, { autoplay }) : null;

    return (
        <div className={`relative w-full overflow-hidden rounded-md bg-[#0b1b4a] aspect-video shadow-sm ${className}`}>
            {src ? (
                <iframe
                    key={src}
                    src={src}
                    title={title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0b1b4a] to-[#0142b2] text-white text-center px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                        {locked ? <LuLock className="text-2xl" /> : <LuPlay className="text-2xl" />}
                    </div>
                    <p className="text-sm font-medium text-white/90 work">
                        {locked ? lockedText || "This lesson unlocks after you get the book." : "Video unavailable"}
                    </p>
                </div>
            )}
        </div>
    );
}
