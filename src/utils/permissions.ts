import { Role, type Role as RoleType } from "../types/common.types.ts";

export const ROLE_DASHBOARD_PATH: Record<RoleType, string> = {
  [Role.SUPER_ADMIN]: "/app/super-admin/dashboard",
  [Role.ADMIN]: "/app/admin/dashboard",
  [Role.EDUCATION_HEAD]: "/app/education-head/dashboard",
  [Role.MENTOR]: "/app/mentor/dashboard",
  [Role.STUDENT]: "/app/student/dashboard",
};

export function hasRole(
  userRole: RoleType | undefined,
  allowedRoles: RoleType[],
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function getDashboardPathForRole(role: RoleType): string {
  return ROLE_DASHBOARD_PATH[role];
}
