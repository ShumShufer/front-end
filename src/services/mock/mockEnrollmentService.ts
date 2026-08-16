import { IEnrollmentService } from '../interfaces/IEnrollmentService';
import { Enrollment, EnrollmentApplication, EnrollmentStatus } from '../../types/enrollment.types';

export const mockEnrollmentService: IEnrollmentService = {
  async applyToSchool(schoolId: string, data: any): Promise<EnrollmentApplication> {
    return {
      id: '1',
      studentId: '1',
      schoolId,
      formData: data,
      status: EnrollmentStatus.PENDING,
      submittedAt: new Date(),
    };
  },

  async getMyApplications(_studentId: string): Promise<EnrollmentApplication[]> {
    return [];
  },

  async getApplicationsForSchool(_schoolId: string): Promise<EnrollmentApplication[]> {
    return [];
  },

  async reviewApplication(applicationId: string, status: EnrollmentStatus): Promise<EnrollmentApplication> {
    return {
      id: applicationId,
      studentId: '1',
      schoolId: '1',
      formData: {},
      status,
      submittedAt: new Date(),
    };
  },

  async getEnrollments(_studentId: string): Promise<Enrollment[]> {
    return [];
  },
};
