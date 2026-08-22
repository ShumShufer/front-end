import type { IQuizService, QuizAttemptResult } from "./interfaces/IQuizService.ts";
import type { Quiz } from "../types/quiz.types.ts";
import httpClient from "./api/httpClient.ts";

class QuizService implements IQuizService {
  async listQuizzes(params?: { courseId?: string }): Promise<Quiz[]> { return httpClient.get<Quiz[], Quiz[]>("/quizzes", { params }); }
  async getQuizById(id: string): Promise<Quiz> { return httpClient.get<Quiz, Quiz>(`/quizzes/${id}`); }
  async createQuiz(data: Partial<Quiz>): Promise<Quiz> { return httpClient.post<Quiz, Quiz>("/quizzes", data); }
  async deleteQuiz(id: string): Promise<void> { await httpClient.delete<void, void>(`/quizzes/${id}`); }

  gradeAttempt(quiz: Quiz, answers: string[]): QuizAttemptResult {
    const totalPoints = quiz.questions.reduce((total, question) => total + question.points, 0);
    const earnedPoints = quiz.questions.reduce((total, question, index) => total + (question.correctAnswer === answers[index] ? question.points : 0), 0);
    const score = totalPoints ? (earnedPoints / totalPoints) * 100 : 0;
    return { score, passed: score >= quiz.passScore, totalPoints, earnedPoints };
  }
}

export const quizService = new QuizService();
