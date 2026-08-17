import type { Course, Topic, CourseResult } from '../../types/course.types.ts';

export interface ICourseService {
  getCourses(params?: { schoolId?: string }): Promise<Course[]>;
  getCourseById(id: string): Promise<Course>;
  createCourse(data: Partial<Course>): Promise<Course>;
  updateCourse(id: string, data: Partial<Course>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  getTopics(courseId: string): Promise<Topic[]>;
  createTopic(courseId: string, data: Partial<Topic>): Promise<Topic>;
  updateTopic(id: string, data: Partial<Topic>): Promise<Topic>;
  
  getStudentProgress(studentId: string): Promise<CourseResult[]>;
  publishResult(courseId: string, studentId: string, data: Partial<CourseResult>): Promise<CourseResult>;
}
