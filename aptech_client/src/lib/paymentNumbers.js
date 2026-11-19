// bKash / Nagad / Rocket "Send Money" numbers shown to students.
// Left empty on purpose until BraveTalk Bangladesh's own payment accounts are ready —
// wherever a number is empty the site shows a "contact us for the number" note instead.
export const PAYMENT_NUMBERS = {
  bkash: "",
  nagad: "",
  rocket: "",
};

export const PAYMENT_CONTACT_PHONE = "01323878569";

export const hasPaymentNumbers = () => Object.values(PAYMENT_NUMBERS).some(Boolean);
