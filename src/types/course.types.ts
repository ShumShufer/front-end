import type { CoursePassStatus } from "./common.types.ts";

export interface Course {
  id: string;
  schoolId?: string | null;
  title: string;
  description?: string | null;
  price: number;
  isFree: boolean;
  createdAt: string;
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
}

export interface ClassroomCourse {
  classroomId: string;
  courseId: string;
  order: number;
  mandatory: boolean;
}

/** Classroom course joined with its course details for UI consumption. */
export interface ClassroomCourseLink {
  course: Course;
  order: number;
  mandatory: boolean;
}

export interface CourseResult {
  id: string;
  studentId: string;
  courseId: string;
  classroomId: string;
  status: CoursePassStatus;
  finalExamScore?: number | null;
  publishedAt?: string | null;
}
