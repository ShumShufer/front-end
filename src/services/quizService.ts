import type { IQuizService, QuizAttemptResult } from "./interfaces/IQuizService.ts";
import type { Quiz } from "../types/quiz.types.ts";
import { mockQuizzes, mockTopics } from "./mockData.ts";

const delay = <T>(ms: number, value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

class QuizService implements IQuizService {
  async listQuizzes(params?: { courseId?: string }): Promise<Quiz[]> {
    if (!params?.courseId) return delay(400, [...mockQuizzes]);
    // A course's quizzes are those attached to the course's topics.
    const topicIds = mockTopics
      .filter((t) => t.courseId === params.courseId)
      .map((t) => t.id);
    const filtered = mockQuizzes.filter(
      (q) => q.topicId !== null && topicIds.includes(q.topicId as string),
    );
    return delay(500, filtered);
  }

  async getQuizById(id: string): Promise<Quiz> {
    const quiz = mockQuizzes.find((q) => q.id === id);
    if (!quiz) throw new Error("Quiz not found");
    return delay(400, quiz);
  }

  async createQuiz(data: Partial<Quiz>): Promise<Quiz> {
    if (data.topicId) {
      // Each topic holds a single quiz; replacing is intentional.
      const existingIndex = mockQuizzes.findIndex(
        (q) => q.topicId === data.topicId,
      );
      if (existingIndex > -1) mockQuizzes.splice(existingIndex, 1);
    }
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      topicId: data.topicId ?? null,
      title: data.title ?? "",
      questions: data.questions ?? [],
      passScore: data.passScore ?? 70,
    };
    mockQuizzes.push(quiz);
    return delay(600, quiz);
  }

  async deleteQuiz(id: string): Promise<void> {
    const index = mockQuizzes.findIndex((q) => q.id === id);
    if (index > -1) mockQuizzes.splice(index, 1);
    return delay(400, undefined);
  }

  gradeAttempt(quiz: Quiz, answers: string[]): QuizAttemptResult {
    // answers[i] corresponds to quiz.questions[i]; empty string = skipped.
    let earnedPoints = 0;
    let totalPoints = 0;
    quiz.questions.forEach((question, i) => {
      totalPoints += question.points;
      if (answers[i] && answers[i] === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });
    const score =
      totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    return { score, passed: score >= quiz.passScore, earnedPoints, totalPoints };
  }
}

export const quizService = new QuizService();
