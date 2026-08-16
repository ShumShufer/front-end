import { Task, TaskSubmission } from '../../types/task.types';

export interface ITaskService {
  getById(id: string): Promise<Task>;
  listByClassroom(classroomId: string): Promise<Task[]>;
  create(data: any): Promise<Task>;
  update(id: string, data: any): Promise<Task>;
  delete(id: string): Promise<void>;
  submitTask(taskId: string, data: { url: string }): Promise<TaskSubmission>;
  getSubmissions(taskId: string): Promise<TaskSubmission[]>;
  gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<TaskSubmission>;
}
