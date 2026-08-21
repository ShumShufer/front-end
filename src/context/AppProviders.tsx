import React from "react";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { NotificationProvider } from "./notification/NotificationProvider.tsx";
import { UIProvider } from "./ui/UIProvider.tsx";
// Note: Domain providers (SchoolProvider, ClassroomProvider, CourseProvider,
// TaskProvider, EnrollmentProvider, PaymentProvider, UserProvider)
// should ideally be wrapped at the route level where they are needed,
// rather than globally, to keep state clean and scoped.

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <UIProvider>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </UIProvider>
  );
};
