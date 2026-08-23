import type { ITaskService } from "./interfaces/ITaskService.ts";
import type { Task, Submission } from "../types/task.types.ts";
import httpClient from "./api/httpClient.ts";

type TasksResponse = { tasks: Task[] };
type SubmissionsResponse = { submissions: Submission[] };

class TaskService implements ITaskService {
  async getTasksByClassroom(classroomId: string): Promise<Task[]> { const response = await httpClient.get<TasksResponse, TasksResponse>("/tasks", { params: { classroomId } }); return response.tasks; }
  async getTaskById(id: string): Promise<Task> { return httpClient.get<Task, Task>(`/tasks/${id}`); }
  async createTask(classroomId: string, data: Partial<Task>): Promise<Task> { return httpClient.post<Task, Task>("/tasks", { ...data, classroomId }); }
  async updateTask(id: string, data: Partial<Task>): Promise<Task> { return httpClient.patch<Task, Task>(`/tasks/${id}`, data); }
  async deleteTask(id: string): Promise<void> { await httpClient.delete<void, void>(`/tasks/${id}`); }
  async getSubmissions(taskId: string): Promise<Submission[]> { const response = await httpClient.get<SubmissionsResponse, SubmissionsResponse>(`/tasks/${taskId}/submissions`); return response.submissions; }
  async getSubmissionById(id: string): Promise<Submission> { const response = await httpClient.get<SubmissionsResponse, SubmissionsResponse>("/submissions", { params: { id } }); const submission = response.submissions.find((item) => item.id === id); if (!submission) throw new Error("Submission not found"); return submission; }
  async getStudentSubmissions(studentId: string): Promise<Submission[]> { const response = await httpClient.get<SubmissionsResponse, SubmissionsResponse>("/submissions", { params: { studentId } }); return response.submissions; }
  async submitTask(taskId: string, _studentId: string, attachments: string[]): Promise<Submission> { return httpClient.post<Submission, Submission>(`/tasks/${taskId}/submissions`, { attachments }); }
  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> { return httpClient.patch<Submission, Submission>(`/submissions/${submissionId}/grade`, { grade, feedback }); }
}

export const taskService = new TaskService();
