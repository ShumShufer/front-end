import { useEffect } from "react";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "../../student/StudentWorkspace/StudentWorkspace.module.css";

export function MentorWorkspace({
  view,
}: {
  view: "dashboard" | "classrooms" | "courses";
}) {
  const { user } = useAuth();
  const classroom = useClassroom();
  const course = useCourse();
  const { loadMentorClassrooms } = classroom;
  const { loadCourses } = course;

  useEffect(() => {
    if (!user) return;
    void loadMentorClassrooms(user.id);
    if (user.schoolId) void loadCourses({ schoolId: user.schoolId });
  }, [user?.id, user?.schoolId, loadMentorClassrooms, loadCourses]);

  if (!user) return null;
  if (classroom.isLoading || course.isLoading)
    return (
      <PageSkeleton variant={view === "dashboard" ? "dashboard" : "list"} />
    );

  if (view === "classrooms")
    return (
      <main className={styles.page}>
        <h1>My classrooms</h1>
        {classroom.classrooms.length ? (
          <div className={styles.grid}>
            {classroom.classrooms.map((item) => (
              <Link
                key={item.id}
                to={ROUTES.mentor.classroomHub(item.id)}
                className={styles.card}
              >
                <GraduationCap size={20} />
                <h2>{item.name}</h2>
                <p>
                  Manage course delivery, tasks, attendance, and student work.
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No classrooms assigned"
            description="Your assigned classrooms will appear here."
          />
        )}
      </main>
    );
  if (view === "courses")
    return (
      <main className={styles.page}>
        <h1>School courses</h1>
        {course.courses.length ? (
          <div className={styles.grid}>
            {course.courses.map((item) => (
              <Link
                key={item.id}
                to={ROUTES.mentor.courseEdit(item.id)}
                className={styles.card}
              >
                <BookOpen size={20} />
                <h2>{item.title}</h2>
                <p>{item.description || "Manage topics and course content."}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses available"
            description="School course managers will add courses for delivery."
          />
        )}
      </main>
    );
  return (
    <main className={styles.page}>
      <header>
        <p>Mentor workspace</p>
        <h1>Run a precise, practical classroom.</h1>
      </header>
      <div className={styles.grid}>
        <Link className={styles.card} to={ROUTES.mentor.classrooms}>
          <GraduationCap size={20} />
          <h2>{classroom.classrooms.length} classrooms</h2>
          <p>Open your classroom hub.</p>
        </Link>
        <Link className={styles.card} to={ROUTES.mentor.courses}>
          <BookOpen size={20} />
          <h2>{course.courses.length} courses</h2>
          <p>Manage course topics and delivery.</p>
        </Link>
        <article className={styles.card}>
          <ClipboardList size={20} />
          <h2>Tasks & grading</h2>
          <p>Open a classroom to manage student submissions.</p>
        </article>
      </div>
    </main>
  );
}
