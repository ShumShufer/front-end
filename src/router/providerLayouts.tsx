import { Outlet } from 'react-router-dom';
import { Role } from '../types/common.types.ts';
import { AppShell } from '../components/Layout/AppShell.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { ROUTES } from './routes.config.ts';
import { SchoolProvider } from '../context/school/SchoolProvider.tsx';
import { ClassroomProvider } from '../context/classroom/ClassroomProvider.tsx';
import { CourseProvider } from '../context/course/CourseProvider.tsx';
import { TaskProvider } from '../context/task/TaskProvider.tsx';
import { EnrollmentProvider } from '../context/enrollment/EnrollmentProvider.tsx';
import { PaymentProvider } from '../context/payment/PaymentProvider.tsx';
import { UserProvider } from '../context/user/UserProvider.tsx';

export function SchoolProviderLayout() {
  return (
    <SchoolProvider>
      <Outlet />
    </SchoolProvider>
  );
}

export function CourseProviderLayout() {
  return (
    <CourseProvider>
      <Outlet />
    </CourseProvider>
  );
}

export function GuestAuthLayout() {
  return <Outlet />;
}

export function StudentLayout() {
  return (
    <ProtectedRoute allowedRoles={[Role.STUDENT]}>
      <ClassroomProvider>
        <CourseProvider>
          <TaskProvider>
            <EnrollmentProvider>
              <PaymentProvider>
                <UserProvider><AppShell roleLabel="Student" homePath={ROUTES.student.dashboard} /></UserProvider>
              </PaymentProvider>
            </EnrollmentProvider>
          </TaskProvider>
        </CourseProvider>
      </ClassroomProvider>
    </ProtectedRoute>
  );
}

export function MentorLayout() {
  return (
    <ProtectedRoute allowedRoles={[Role.MENTOR]}>
      <ClassroomProvider>
        <CourseProvider>
          <TaskProvider>
            <UserProvider><AppShell roleLabel="Mentor" homePath={ROUTES.mentor.dashboard} /></UserProvider>
          </TaskProvider>
        </CourseProvider>
      </ClassroomProvider>
    </ProtectedRoute>
  );
}

export function EducationHeadLayout() {
  return (
    <ProtectedRoute allowedRoles={[Role.EDUCATION_HEAD]}>
      <SchoolProvider>
        <ClassroomProvider>
          <CourseProvider>
            <AppShell roleLabel="Education Head" homePath={ROUTES.educationHead.dashboard} />
          </CourseProvider>
        </ClassroomProvider>
      </SchoolProvider>
    </ProtectedRoute>
  );
}

export function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <SchoolProvider>
        <EnrollmentProvider>
          <UserProvider>
            <PaymentProvider>
              <CourseProvider>
                <ClassroomProvider>
                  <AppShell roleLabel="Admin" homePath={ROUTES.admin.dashboard} />
                </ClassroomProvider>
              </CourseProvider>
            </PaymentProvider>
          </UserProvider>
        </EnrollmentProvider>
      </SchoolProvider>
    </ProtectedRoute>
  );
}

export function SuperAdminLayout() {
  return (
    <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
      <SchoolProvider>
        <UserProvider>
          <PaymentProvider>
            <CourseProvider>
              <AppShell roleLabel="Super Admin" homePath={ROUTES.superAdmin.dashboard} />
            </CourseProvider>
          </PaymentProvider>
        </UserProvider>
      </SchoolProvider>
    </ProtectedRoute>
  );
}

export function AuthenticatedLayout() {
  return (
    <ProtectedRoute allowedRoles={Object.values(Role)}>
      <Outlet />
    </ProtectedRoute>
  );
}
