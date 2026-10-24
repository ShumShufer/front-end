import { Navigate, useLocation } from "react-router-dom";
import { Role, VerificationStatus } from "../types/common.types.ts";
import { useAuth } from "../context/auth/useAuth.ts";
import { hasRole, getDashboardPathForRole } from "../utils/permissions.ts";
import { ROUTES } from "./routes.config.ts";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.auth.login}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If a student account is pending Fayda verification, gate access and route to verify-fayda
  if (
    user.role === Role.STUDENT &&
    user.verificationStatus === VerificationStatus.PENDING
  ) {
    return <Navigate to={ROUTES.auth.verifyFayda} replace />;
  }

  if (!hasRole(user.role, allowedRoles)) {
    return <Navigate to={ROUTES.shared.forbidden} replace />;
  }

  return children;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (user) {
    if (user.verificationStatus === VerificationStatus.PENDING) {
      return <Navigate to={ROUTES.auth.verifyFayda} replace />;
    }
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
}
