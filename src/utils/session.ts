import type { User } from "../types/user.types.ts";

// AuthProvider persists the signed-in user snapshot next to the token.
// Mock services read it the way remote implementations would rely on the
// Authorization header resolving the caller server-side.
export function getSessionUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed?.id || !parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}
