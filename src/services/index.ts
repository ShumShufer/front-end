import type { IAuthService } from './interfaces/IAuthService';
import type { ISchoolService } from './interfaces/ISchoolService';
import type { IClassroomService } from './interfaces/IClassroomService';
import type { ICourseService } from './interfaces/ICourseService';
import type { ITaskService } from './interfaces/ITaskService';
import type { IQuizService } from './interfaces/IQuizService';
import type { IEnrollmentService } from './interfaces/IEnrollmentService';
import type { IUserService } from './interfaces/IUserService';
import type { IPaymentService } from './interfaces/IPaymentService';
import type { INotificationService } from './interfaces/INotificationService';
import type { IAttendanceService } from './interfaces/IAttendanceService';

import { mockAuthService } from './mock/mockAuthService';
import { mockSchoolService } from './mock/mockSchoolService';
import { mockClassroomService } from './mock/mockClassroomService';
import { mockCourseService } from './mock/mockCourseService';
import { mockTaskService } from './mock/mockTaskService';
import { mockQuizService } from './mock/mockQuizService';
import { mockEnrollmentService } from './mock/mockEnrollmentService';
import { mockUserService } from './mock/mockUserService';
import { mockPaymentService } from './mock/mockPaymentService';
import { mockNotificationService } from './mock/mockNotificationService';
import { mockAttendanceService } from './mock/mockAttendanceService';

// Remote service implementations will replace the mock services here
// once the back-end API is ready. Swap each mock below for its remote counterpart.
export const authService: IAuthService = mockAuthService;
export const schoolService: ISchoolService = mockSchoolService;
export const classroomService: IClassroomService = mockClassroomService;
export const courseService: ICourseService = mockCourseService;
export const taskService: ITaskService = mockTaskService;
export const quizService: IQuizService = mockQuizService;
export const enrollmentService: IEnrollmentService = mockEnrollmentService;
export const userService: IUserService = mockUserService;
export const paymentService: IPaymentService = mockPaymentService;
export const notificationService: INotificationService = mockNotificationService;
export const attendanceService: IAttendanceService = mockAttendanceService;
