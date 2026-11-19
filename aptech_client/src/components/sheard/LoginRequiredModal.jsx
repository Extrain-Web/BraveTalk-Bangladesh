'use client';

import Link from 'next/link';
import { FiX, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Shown when an unauthenticated user tries to purchase / checkout.
 * Offers two paths: Log In (has account) or Sign Up (new).
 * Both carry ?redirect=<redirectTo> so the user returns here after auth.
 */
const LoginRequiredModal = ({ isOpen, onClose, redirectTo = '/' }) => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const bengaliClass = bn ? 'hind-siliguri' : '';

  if (!isOpen) return null;

  const enc = encodeURIComponent(redirectTo);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[#0142b2] via-[#01368f] to-[#027a1e]"></div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        <div className="p-7 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eef3ff] flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-[#0142b2]" size={26} />
          </div>

          <h3 className={`text-lg font-bold text-gray-900 outfit mb-1.5 ${bengaliClass}`}>
            {bn ? 'কিনতে হলে আগে লগইন করুন' : 'Login required to purchase'}
          </h3>
          <p className={`text-sm text-gray-500 work mb-6 leading-relaxed ${bengaliClass}`}>
            {bn
              ? 'কোর্স কিনতে বা পেমেন্ট করতে হলে অবশ্যই আপনার অ্যাকাউন্টে লগইন করতে হবে।'
              : 'You must be logged in to purchase a course or make a payment.'}
          </p>

          <div className="space-y-2.5">
            <Link
              href={`/login?redirect=${enc}`}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#0142b2] to-[#01368f] text-white font-bold text-sm shadow-lg shadow-[#0142b2]/25 hover:shadow-xl transition ${bengaliClass}`}
            >
              <FiLogIn size={16} /> {bn ? 'অ্যাকাউন্ট আছে? লগইন করুন' : 'Have an account? Log In'}
            </Link>
            <Link
              href={`/register?redirect=${enc}`}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#F0DFB4] bg-[#eef3ff]/40 text-[#01368f] font-bold text-sm hover:bg-[#eef3ff] transition ${bengaliClass}`}
            >
              <FiUserPlus size={16} /> {bn ? 'নতুন? সাইন আপ করুন' : 'New here? Sign Up'}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginRequiredModal;
