import { Role, type Role as RoleType } from "../types/common.types.ts";

export const ROUTES = {
  public: {
    landing: "/",
    schools: "/schools",
    schoolProfile: (schoolId = ":schoolId") => `/schools/${schoolId}`,
    courses: "/courses",
    courseDetail: (courseId = ":courseId") => `/courses/${courseId}`,
    mentors: "/mentors",
    drivers: "/drivers",
    applications: "/applications",
    announcements: "/announcements",
    about: "/about",
    pricing: "/pricing",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyFayda: "/auth/verify-fayda",
    verificationPending: "/auth/verification-pending",
    onboarding: "/auth/onboarding",
  },
  student: {
    root: "/app/student",
    dashboard: "/app/student/dashboard",
    apply: (schoolId = ":schoolId") => `/app/student/apply/${schoolId}`,
    applications: "/app/student/applications",
    classroom: "/app/student/classroom",
    classroomHub: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}`,
    classroomFeed: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/feed`,
    classroomCourses: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/courses`,
    classroomResources: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/resources`,
    classroomTasks: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/tasks`,
    classroomSchedule: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/schedule`,
    classroomAttendance: (classroomId = ":classroomId") =>
      `/app/student/classroom/${classroomId}/attendance`,
    coursePlayer: (courseId = ":courseId") =>
      `/app/student/courses/${courseId}`,
    courseExam: (courseId = ":courseId") =>
      `/app/student/courses/${courseId}/exam`,
    taskDetail: (taskId = ":taskId") => `/app/student/tasks/${taskId}`,
    practiceQuizzes: "/app/student/practice-quizzes",
    practiceElsewhere: "/app/student/practice-elsewhere",
    results: "/app/student/results",
    profile: "/app/student/profile",
    payments: "/app/student/payments",
    notifications: "/app/student/notifications",
    leaveReview: (courseId = ":courseId") => `/app/student/reviews/${courseId}`,
  },
  mentor: {
    root: "/app/mentor",
    dashboard: "/app/mentor/dashboard",
    classrooms: "/app/mentor/classrooms",
    classroomHub: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}`,
    announcements: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/announcements`,
    courses: "/app/mentor/courses",
    courseEdit: (courseId = ":courseId") => `/app/mentor/courses/${courseId}`,
    topicEdit: (courseId = ":courseId", topicId = ":topicId") =>
      `/app/mentor/courses/${courseId}/topics/${topicId}`,
    quizBuilder: "/app/mentor/quizzes/builder",
    tasks: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/tasks`,
    taskEdit: (taskId = ":taskId") => `/app/mentor/tasks/${taskId}`,
    grading: (submissionId = ":submissionId") =>
      `/app/mentor/submissions/${submissionId}/grade`,
    publishResults: (courseId = ":courseId") =>
      `/app/mentor/courses/${courseId}/publish-results`,
    schedule: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/schedule`,
    attendance: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/attendance`,
    reportStudent: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/report`,
    resources: (classroomId = ":classroomId") =>
      `/app/mentor/classrooms/${classroomId}/resources`,
    profile: "/app/mentor/profile",
    notifications: "/app/mentor/notifications",
    openings: "/app/mentor/openings",
  },
  educationHead: {
    root: "/app/education-head",
    dashboard: "/app/education-head/dashboard",
    mentors: "/app/education-head/mentors",
    schedule: "/app/education-head/schedule",
    classrooms: "/app/education-head/classrooms",
    courses: "/app/education-head/courses",
    notifications: "/app/education-head/notifications",
  },
  admin: {
    root: "/app/admin",
    dashboard: "/app/admin/dashboard",
    profile: "/app/admin/profile",
    schoolProfile: "/app/admin/school/profile",
    branches: "/app/admin/school/branches",
    courses: "/app/admin/school/courses",
    enrollments: "/app/admin/enrollments",
    applicationForm: "/app/admin/enrollments/form-builder",
    staffApplications: "/app/admin/staff/applications",
    staffPosts: "/app/admin/staff/posts",
    announcements: "/app/admin/announcements",
    schedule: "/app/admin/schedule",
    educationHeads: "/app/admin/education-heads",
    agreements: "/app/admin/agreements",
    practiceRequests: "/app/admin/practice-requests",
    students: "/app/admin/students",
    classrooms: "/app/admin/classrooms",
    reviews: "/app/admin/reviews",
    revenue: "/app/admin/revenue",
    settings: "/app/admin/settings",
    notifications: "/app/admin/notifications",
  },
  superAdmin: {
    root: "/app/super-admin",
    dashboard: "/app/super-admin/dashboard",
    schools: "/app/super-admin/schools",
    admins: "/app/super-admin/admins",
    announcements: "/app/super-admin/announcements",
    courses: "/app/super-admin/courses",
    payments: "/app/super-admin/payments",
    reports: "/app/super-admin/reports",
    users: "/app/super-admin/users",
    faydaAudit: "/app/super-admin/fayda-audit",
    settings: "/app/super-admin/settings",
    notifications: "/app/super-admin/notifications",
  },
  shared: {
    search: "/search",
    mediaViewer: (mediaId = ":mediaId") => `/media/${mediaId}`,
    notifications: "/notifications",
    forbidden: "/403",
    notFound: "*",
  },
} as const;

export interface RouteMeta {
  path: string;
  allowedRoles?: RoleType[];
  guestOnly?: boolean;
}

export const ROLE_ROUTE_PREFIX: Record<RoleType, string> = {
  [Role.STUDENT]: ROUTES.student.root,
  [Role.MENTOR]: ROUTES.mentor.root,
  [Role.EDUCATION_HEAD]: ROUTES.educationHead.root,
  [Role.ADMIN]: ROUTES.admin.root,
  [Role.SUPER_ADMIN]: ROUTES.superAdmin.root,
};
