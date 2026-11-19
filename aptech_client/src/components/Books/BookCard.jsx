"use client";

import Link from "next/link";
import { LuCirclePlay, LuBookOpen, LuTruck, LuFileText } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { formatTaka } from "@/lib/booksApi";

/**
 * Book card used on /books and in the student's "My Books".
 * `href` overrides the link (My Books links into the reader instead of the shop page).
 */
export default function BookCard({ book, href, owned = false }) {
    const { language } = useLanguage();
    const bn = language === "bn" ? "hind-siliguri" : "";
    const link = href || `/books/${book.slug}`;
    const price = book.finalPrice ?? (book.isFree ? 0 : book.offerPrice || book.price);
    const hasOffer = !book.isFree && book.offerPrice > 0 && book.offerPrice < book.price;
    const printed = book.format === "printed" || book.format === "both";
    const digital = book.format === "digital" || book.format === "both";

    return (
        <Link
            href={link}
            className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
            {/* Cover */}
            <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span
                    className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${
                        book.isFree ? "bg-[#027a1e] text-white" : "bg-white text-[#0b1b4a] border border-slate-200"
                    }`}
                >
                    {book.isFree ? (language === "bn" ? "ফ্রি" : "Free") : language === "bn" ? "পেইড" : "Paid"}
                </span>
                {owned && (
                    <span className="absolute right-3 top-3 rounded-sm bg-[#0142b2] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        {language === "bn" ? "আপনার বই" : "Owned"}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4">
                {book.category && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5251f] work">{book.category}</p>}
                <h3 className={`mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[#0b1b4a] outfit ${bn}`}>{book.title}</h3>
                <p className="mt-1 text-xs text-slate-500 work">{book.author}</p>

                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 work">
                    {book.videoCount > 0 && (
                        <span className="flex items-center gap-1"><LuCirclePlay className="text-[#0142b2]" /> {book.videoCount} {language === "bn" ? "ভিডিও" : "videos"}</span>
                    )}
                    {digital && book.hasPdf && <span className="flex items-center gap-1"><LuFileText className="text-[#0142b2]" /> PDF</span>}
                    {printed && <span className="flex items-center gap-1"><LuTruck className="text-[#0142b2]" /> {language === "bn" ? "হোম ডেলিভারি" : "Home delivery"}</span>}
                    {book.pages > 0 && <span className="flex items-center gap-1"><LuBookOpen className="text-[#0142b2]" /> {book.pages} {language === "bn" ? "পৃষ্ঠা" : "pages"}</span>}
                </div>

                <div className="mt-auto flex items-end justify-between pt-4">
                    {owned ? (
                        <span className={`text-sm font-semibold text-[#0142b2] work ${bn}`}>{language === "bn" ? "পড়া শুরু করুন →" : "Open book →"}</span>
                    ) : (
                        <div>
                            <span className={`text-lg font-bold outfit ${book.isFree ? "text-[#027a1e]" : "text-[#0b1b4a]"}`}>
                                {book.isFree ? (language === "bn" ? "ফ্রি" : "Free") : formatTaka(price)}
                            </span>
                            {hasOffer && <span className="ml-2 text-xs text-slate-400 line-through">{formatTaka(book.price)}</span>}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
