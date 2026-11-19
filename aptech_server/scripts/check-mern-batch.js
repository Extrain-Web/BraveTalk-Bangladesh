/**
 * Preflight check: BAC-MERNF07 batch + MERN Frontend course
 * Run: node scripts/check-mern-batch.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/bdcalling-academy';

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const Batch = mongoose.connection.collection('batches');
    const Course = mongoose.connection.collection('courses');

    // 1. Find batch BAC-MERNF07
    const batch = await Batch.findOne({ id: 'BAC-MERNF07', isDeleted: { $ne: true } });
    if (batch) {
        console.log('Batch BAC-MERNF07: FOUND');
        console.log('   _id:', batch._id.toString());
        console.log('   courseId:', batch.courseId?.toString() || '(none)');
        console.log('   courseName:', batch.courseName);
        console.log('   mentorId:', batch.mentorId?.toString() || '(none)');
    } else {
        console.log('Batch BAC-MERNF07: NOT FOUND');
    }

    // 2. Search MERN Frontend courses
    console.log('\nCourses matching "MERN" or "Frontend":');
    const courses = await Course.find({
        $or: [
            { title: { $regex: /mern/i } },
            { title: { $regex: /frontend/i } },
            { title: { $regex: /front.end/i } },
        ]
    }).toArray();
    if (courses.length === 0) {
        console.log('   (none found)');
    } else {
        courses.forEach(c => {
            console.log(`   ${c._id}  |  ${c.title}  |  type: ${c.type}`);
        });
    }

    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
