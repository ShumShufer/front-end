import { useEffect } from "react";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { SchoolCalendar } from "../../shared/Calendar/SchoolCalendar.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useEnrollment } from "../../../context/enrollment/useEnrollment.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./StudentWorkspace.module.css";

export function StudentWorkspace({
  view,
}: {
  view: "dashboard" | "classrooms" | "courses";
}) {
  const { user } = useAuth();
  const enrollment = useEnrollment();
  const classroom = useClassroom();
  const course = useCourse();
  const school = useSchool();
  const { loadEnrollments } = enrollment;
  const { loadStudentClassrooms } = classroom;
  const { loadStudentProgress } = course;
  const { loadSchools } = school;
  useEffect(() => {
    if (!user) return;
    void loadEnrollments({ studentId: user.id });
    void loadStudentClassrooms(user.id);
    void loadStudentProgress(user.id);
    void loadSchools({ status: "ACTIVE" });
  }, [
    user?.id,
    loadEnrollments,
    loadStudentClassrooms,
    loadStudentProgress,
    loadSchools,
  ]);
  if (!user) return null;
  const schoolIds =
    enrollment.enrollments?.data
      .filter((item) => item.status === "ACCEPTED")
      .map((item) => item.schoolId) || [];
  const schools =
    school.schools?.data.filter((item) => schoolIds.includes(item.id)) || [];
  const loading =
    enrollment.isLoading ||
    classroom.isLoading ||
    course.isLoading ||
    school.isLoading;
  if (loading)
    return (
      <PageSkeleton variant={view === "dashboard" ? "dashboard" : "list"} />
    );
  if (view === "classrooms")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1>My classrooms</h1>
          {classroom.classrooms.length ? (
            <div className={styles.grid}>
              {classroom.classrooms.map((item) => (
                <Link
                  key={item.id}
                  to={ROUTES.student.classroomHub(item.id)}
                  className={styles.card}
                >
                  <GraduationCap size={20} />
                  <h2>{item.name}</h2>
                  <p>Open classroom learning, resources, tasks, and schedule.</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No classrooms assigned"
              description="Accepted school applications will place you into a classroom."
            />
          )}
        </div>
      </main>
    );
  if (view === "courses")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1>Course progress</h1>
          {course.progress.length ? (
            <div className={styles.grid}>
              {course.progress.map((item) => (
                <article key={item.id} className={styles.card}>
                  <BookOpen size={20} />
                  <h2>Course progress</h2>
                  <p>{item.status.replaceAll("_", " ")}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No course progress yet"
              description="Your classroom courses and progress will appear here."
            />
          )}
        </div>
      </main>
    );
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header>
          <p>Student workspace</p>
          <h1>Keep your road to readiness moving.</h1>
        </header>
        <div className={styles.grid}>
          <section className={styles.card}>
            <Building2 size={20} />
            <h2>
              {schools.length} enrolled school{schools.length === 1 ? "" : "s"}
            </h2>
            <p>
              {schools.map((item) => item.name).join(", ") ||
                "Your enrolled schools appear here."}
            </p>
          </section>
          <Link to={ROUTES.student.classroom} className={styles.card}>
            <GraduationCap size={20} />
            <h2>{classroom.classrooms.length} classrooms</h2>
            <p>Continue learning and view your classroom hub.</p>
          </Link>
          <Link to={ROUTES.student.results} className={styles.card}>
            <ClipboardCheck size={20} />
            <h2>{course.progress.length} course records</h2>
            <p>See results and learning progress.</p>
          </Link>
        </div>
        {schools[0] && <SchoolCalendar schoolId={schools[0].id} role="STUDENT" />}
      </div>
    </main>
  );
}
