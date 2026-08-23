export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDUCATION_HEAD: "EDUCATION_HEAD",
  MENTOR: "MENTOR",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const VerificationStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const ApplicationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ApplicationMode = {
  ONLINE: "ONLINE",
  IN_PERSON: "IN_PERSON",
} as const;

export type ApplicationMode =
  (typeof ApplicationMode)[keyof typeof ApplicationMode];

export const ScheduleScope = {
  SCHOOL: "SCHOOL",
  CLASSROOM: "CLASSROOM",
} as const;

export type ScheduleScope = (typeof ScheduleScope)[keyof typeof ScheduleScope];

export const TaskType = {
  ASSIGNMENT: "ASSIGNMENT",
  QUIZ: "QUIZ",
  EXAM: "EXAM",
} as const;

export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const CoursePassStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  PASSED: "PASSED",
  FAILED: "FAILED",
  RETAKE_REQUIRED: "RETAKE_REQUIRED",
} as const;

export type CoursePassStatus =
  (typeof CoursePassStatus)[keyof typeof CoursePassStatus];

export const PaymentType = {
  ENROLLMENT: "ENROLLMENT",
  COURSE_PURCHASE: "COURSE_PURCHASE",
  PRACTICE_ELSEWHERE_FEE: "PRACTICE_ELSEWHERE_FEE",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const NotificationTopic = {
  SCHOOL_ANNOUNCEMENT: "SCHOOL_ANNOUNCEMENT",
  STAFF_POST: "STAFF_POST",
  CLASSROOM: "CLASSROOM",
  APPLICATION: "APPLICATION",
  TASK: "TASK",
  RESULT: "RESULT",
  PAYMENT: "PAYMENT",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationTopic =
  (typeof NotificationTopic)[keyof typeof NotificationTopic];

export interface PaginatedData<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
}
