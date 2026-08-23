import { useEffect } from "react";
import {
  BookOpen,
  Briefcase,
  ClipboardList,
  GraduationCap,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import styles from "../../student/StudentWorkspace/StudentWorkspace.module.css";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUI } from "../../../context/ui/useUI.ts";
import { ApplicationStatus } from "../../../types/common.types.ts";
import { ROUTES } from "../../../router/routes.config.ts";

export function MentorWorkspace({
  view,
}: {
  view: "dashboard" | "classrooms" | "courses" | "openings";
}) {
  const { user } = useAuth();
  const classroom = useClassroom();
  const course = useCourse();
  const school = useSchool();
  const { showToast } = useUI();
  const { loadMentorClassrooms } = classroom;
  const { loadCourses } = course;
  const { loadStaffPosts, loadStaffApplications, loadSchools, applyToStaffPost } =
    school;

  useEffect(() => {
    if (!user) return;
    void loadMentorClassrooms(user.id);
    if (user.schoolId) void loadCourses({ schoolId: user.schoolId });
  }, [user?.id, user?.schoolId, loadMentorClassrooms, loadCourses]);

  // Job board: every school's open role plus this mentor's own applications
  // so cards can show "applied" state without refetching.
  useEffect(() => {
    if (view !== "openings") return;
    void loadStaffPosts();
    void loadSchools({ status: "ACTIVE" });
    if (user) void loadStaffApplications({ applicantId: user.id });
  }, [
    view,
    user?.id,
    loadStaffPosts,
    loadSchools,
    loadStaffApplications,
  ]);

  if (!user) return null;
  if (
    classroom.isLoading ||
    course.isLoading ||
    (view === "openings" && school.isLoading && !school.staffPosts.length)
  )
    return (
      <PageSkeleton variant={view === "dashboard" ? "dashboard" : "list"} />
    );

  const apply = async (postId: string) => {
    try {
      await applyToStaffPost(postId, user.id);
      showToast("Application sent to the hiring school.", "success");
    } catch {
      showToast(school.error || "Could not submit your application.", "error");
    }
  };

  if (view === "openings")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <header>
            <p>Mentor workspace</p>
            <h1>Job openings</h1>
          </header>
          <section className={styles.stack}>
            {school.staffPosts.filter((post) => post.status === "OPEN").length ? (
              school.staffPosts
                .filter((post) => post.status === "OPEN")
                .map((post) => {
                  const myApplication = school.staffApplications.find(
                    (application) =>
                      application.postId === post.id &&
                      application.applicantId === user.id,
                  );
                  const schoolName =
                    school.schools?.data.find((item) => item.id === post.schoolId)
                      ?.name ?? "Partner school";
                  return (
                    <article key={post.id} className={styles.card}>
                      <Briefcase size={20} />
                      <h2>
                        {post.role.replaceAll("_", " ")} · {schoolName}
                      </h2>
                      <p>{post.description}</p>
                      {myApplication &&
                      myApplication.status === ApplicationStatus.ACCEPTED ? (
                        <p className={styles.cardHighlight}>
                          Hired! This school is now your home school.
                        </p>
                      ) : myApplication &&
                        myApplication.status === ApplicationStatus.PENDING ? (
                        <p>Application under review.</p>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => void apply(post.id)}
                          disabled={school.isLoading}
                        >
                          <Send size={15} /> Apply
                        </Button>
                      )}
                    </article>
                  );
                })
            ) : (
              <EmptyState
                title="No open roles right now"
                description="Schools post mentor and education-head openings here."
              />
            )}
          </section>
        </div>
      </main>
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
        </div>
      </main>
    );
  if (view === "courses")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
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
        </div>
      </main>
    );
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
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
      </div>
    </main>
  );
}
