import { SchoolCalendar } from "../../features/shared/Calendar/SchoolCalendar.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
export default function GlobalSchedulePage() {
  const { user } = useAuth();
  return user?.schoolId ? (
    <SchoolCalendar schoolId={user.schoolId} role="EDUCATION_HEAD" editable />
  ) : null;
}
