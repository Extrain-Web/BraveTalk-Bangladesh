// Default content for the Contact page — used by the admin editor (initial values)
// AND the public page (fallback when nothing is saved yet). Single source of truth.
export const CONTACT_DEFAULTS = {
  hero: {
    badge: 'Get in touch', badgeBn: 'যোগাযোগ করুন',
    title: "Let's ", titleBn: 'চলুন ',
    highlight: 'Connect', highlightBn: 'সংযুক্ত হই',
    subtitle: 'Have a question or want to enroll? Reach out — our team is here to help you every step of the way.',
    subtitleBn: 'কোনো প্রশ্ন আছে বা ভর্তি হতে চান? যোগাযোগ করুন — আমাদের টিম প্রতিটি ধাপে আপনার পাশে আছে।',
  },
  info: {
    email: 'bravetalkbd@gmail.com',
    phone: '+880 1323-878569',
    visitText: 'South Badda, Dhaka',
    visitTextBn: 'দক্ষিণ বাড্ডা, ঢাকা',
    officeHours: 'Sat–Thu, 9AM–8PM',
    officeHoursBn: 'শনি–বৃহঃ, সকাল ৯টা–রাত ৮টা',
  },
  branches: [
    {
      nameEn: 'BraveTalk Bangladesh Office', nameBn: 'ব্রেভটক বাংলাদেশ অফিস',
      addressEn: 'South Badda, Dhaka, Bangladesh',
      addressBn: 'দক্ষিণ বাড্ডা, ঢাকা, বাংলাদেশ',
      phones: ['01323878569', '01957501506'],
    },
  ],
  map: {
    embedUrl: 'https://www.google.com/maps?q=South+Badda,+Dhaka,+Bangladesh&output=embed',
  },
  social: {
    facebook: '',
    youtube: '',
    linkedin: '',
    whatsapp: '8801323878569',
    followTitle: 'Follow Us', followTitleBn: 'আমাদের ফলো করুন',
    followDesc: 'Stay connected on social media for updates.', followDescBn: 'আপডেটের জন্য সোশ্যাল মিডিয়ায় যুক্ত থাকুন।',
    quickTitle: 'Need Quick Help?', quickTitleBn: 'দ্রুত সাহায্য দরকার?',
    quickDesc: 'Message us on WhatsApp for a fast reply.', quickDescBn: 'দ্রুত উত্তরের জন্য WhatsApp-এ মেসেজ দিন।',
  },
};
