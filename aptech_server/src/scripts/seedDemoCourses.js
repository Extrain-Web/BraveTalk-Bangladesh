/**
 * Demo data for testing the course → batch → certificate workflow.
 * Uses the public admin API (server must be running) so every record goes
 * through the same validation the admin panel uses.
 *
 * Usage:  node src/scripts/seedDemoCourses.js
 * Env:    API_URL (default http://localhost:5001), ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * All demo records are tagged "[DEMO]" so they are easy to find and delete later.
 *
 * Local test accounts used for the workflow test (local DB only — never use in production):
 *   Admin   : admin@bravetalkbd.com        / see seedAdmin.ts
 *   Mentor  : demo.mentor@bravetalkbd.com  / Mentor@123456   (created below)
 *   Student : demo.student@bravetalkbd.com / Student@12345   (registered through /register)
 */
const API = (process.env.API_URL || 'http://localhost:5001') + '/api';
const SITE = process.env.SITE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bravetalkbd.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456'; // local seed admin (see seedAdmin.ts)

const IMG = `${SITE}/images/logo.png`;

async function call(method, path, token, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`${method} ${path} → ${res.status}: ${json.message || JSON.stringify(json).slice(0, 300)}`);
  }
  return json.data ?? json;
}

const addDays = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

(async () => {
  const login = await call('POST', '/auth/login', null, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = login.token;
  console.log('✅ Logged in as admin');

  // ── Categories ──
  const existingCats = await call('GET', '/categories');
  const catList = Array.isArray(existingCats) ? existingCats : existingCats.data || [];
  const cat = {};
  for (const name of ['Spoken English', 'Public Speaking', 'Leadership']) {
    const found = catList.find((c) => c.name === name);
    cat[name] = found ? found._id : (await call('POST', '/categories/create-category', token, { name, slug: name.toLowerCase().replace(/\s+/g, '-') }))._id;
  }
  console.log('✅ Categories:', Object.keys(cat).join(', '));

  // ── Mentor ──
  const mentors = await call('GET', '/mentors');
  const mentorList = Array.isArray(mentors) ? mentors : mentors.data || [];
  let mentor = mentorList.find((m) => m.email === 'demo.mentor@bravetalkbd.com');
  if (!mentor) {
    mentor = await call('POST', '/mentors/create-mentor', token, {
      id: 'BT-MENTOR-DEMO',
      name: '[DEMO] Rafiq Ahmed',
      email: 'demo.mentor@bravetalkbd.com',
      phone: '01323878569',
      designation: 'Public Speaking & Spoken English Trainer',
      subject: 'Spoken English / Public Speaking',
      specialized_area: ['Spoken English', 'Public Speaking', 'Leadership'],
      education_qualification: ['BA (Hons) in English'],
      work_experience: ['5 years training students in public speaking'],
      training_experience: { years: '5', students: '500' },
      image: IMG,
      details: 'Demo mentor created for workflow testing.',
      lifeJourney: 'Demo mentor profile — replace with a real mentor.',
      password: 'Mentor@123456',
      isPublished: true,
    });
  }
  const mentorId = mentor._id;
  console.log('✅ Mentor:', mentor.name);

  // ── Courses ──
  const coursesRes = await call('GET', '/courses?status=all');
  const courseList = Array.isArray(coursesRes) ? coursesRes : coursesRes.data || coursesRes.courses || [];
  const nextId = Math.max(1000, ...courseList.map((c) => Number(c.id) || 0)) + 1;

  const base = {
    image: IMG, mentor: mentorId, status: 'published',
    rating: 5, totalRating: 0, totalStudentsEnroll: 0, totalExam: 1, totalProject: 1,
    courseIncludes: [{ icon: 'FaVideo', text: 'Live interactive classes' }, { icon: 'FaCertificate', text: 'Certificate on completion' }],
    softwareYoullLearn: ['Confidence', 'Fluency', 'Body language'],
    jobPositions: ['Presenter', 'Team Leader', 'Customer-facing roles'],
  };
  const defs = [
    {
      ...base, title: '[DEMO] Spoken English Foundation', slug: 'demo-spoken-english-foundation',
      category: cat['Spoken English'], type: 'Online', fee: '3000', offerPrice: '2500', admissionFee: 1000,
      technology: 'Spoken English', courseStart: addDays(7), durationMonth: 2, lectures: 24,
      curriculum: ['Daily conversation', 'Grammar for speaking', 'Pronunciation', 'Vocabulary building'],
      details: 'Speak English confidently in daily life — live online classes with mentor feedback.',
      courseOverview: 'A 2-month live online course that takes you from hesitation to confident everyday English.',
    },
    {
      ...base, title: '[DEMO] Public Speaking & Leadership', slug: 'demo-public-speaking-leadership',
      category: cat['Public Speaking'], type: 'Offline', fee: '5000', offerPrice: '4500', admissionFee: 2000,
      technology: 'Public Speaking', courseStart: addDays(10), durationMonth: 3, lectures: 30,
      curriculum: ['Stage fear', 'Speech structure', 'Debate', 'Leadership communication'],
      details: 'In-person course at South Badda, Dhaka. Be a Speaker, Be a Leader!',
      courseOverview: 'Hands-on public speaking, debate and leadership practice in small groups.',
    },
    {
      ...base, title: '[DEMO] Spoken English Recorded Course', slug: 'demo-spoken-english-recorded',
      category: cat['Spoken English'], type: 'Recorded', fee: '1500', offerPrice: '999', admissionFee: 0,
      technology: 'Spoken English', lectures: 20,
      details: 'Learn at your own pace with recorded lessons.',
      courseOverview: 'Self-paced recorded spoken English lessons you can watch anytime.',
    },
  ];
  const created = {};
  let id = nextId;
  for (const d of defs) {
    const exists = courseList.find((c) => c.slug === d.slug);
    created[d.type] = exists || (await call('POST', '/courses/create-course', token, { id: id++, ...d }));
    console.log(`✅ Course (${d.type}):`, created[d.type].title, '→', created[d.type]._id);
  }

  // ── Batches for the live courses ──
  const batchesRes = await call('GET', '/batches');
  const batchList = Array.isArray(batchesRes) ? batchesRes : batchesRes.data || [];
  for (const [type, bid, days] of [['Online', 'BT-SEF-01', ['Sat', 'Mon', 'Wed']], ['Offline', 'BT-PSL-01', ['Fri']]]) {
    const course = created[type];
    if (batchList.find((b) => b.id === bid)) { console.log('✅ Batch exists:', bid); continue; }
    const b = await call('POST', '/batches', token, {
      id: bid, name: `${bid} (${type})`, courseName: course.title, courseId: course._id, mentorId,
      startDate: addDays(type === 'Online' ? 7 : 10), endDate: addDays(type === 'Online' ? 67 : 100),
      classTime: type === 'Online' ? '8:00 PM - 9:30 PM' : '3:00 PM - 5:00 PM', classDays: days,
      branch: type === 'Online' ? 'Online' : 'South Badda (Dhaka)', maxStudents: 30, status: 'active',
    });
    console.log('✅ Batch:', b.id || bid);
  }
  console.log('\n🎉 Demo data ready.');
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
