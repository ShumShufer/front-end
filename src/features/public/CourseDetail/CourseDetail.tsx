import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, PlayCircle } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./CourseDetail.module.css";

export function CourseDetail() {
  const { courseId = "" } = useParams();
  const course = useCourse();

  useEffect(() => {
    if (!courseId) return;
    void course.loadCourseById(courseId);
    void course.loadTopics(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const active = course.activeCourse;
  if (course.isLoading && !active) return <PageSkeleton variant="dashboard" />;
  if (!active)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Course unavailable"
            description={course.error ?? "This course could not be found."}
          />
          <div className={styles.backWrap}>
            <Link to={ROUTES.public.courses} className={styles.back}>
              <ArrowLeft size={16} /> Browse courses
            </Link>
          </div>
        </div>
      </main>
    );

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.public.courses} className={styles.back}>
          <ArrowLeft size={16} /> All courses
        </Link>
        <header className={styles.header}>
          <p>
            <BookOpen size={14} />
            {active.schoolId ? "Driving school course" : "ShumShufer course"}
          </p>
          <h1>{active.title}</h1>
          {active.description && <p className={styles.lede}>{active.description}</p>}
          <span
            className={`${styles.badge} ${active.isFree ? styles.toneSuccess : ""}`}
          >
            {active.isFree ? "Free" : formatCurrency(active.price)}
          </span>
        </header>

        <section className={styles.topics}>
          <h2>
            <PlayCircle size={18} /> Curriculum ({course.topics.length} topics)
          </h2>
          {course.topics.length ? (
            <ol className={styles.topicList}>
              {[...course.topics]
                .sort((a, b) => a.order - b.order)
                .map((topic) => (
                  <li key={topic.id}>
                    <strong>{topic.title}</strong>
                    {topic.description && <span>{topic.description}</span>}
                  </li>
                ))}
            </ol>
          ) : (
            <p className={styles.muted}>
              The full curriculum will be published soon.
            </p>
          )}
        </section>

        <div className={styles.ctaRow}>
          <Button to={ROUTES.auth.login}>Enroll to start learning</Button>
        </div>
      </div>
    </main>
  );
}
