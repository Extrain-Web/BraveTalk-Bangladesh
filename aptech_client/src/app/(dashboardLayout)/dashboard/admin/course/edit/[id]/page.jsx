'use client';

import { useParams } from 'next/navigation';
import CourseForm from '@/components/Admin/course/CourseForm';

// Create & Edit share the same form — see components/Admin/course/CourseForm.jsx
// Supports ?tab=modules to open the Modules & Lessons tab directly (Recorded courses).
const EditCoursePage = () => {
  const { id } = useParams();
  return <CourseForm mode="edit" courseId={id} />;
};

export default EditCoursePage;
