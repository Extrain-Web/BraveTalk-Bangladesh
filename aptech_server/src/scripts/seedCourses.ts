/**
 * Seeds 7 real BraveTalk Bangladesh course categories + 1 promo combo course,
 * with 4 placeholder mentors. Run: npx ts-node src/scripts/seedCourses.ts
 *
 * NOTE: mentor names/bios and course images below are placeholders —
 * replace with real staff info and real photos from the admin dashboard later.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Category } from '../app/modules/courseCategory/courseCategory.model';
import { Mentor } from '../app/modules/mentor/mentor.model';
import { Course } from '../app/modules/courses/course.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const CATEGORIES = [
  { id: 1, name: 'IELTS' },
  { id: 2, name: 'Spoken English' },
  { id: 3, name: 'Office Management' },
  { id: 4, name: 'Graphic Design' },
  { id: 5, name: 'Web Design' },
  { id: 6, name: 'AutoCAD' },
  { id: 7, name: 'Digital Marketing' },
];

const MENTORS = [
  {
    id: 'mentor-1',
    name: 'Ariful Islam',
    email: 'ariful.islam@bravetalkbd.com',
    phone: '01711000001',
    designation: 'Senior IELTS & Spoken English Instructor',
    subject: 'IELTS / Spoken English',
    specialized_area: ['IELTS Band Score Coaching', 'Spoken English', 'Public Speaking'],
    education_qualification: ['MA in English, Dhaka University', 'CELTA Certified'],
    work_experience: ['6 years teaching IELTS & Spoken English at leading Bangladeshi institutes'],
    training_experience: { years: '6', students: '3000+' },
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
    details: 'Specializes in helping students achieve Band 7+ through structured mock tests and speaking practice.',
    lifeJourney: 'Started as a spoken English trainer and grew into a full-time IELTS mentor after years of helping students go abroad for higher studies.',
  },
  {
    id: 'mentor-2',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@bravetalkbd.com',
    phone: '01711000002',
    designation: 'Graphic & Web Design Instructor',
    subject: 'Graphic Design / Web Design',
    specialized_area: ['Adobe Photoshop', 'Adobe Illustrator', 'HTML/CSS/JS', 'WordPress'],
    education_qualification: ['BSc in Multimedia & Creative Technology'],
    work_experience: ['5 years as a freelance graphic & web designer on Fiverr and Upwork'],
    training_experience: { years: '4', students: '1200+' },
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    details: 'Focuses on portfolio-building and freelancing skills alongside core design fundamentals.',
    lifeJourney: 'Built a freelancing career from scratch and now trains students to do the same.',
  },
  {
    id: 'mentor-3',
    name: 'Kamrul Hasan',
    email: 'kamrul.hasan@bravetalkbd.com',
    phone: '01711000003',
    designation: 'Office Management & AutoCAD Instructor',
    subject: 'Office Management / AutoCAD',
    specialized_area: ['MS Office', 'AutoCAD 2D & 3D', 'Office Administration'],
    education_qualification: ['Diploma in Civil Engineering'],
    work_experience: ['7 years teaching computer office applications and AutoCAD drafting'],
    training_experience: { years: '7', students: '2500+' },
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    details: 'Combines practical office-software training with technical AutoCAD drafting skills.',
    lifeJourney: 'Moved from civil drafting work into full-time technical training.',
  },
  {
    id: 'mentor-4',
    name: 'Tania Akter',
    email: 'tania.akter@bravetalkbd.com',
    phone: '01711000004',
    designation: 'Digital Marketing Instructor',
    subject: 'Digital Marketing',
    specialized_area: ['Facebook Ads', 'Google Ads', 'SEO', 'Social Media Marketing'],
    education_qualification: ['BBA in Marketing'],
    work_experience: ['4 years running paid ad campaigns for local businesses'],
    training_experience: { years: '3', students: '900+' },
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face',
    details: 'Teaches hands-on ad campaign management using real business case studies.',
    lifeJourney: 'Started as a small-business marketer and now trains the next generation of digital marketers.',
  },
];

async function seedCourses() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not defined');

  console.log('🔌 Connecting to database...');
  await mongoose.connect(dbUrl);
  console.log('✅ Connected.');

  // 1. Categories
  const categoryIdMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { id: cat.id },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryIdMap[cat.name] = doc._id as mongoose.Types.ObjectId;
  }
  console.log(`📂 ${CATEGORIES.length} categories ready.`);

  // 2. Mentors
  const mentorIdMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const mentor of MENTORS) {
    const doc = await Mentor.findOneAndUpdate(
      { id: mentor.id },
      { $setOnInsert: mentor },
      { upsert: true, new: true }
    );
    mentorIdMap[mentor.id] = doc._id as mongoose.Types.ObjectId;
  }
  console.log(`👤 ${MENTORS.length} mentors ready.`);

  // 3. Courses
  const COURSES = [
    {
      id: 1,
      title: 'IELTS Preparation Course',
      slug: 'ielts-preparation-course',
      category: categoryIdMap['IELTS'],
      type: 'Offline',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=350&fit=crop',
      fee: '10000',
      offerPrice: '5000',
      rating: 4.8,
      totalRating: 62,
      totalStudentsEnroll: 340,
      mentor: mentorIdMap['mentor-1'],
      technology: 'IELTS',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 60,
      totalExam: 12,
      totalProject: 0,
      details: 'A complete IELTS preparation course covering Listening, Reading, Writing and Speaking with 12 full mock tests and real band-score feedback.',
      courseOverview: 'This course prepares students for both Academic and General Training IELTS through structured lessons, weekly mock tests, and one-on-one speaking practice with expert mentors.',
      curriculum: ['Listening Module', 'Reading Module', 'Writing Task 1 & 2', 'Speaking Part 1, 2 & 3', 'Full Mock Test Practice'],
      courseIncludes: [
        { icon: 'FiHeadphones', text: '60 live classes' },
        { icon: 'FiFileText', text: '12 full mock tests' },
        { icon: 'FiAward', text: 'Band score feedback & certificate' },
      ],
      softwareYoullLearn: ['Online Mock Test Platform'],
      jobPositions: ['Study Abroad Aspirant', 'Immigration Candidate', 'University Applicant'],
    },
    {
      id: 2,
      title: 'Spoken English Course',
      slug: 'spoken-english-course',
      category: categoryIdMap['Spoken English'],
      type: 'Offline',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=350&fit=crop',
      fee: '5000',
      offerPrice: '2500',
      rating: 4.7,
      totalRating: 84,
      totalStudentsEnroll: 520,
      mentor: mentorIdMap['mentor-1'],
      technology: 'Spoken English',
      courseStart: 'Every Month',
      durationMonth: 2,
      lectures: 24,
      totalExam: 2,
      totalProject: 0,
      details: 'Build day-to-day conversational English confidence with grammar fundamentals and free weekly language-club practice sessions.',
      courseOverview: 'A practical spoken English course for beginners to intermediate learners, focused on fluency, pronunciation, and real conversation practice.',
      curriculum: ['Basic Grammar', 'Everyday Conversation', 'Pronunciation Practice', 'Interview & Public Speaking'],
      courseIncludes: [
        { icon: 'FiMessageCircle', text: '24 live classes' },
        { icon: 'FiUsers', text: 'Free weekly language club' },
        { icon: 'FiAward', text: 'Certificate on completion' },
      ],
      softwareYoullLearn: [],
      jobPositions: ['Customer Service Executive', 'Call Center Agent', 'Front Desk Officer'],
    },
    {
      id: 3,
      title: 'Office Management Course',
      slug: 'office-management-course',
      category: categoryIdMap['Office Management'],
      type: 'Offline',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=350&fit=crop',
      fee: '6000',
      offerPrice: '3500',
      rating: 4.6,
      totalRating: 45,
      totalStudentsEnroll: 410,
      mentor: mentorIdMap['mentor-3'],
      technology: 'MS Office',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 36,
      totalExam: 2,
      totalProject: 2,
      details: 'Government-certified office applications course covering MS Word, Excel, PowerPoint and general office administration skills.',
      courseOverview: 'Learn practical computer office skills needed for administrative and data-entry roles, with a government-recognized certificate.',
      curriculum: ['MS Word', 'MS Excel', 'MS PowerPoint', 'Office Administration Basics'],
      courseIncludes: [
        { icon: 'FiFileText', text: '36 live classes' },
        { icon: 'FiAward', text: 'Govt. recognized certificate' },
        { icon: 'FiBriefcase', text: 'Practical assignments' },
      ],
      softwareYoullLearn: ['MS Word', 'MS Excel', 'MS PowerPoint', 'Google Workspace'],
      jobPositions: ['Office Assistant', 'Data Entry Operator', 'Admin Executive'],
    },
    {
      id: 4,
      title: 'Graphic Design Course',
      slug: 'graphic-design-course',
      category: categoryIdMap['Graphic Design'],
      type: 'Online',
      image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=500&h=350&fit=crop',
      fee: '10000',
      offerPrice: '5000',
      rating: 4.9,
      totalRating: 71,
      totalStudentsEnroll: 380,
      mentor: mentorIdMap['mentor-2'],
      technology: 'Graphic Design',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 36,
      totalExam: 1,
      totalProject: 4,
      details: 'Learn Adobe Photoshop and Illustrator from scratch and build a freelancing-ready portfolio with real client-style projects.',
      courseOverview: 'A hands-on graphic design course covering branding, poster & social media design, with dedicated freelancing marketplace support.',
      curriculum: ['Adobe Photoshop Basics', 'Adobe Illustrator Basics', 'Logo & Brand Design', 'Social Media Design', 'Portfolio Building'],
      courseIncludes: [
        { icon: 'FiPenTool', text: '36 live classes' },
        { icon: 'FiBriefcase', text: 'Freelancing marketplace support' },
        { icon: 'FiAward', text: '4 real projects + certificate' },
      ],
      softwareYoullLearn: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva'],
      jobPositions: ['Graphic Designer', 'Freelance Designer', 'Brand Identity Designer'],
    },
    {
      id: 5,
      title: 'Web Design Course',
      slug: 'web-design-course',
      category: categoryIdMap['Web Design'],
      type: 'Online',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=350&fit=crop',
      fee: '10000',
      offerPrice: '5000',
      rating: 4.8,
      totalRating: 58,
      totalStudentsEnroll: 295,
      mentor: mentorIdMap['mentor-2'],
      technology: 'Web Design',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 36,
      totalExam: 1,
      totalProject: 3,
      details: 'Learn to design and build responsive websites using HTML, CSS, JavaScript and WordPress, with freelancing marketplace guidance.',
      courseOverview: 'From HTML basics to a complete responsive WordPress website, this course prepares students to freelance as web designers.',
      curriculum: ['HTML5 & CSS3', 'JavaScript Basics', 'Responsive Design', 'WordPress Website Building'],
      courseIncludes: [
        { icon: 'FiCode', text: '36 live classes' },
        { icon: 'FiBriefcase', text: 'Freelancing marketplace support' },
        { icon: 'FiAward', text: 'Live project + certificate' },
      ],
      softwareYoullLearn: ['HTML5', 'CSS3', 'JavaScript', 'WordPress'],
      jobPositions: ['Web Designer', 'Freelance Web Developer', 'WordPress Developer'],
    },
    {
      id: 6,
      title: 'AutoCAD 2D & 3D Course',
      slug: 'autocad-2d-3d-course',
      category: categoryIdMap['AutoCAD'],
      type: 'Offline',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=350&fit=crop',
      fee: '8000',
      offerPrice: '4000',
      rating: 4.7,
      totalRating: 33,
      totalStudentsEnroll: 180,
      mentor: mentorIdMap['mentor-3'],
      technology: 'AutoCAD',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 36,
      totalExam: 2,
      totalProject: 3,
      details: 'Hands-on AutoCAD 2D and 3D drafting course for students pursuing careers in civil, mechanical or architectural drafting.',
      courseOverview: 'Learn 2D drafting fundamentals and progress to 3D modeling with real drawing exercises and instructor feedback.',
      curriculum: ['AutoCAD 2D Basics', 'Dimensioning & Layouts', 'AutoCAD 3D Modeling', 'Project Drawings'],
      courseIncludes: [
        { icon: 'FiEdit3', text: '36 live classes' },
        { icon: 'FiAward', text: 'Certificate on completion' },
        { icon: 'FiFileText', text: 'Practical drawing sessions' },
      ],
      softwareYoullLearn: ['AutoCAD 2D', 'AutoCAD 3D'],
      jobPositions: ['CAD Draftsman', 'Civil Design Assistant', 'Architectural Drafter'],
    },
    {
      id: 7,
      title: 'Digital Marketing Course',
      slug: 'digital-marketing-course',
      category: categoryIdMap['Digital Marketing'],
      type: 'Online',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=500&h=350&fit=crop',
      fee: '7000',
      offerPrice: '3500',
      rating: 4.6,
      totalRating: 40,
      totalStudentsEnroll: 210,
      mentor: mentorIdMap['mentor-4'],
      technology: 'Digital Marketing',
      courseStart: 'Every Month',
      durationMonth: 2,
      lectures: 24,
      totalExam: 1,
      totalProject: 2,
      details: 'Learn to run real Facebook and Google ad campaigns, SEO basics and social media growth strategy for local and online businesses.',
      courseOverview: 'A practical digital marketing course with real ad-campaign practice, ideal for freelancers and small business marketers.',
      curriculum: ['Facebook Ads Manager', 'Google Ads Basics', 'SEO Fundamentals', 'Social Media Strategy'],
      courseIncludes: [
        { icon: 'FiTrendingUp', text: '24 live classes' },
        { icon: 'FiTarget', text: 'Real ad campaign practice' },
        { icon: 'FiAward', text: 'Certificate on completion' },
      ],
      softwareYoullLearn: ['Facebook Ads Manager', 'Google Ads', 'SEO Tools'],
      jobPositions: ['Digital Marketing Executive', 'Social Media Manager', 'SEO Specialist'],
    },
    {
      id: 8,
      title: 'Computer & Spoken English Combo (SSC Special)',
      slug: 'computer-spoken-english-combo-ssc',
      category: categoryIdMap['Spoken English'],
      type: 'Offline',
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&h=350&fit=crop',
      fee: '6000',
      offerPrice: '3000',
      rating: 4.7,
      totalRating: 28,
      totalStudentsEnroll: 260,
      mentor: mentorIdMap['mentor-3'],
      technology: 'Computer & Spoken English',
      courseStart: 'Every Month',
      durationMonth: 3,
      lectures: 30,
      totalExam: 2,
      totalProject: 1,
      details: 'Special SSC-student combo course covering computer basics and spoken English together at a discounted rate.',
      courseOverview: 'Designed for SSC-level students, this combo course builds basic computer literacy alongside conversational English skills.',
      curriculum: ['Computer & MS Office Basics', 'Typing Practice', 'Internet & Email', 'Basic Spoken English'],
      courseIncludes: [
        { icon: 'FiMonitor', text: '30 live classes' },
        { icon: 'FiUsers', text: 'Free language club access' },
        { icon: 'FiAward', text: 'Special SSC discount + certificate' },
      ],
      softwareYoullLearn: ['MS Office Basics', 'Typing', 'Internet & Email'],
      jobPositions: ['Computer Operator', 'Junior Office Assistant'],
    },
  ];

  for (const course of COURSES) {
    await Course.findOneAndUpdate(
      { id: course.id },
      { $set: course },
      { upsert: true, new: true }
    );
    console.log(`✅ ${course.title}`);
  }

  console.log(`🎉 ${COURSES.length} courses seeded.`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seedCourses().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exitCode = 1;
});
