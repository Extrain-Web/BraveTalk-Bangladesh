import { Schema, model } from 'mongoose';
import { ISiteSettings } from './settings.interface';

const settingsSchema = new Schema<ISiteSettings>(
    {
        // Brand / Identity
        brandName: { type: String, default: 'BraveTalk Bangladesh' },
        brandNameBn: { type: String, default: 'ব্রেভটক বাংলাদেশ' },
        websiteUrl: { type: String, default: '' },
        // Site logo — admin-uploaded URL; empty = use the built-in default logo
        logo: { type: String, default: '' },

        // Hero Section - English
        heroBadge: { type: String, default: '🎓 A Leading Platform for Skills Development' },
        heroHeading1: { type: String, default: 'Transform Your' },
        heroHeading2: { type: String, default: 'Career Path' },
        heroHeadingWith: { type: String, default: 'with' },
        heroAcademyName: { type: String, default: 'BraveTalk Bangladesh' },
        heroDescription: { type: String, default: 'Empowering students through public speaking, leadership & social advocacy. Be a Speaker, Be a Leader!' },

        // Hero Section - Bengali
        heroBadgeBn: { type: String, default: '🎓 দক্ষতা উন্নয়নের একটি অগ্রণী প্ল্যাটফর্ম' },
        heroHeading1Bn: { type: String, default: 'আপনার ক্যারিয়ার' },
        heroHeading2Bn: { type: String, default: 'রূপান্তর করুন' },
        heroHeadingWithBn: { type: String, default: 'সাথে' },
        heroAcademyNameBn: { type: String, default: 'ব্রেভটক বাংলাদেশ' },
        heroDescriptionBn: { type: String, default: 'পাবলিক স্পিকিং, লিডারশিপ ও সোশ্যাল অ্যাডভোকেসির মাধ্যমে শিক্ষার্থীদের এগিয়ে নেওয়া। বক্তা হও, নেতা হও!' },

        // Contact Information
        phoneNumber: { type: String, default: '+880 1323-878569' },
        whatsappNumber: { type: String, default: '8801323878569' },
        email: { type: String, default: 'bravetalkbd@gmail.com' },
        address: { type: String, default: 'South Badda, Dhaka, Bangladesh' },
        addressBn: { type: String, default: 'দক্ষিণ বাড্ডা, ঢাকা, বাংলাদেশ' },

        // Social Links
        facebookUrl: { type: String, default: '' },
        youtubeUrl: { type: String, default: '' },
        linkedinUrl: { type: String, default: '' },
        instagramUrl: { type: String, default: '' },

        // Admin-uploaded photos for the public pages (see ISiteSettings.siteImages)
        siteImages: { type: Map, of: String, default: {} },

        // Manual payment accounts shown at checkout (managed from Admin → Payment Info).
        // { mobile: { bkash|nagad|rocket|upay: { number, accountType, enabled } },
        //   banks: [{ bankName, accountName, accountNumber, branch, routingNumber, enabled }],
        //   note: string }
        paymentInfo: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

export const Settings = model<ISiteSettings>('Settings', settingsSchema);
