import type { TaskType } from './common.types.ts';

export interface Task {
  id: string;
  classroomId: string;
  createdById: string;
  type: TaskType;
  title: string;
  description?: string | null;
  attachments: string[];
  deadline: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  attachments: string[];
  submittedAt: string;
  grade?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
}
