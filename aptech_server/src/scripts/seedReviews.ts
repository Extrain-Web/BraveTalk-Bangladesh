/**
 * Seeds initial student reviews. Run: npx ts-node src/scripts/seedReviews.ts
 * Only inserts if the reviews collection is empty, so it won't duplicate on re-run.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Review } from '../app/modules/review/review.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const REVIEWS = [
    { name: 'Nusrat Jahan', role: 'IELTS Band 7.5 · Now in Canada', courseTag: 'IELTS', rating: 5, text: 'I got Band 7.5 after taking the IELTS course at BraveTalk Bangladesh. The mock tests and speaking practice felt so real that I was not nervous at all on exam day. Now studying in Canada.' },
    { name: 'Rakibul Hasan', role: 'Customer Service Executive', courseTag: 'Spoken English', rating: 5, text: 'The Spoken English course completely changed my confidence. I can now speak fluently in interviews. I landed a great position at a call center right after finishing.' },
    { name: 'Tania Sultana', role: 'Freelance Graphic Designer', courseTag: 'Graphic Design', rating: 5, text: 'The freelancing support in the Graphic Design course was the best part. I learned Photoshop and Illustrator, and now I get regular work on Fiverr. The instructor was always ready to help.' },
    { name: 'Shakil Ahmed', role: 'Junior Web Developer', courseTag: 'Web Design', rating: 4, text: 'From HTML and CSS to building a full WordPress site — I learned it all here. Landed a junior developer job at a software company within just 3 months of finishing.' },
    { name: 'Mahfuz Rahman', role: 'CAD Draftsman', courseTag: 'AutoCAD', rating: 5, text: 'I learned both AutoCAD 2D and 3D hands-on. The practical drawing sessions were extremely useful. Now working as a draftsman at a civil engineering firm.' },
    { name: 'Farzana Akter', role: 'Digital Marketing Agency Owner', courseTag: 'Digital Marketing', rating: 5, text: 'Learned to run real Facebook and Google ad campaigns, and now I run my own small marketing agency. The real campaign practice made all the difference.' },
];

async function seed() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not defined');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected.');

    const existing = await Review.countDocuments();
    if (existing > 0) {
        console.log(`ℹ️  ${existing} reviews already exist — skipping seed.`);
    } else {
        await Review.insertMany(REVIEWS.map((r) => ({ ...r, status: 'approved' })));
        console.log(`🎉 ${REVIEWS.length} reviews seeded.`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
});
