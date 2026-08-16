import { Quiz, QuizResult } from '../../types/quiz.types';

export interface IQuizService {
  getById(id: string): Promise<Quiz>;
  getByTopic(topicId: string): Promise<Quiz>;
  create(data: any): Promise<Quiz>;
  update(id: string, data: any): Promise<Quiz>;
  submitQuiz(quizId: string, answers: Record<string, string>): Promise<QuizResult>;
  getResults(quizId: string, studentId: string): Promise<QuizResult[]>;
}
