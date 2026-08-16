export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Schools
  SCHOOLS: '/schools',
  SCHOOL_BY_ID: (id: string) => `/schools/${id}`,

  // Classrooms
  CLASSROOMS: '/classrooms',
  CLASSROOM_BY_ID: (id: string) => `/classrooms/${id}`,

  // Courses
  COURSES: '/courses',
  COURSE_BY_ID: (id: string) => `/courses/${id}`,

  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id: string) => `/tasks/${id}`,

  // Quizzes
  QUIZZES: '/quizzes',
  QUIZ_BY_ID: (id: string) => `/quizzes/${id}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD: '/notifications/unread',

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
};
