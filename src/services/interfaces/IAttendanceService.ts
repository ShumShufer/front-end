export interface IAttendanceService {
  getAttendanceHistory(studentId: string, classroomId: string): Promise<any[]>;
  markAttendance(classroomId: string, sessionId: string, records: any[]): Promise<void>;
}
