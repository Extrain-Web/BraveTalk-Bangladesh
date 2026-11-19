/**
 * Bulk Enroll Offline Students into MERN Frontend Course + BAC-MERNF07 Batch
 *
 * Email format: lowercase(name with no spaces, dots, hyphens) + @gmail.com
 * Password: phone number (as provided)
 * User.id: the S### code from the offline list
 *
 * Run: node scripts/enroll-mern-frontend-07.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/bdcalling-academy';
const COURSE_ID = '694950230e4c0c0b63c79e4a'; // Mastering MERN Stack Web Development (Offline)
const BATCH_ID = '6a0d545878940f14d8cdb484';   // BAC-MERNF07
const BATCH_CODE = 'BAC-MERNF07';

const students = [
    { sid: 'S395107', name: 'Robiaul Aual Masum',       phone: '01915179084' },
    { sid: 'S15856',  name: 'Al-Sakhrun Anim',          phone: '01601441233' },
    { sid: 'S21124',  name: 'Shakib Hasan Shuasto',     phone: '01703488281' },
    { sid: 'S21801',  name: 'Sumaya Pahar',             phone: '01781931534' },
    { sid: 'S24109',  name: 'shahariar hossain pranto', phone: '01912661908' },
    { sid: 'S60113',  name: 'Md. Abu Abdullah',         phone: '01776703145' },
    { sid: 'S60724',  name: 'Samiur Rahman Siyam',      phone: '01621183068' },
    { sid: 'S62510',  name: 'ABU SUFIAN',               phone: '01618562254' },
    { sid: 'S414145', name: 'Junaid Al Habib',          phone: '01748895923' },
];

function makeEmail(name) {
    return name
        .replace(/[.\-]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '') + '@gmail.com';
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');
    const Enrollment = mongoose.connection.collection('enrollments');

    const results = [];

    for (const s of students) {
        const email = makeEmail(s.name);
        const password = s.phone;
        const nameParts = s.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        let status = '';
        try {
            // Lookup by email or by custom id
            let user = await User.findOne({
                $or: [{ email }, { id: s.sid }],
                isDeleted: { $ne: true },
            });

            if (!user) {
                const hashed = await bcrypt.hash(password, 10);
                const insertRes = await User.insertOne({
                    id: s.sid,
                    email,
                    firstName,
                    lastName,
                    phoneNumber: s.phone,
                    password: hashed,
                    isPasswordChanged: false,
                    role: 'student',
                    status: 'active',
                    isDeleted: false,
                    image: '',
                    googleId: '',
                    authProvider: 'local',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                user = { _id: insertRes.insertedId };
                status = 'User created';
                console.log(`  [+] User created: ${s.name} -> ${email}`);
            } else {
                status = 'User exists (reused)';
                console.log(`  [=] User exists: ${email} (reused)`);
            }

            // Enrollment check
            const existingEnrollment = await Enrollment.findOne({
                studentId: user._id,
                courseId: new mongoose.Types.ObjectId(COURSE_ID),
                isDeleted: { $ne: true },
            });

            if (!existingEnrollment) {
                await Enrollment.insertOne({
                    studentId: user._id,
                    courseId: new mongoose.Types.ObjectId(COURSE_ID),
                    batchId: new mongoose.Types.ObjectId(BATCH_ID),
                    status: 'active',
                    enrolledAt: new Date(),
                    payment: {
                        amount: 0,
                        method: 'manual',
                        status: 'paid',
                        paidAt: new Date(),
                    },
                    completionPercent: 0,
                    studentStatus: 'active',
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                status += ' + Enrolled';
                console.log(`      Enrolled in ${BATCH_CODE}`);
            } else {
                // Update batch if missing
                if (!existingEnrollment.batchId) {
                    await Enrollment.updateOne(
                        { _id: existingEnrollment._id },
                        { $set: { batchId: new mongoose.Types.ObjectId(BATCH_ID), status: 'active', studentStatus: 'active', updatedAt: new Date() } }
                    );
                    status += ' + Batch linked';
                    console.log(`      Batch linked to ${BATCH_CODE}`);
                } else {
                    status += ' + Already enrolled';
                    console.log(`      Already enrolled`);
                }
            }

            results.push({
                sid: s.sid,
                name: s.name,
                email,
                password,
                phone: s.phone,
                status,
            });
        } catch (err) {
            console.error(`  [!] Error for ${s.name}:`, err.message);
            results.push({
                sid: s.sid,
                name: s.name,
                email,
                password,
                phone: s.phone,
                status: `ERROR: ${err.message}`,
            });
        }
    }

    console.log('\n\n=======================================================');
    console.log('  STUDENT CREDENTIALS - MERN Frontend (BAC-MERNF07)');
    console.log('=======================================================\n');
    console.log('| # | Student ID | Name | Email (login) | Password | Status |');
    console.log('|---|------------|------|----------------|----------|--------|');
    results.forEach((r, i) => {
        console.log(`| ${i+1} | ${r.sid} | ${r.name} | ${r.email} | ${r.password} | ${r.status} |`);
    });

    const ok = results.filter(r => !r.status.startsWith('ERROR')).length;
    console.log(`\nDone: ${ok}/${results.length} processed without error.`);
    console.log('Course: Mastering MERN Stack Web Development (Offline)');
    console.log(`Batch: ${BATCH_CODE}\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

main().catch(err => { console.error(err); process.exit(1); });
