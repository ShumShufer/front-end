import { createContext } from "react";
import type {
  Course,
  Topic,
  CourseResult,
  ClassroomCourseLink,
} from "../../types/course.types.ts";

export interface CourseState {
  courses: Course[];
  activeCourse: Course | null;
  topics: Topic[];
  classroomCourses: ClassroomCourseLink[];
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
  loadClassroomCourses: (classroomId: string) => Promise<void>;
  loadStudentProgress: (studentId: string) => Promise<void>;
  submitFinalExam: (
    courseId: string,
    studentId: string,
    classroomId: string,
    score: number,
    passScore: number,
  ) => Promise<void>;
  publishResult: (
    courseId: string,
    studentId: string,
    data: Partial<CourseResult>,
  ) => Promise<void>;
}

export const CourseContext = createContext<CourseContextType | null>(null);
