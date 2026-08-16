import { Enrollment, EnrollmentApplication, EnrollmentStatus } from '../../types/enrollment.types';

export interface IEnrollmentService {
  applyToSchool(schoolId: string, data: any): Promise<EnrollmentApplication>;
  getMyApplications(studentId: string): Promise<EnrollmentApplication[]>;
  getApplicationsForSchool(schoolId: string): Promise<EnrollmentApplication[]>;
  reviewApplication(applicationId: string, status: EnrollmentStatus): Promise<EnrollmentApplication>;
  getEnrollments(studentId: string): Promise<Enrollment[]>;
}
