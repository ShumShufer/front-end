import type { ITaskService } from './interfaces/ITaskService.ts';
import type { Task, Submission } from '../types/task.types.ts';
import { TaskType } from '../types/common.types.ts';
import { mockTasks, mockSubmissions } from './mockData.ts';
// import httpClient from './api/httpClient.ts';

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class TaskService implements ITaskService {
  async getTasksByClassroom(classroomId: string): Promise<Task[]> {
    // return httpClient.get(`/classrooms/${classroomId}/tasks`);
    const filtered = mockTasks.filter(t => t.classroomId === classroomId);
    return delay(500, filtered);
  }

  async getTaskById(id: string): Promise<Task> {
    // return httpClient.get(`/tasks/${id}`);
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return delay(400, task);
  }

  async createTask(classroomId: string, data: Partial<Task>): Promise<Task> {
    // return httpClient.post(`/classrooms/${classroomId}/tasks`, data);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      classroomId,
      createdById: data.createdById ?? 'user-3',
      type: data.type ?? TaskType.ASSIGNMENT,
      title: data.title ?? '',
      description: data.description ?? null,
      attachments: data.attachments ?? [],
      deadline: data.deadline ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return delay(600, newTask);
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    // return httpClient.patch(`/tasks/${id}`, data);
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks[index] = { ...mockTasks[index], ...data };
    return delay(500, mockTasks[index]);
  }

  async deleteTask(id: string): Promise<void> {
    // return httpClient.delete(`/tasks/${id}`);
    const index = mockTasks.findIndex(t => t.id === id);
    if (index > -1) mockTasks.splice(index, 1);
    return delay(400, undefined);
  }

  async getSubmissions(taskId: string): Promise<Submission[]> {
    // return httpClient.get(`/tasks/${taskId}/submissions`);
    const filtered = mockSubmissions.filter(s => s.taskId === taskId);
    return delay(500, filtered);
  }

  async submitTask(taskId: string, studentId: string, attachments: string[]): Promise<Submission> {
    // return httpClient.post(`/tasks/${taskId}/submissions`, { studentId, attachments });
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      taskId,
      studentId,
      attachments,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null,
      gradedAt: null,
    };
    mockSubmissions.push(newSub);
    return delay(600, newSub);
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> {
    // return httpClient.patch(`/submissions/${submissionId}/grade`, { grade, feedback });
    const index = mockSubmissions.findIndex(s => s.id === submissionId);
    if (index === -1) throw new Error('Submission not found');
    mockSubmissions[index] = {
      ...mockSubmissions[index],
      grade,
      feedback,
      gradedAt: new Date().toISOString(),
    };
    return delay(500, mockSubmissions[index]);
  }
}

export const taskService = new TaskService();
