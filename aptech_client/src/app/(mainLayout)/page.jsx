"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchCategories } from "@/redux/categorySlice";
import { fetchCoursesData } from "@/redux/CourseSlice";
import Hero from "@/components/Home/Hero";
import HomeCategory from "@/components/Home/HomeCategory";
import PopularCourse from "@/components/Home/PopularCourse";
import BooksTeaser from "@/components/Home/BooksTeaser";
import WhatWeProvide from "@/components/Home/WhatWeProvide";
import SuccesHistory from "@/components/Home/SuccesHistory";
import Partners from "@/components/Home/Partners";
import HomeCTA from "@/components/Home/HomeCTA";
import Concerns from "@/components/Home/Concerns";
import PaymentMethod from "@/components/sheard/PaymentMethod";

const HomePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCoursesData());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="overflow-hidden bg-white">
      <Hero />
      {/* How do you want to learn — learning formats */}
      <HomeCategory />
      {/* Popular courses (redux data) */}
      <PopularCourse />
      {/* Books & video lessons teaser (hidden when there are no books) */}
      <BooksTeaser />
      {/* Why BraveTalk — benefits + real live counts */}
      <WhatWeProvide />
      {/* Student reviews from /api/reviews */}
      <SuccesHistory />
      {/* Partners (only when the API returns some) */}
      <Partners />
      {/* Navy CTA band — the one dark section */}
      <HomeCTA />
      {/* Visit / contact strip */}
      <Concerns />
      {/* Payment methods */}
      <PaymentMethod />
    </div>
  );
};

export default HomePage;
