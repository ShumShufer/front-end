import { ITaskService } from '../interfaces/ITaskService';
import { Task, TaskSubmission } from '../../types/task.types';

export const mockTaskService: ITaskService = {
  async getById(id: string): Promise<Task> {
    return {
      id,
      classroomId: '1',
      title: 'Mock Task',
      deadline: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async listByClassroom(_classroomId: string): Promise<Task[]> {
    return [];
  },

  async create(data: any): Promise<Task> {
    return {
      id: '1',
      classroomId: data.classroomId,
      title: data.title,
      deadline: data.deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async update(id: string, data: any): Promise<Task> {
    return {
      id,
      classroomId: data.classroomId ?? '',
      title: data.title ?? '',
      deadline: data.deadline ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async delete(_id: string): Promise<void> {
    // Mock implementation
  },

  async submitTask(taskId: string, data: { url: string }): Promise<TaskSubmission> {
    return {
      id: '1',
      taskId,
      studentId: '1',
      submissionUrl: data.url,
      submittedAt: new Date(),
    };
  },

  async getSubmissions(_taskId: string): Promise<TaskSubmission[]> {
    return [];
  },

  async gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string
  ): Promise<TaskSubmission> {
    return {
      id: submissionId,
      taskId: '1',
      studentId: '1',
      submissionUrl: '',
      submittedAt: new Date(),
      feedback,
      grade,
    };
  },
};
