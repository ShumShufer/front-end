export interface Quiz {
  id: string;
  topicId?: string | null;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }>;
  passScore: number;
}
