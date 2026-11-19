/**
 * Admin Password Reset Script
 *
 * সব admin অ্যাকাউন্ট লিস্ট করে এবং একটি নির্দিষ্ট admin-এর password
 * একটি জানা ভ্যালুতে রিসেট করে (password ভুলে গেলে ব্যবহার করুন)।
 *
 * Usage:
 *   npm run reset:admin                       (ডিফল্ট email + password রিসেট করে)
 *   npx ts-node src/scripts/resetAdminPassword.ts <email> <newPassword>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../app/modules/user/user.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const TARGET_EMAIL = process.argv[2] || 'sakib@exampleee.com';
const NEW_PASSWORD = process.argv[3] || 'Admin@123456';

async function resetAdminPassword() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(dbUrl);
        console.log('✅ Database connected successfully');

        // List all admins
        const admins = await User.find({ role: 'admin', isDeleted: false }).select('id email firstName lastName');
        console.log('\n👥 Existing admin accounts:');
        console.log('━'.repeat(50));
        admins.forEach((a) => {
            console.log(`📧 ${a.email}   🆔 ${a.id}   (${a.firstName ?? ''} ${a.lastName ?? ''})`);
        });
        console.log('━'.repeat(50));

        // Find target admin
        const admin = await User.findOne({ email: TARGET_EMAIL, role: 'admin', isDeleted: false });
        if (!admin) {
            console.log(`\n❌ No admin found with email: ${TARGET_EMAIL}`);
            console.log('   উপরের লিস্ট থেকে একটি email নিয়ে আবার চালান:');
            console.log('   npx ts-node src/scripts/resetAdminPassword.ts <email> <newPassword>');
            return;
        }

        // Set new password (pre-save hook will hash it)
        admin.password = NEW_PASSWORD;
        admin.isPasswordChanged = true; // যাতে login এ আবার change করতে force না করে
        admin.status = 'active' as any; // login এর জন্য status active থাকা জরুরি
        await admin.save();

        console.log('\n✅ Password reset successfully!');
        console.log('━'.repeat(50));
        console.log('📧 Email   :', admin.email);
        console.log('🔑 Password:', NEW_PASSWORD);
        console.log('🆔 ID      :', admin.id);
        console.log('━'.repeat(50));
        console.log('\n⚠️  Login এর পর password পরিবর্তন করে নিন।');
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Database disconnected.');
    }
}

resetAdminPassword();
