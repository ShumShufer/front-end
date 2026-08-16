import { IQuizService } from '../interfaces/IQuizService';
import { Quiz, QuizResult } from '../../types/quiz.types';

export const mockQuizService: IQuizService = {
  async getById(id: string): Promise<Quiz> {
    return {
      id,
      title: 'Mock Quiz',
      questionIds: [],
      passingScore: 70,
      createdAt: new Date(),
    };
  },

  async getByTopic(topicId: string): Promise<Quiz> {
    return {
      id: '1',
      topicId,
      title: 'Mock Quiz',
      questionIds: [],
      passingScore: 70,
      createdAt: new Date(),
    };
  },

  async create(data: any): Promise<Quiz> {
    return {
      id: '1',
      title: data.title,
      questionIds: [],
      passingScore: data.passingScore,
      createdAt: new Date(),
    };
  },

  async update(id: string, data: any): Promise<Quiz> {
    return {
      id,
      title: data.title,
      questionIds: [],
      passingScore: data.passingScore,
      createdAt: new Date(),
    };
  },

  async submitQuiz(quizId: string, _answers: Record<string, string>): Promise<QuizResult> {
    return {
      id: '1',
      quizId,
      studentId: '1',
      score: 85,
      completedAt: new Date(),
    };
  },

  async getResults(_quizId: string, _studentId: string): Promise<QuizResult[]> {
    return [];
  },
};
