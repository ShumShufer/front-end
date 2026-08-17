import { createContext } from 'react';
import type { Task, Submission } from '../../types/task.types.ts';

export interface TaskState {
  tasks: Task[];
  activeTask: Task | null;
  submissions: Submission[];
  isLoading: boolean;
  error: string | null;
}

export interface TaskContextType extends TaskState {
  loadTasks: (classroomId: string) => Promise<void>;
  loadTaskById: (id: string) => Promise<void>;
  createTask: (classroomId: string, data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loadSubmissions: (taskId: string) => Promise<void>;
  submitTask: (taskId: string, studentId: string, attachments: string[]) => Promise<void>;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | null>(null);
