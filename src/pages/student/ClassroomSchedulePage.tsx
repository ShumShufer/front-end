import { useParams } from "react-router-dom";
import { SchoolCalendar } from "../../features/shared/Calendar/SchoolCalendar.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
export default function ClassroomSchedulePage() {
  const { user } = useAuth();
  const { classroomId } = useParams<{ classroomId: string }>();
  return user?.schoolId && classroomId ? (
    <SchoolCalendar
      schoolId={user.schoolId}
      classroomId={classroomId}
      role="STUDENT"
    />
  ) : null;
}
