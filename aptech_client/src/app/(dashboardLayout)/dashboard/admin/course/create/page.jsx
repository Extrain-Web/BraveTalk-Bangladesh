'use client';

import CourseForm from '@/components/Admin/course/CourseForm';

// Create & Edit share the same form — see components/Admin/course/CourseForm.jsx
const CreateCoursePage = () => <CourseForm mode="create" />;

export default CreateCoursePage;
