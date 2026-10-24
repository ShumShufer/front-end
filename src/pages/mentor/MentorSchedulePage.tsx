import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { SchoolCalendar } from "../../features/shared/Calendar/SchoolCalendar.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
import { useClassroom } from "../../context/classroom/useClassroom.ts";

export default function MentorSchedulePage() {
  const { user } = useAuth();
  const { classroomId = "" } = useParams<{ classroomId: string }>();
  const classroom = useClassroom();

  useEffect(() => {
    if (classroomId && (!classroom.activeClassroom || classroom.activeClassroom.id !== classroomId)) {
      void classroom.loadClassroomById(classroomId);
    }
  }, [classroomId, classroom]);

  const effectiveSchoolId = user?.schoolId || classroom.activeClassroom?.schoolId || "";

  return classroomId ? (
    <SchoolCalendar
      schoolId={effectiveSchoolId}
      classroomId={classroomId}
      role="MENTOR"
      editable
    />
  ) : null;
}
