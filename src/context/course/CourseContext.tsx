import { createContext } from 'react';
import type { Course, Topic, CourseResult } from '../../types/course.types.ts';

export interface CourseState {
  courses: Course[];
  activeCourse: Course | null;
  topics: Topic[];
  progress: CourseResult[];
  isLoading: boolean;
  error: string | null;
}

export interface CourseContextType extends CourseState {
  loadCourses: (params?: { schoolId?: string }) => Promise<void>;
  loadCourseById: (id: string) => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  loadTopics: (courseId: string) => Promise<void>;
  createTopic: (courseId: string, data: Partial<Topic>) => Promise<void>;
  updateTopic: (id: string, data: Partial<Topic>) => Promise<void>;
  loadStudentProgress: (studentId: string) => Promise<void>;
}

export const CourseContext = createContext<CourseContextType | null>(null);
