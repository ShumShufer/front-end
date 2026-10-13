import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Film,
  Link2,
  Megaphone,
  Users,
} from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useTask } from "../../../context/task/useTask.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate, formatDateTime, formatTime, isOverdue } from "../../../utils/formatters.ts";
import type { CoursePassStatus } from "../../../types/common.types.ts";
import styles from "./ClassroomDetail.module.css";

export type ClassroomTab =
  | "hub"
  | "feed"
  | "courses"
  | "tasks"
  | "attendance"
  | "resources";

const TABS: Array<{ key: ClassroomTab; label: string }> = [
  { key: "hub", label: "Overview" },
  { key: "feed", label: "Feed" },
  { key: "courses", label: "Courses" },
  { key: "tasks", label: "Tasks" },
  { key: "attendance", label: "Attendance" },
  { key: "resources", label: "Resources" },
];

const TAB_ROUTES: Record<ClassroomTab, (id: string) => string> = {
  hub: ROUTES.student.classroomHub,
  feed: ROUTES.student.classroomFeed,
  courses: ROUTES.student.classroomCourses,
  tasks: ROUTES.student.classroomTasks,
  attendance: ROUTES.student.classroomAttendance,
  resources: ROUTES.student.classroomResources,
};

const RESOURCE_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  PPT: FileText,
  VIDEO: Film,
  LINK: Link2,
};

const PASS_STATUS_LABELS: Record<CoursePassStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  PASSED: "Passed",
  FAILED: "Failed",
  RETAKE_REQUIRED: "Retake required",
};

const PASS_STATUS_TONES: Record<CoursePassStatus, string> = {
  NOT_STARTED: styles.toneMuted,
  IN_PROGRESS: styles.toneInfo,
  PASSED: styles.toneSuccess,
  FAILED: styles.toneDanger,
  RETAKE_REQUIRED: styles.toneWarning,
};

function AttendanceBadge({ status }: { status: string }) {
  const tone =
    status === "PRESENT"
      ? styles.toneSuccess
      : status === "LATE"
        ? styles.toneWarning
        : status === "EXCUSED"
          ? styles.toneInfo
          : styles.toneDanger;
  return <span className={`${styles.badge} ${tone}`}>{status}</span>;
}

export function ClassroomDetail({ tab }: { tab: ClassroomTab }) {
  const { classroomId = "" } = useParams();
  const { user } = useAuth();
  const classroom = useClassroom();

  // Ticks every minute so "upcoming" stays fresh without calling Date.now()
  // during render.
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const course = useCourse();
  const task = useTask();

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadClassroomById(classroomId);
    if (tab === "hub") {
      void classroom.loadSchedules(classroomId);
      void classroom.loadAnnouncements(classroomId);
      void classroom.loadAttendance(classroomId);
      void course.loadClassroomCourses(classroomId);
      if (user) void task.loadStudentSubmissions(user.id);
    }
    if (tab === "feed") void classroom.loadAnnouncements(classroomId);
    if (tab === "courses") {
      void course.loadClassroomCourses(classroomId);
      if (user) void course.loadStudentProgress(user.id);
    }
    if (tab === "tasks") {
      void task.loadTasks(classroomId);
      if (user) void task.loadStudentSubmissions(user.id);
    }
    if (tab === "attendance") void classroom.loadAttendance(classroomId);
    if (tab === "resources") void classroom.loadResources(classroomId);
    // Context actions are stable callbacks; classroomId + tab drive loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, tab, user?.id]);

  const active = classroom.activeClassroom;
  const myAttendance = useMemo(
    () =>
      classroom.attendanceRecords.filter((r) => r.studentId === user?.id),
    [classroom.attendanceRecords, user?.id],
  );
  const attendanceRate =
    myAttendance.length === 0
      ? null
      : Math.round(
          (myAttendance.filter(
            (r) => r.status === "PRESENT" || r.status === "LATE",
          ).length /
            myAttendance.length) *
            100,
        );

  if (classroom.isLoading && !active)
    return <PageSkeleton variant="dashboard" />;
  if (!active)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Classroom unavailable"
            description={
              classroom.error ?? "This classroom could not be found."
            }
          />
        </div>
      </main>
    );

  const upcoming = classroom.schedules
    .filter((e) => Date.parse(e.endTime) > nowTs)
    .sort(
      (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
    );

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.student.classroom} className={styles.back}>
          <ArrowLeft size={16} /> All classrooms
        </Link>
        <header className={styles.header}>
          <h1>{active.name}</h1>
          <p>Batch classroom at your enrolled school</p>
        </header>

        <nav className={styles.tabs}>
          {TABS.map((t) => (
            <Link
              key={t.key}
              to={TAB_ROUTES[t.key](classroomId)}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {(classroom.error || task.error || course.error) && (
          <p className={styles.formError} role="alert">
            {classroom.error ?? task.error ?? course.error}
          </p>
        )}

        {tab === "hub" && (
          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <BookOpen size={20} />
              <strong>{course.classroomCourses.length}</strong>
              <span>Courses</span>
            </article>
            <article className={styles.statCard}>
              <ClipboardList size={20} />
              <strong>{task.tasks.length}</strong>
              <span>Tasks posted</span>
            </article>
            <article className={styles.statCard}>
              <Megaphone size={20} />
              <strong>{classroom.announcements.length}</strong>
              <span>Announcements</span>
            </article>
            <article className={styles.statCard}>
              <Users size={20} />
              <strong>{attendanceRate === null ? "—" : `${attendanceRate}%`}</strong>
              <span>My attendance</span>
            </article>

            <article className={styles.panel}>
              <h2>
                <CalendarDays size={18} /> Upcoming sessions
              </h2>
              {upcoming.length ? (
                <ul className={styles.list}>
                  {upcoming.map((event) => (
                    <li key={event.id}>
                      <div>
                        <strong>{event.title}</strong>
                        <span>{event.location ?? "Location TBD"}</span>
                      </div>
                      <time>
                        {formatDateTime(event.startTime)} –{" "}
                        {formatTime(event.endTime)}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>
                  No upcoming sessions on the classroom schedule.
                </p>
              )}
            </article>

            <article className={styles.panel}>
              <h2>
                <Megaphone size={18} /> Latest announcements
              </h2>
              {classroom.announcements.length ? (
                <ul className={styles.list}>
                  {classroom.announcements.slice(0, 3).map((a) => (
                    <li key={a.id}>
                      <div>
                        <strong>{a.title}</strong>
                        <span>{formatDate(a.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>No announcements yet.</p>
              )}
            </article>
          </section>
        )}

        {tab === "feed" &&
          (classroom.announcements.length ? (
            <section className={styles.stack}>
              {classroom.announcements.map((a) => (
                <article key={a.id} className={styles.card}>
                  <header>
                    <h2>{a.title}</h2>
                    <time>{formatDate(a.createdAt)}</time>
                  </header>
                  <p>{a.body}</p>
                  <span className={styles.muted}>Audience: {a.audience}</span>
                </article>
              ))}
            </section>
          ) : (
            <EmptyState
              title="No announcements yet"
              description="Posts from your mentor and school will appear here."
            />
          ))}

        {tab === "courses" &&
          (course.classroomCourses.length ? (
            <section className={styles.cardGrid}>
              {course.classroomCourses.map(({ course: c }) => {
                const result = course.progress.find(
                  (r) => r.courseId === c.id,
                );
                const status = result?.status ?? "NOT_STARTED";
                return (
                  <article key={c.id} className={styles.card}>
                    <BookOpen size={20} />
                    <h2>{c.title}</h2>
                    <p>{c.description ?? "No description provided."}</p>
                    <span
                      className={`${styles.badge} ${PASS_STATUS_TONES[status]}`}
                    >
                      {PASS_STATUS_LABELS[status]}
                    </span>
                    {result?.finalExamScore !== null &&
                      result?.finalExamScore !== undefined && (
                        <span className={styles.scoreLine}>
                          Final exam score: {result.finalExamScore}%
                        </span>
                      )}
                    <div className={styles.cardActions}>
                      <Link to={ROUTES.student.coursePlayer(c.id)}>
                        Open course
                      </Link>
                      <Link to={ROUTES.student.courseExam(c.id)}>Final exam</Link>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <EmptyState
              title="No courses assigned"
              description="Your mentor or school has not attached courses to this classroom yet."
            />
          ))}

        {tab === "tasks" &&
          (task.tasks.length ? (
            <section className={styles.cardGrid}>
              {[...task.tasks]
                .sort(
                  (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline),
                )
                .map((t) => {
                  const submission = task.studentSubmissions.find(
                    (s) => s.taskId === t.id,
                  );
                  return (
                    <article key={t.id} className={styles.card}>
                      <ClipboardList size={20} />
                      <h2>{t.title}</h2>
                      <p>{t.description ?? ""}</p>
                      <span
                        className={`${styles.badge} ${
                          isOverdue(t.deadline) && !submission
                            ? styles.toneDanger
                            : styles.toneInfo
                        }`}
                      >
                        Due {formatDate(t.deadline)}
                      </span>
                      <span
                        className={`${styles.badge} ${
                          submission
                            ? submission.grade !== null
                              ? styles.toneSuccess
                              : styles.toneInfo
                            : styles.toneMuted
                        }`}
                      >
                        {submission
                          ? submission.grade !== null
                            ? `Graded: ${submission.grade}/100`
                            : "Submitted – awaiting grade"
                          : "Not submitted"}
                      </span>
                      <div className={styles.cardActions}>
                        <Link to={ROUTES.student.taskDetail(t.id)}>
                          {submission ? "View submission" : "Open task"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
            </section>
          ) : (
            <EmptyState
              title="No tasks posted"
              description="Assignments, quizzes and exams from your mentor will appear here."
            />
          ))}

        {tab === "attendance" &&
          (classroom.attendanceSessions.length ? (
            <section className={styles.stack}>
              <p className={styles.summary}>
                {attendanceRate === null
                  ? "No records marked for you yet."
                  : `You attended ${attendanceRate}% of ${myAttendance.length} recorded session${myAttendance.length === 1 ? "" : "s"}.`}
              </p>
              {classroom.attendanceSessions
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((session) => {
                  const record = myAttendance.find(
                    (r) => r.sessionId === session.id,
                  );
                  return (
                    <article key={session.id} className={styles.rowCard}>
                      <CalendarDays size={18} />
                      <strong>{formatDate(session.date)}</strong>
                      {record ? (
                        <AttendanceBadge status={record.status} />
                      ) : (
                        <span className={`${styles.badge} ${styles.toneMuted}`}>
                          Not recorded
                        </span>
                      )}
                    </article>
                  );
                })}
            </section>
          ) : (
            <EmptyState
              title="No attendance sessions"
              description="Your mentor opens attendance sessions during class meetings."
            />
          ))}

        {tab === "resources" &&
          (classroom.resources.length ? (
            <section className={styles.stack}>
              {classroom.resources.map((r) => {
                const Icon = RESOURCE_ICONS[r.type] ?? Link2;
                return (
                  <article key={r.id} className={styles.rowCard}>
                    <Icon size={18} />
                    <div className={styles.rowBody}>
                      <strong>{r.title}</strong>
                      <span>
                        {r.type}
                        {r.mandatory ? " · Mandatory" : " · Optional"}
                      </span>
                    </div>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </article>
                );
              })}
            </section>
          ) : (
            <EmptyState
              title="No resources yet"
              description="PDFs, videos and links shared by your mentor will appear here."
            />
          ))}
      </div>
    </main>
  );
}
