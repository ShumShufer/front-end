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

// Priority ladder for cross-role resources such as the schedule: a role may
// only manage (edit/delete) events created by its own rank or lower, so a
// school-wide event set by an admin cannot be overridden by a mentor
// (see FRONTEND_DESIGN.md §8 "Permissions").
export const ROLE_PRIORITY: Record<RoleType, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.EDUCATION_HEAD]: 2,
  [Role.MENTOR]: 1,
  [Role.STUDENT]: 0,
};

export function canManageEvent(
  actorRole: RoleType | undefined,
  creatorRole: RoleType,
): boolean {
  if (!actorRole) return false;
  return ROLE_PRIORITY[actorRole] >= ROLE_PRIORITY[creatorRole];
}
