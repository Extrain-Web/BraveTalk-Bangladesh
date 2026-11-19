/**
 * Backfill: copy legacy recordingUrl into recordings[] for any classSchedule
 * where recordings is empty but recordingUrl is set.
 *
 * Run: node scripts/backfill-recordings.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

async function main() {
    if (!MONGO_URI) {
        console.error('DATABASE_URL not set'); process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const col = mongoose.connection.collection('classschedules');

    // Find candidates
    const candidates = await col.find({
        recordingUrl: { $exists: true, $ne: null, $ne: '' },
        $or: [
            { recordings: { $exists: false } },
            { recordings: { $size: 0 } },
        ],
        isDeleted: { $ne: true },
    }).toArray();

    console.log(`Found ${candidates.length} class(es) needing backfill.\n`);

    let updated = 0;
    for (const c of candidates) {
        const rec = {
            title: 'Recording',
            url: c.recordingUrl,
            addedAt: c.updatedAt || c.createdAt || new Date(),
        };
        await col.updateOne(
            { _id: c._id },
            { $set: { recordings: [rec], updatedAt: new Date() } }
        );
        console.log(`  ✓ ${c.title} (${c._id})`);
        console.log(`     -> recordings[0] = "${c.recordingUrl}"`);
        updated++;
    }

    console.log(`\nDone. ${updated}/${candidates.length} updated.`);
    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
