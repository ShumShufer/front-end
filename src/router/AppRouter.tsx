import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../components/Layout/PublicLayout.tsx";
import { GuestRoute } from "./ProtectedRoute.tsx";
import {
  AdminLayout,
  AuthenticatedLayout,
  CourseProviderLayout,
  EducationHeadLayout,
  GuestAuthLayout,
  MentorLayout,
  SchoolProviderLayout,
  StudentLayout,
  SuperAdminLayout,
} from "./providerLayouts.tsx";

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
    Loading page...
  </div>
);

function lazyPage(importFn: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

// Public pages
const LandingPage = () =>
  lazyPage(() => import("../pages/public/LandingPage.tsx"));
const BrowseSchoolsPage = () =>
  lazyPage(() => import("../pages/public/BrowseSchoolsPage.tsx"));
const SchoolProfilePage = () =>
  lazyPage(() => import("../pages/public/SchoolProfilePage.tsx"));
const BrowseCoursesPage = () =>
  lazyPage(() => import("../pages/public/BrowseCoursesPage.tsx"));
const PublicCourseDetailPage = () =>
  lazyPage(() => import("../pages/public/CourseDetailPage.tsx"));
const BrowseMentorsPage = () =>
  lazyPage(() => import("../pages/public/BrowseMentorsPage.tsx"));
const DriverLookupPage = () =>
  lazyPage(() => import("../pages/public/DriverLookupPage.tsx"));
const ApplicationsPage = () =>
  lazyPage(() => import("../pages/public/ApplicationsPage.tsx"));
const AnnouncementsPage = () =>
  lazyPage(() => import("../pages/public/AnnouncementsPage.tsx"));
const AboutPage = () => lazyPage(() => import("../pages/public/AboutPage.tsx"));
const PricingPage = () =>
  lazyPage(() => import("../pages/public/PricingPage.tsx"));

// Auth pages
const LoginPage = () => lazyPage(() => import("../pages/auth/LoginPage.tsx"));
const RegisterPage = () =>
  lazyPage(() => import("../pages/auth/RegisterPage.tsx"));
const ForgotPasswordPage = () =>
  lazyPage(() => import("../pages/auth/ForgotPasswordPage.tsx"));
const ResetPasswordPage = () =>
  lazyPage(() => import("../pages/auth/ResetPasswordPage.tsx"));
const FaydaVerificationPage = () =>
  lazyPage(() => import("../pages/auth/FaydaVerificationPage.tsx"));
const VerificationPendingPage = () =>
  lazyPage(() => import("../pages/auth/VerificationPendingPage.tsx"));
const OnboardingPage = () =>
  lazyPage(() => import("../pages/auth/OnboardingPage.tsx"));

// Student pages
const StudentDashboardPage = () =>
  lazyPage(() => import("../pages/student/StudentDashboardPage.tsx"));
const SchoolApplicationPage = () =>
  lazyPage(() => import("../pages/student/SchoolApplicationPage.tsx"));
const MyApplicationsPage = () =>
  lazyPage(() => import("../pages/student/MyApplicationsPage.tsx"));
const MyClassroomPage = () =>
  lazyPage(() => import("../pages/student/MyClassroomPage.tsx"));
const ClassroomHubPage = () =>
  lazyPage(() => import("../pages/student/ClassroomHubPage.tsx"));
const ClassroomFeedPage = () =>
  lazyPage(() => import("../pages/student/ClassroomFeedPage.tsx"));
const ClassroomCoursesPage = () =>
  lazyPage(() => import("../pages/student/ClassroomCoursesPage.tsx"));
const CoursePlayerPage = () =>
  lazyPage(() => import("../pages/student/CoursePlayerPage.tsx"));
const CourseExamPage = () =>
  lazyPage(() => import("../pages/student/CourseExamPage.tsx"));
const ClassroomResourcesPage = () =>
  lazyPage(() => import("../pages/student/ClassroomResourcesPage.tsx"));
const ClassroomTasksPage = () =>
  lazyPage(() => import("../pages/student/ClassroomTasksPage.tsx"));
const TaskDetailPage = () =>
  lazyPage(() => import("../pages/student/TaskDetailPage.tsx"));
const ClassroomSchedulePage = () =>
  lazyPage(() => import("../pages/student/ClassroomSchedulePage.tsx"));
const ClassroomAttendancePage = () =>
  lazyPage(() => import("../pages/student/ClassroomAttendancePage.tsx"));
const PracticeQuizzesPage = () =>
  lazyPage(() => import("../pages/student/PracticeQuizzesPage.tsx"));
const PracticeElsewherePage = () =>
  lazyPage(() => import("../pages/student/PracticeElsewherePage.tsx"));
const MyResultsPage = () =>
  lazyPage(() => import("../pages/student/MyResultsPage.tsx"));
const StudentProfilePage = () =>
  lazyPage(() => import("../pages/student/StudentProfilePage.tsx"));
const StudentPaymentsPage = () =>
  lazyPage(() => import("../pages/student/StudentPaymentsPage.tsx"));
const StudentNotificationsPage = () =>
  lazyPage(() => import("../pages/student/StudentNotificationsPage.tsx"));
const LeaveReviewPage = () =>
  lazyPage(() => import("../pages/student/LeaveReviewPage.tsx"));

// Mentor pages
const MentorDashboardPage = () =>
  lazyPage(() => import("../pages/mentor/MentorDashboardPage.tsx"));
const MentorClassroomsPage = () =>
  lazyPage(() => import("../pages/mentor/MentorClassroomsPage.tsx"));
const MentorClassroomHubPage = () =>
  lazyPage(() => import("../pages/mentor/MentorClassroomHubPage.tsx"));
const CreateAnnouncementPage = () =>
  lazyPage(() => import("../pages/mentor/CreateAnnouncementPage.tsx"));
const MentorCoursesPage = () =>
  lazyPage(() => import("../pages/mentor/MentorCoursesPage.tsx"));
const MentorOpeningsPage = () =>
  lazyPage(() => import("../pages/mentor/MentorOpeningsPage.tsx"));
const EditTopicPage = () =>
  lazyPage(() => import("../pages/mentor/EditTopicPage.tsx"));
const QuizBuilderPage = () =>
  lazyPage(() => import("../pages/mentor/QuizBuilderPage.tsx"));
const MentorTasksPage = () =>
  lazyPage(() => import("../pages/mentor/MentorTasksPage.tsx"));
const EditTaskPage = () =>
  lazyPage(() => import("../pages/mentor/EditTaskPage.tsx"));
const GradingPage = () =>
  lazyPage(() => import("../pages/mentor/GradingPage.tsx"));
const PublishResultsPage = () =>
  lazyPage(() => import("../pages/mentor/PublishResultsPage.tsx"));
const MentorSchedulePage = () =>
  lazyPage(() => import("../pages/mentor/MentorSchedulePage.tsx"));
const MentorAttendancePage = () =>
  lazyPage(() => import("../pages/mentor/MentorAttendancePage.tsx"));
const ReportStudentPage = () =>
  lazyPage(() => import("../pages/mentor/ReportStudentPage.tsx"));
const ResourceLibraryPage = () =>
  lazyPage(() => import("../pages/mentor/ResourceLibraryPage.tsx"));
const MentorProfilePage = () =>
  lazyPage(() => import("../pages/mentor/MentorProfilePage.tsx"));
const MentorNotificationsPage = () =>
  lazyPage(() => import("../pages/mentor/MentorNotificationsPage.tsx"));

// Education head pages
const EducationHeadDashboardPage = () =>
  lazyPage(
    () => import("../pages/education-head/EducationHeadDashboardPage.tsx"),
  );
const MentorManagementPage = () =>
  lazyPage(() => import("../pages/education-head/MentorManagementPage.tsx"));
const GlobalSchedulePage = () =>
  lazyPage(() => import("../pages/education-head/GlobalSchedulePage.tsx"));
const ClassroomsOverviewPage = () =>
  lazyPage(() => import("../pages/education-head/ClassroomsOverviewPage.tsx"));
const CourseCatalogOversightPage = () =>
  lazyPage(
    () => import("../pages/education-head/CourseCatalogOversightPage.tsx"),
  );
const EducationHeadNotificationsPage = () =>
  lazyPage(
    () => import("../pages/education-head/EducationHeadNotificationsPage.tsx"),
  );

// Admin pages
const AdminDashboardPage = () =>
  lazyPage(() => import("../pages/admin/AdminDashboardPage.tsx"));
const AdminProfilePage = () =>
  lazyPage(() => import("../pages/admin/AdminProfilePage.tsx"));
const SchoolProfileEditorPage = () =>
  lazyPage(() => import("../pages/admin/SchoolProfileEditorPage.tsx"));
const BranchManagementPage = () =>
  lazyPage(() => import("../pages/admin/BranchManagementPage.tsx"));
const AdminCoursesPage = () =>
  lazyPage(() => import("../pages/admin/AdminCoursesPage.tsx"));
const EnrollmentInboxPage = () =>
  lazyPage(() => import("../pages/admin/EnrollmentInboxPage.tsx"));
const ApplicationFormBuilderPage = () =>
  lazyPage(() => import("../pages/admin/ApplicationFormBuilderPage.tsx"));
const StaffApplicationsInboxPage = () =>
  lazyPage(() => import("../pages/admin/StaffApplicationsInboxPage.tsx"));
const StaffJobPostsPage = () =>
  lazyPage(() => import("../pages/admin/StaffJobPostsPage.tsx"));
const SchoolAnnouncementsPage = () =>
  lazyPage(() => import("../pages/admin/SchoolAnnouncementsPage.tsx"));
const AdminSchedulePage = () =>
  lazyPage(() => import("../pages/admin/AdminSchedulePage.tsx"));
const AssignEducationHeadsPage = () =>
  lazyPage(() => import("../pages/admin/AssignEducationHeadsPage.tsx"));
const InterSchoolAgreementsPage = () =>
  lazyPage(() => import("../pages/admin/InterSchoolAgreementsPage.tsx"));
const PracticeRequestsInboxPage = () =>
  lazyPage(() => import("../pages/admin/PracticeRequestsInboxPage.tsx"));
const StudentsDirectoryPage = () =>
  lazyPage(() => import("../pages/admin/StudentsDirectoryPage.tsx"));
const ClassroomsDirectoryPage = () =>
  lazyPage(() => import("../pages/admin/ClassroomsDirectoryPage.tsx"));
const SchoolReviewsPage = () =>
  lazyPage(() => import("../pages/admin/SchoolReviewsPage.tsx"));
const RevenueReportPage = () =>
  lazyPage(() => import("../pages/admin/RevenueReportPage.tsx"));
const SchoolSettingsPage = () =>
  lazyPage(() => import("../pages/admin/SchoolSettingsPage.tsx"));
const AdminNotificationsPage = () =>
  lazyPage(() => import("../pages/admin/AdminNotificationsPage.tsx"));

// Super admin pages
const SuperAdminDashboardPage = () =>
  lazyPage(() => import("../pages/super-admin/SuperAdminDashboardPage.tsx"));
const SchoolsManagementPage = () =>
  lazyPage(() => import("../pages/super-admin/SchoolsManagementPage.tsx"));
const AdminManagementPage = () =>
  lazyPage(() => import("../pages/super-admin/AdminManagementPage.tsx"));
const PlatformAnnouncementsPage = () =>
  lazyPage(() => import("../pages/super-admin/PlatformAnnouncementsPage.tsx"));
const IndependentCourseManagementPage = () =>
  lazyPage(
    () => import("../pages/super-admin/IndependentCourseManagementPage.tsx"),
  );
const PaymentsOverviewPage = () =>
  lazyPage(() => import("../pages/super-admin/PaymentsOverviewPage.tsx"));
const GlobalReportsPage = () =>
  lazyPage(() => import("../pages/super-admin/GlobalReportsPage.tsx"));
const UserManagementPage = () =>
  lazyPage(() => import("../pages/super-admin/UserManagementPage.tsx"));
const FaydaAuditPage = () =>
  lazyPage(() => import("../pages/super-admin/FaydaAuditPage.tsx"));
const SystemSettingsPage = () =>
  lazyPage(() => import("../pages/super-admin/SystemSettingsPage.tsx"));
const SuperAdminNotificationsPage = () =>
  lazyPage(
    () => import("../pages/super-admin/SuperAdminNotificationsPage.tsx"),
  );

// Shared pages
const ForbiddenPage = () =>
  lazyPage(() => import("../pages/shared/ForbiddenPage.tsx"));
const NotFoundPage = () =>
  lazyPage(() => import("../pages/shared/NotFoundPage.tsx"));
const SearchResultsPage = () =>
  lazyPage(() => import("../pages/shared/SearchResultsPage.tsx"));
const MediaViewerPage = () =>
  lazyPage(() => import("../pages/shared/MediaViewerPage.tsx"));
const NotificationsCenterPage = () =>
  lazyPage(() => import("../pages/shared/NotificationsCenterPage.tsx"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />

          <Route element={<SchoolProviderLayout />}>
            <Route path="schools" element={<BrowseSchoolsPage />} />
            <Route path="schools/:schoolId" element={<SchoolProfilePage />} />

            <Route element={<CourseProviderLayout />}>
              <Route path="courses" element={<BrowseCoursesPage />} />
              <Route
                path="courses/:courseId"
                element={<PublicCourseDetailPage />}
              />
            </Route>
          </Route>

          <Route path="mentors" element={<BrowseMentorsPage />} />
          <Route path="drivers" element={<DriverLookupPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="pricing" element={<PricingPage />} />

          <Route element={<SchoolProviderLayout />}>
            <Route path="applications" element={<ApplicationsPage />} />
          </Route>
          <Route path="announcements" element={<AnnouncementsPage />} />

          {/* Auth routes (guest only) */}
          <Route
            element={
              <GuestRoute>
                <GuestAuthLayout />
              </GuestRoute>
            }
          >
            <Route path="auth/login" element={<LoginPage />} />
            <Route path="auth/register" element={<RegisterPage />} />
            <Route
              path="auth/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route path="auth/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="auth/verify-fayda"
              element={<FaydaVerificationPage />}
            />
            <Route
              path="auth/verification-pending"
              element={<VerificationPendingPage />}
            />
            <Route path="auth/onboarding" element={<OnboardingPage />} />
          </Route>
        </Route>

        {/* Shared authenticated routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="media/:mediaId" element={<MediaViewerPage />} />
          <Route path="notifications" element={<NotificationsCenterPage />} />
        </Route>

        {/* Student app */}
        <Route path="app/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="apply/:schoolId" element={<SchoolApplicationPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="classroom" element={<MyClassroomPage />} />
          <Route path="classroom/:classroomId" element={<ClassroomHubPage />} />
          <Route
            path="classroom/:classroomId/feed"
            element={<ClassroomFeedPage />}
          />
          <Route
            path="classroom/:classroomId/courses"
            element={<ClassroomCoursesPage />}
          />
          <Route
            path="classroom/:classroomId/resources"
            element={<ClassroomResourcesPage />}
          />
          <Route
            path="classroom/:classroomId/tasks"
            element={<ClassroomTasksPage />}
          />
          <Route
            path="classroom/:classroomId/schedule"
            element={<ClassroomSchedulePage />}
          />
          <Route
            path="classroom/:classroomId/attendance"
            element={<ClassroomAttendancePage />}
          />
          <Route path="courses/:courseId" element={<CoursePlayerPage />} />
          <Route path="courses/:courseId/exam" element={<CourseExamPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="practice-quizzes" element={<PracticeQuizzesPage />} />
          <Route
            path="practice-elsewhere"
            element={<PracticeElsewherePage />}
          />
          <Route path="results" element={<MyResultsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="payments" element={<StudentPaymentsPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="reviews/:courseId" element={<LeaveReviewPage />} />
        </Route>

        {/* Mentor app */}
        <Route path="app/mentor" element={<MentorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboardPage />} />
          <Route path="classrooms" element={<MentorClassroomsPage />} />
          <Route path="openings" element={<MentorOpeningsPage />} />
          <Route
            path="classrooms/:classroomId"
            element={<MentorClassroomHubPage />}
          />
          <Route
            path="classrooms/:classroomId/announcements"
            element={<CreateAnnouncementPage />}
          />
          <Route
            path="classrooms/:classroomId/tasks"
            element={<MentorTasksPage />}
          />
          <Route
            path="classrooms/:classroomId/schedule"
            element={<MentorSchedulePage />}
          />
          <Route
            path="classrooms/:classroomId/attendance"
            element={<MentorAttendancePage />}
          />
          <Route
            path="classrooms/:classroomId/report"
            element={<ReportStudentPage />}
          />
          <Route
            path="classrooms/:classroomId/resources"
            element={<ResourceLibraryPage />}
          />
          <Route path="courses" element={<MentorCoursesPage />} />
          <Route path="courses/:courseId" element={<MentorCoursesPage />} />
          <Route
            path="courses/:courseId/topics/:topicId"
            element={<EditTopicPage />}
          />
          <Route
            path="courses/:courseId/publish-results"
            element={<PublishResultsPage />}
          />
          <Route path="quizzes/builder" element={<QuizBuilderPage />} />
          <Route path="tasks/:taskId" element={<EditTaskPage />} />
          <Route
            path="submissions/:submissionId/grade"
            element={<GradingPage />}
          />
          <Route path="profile" element={<MentorProfilePage />} />
          <Route path="notifications" element={<MentorNotificationsPage />} />
        </Route>

        {/* Education head app */}
        <Route path="app/education-head" element={<EducationHeadLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EducationHeadDashboardPage />} />
          <Route path="mentors" element={<MentorManagementPage />} />
          <Route path="schedule" element={<GlobalSchedulePage />} />
          <Route path="classrooms" element={<ClassroomsOverviewPage />} />
          <Route path="courses" element={<CourseCatalogOversightPage />} />
          <Route
            path="notifications"
            element={<EducationHeadNotificationsPage />}
          />
        </Route>

        {/* Admin app */}
        <Route path="app/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="school/profile" element={<SchoolProfileEditorPage />} />
          <Route path="school/branches" element={<BranchManagementPage />} />
          <Route path="school/courses" element={<AdminCoursesPage />} />
          <Route path="enrollments" element={<EnrollmentInboxPage />} />
          <Route
            path="enrollments/form-builder"
            element={<ApplicationFormBuilderPage />}
          />
          <Route
            path="staff/applications"
            element={<StaffApplicationsInboxPage />}
          />
          <Route path="staff/posts" element={<StaffJobPostsPage />} />
          <Route path="announcements" element={<SchoolAnnouncementsPage />} />
          <Route path="schedule" element={<AdminSchedulePage />} />
          <Route
            path="education-heads"
            element={<AssignEducationHeadsPage />}
          />
          <Route path="agreements" element={<InterSchoolAgreementsPage />} />
          <Route
            path="practice-requests"
            element={<PracticeRequestsInboxPage />}
          />
          <Route path="students" element={<StudentsDirectoryPage />} />
          <Route path="classrooms" element={<ClassroomsDirectoryPage />} />
          <Route path="reviews" element={<SchoolReviewsPage />} />
          <Route path="revenue" element={<RevenueReportPage />} />
          <Route path="settings" element={<SchoolSettingsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>

        {/* Super admin app */}
        <Route path="app/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="schools" element={<SchoolsManagementPage />} />
          <Route path="admins" element={<AdminManagementPage />} />
          <Route path="announcements" element={<PlatformAnnouncementsPage />} />
          <Route path="courses" element={<IndependentCourseManagementPage />} />
          <Route path="payments" element={<PaymentsOverviewPage />} />
          <Route path="reports" element={<GlobalReportsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="fayda-audit" element={<FaydaAuditPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
          <Route
            path="notifications"
            element={<SuperAdminNotificationsPage />}
          />
        </Route>

        {/* Error pages */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
