/**
 * Demo books for the BraveTalk bookstore (tagged "[DEMO]").
 * Uses the admin API, so the server must be running.
 *   node src/scripts/seedDemoBooks.js
 * Env: API_URL (default http://localhost:5001), ADMIN_EMAIL, ADMIN_PASSWORD
 */
const API = (process.env.API_URL || 'http://localhost:5001') + '/api';
const SITE = process.env.SITE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bravetalkbd.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456'; // local seed admin (see seedAdmin.ts)

async function call(method, path, token, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(`${method} ${path} → ${res.status}: ${json.message}`);
  return json.data;
}

// Public, embeddable sample videos (replace with your own unlisted lessons)
const YT = [
  'https://www.youtube.com/watch?v=eIho2S0ZahI', // TED: How to speak so that people want to listen
  'https://www.youtube.com/watch?v=Unzc731iCUY', // How to speak with confidence
  'https://www.youtube.com/watch?v=ZK3jSWJaUhE',
  'https://www.youtube.com/watch?v=tShavGuo0_E',
];
const cover = `${SITE}/images/logo.png`;

(async () => {
  const { token } = await call('POST', '/auth/login', null, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const existing = await call('GET', '/books/admin/all', token);
  const defs = [
    {
      title: '[DEMO] Spoken English Starter Guide',
      author: 'BraveTalk Bangladesh',
      shortDescription: 'Free starter guide with 3 video lessons.',
      description: 'A free beginner guide to everyday spoken English — greetings, introductions and small talk, with short video lessons.',
      format: 'digital', isFree: true, price: 0, pages: 40, category: 'Spoken English',
      videos: [
        { title: 'Lesson 1: Introducing yourself', youtubeUrl: YT[0], duration: '9:58', isPreview: true },
        { title: 'Lesson 2: Small talk that works', youtubeUrl: YT[1], duration: '12:10' },
        { title: 'Lesson 3: Speaking without fear', youtubeUrl: YT[2], duration: '8:20' },
      ],
    },
    {
      title: '[DEMO] Public Speaking Masterclass (eBook)',
      author: 'BraveTalk Bangladesh',
      shortDescription: 'Digital book + 4 lesson videos on stage confidence.',
      description: 'Learn how to plan a speech, control stage fear, use your voice and body language, and lead a room. Includes the full PDF and 4 video lessons.',
      format: 'digital', isFree: false, price: 499, offerPrice: 349, pages: 120, category: 'Public Speaking',
      videos: [
        { title: 'Lesson 1: Why people fear the stage', youtubeUrl: YT[0], duration: '9:58', isPreview: true },
        { title: 'Lesson 2: Building your speech', youtubeUrl: YT[1], duration: '12:10' },
        { title: 'Lesson 3: Voice & body language', youtubeUrl: YT[2], duration: '8:20' },
        { title: 'Lesson 4: Handling questions', youtubeUrl: YT[3], duration: '10:05' },
      ],
    },
    {
      title: '[DEMO] Leadership Communication (Printed)',
      author: 'BraveTalk Bangladesh',
      shortDescription: 'Printed book delivered to your door + video lessons.',
      description: 'A printed workbook on leadership communication, delivered anywhere in Bangladesh. Every buyer also gets the companion video lessons.',
      format: 'both', isFree: false, price: 650, offerPrice: 550, stock: 25, pages: 160, category: 'Leadership',
      videos: [
        { title: 'Lesson 1: Leading by example', youtubeUrl: YT[3], duration: '10:05', isPreview: true },
        { title: 'Lesson 2: Running a team meeting', youtubeUrl: YT[1], duration: '12:10' },
      ],
    },
  ];
  for (const d of defs) {
    if (existing.find((b) => b.title === d.title)) { console.log('exists:', d.title); continue; }
    const b = await call('POST', '/books', token, { ...d, coverImage: cover, status: 'published' });
    console.log('✅', b.title, '→ /books/' + b.slug);
  }
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
