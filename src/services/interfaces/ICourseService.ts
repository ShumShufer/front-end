import { Course, Topic } from '../../types/course.types';

export interface ICourseService {
  getById(id: string): Promise<Course>;
  listByClassroom(classroomId: string): Promise<Course[]>;
  create(data: any): Promise<Course>;
  update(id: string, data: any): Promise<Course>;
  delete(id: string): Promise<void>;
  getTopics(courseId: string): Promise<Topic[]>;
  getTopic(topicId: string): Promise<Topic>;
}
