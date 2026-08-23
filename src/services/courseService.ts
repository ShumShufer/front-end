import type { ICourseService } from "./interfaces/ICourseService.ts";
import type { Course, Topic, CourseResult, ClassroomCourseLink } from "../types/course.types.ts";
import httpClient from "./api/httpClient.ts";

type CourseListResponse = { courses: Course[] };
type ProgressResponse = { progress?: CourseResult[]; results?: CourseResult[] };

class CourseService implements ICourseService {
  async getCourses(params?: { schoolId?: string }): Promise<Course[]> {
    const response = await httpClient.get<CourseListResponse, CourseListResponse>("/courses", { params });
    return response.courses;
  }

  async getCourseById(id: string): Promise<Course> { return httpClient.get<Course, Course>(`/courses/${id}`); }
  async createCourse(data: Partial<Course>): Promise<Course> { return httpClient.post<Course, Course>("/courses", data); }
  async updateCourse(id: string, data: Partial<Course>): Promise<Course> { return httpClient.patch<Course, Course>(`/courses/${id}`, data); }
  async deleteCourse(id: string): Promise<void> { await httpClient.delete<void, void>(`/courses/${id}`); }
  async getTopics(courseId: string): Promise<Topic[]> { return httpClient.get<Topic[], Topic[]>(`/courses/${courseId}/topics`); }
  async createTopic(courseId: string, data: Partial<Topic>): Promise<Topic> { return httpClient.post<Topic, Topic>(`/courses/${courseId}/topics`, data); }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    if (!data.courseId) throw new Error("A course is required to update a topic");
    return httpClient.patch<Topic, Topic>(`/courses/${data.courseId}/topics/${id}`, data);
  }

  async getClassroomCourses(classroomId: string): Promise<ClassroomCourseLink[]> { return httpClient.get<ClassroomCourseLink[], ClassroomCourseLink[]>(`/classrooms/${classroomId}/courses`); }

  async getStudentProgress(studentId: string): Promise<CourseResult[]> {
    const response = await httpClient.get<ProgressResponse | CourseResult[], ProgressResponse | CourseResult[]>(`/students/${studentId}/progress`);
    return Array.isArray(response) ? response : response.progress ?? response.results ?? [];
  }

  async publishResult(courseId: string, studentId: string, data: Partial<CourseResult>): Promise<CourseResult> {
    return httpClient.post<CourseResult, CourseResult>(`/courses/${courseId}/publish-result`, { ...data, studentId });
  }

  async submitFinalExam(courseId: string, studentId: string, classroomId: string, score: number, passScore: number): Promise<CourseResult> {
    return this.publishResult(courseId, studentId, { classroomId, finalExamScore: score, status: score >= passScore ? "PASSED" : "RETAKE_REQUIRED" });
  }
}

export const courseService = new CourseService();
