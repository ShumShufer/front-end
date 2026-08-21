import { SchoolCalendar } from "../../features/shared/Calendar/SchoolCalendar.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
export default function AdminSchedulePage() {
  const { user } = useAuth();
  return user?.schoolId ? (
    <SchoolCalendar schoolId={user.schoolId} role="ADMIN" editable />
  ) : null;
}
