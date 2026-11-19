// Course pricing helpers — a course is bought once at full price, or is FREE.
// FREE = the fee parses to 0 ("0", "", "Free" …).

export const parsePrice = (value) =>
  Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;

export const isFreeCourse = (course) => parsePrice(course?.fee) === 0;

/** { isFree, fee, offer, hasDiscount, price, percentOff } for any course object. */
export const getCoursePricing = (course) => {
  const fee = parsePrice(course?.fee);
  const offer = course?.offerPrice ? parsePrice(course.offerPrice) : 0;
  const isFree = fee === 0;
  const hasDiscount = !isFree && offer > 0 && offer < fee;
  return {
    isFree,
    fee,
    offer: hasDiscount ? offer : null,
    hasDiscount,
    price: isFree ? 0 : hasDiscount ? offer : fee,
    percentOff: hasDiscount ? Math.round((1 - offer / fee) * 100) : 0,
  };
};
