import type { Quiz } from "../../types/quiz.types.ts";

export interface QuizAttemptResult {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
}

export interface IQuizService {
  listQuizzes(params?: { courseId?: string }): Promise<Quiz[]>;
  getQuizById(id: string): Promise<Quiz>;
  createQuiz(data: Partial<Quiz>): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;
  gradeAttempt(quiz: Quiz, answers: string[]): QuizAttemptResult;
}
