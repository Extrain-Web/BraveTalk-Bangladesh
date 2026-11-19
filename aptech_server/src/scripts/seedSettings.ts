/**
 * Site Settings Seeder Script
 *
 * এই script টি ডাটাবেজের site settings doc-কে BraveTalk Bangladesh এর তথ্য দিয়ে
 * তৈরি/আপডেট করে। নতুন install এ schema default থেকেই ভ্যালু আসবে, কিন্তু
 * আগে থেকে একটা settings doc থাকলে এটা চালিয়ে সেটা আপডেট করতে হবে।
 *
 * Usage: npm run seed:settings
 *        বা: npx ts-node src/scripts/seedSettings.ts
 *
 * Settings গুলো admin dashboard থেকে যেকোনো সময় পরিবর্তন করা যাবে (dynamic)।
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Settings } from '../app/modules/settings/settings.model';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Default brand / contact / address values for BraveTalk Bangladesh
const DEFAULT_SETTINGS = {
    // Brand / Identity
    brandName: 'BraveTalk Bangladesh',
    brandNameBn: 'ব্রেভটক বাংলাদেশ',
    websiteUrl: '',

    // Hero
    heroAcademyName: 'BraveTalk Bangladesh',
    heroAcademyNameBn: 'ব্রেভটক বাংলাদেশ',
    heroDescription:
        'Empowering students through public speaking, leadership & social advocacy. Be a Speaker, Be a Leader!',
    heroDescriptionBn:
        'পাবলিক স্পিকিং, লিডারশিপ ও সোশ্যাল অ্যাডভোকেসির মাধ্যমে শিক্ষার্থীদের এগিয়ে নেওয়া। বক্তা হও, নেতা হও!',

    // Contact
    phoneNumber: '+880 1323-878569',
    whatsappNumber: '8801323878569',
    email: 'bravetalkbd@gmail.com',
    address: 'South Badda, Dhaka, Bangladesh',
    addressBn: 'দক্ষিণ বাড্ডা, ঢাকা, বাংলাদেশ',

    // Social
    facebookUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
};

async function seedSettings() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(dbUrl);
        console.log('✅ Database connected successfully');

        const existing = await Settings.findOne({});

        if (existing) {
            await Settings.findByIdAndUpdate(existing._id, DEFAULT_SETTINGS, { new: true });
            console.log('♻️  Existing site settings updated with BraveTalk Bangladesh info.');
        } else {
            await Settings.create(DEFAULT_SETTINGS);
            console.log('🆕 Site settings created with BraveTalk Bangladesh info.');
        }

        console.log('🎉 Settings seed completed.');
    } catch (error) {
        console.error('❌ Settings seed failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Database disconnected.');
    }
}

seedSettings();
