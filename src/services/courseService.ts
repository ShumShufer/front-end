import type { ICourseService } from "./interfaces/ICourseService.ts";
import type { Course, Topic, CourseResult } from "../types/course.types.ts";
import { CoursePassStatus } from "../types/common.types.ts";
import { mockCourses, mockTopics, mockCourseResults } from "./mockData.ts";
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class CourseService implements ICourseService {
  async getCourses(params?: { schoolId?: string }): Promise<Course[]> {
    // return httpClient.get('/courses', { params });
    let filtered = mockCourses;
    if (params?.schoolId) {
      filtered = filtered.filter((c) => c.schoolId === params.schoolId);
    }
    return delay(500, filtered);
  }

  async getCourseById(id: string): Promise<Course> {
    // return httpClient.get(`/courses/${id}`);
    const course = mockCourses.find((c) => c.id === id);
    if (!course) throw new Error("Course not found");
    return delay(400, course);
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    // return httpClient.post('/courses', data);
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: data.title ?? "",
      schoolId: data.schoolId ?? null,
      description: data.description ?? null,
      price: data.price ?? 0,
      isFree: data.isFree ?? false,
      createdAt: new Date().toISOString(),
    };
    mockCourses.push(newCourse);
    return delay(600, newCourse);
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    // return httpClient.patch(`/courses/${id}`, data);
    const index = mockCourses.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Course not found");
    mockCourses[index] = { ...mockCourses[index], ...data };
    return delay(500, mockCourses[index]);
  }

  async deleteCourse(id: string): Promise<void> {
    // return httpClient.delete(`/courses/${id}`);
    const index = mockCourses.findIndex((c) => c.id === id);
    if (index > -1) mockCourses.splice(index, 1);
    return delay(500, undefined);
  }

  async getTopics(courseId: string): Promise<Topic[]> {
    // return httpClient.get(`/courses/${courseId}/topics`);
    const filtered = mockTopics.filter((t) => t.courseId === courseId);
    return delay(400, filtered);
  }

  async createTopic(courseId: string, data: Partial<Topic>): Promise<Topic> {
    // return httpClient.post(`/courses/${courseId}/topics`, data);
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      courseId,
      title: data.title ?? "",
      description: data.description ?? null,
      order:
        data.order ??
        mockTopics.filter((t) => t.courseId === courseId).length + 1,
      videoUrl: data.videoUrl ?? null,
      content: data.content ?? null,
    };
    mockTopics.push(newTopic);
    return delay(600, newTopic);
  }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    // return httpClient.patch(`/topics/${id}`, data);
    const index = mockTopics.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Topic not found");
    mockTopics[index] = { ...mockTopics[index], ...data };
    return delay(500, mockTopics[index]);
  }

  async getStudentProgress(studentId: string): Promise<CourseResult[]> {
    // return httpClient.get(`/students/${studentId}/course-results`);
    const filtered = mockCourseResults.filter((r) => r.studentId === studentId);
    return delay(400, filtered);
  }

  async publishResult(
    courseId: string,
    studentId: string,
    data: Partial<CourseResult>,
  ): Promise<CourseResult> {
    // return httpClient.post(`/course-results`, { courseId, studentId, ...data });
    const existing = mockCourseResults.find(
      (r) => r.courseId === courseId && r.studentId === studentId,
    );
    if (existing) {
      const index = mockCourseResults.indexOf(existing);
      mockCourseResults[index] = {
        ...existing,
        ...data,
        publishedAt: new Date().toISOString(),
      };
      return delay(500, mockCourseResults[index]);
    }
    const newResult: CourseResult = {
      id: `result-${Date.now()}`,
      courseId,
      studentId,
      classroomId: data.classroomId ?? "classroom-1",
      status: data.status ?? CoursePassStatus.IN_PROGRESS,
      finalExamScore: data.finalExamScore ?? null,
      publishedAt: new Date().toISOString(),
    };
    mockCourseResults.push(newResult);
    return delay(500, newResult);
  }
}

export const courseService = new CourseService();
