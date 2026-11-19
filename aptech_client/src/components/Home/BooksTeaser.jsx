"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { LuArrowRight, LuCirclePlay, LuFileText, LuTruck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import BookCard from "@/components/Books/BookCard";
import { booksApi } from "@/lib/booksApi";
import SectionHeader from "./SectionHeader";

const MAX_BOOKS = 4;

// Home page teaser for the bookstore — hidden entirely when there are no books.
const BooksTeaser = () => {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bn = isBn ? "hind-siliguri" : "";

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
    const [books, setBooks] = useState(null);

    useEffect(() => {
        let cancelled = false;
        booksApi
            .list()
            .then((data) => !cancelled && setBooks(Array.isArray(data) ? data.slice(0, MAX_BOOKS) : []))
            .catch(() => !cancelled && setBooks([]));
        return () => {
            cancelled = true;
        };
    }, []);

    if (books && books.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-white py-12 lg:py-16">

            <div ref={sectionRef} className="relative mx-auto max-w-[1140px] 2xl:max-w-[1280px] px-4 sm:px-6">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <SectionHeader
                            align="left"
                            dot="red"
                            className="mb-0"
                            badge={isBn ? "বই · পিডিএফ · ভিডিও লেসন" : "Books · PDFs · Video lessons"}
                            title={isBn ? "বই ও" : "Books &"}
                            titleAccent={isBn ? "ভিডিও লেসন" : "video lessons"}
                            description={
                                isBn
                                    ? "স্পোকেন ইংলিশ ও পাবলিক স্পিকিংয়ের বাছাই করা বই — প্রতিটির সাথে ভিডিও লেসন।"
                                    : "Hand-picked books for spoken English and public speaking — each with video lessons."
                            }
                            isInView={isInView}
                            bengaliClass={bn}
                        />
                        <div className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 work ${bn}`}>
                            <span className="flex items-center gap-1.5"><LuCirclePlay className="text-[#0142b2]" /> {isBn ? "ভিডিও লেসন" : "Video lessons"}</span>
                            <span className="flex items-center gap-1.5"><LuFileText className="text-[#0142b2]" /> {isBn ? "পিডিএফ" : "PDF reader"}</span>
                            <span className="flex items-center gap-1.5"><LuTruck className="text-[#0142b2]" /> {isBn ? "হোম ডেলিভারি" : "Home delivery"}</span>
                        </div>
                    </div>
                    <Link
                        href="/books"
                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1b4a] shadow-sm transition hover:border-[#0142b2]/40 hover:text-[#0142b2] work ${bn}`}
                    >
                        {isBn ? "সব বই দেখুন" : "Browse all books"} <LuArrowRight />
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {books === null
                        ? Array.from({ length: MAX_BOOKS }).map((_, i) => (
                              <div key={i} className="h-[340px] animate-pulse rounded-md border border-slate-200 bg-slate-50" />
                          ))
                        : books.map((book) => <BookCard key={book._id || book.slug} book={book} />)}
                </motion.div>
            </div>
        </section>
    );
};

export default BooksTeaser;
