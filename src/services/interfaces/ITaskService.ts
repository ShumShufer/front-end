import type { Task, Submission } from '../../types/task.types.ts';

export interface ITaskService {
  getTasksByClassroom(classroomId: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task>;
  createTask(classroomId: string, data: Partial<Task>): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  getSubmissions(taskId: string): Promise<Submission[]>;
  submitTask(taskId: string, studentId: string, attachments: string[]): Promise<Submission>;
  gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission>;
}
