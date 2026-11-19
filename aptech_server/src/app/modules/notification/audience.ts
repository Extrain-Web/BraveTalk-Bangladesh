/* eslint-disable @typescript-eslint/no-explicit-any */
// Helpers that fan a notification out to the right group of students.
// Every helper swallows its own errors — a failed notification must never
// break the action (saving a lesson, notice, recording) that triggered it.
import { Enrollment } from '../enrollment/enrollment.model';
import { User } from '../user/user.model';
import { NotificationService } from './notification.service';

type NType = 'payment' | 'enrollment' | 'class' | 'exam' | 'assignment' | 'certificate' | 'system' | 'reminder';

const send = async (ids: any[], type: NType, title: string, message: string, link?: string) => {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (!unique.length) return 0;
  await NotificationService.createBulk(unique, type, title, message, link);
  return unique.length;
};

/** Students with an active enrollment in a course. */
export const notifyCourseStudents = async (courseId: any, type: NType, title: string, message: string, link?: string) => {
  try {
    const ids = await Enrollment.distinct('studentId', { courseId, status: { $in: ['active', 'completed'] }, isDeleted: false });
    return await send(ids, type, title, message, link);
  } catch (e) { console.error('notifyCourseStudents failed:', e); return 0; }
};

/** Students placed in a batch. */
export const notifyBatchStudents = async (batchId: any, type: NType, title: string, message: string, link?: string) => {
  try {
    const ids = await Enrollment.distinct('studentId', { batchId, status: { $in: ['active', 'completed'] }, isDeleted: false });
    return await send(ids, type, title, message, link);
  } catch (e) { console.error('notifyBatchStudents failed:', e); return 0; }
};

/** Notice board: 'enrolled' → students with an active enrollment, 'public' → every student account. */
export const notifyNoticeAudience = async (audience: string, title: string, message: string, link = '/dashboard/user/notice-board') => {
  try {
    const ids = audience === 'enrolled'
      ? await Enrollment.distinct('studentId', { status: 'active', isDeleted: false })
      : await User.distinct('_id', { role: 'student' });
    return await send(ids, 'system', title, message, link);
  } catch (e) { console.error('notifyNoticeAudience failed:', e); return 0; }
};
