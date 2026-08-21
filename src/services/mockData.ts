// All imports consolidated at the top
import type { User } from '../types/user.types.ts';
import type { School, Branch, SchoolAgreement, StaffApplicationPost, StaffApplication, Review } from '../types/school.types.ts';
import type { ClassroomMentor, StudentReport, Classroom, Announcement, Resource, ScheduleEvent, AttendanceSession, AttendanceRecord } from '../types/classroom.types.ts';
import type { ClassroomCourse } from '../types/course.types.ts';
import type { Quiz } from '../types/quiz.types.ts';
import type { ApplicationFormTemplate } from '../types/enrollment.types.ts';
import type { Course, Topic, CourseResult } from '../types/course.types.ts';
import type { Enrollment, PracticeElsewhereRequest } from '../types/enrollment.types.ts';
import type { Task, Submission } from '../types/task.types.ts';
import type { Payment } from '../types/payment.types.ts';
import type { Notification, NotificationRecipient } from '../types/notification.types.ts';
import {
  Role,
  VerificationStatus,
  ApplicationStatus,
  ApplicationMode,
  TaskType,
  PaymentType,
  PaymentStatus,
  NotificationTopic,
  CoursePassStatus,
  ScheduleScope,
} from '../types/common.types.ts';

// ─── Users ───────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@addisdrive.com',
    firstName: 'Alemu',
    lastName: 'Bekalu',
    role: Role.ADMIN,
    schoolId: 'school-1',
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1990-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-100',
    email: 'admin@top.com',
    firstName: 'Demeke',
    lastName: 'Ketema',
    role: Role.ADMIN,
    schoolId: 'school-2',
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1990-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'student@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.STUDENT,
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '2000-05-15T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'mentor@addisdrive.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: Role.MENTOR,
    schoolId: 'school-1',
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1985-08-22T00:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'user-4',
    email: 'mentor2@safedrive.com',
    firstName: 'Bob',
    lastName: 'Mentor',
    role: Role.MENTOR,
    schoolId: 'school-2',
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1980-03-10T00:00:00Z',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'user-5',
    email: 'student2@example.com',
    firstName: 'Sara',
    lastName: 'Lane',
    role: Role.STUDENT,
    verificationStatus: VerificationStatus.PENDING,
    dateOfBirth: '2001-11-20T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'user-6',
    email: 'education@addisdrive.com',
    firstName: 'Helen',
    lastName: 'Tadesse',
    role: Role.EDUCATION_HEAD,
    schoolId: 'school-1',
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1988-04-12T00:00:00Z',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'user-7',
    email: 'superadmin@shumshufer.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: Role.SUPER_ADMIN,
    verificationStatus: VerificationStatus.VERIFIED,
    dateOfBirth: '1985-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Schools ─────────────────────────────────────────────────────────────────

export const mockSchools: School[] = [
  {
    id: 'school-1',
    name: 'Addis Driving Academy',
    description: 'The best driving school in Addis Ababa.',
    rating: 4.8,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'school-2',
    name: 'Safe Drive School',
    description: 'Learn safely with our experienced mentors.',
    rating: 4.5,
    status: 'ACTIVE',
    createdAt: '2024-02-15T00:00:00Z',
  },
];

export const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    schoolId: 'school-1',
    name: 'Bole Branch',
    address: 'Bole Medhanialem, Addis Ababa',
    latitude: 9.005401,
    longitude: 38.763611,
  },
  {
    id: 'branch-2',
    schoolId: 'school-1',
    name: 'Kazanchis Branch',
    address: 'Kazanchis, Addis Ababa',
    latitude: 9.014261,
    longitude: 38.762762,
  },
  {
    id: 'branch-3',
    schoolId: 'school-1',
    name: 'Nifas Silk Branch',
    address: 'Nifas Silk-Lafto, Addis Ababa',
    latitude: 9.035,
    longitude: 38.777,
  },
  {
    id: 'branch-4',
    schoolId: 'school-2',
    name: 'Piassa Branch',
    address: 'Piassa, Addis Ababa',
    latitude: 9.031222,
    longitude: 38.746655,
  },
  {
    id: 'branch-5',
    schoolId: 'school-2',
    name: 'Arada Branch',
    address: 'Arada, Addis Ababa',
    latitude: 9.033,
    longitude: 38.755,
  },
];

export const mockSchoolAgreements: SchoolAgreement[] = [
  {
    id: 'agreement-1',
    schoolAId: 'school-1',
    schoolBId: 'school-2',
    status: 'ACTIVE',
    feeSplit: { schoolA: 0.7, schoolB: 0.3 },
    createdAt: '2025-03-01T00:00:00Z',
  },
];

export const mockStaffPosts: StaffApplicationPost[] = [
  {
    id: 'post-1',
    schoolId: 'school-1',
    role: Role.MENTOR,
    description: 'Seeking an experienced driving instructor for our Bole branch.',
    status: 'OPEN',
    createdAt: '2026-01-10T00:00:00Z',
  },
];

export const mockStaffApplications: StaffApplication[] = [
  {
    id: 'staff-app-1',
    postId: 'post-1',
    applicantId: 'user-4',
    status: ApplicationStatus.PENDING,
    resumeUrl: null,
    submittedAt: '2026-01-12T00:00:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    schoolId: 'school-1',
    studentId: 'user-2',
    rating: 5,
    comment: 'Excellent instructors and great facilities!',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'review-2',
    schoolId: 'school-2',
    studentId: 'user-5',
    rating: 4,
    comment: 'Good school, very patient teachers.',
    createdAt: '2026-03-10T00:00:00Z',
  },
];

// ─── Classrooms ───────────────────────────────────────────────────────────────

export const mockClassrooms: Classroom[] = [
  {
    id: 'classroom-1',
    schoolId: 'school-1',
    name: 'Batch 2026 - Morning Theory',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'classroom-2',
    schoolId: 'school-1',
    name: 'Batch 2026 - Weekend Practical',
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'classroom-3',
    schoolId: 'school-2',
    name: 'Batch 2026 - Evening Theory',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export const mockClassroomMentors: ClassroomMentor[] = [
  { classroomId: 'classroom-1', mentorId: 'user-3' },
  { classroomId: 'classroom-2', mentorId: 'user-3' },
  { classroomId: 'classroom-3', mentorId: 'user-4' },
];

export const mockClassroomCourses: ClassroomCourse[] = [
  { classroomId: 'classroom-1', courseId: 'course-1', order: 1, mandatory: true },
  { classroomId: 'classroom-1', courseId: 'course-2', order: 2, mandatory: true },
  { classroomId: 'classroom-2', courseId: 'course-2', order: 1, mandatory: true },
  { classroomId: 'classroom-3', courseId: 'course-3', order: 1, mandatory: true },
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    topicId: 'topic-1',
    title: 'Traffic Signs Quiz',
    passScore: 70,
    questions: [
      {
        question: 'What does a red octagonal sign mean?',
        options: ['Yield', 'Stop', 'No Entry', 'Speed Limit'],
        correctAnswer: 'Stop',
        points: 10,
      },
      {
        question: 'What color are warning signs in Ethiopia?',
        options: ['Blue', 'Green', 'Yellow/Red triangle', 'White'],
        correctAnswer: 'Yellow/Red triangle',
        points: 10,
      },
    ],
  },
  {
    id: 'quiz-2',
    topicId: 'topic-2',
    title: 'Right of Way Quiz',
    passScore: 70,
    questions: [
      {
        question: 'At an uncontrolled intersection, who has right of way?',
        options: ['Vehicle on the left', 'Vehicle on the right', 'Larger vehicle', 'Faster vehicle'],
        correctAnswer: 'Vehicle on the right',
        points: 10,
      },
    ],
  },
];

export const mockApplicationFormTemplates: ApplicationFormTemplate[] = [
  {
    id: 'form-template-1',
    schoolId: 'school-1',
    fields: [
      { key: 'heardFrom', label: 'How did you hear about us?', type: 'text', required: true },
      { key: 'hasLicense', label: 'Do you have a learner permit?', type: 'boolean', required: true },
      { key: 'preferredSchedule', label: 'Preferred schedule', type: 'select', required: false },
    ],
  },
  {
    id: 'form-template-2',
    schoolId: 'school-2',
    fields: [
      { key: 'heardFrom', label: 'How did you hear about us?', type: 'text', required: true },
      { key: 'hasLicense', label: 'Do you have a learner permit?', type: 'boolean', required: true },
    ],
  },
];

export const mockStudentReports: StudentReport[] = [];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    classroomId: 'classroom-1',
    authorId: 'user-3',
    title: 'Welcome to Batch 2026 Morning Theory',
    body: 'Welcome everyone! Please bring your government-issued ID on the first day.',
    audience: 'ALL',
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'ann-2',
    classroomId: 'classroom-1',
    authorId: 'user-1',
    title: 'Holiday Schedule Update',
    body: 'There will be no classes on Jan 19th due to the Ethiopian Epiphany holiday.',
    audience: 'ALL',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'ann-3',
    classroomId: 'classroom-2',
    authorId: 'user-3',
    title: 'Practical Session Reminder',
    body: 'Please arrive 15 minutes early for your practical session this Saturday.',
    audience: 'ALL',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

export const mockResources: Resource[] = [
  {
    id: 'resource-1',
    classroomId: 'classroom-1',
    topicId: 'topic-1',
    title: 'Ethiopian Traffic Laws PDF',
    type: 'PDF',
    url: 'https://example.com/resources/eth-traffic-laws.pdf',
    mandatory: true,
    uploadedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'resource-2',
    classroomId: 'classroom-1',
    topicId: 'topic-1',
    title: 'Traffic Signs Introduction Video',
    type: 'VIDEO',
    url: 'https://example.com/resources/traffic-signs-intro.mp4',
    mandatory: false,
    uploadedAt: '2026-01-04T00:00:00Z',
  },
];

export const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: 'event-1',
    classroomId: 'classroom-1',
    scope: ScheduleScope.CLASSROOM,
    createdByRole: Role.MENTOR,
    title: 'Theory Class - Week 1',
    startTime: '2026-01-05T08:00:00Z',
    endTime: '2026-01-05T10:00:00Z',
    location: 'Room 101, Bole Branch',
  },
  {
    id: 'event-2',
    classroomId: 'classroom-1',
    scope: ScheduleScope.CLASSROOM,
    createdByRole: Role.MENTOR,
    title: 'Theory Class - Week 2',
    startTime: '2026-01-12T08:00:00Z',
    endTime: '2026-01-12T10:00:00Z',
    location: 'Room 101, Bole Branch',
  },
  {
    id: 'event-3',
    classroomId: 'classroom-2',
    scope: ScheduleScope.CLASSROOM,
    createdByRole: Role.MENTOR,
    title: 'Practical Session - Saturday',
    startTime: '2026-01-18T07:00:00Z',
    endTime: '2026-01-18T11:00:00Z',
    location: 'Bole Branch Parking Lot',
  },
  {
    id: 'event-4',
    schoolId: 'school-1',
    scope: ScheduleScope.SCHOOL,
    createdByRole: Role.ADMIN,
    title: 'School Orientation Day',
    startTime: '2026-02-01T09:00:00Z',
    endTime: '2026-02-01T12:00:00Z',
    location: 'Main Hall, Bole Branch',
  },
];

export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: 'session-1',
    classroomId: 'classroom-1',
    date: '2026-01-05',
  },
  {
    id: 'session-2',
    classroomId: 'classroom-1',
    date: '2026-01-12',
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    sessionId: 'session-1',
    studentId: 'user-2',
    status: 'PRESENT',
  },
  {
    id: 'att-2',
    sessionId: 'session-2',
    studentId: 'user-2',
    status: 'LATE',
  },
];

// ─── Courses ─────────────────────────────────────────────────────────────────

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    schoolId: 'school-1',
    title: 'Basic Driving Theory',
    description: 'Learn the rules of the road, traffic laws, and road signs.',
    price: 1500,
    isFree: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'course-2',
    schoolId: 'school-1',
    title: 'Practical Driving – Automatics',
    description: 'Hands-on practice with automatic transmission vehicles.',
    price: 3500,
    isFree: false,
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'course-3',
    schoolId: 'school-2',
    title: 'Defensive Driving Techniques',
    description: 'Advanced techniques to stay safe in all road conditions.',
    price: 2000,
    isFree: false,
    createdAt: '2025-03-01T00:00:00Z',
  },
];

export const mockTopics: Topic[] = [
  {
    id: 'topic-1',
    courseId: 'course-1',
    title: 'Introduction to Traffic Signs',
    order: 1,
    content: 'In this topic, we explore the most common Ethiopian road signs and their meanings.',
  },
  {
    id: 'topic-2',
    courseId: 'course-1',
    title: 'Right of Way Rules',
    order: 2,
    content: 'Understanding right of way is essential for safe driving. We cover intersections, roundabouts, and merging.',
  },
  {
    id: 'topic-3',
    courseId: 'course-2',
    title: 'Basic Vehicle Controls',
    order: 1,
    content: 'Introduction to accelerator, brake, steering, and gear selector in automatic vehicles.',
  },
  {
    id: 'topic-4',
    courseId: 'course-2',
    title: 'Parking and Reversing',
    order: 2,
    content: 'Techniques for parallel parking, reverse parking, and three-point turns.',
  },
];

export const mockCourseResults: CourseResult[] = [
  {
    id: 'result-1',
    courseId: 'course-1',
    studentId: 'user-2',
    classroomId: 'classroom-1',
    status: CoursePassStatus.IN_PROGRESS,
    finalExamScore: null,
    publishedAt: null,
  },
  {
    id: 'result-2',
    courseId: 'course-2',
    studentId: 'user-2',
    classroomId: 'classroom-2',
    status: CoursePassStatus.NOT_STARTED,
    finalExamScore: null,
    publishedAt: null,
  },
];

// ─── Enrollments ─────────────────────────────────────────────────────────────

export const mockEnrollments: Enrollment[] = [
  {
    id: 'enrollment-1',
    studentId: 'user-2',
    schoolId: 'school-1',
    classroomId: 'classroom-1',
    mode: ApplicationMode.ONLINE,
    status: ApplicationStatus.ACCEPTED,
    formResponses: { heardFrom: 'Facebook', hasLicense: false },
    submittedAt: '2026-01-15T00:00:00Z',
    reviewedAt: '2026-01-16T00:00:00Z',
    reviewedById: 'user-1',
  },
  {
    id: 'enrollment-2',
    studentId: 'user-5',
    schoolId: 'school-1',
    classroomId: null,
    mode: ApplicationMode.IN_PERSON,
    status: ApplicationStatus.PENDING,
    formResponses: { heardFrom: 'Friend', hasLicense: false },
    submittedAt: '2026-02-01T00:00:00Z',
    reviewedAt: null,
    reviewedById: null,
  },
];

export const mockPracticeRequests: PracticeElsewhereRequest[] = [
  {
    id: 'practice-1',
    studentId: 'user-2',
    homeSchoolId: 'school-1',
    hostSchoolId: 'school-2',
    fee: 500,
    status: ApplicationStatus.PENDING,
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'practice-2',
    studentId: 'user-5',
    homeSchoolId: 'school-2',
    hostSchoolId: 'school-1',
    fee: 500,
    status: ApplicationStatus.ACCEPTED,
    createdAt: '2026-01-22T00:00:00Z',
  },
];

// ─── Tasks & Submissions ──────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    classroomId: 'classroom-1',
    createdById: 'user-3',
    type: TaskType.ASSIGNMENT,
    title: 'Traffic Signs Quiz',
    description: 'Please complete the attached quiz on basic traffic signs.',
    attachments: [],
    deadline: '2026-02-01T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'task-2',
    classroomId: 'classroom-1',
    createdById: 'user-3',
    type: TaskType.EXAM,
    title: 'Mid-Term Theory Exam',
    description: 'Covers topics 1 and 2. Duration is 90 minutes. Passing score is 70%.',
    attachments: [],
    deadline: '2026-02-20T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'task-3',
    classroomId: 'classroom-2',
    createdById: 'user-3',
    type: TaskType.ASSIGNMENT,
    title: 'Parking Practice Report',
    description: 'Write a short report about your parking practice session.',
    attachments: [],
    deadline: '2026-02-10T00:00:00Z',
    createdAt: '2026-01-20T00:00:00Z',
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    studentId: 'user-2',
    attachments: [],
    submittedAt: '2026-01-30T00:00:00Z',
    grade: 88,
    feedback: 'Good work! Review sign #14.',
    gradedAt: '2026-02-02T00:00:00Z',
  },
];

// ─── Payments ─────────────────────────────────────────────────────────────────

export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    userId: 'user-2',
    type: PaymentType.ENROLLMENT,
    amount: 1500,
    commission: 150,
    status: PaymentStatus.SUCCESS,
    chapaTxRef: 'TX-123456',
    relatedEntityId: 'enrollment-1',
    createdAt: '2026-01-14T00:00:00Z',
  },
  {
    id: 'payment-2',
    userId: 'user-5',
    type: PaymentType.ENROLLMENT,
    amount: 1500,
    commission: 150,
    status: PaymentStatus.PENDING,
    chapaTxRef: 'TX-789012',
    relatedEntityId: 'enrollment-2',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Array<Notification & NotificationRecipient> = [
  {
    id: 'notif-1',
    notificationId: 'n-1',
    userId: 'user-2',
    read: false,
    topic: NotificationTopic.APPLICATION,
    title: 'Enrollment Accepted',
    body: 'Your enrollment to Addis Driving Academy has been accepted. Classes start next week!',
    createdAt: '2026-01-16T00:00:00Z',
  },
  {
    id: 'notif-2',
    notificationId: 'n-2',
    userId: 'user-2',
    read: true,
    topic: NotificationTopic.TASK,
    title: 'New Assignment: Traffic Signs Quiz',
    body: 'Your mentor has posted a new assignment due on Feb 1st.',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'notif-3',
    notificationId: 'n-3',
    userId: 'user-2',
    read: false,
    topic: NotificationTopic.RESULT,
    title: 'Assignment Graded',
    body: 'Your Traffic Signs Quiz has been graded. You scored 88/100.',
    createdAt: '2026-02-02T14:00:00Z',
  },
  {
    id: 'notif-4',
    notificationId: 'n-4',
    userId: 'user-5',
    read: false,
    topic: NotificationTopic.PAYMENT,
    title: 'Payment Pending',
    body: 'Your enrollment payment of 1500 ETB is pending. Please complete the payment.',
    createdAt: '2026-02-01T08:00:00Z',
  },
];
