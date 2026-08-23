import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileStack,
  Megaphone,
  Users,
} from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDateTime } from "../../../utils/formatters.ts";
import styles from "./MentorClassroomHub.module.css";

export function MentorClassroomHub() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();

  // Ticks every minute so "upcoming" stays fresh without calling Date.now()
  // during render.
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const course = useCourse();

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadClassroomById(classroomId);
    void classroom.loadStudents(classroomId);
    void classroom.loadAnnouncements(classroomId);
    void classroom.loadSchedules(classroomId);
    void course.loadClassroomCourses(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  if (classroom.isLoading && !classroom.activeClassroom)
    return <PageSkeleton variant="dashboard" />;
  const active = classroom.activeClassroom;
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
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

  const quickLinks = [
    {
      to: ROUTES.mentor.tasks(classroomId),
      icon: ClipboardList,
      title: "Tasks",
      description: "Create assignments, quizzes and exams.",
    },
    {
      to: ROUTES.mentor.attendance(classroomId),
      icon: Users,
      title: "Attendance",
      description: "Open sessions and mark the register.",
    },
    {
      to: ROUTES.mentor.resources(classroomId),
      icon: FileStack,
      title: "Resources",
      description: "Share PDFs, videos and links.",
    },
    {
      to: ROUTES.mentor.schedule(classroomId),
      icon: CalendarDays,
      title: "Schedule",
      description: "Plan classroom sessions.",
    },
    {
      to: ROUTES.mentor.announcements(classroomId),
      icon: Megaphone,
      title: "Announcements",
      description: "Post updates to your students.",
    },
    {
      to: ROUTES.mentor.reportStudent(classroomId),
      icon: BookOpen,
      title: "Report an issue",
      description: "Flag a concern about a student.",
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.mentor.classrooms} className={styles.back}>
          <ArrowLeft size={16} /> All classrooms
        </Link>
        <header className={styles.header}>
          <h1>{active.name}</h1>
          <p>Mentor workspace</p>
        </header>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <Users size={20} />
            <strong>{classroom.students.length}</strong>
            <span>Students</span>
          </article>
          <article className={styles.statCard}>
            <BookOpen size={20} />
            <strong>{course.classroomCourses.length}</strong>
            <span>Courses</span>
          </article>
          <article className={styles.statCard}>
            <Megaphone size={20} />
            <strong>{classroom.announcements.length}</strong>
            <span>Announcements</span>
          </article>
          <article className={styles.statCard}>
            <CalendarDays size={20} />
            <strong>{upcoming.length}</strong>
            <span>Upcoming sessions</span>
          </article>
        </section>

        <nav className={styles.linkGrid}>
          {quickLinks.map(({ to, icon: Icon, title, description }) => (
            <Link key={title} to={to} className={styles.quickLink}>
              <Icon size={20} />
              <h2>{title}</h2>
              <p>{description}</p>
            </Link>
          ))}
        </nav>

        <section className={styles.panel}>
          <h2>Next sessions</h2>
          {upcoming.length ? (
            <ul className={styles.list}>
              {upcoming.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.location ?? "Location TBD"}</span>
                  </div>
                  <time>{formatDateTime(event.startTime)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Nothing scheduled yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
