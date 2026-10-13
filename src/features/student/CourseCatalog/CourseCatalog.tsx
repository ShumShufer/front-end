import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./CourseCatalog.module.css";

export function CourseCatalog() {
  const { user } = useAuth();
  const course = useCourse();
  const schoolId = user?.schoolId ?? "";

  useEffect(() => {
    if (!schoolId) return;
    void course.loadCourses({ schoolId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>Courses</p>
          <h1>Everything your school offers</h1>
        </header>

        {!schoolId || course.isLoading ? (
          <PageSkeleton variant="list" />
        ) : course.courses.length ? (
          <section className={styles.grid} aria-label="Course list">
            {course.courses.map((c) => (
              <article key={c.id} className={styles.card}>
                <BookOpen size={20} />
                <h2>{c.title}</h2>
                <p>{c.description ?? "No description provided."}</p>
                <span className={styles.price}>
                  {c.isFree ? "Free" : formatCurrency(Number(c.price))}
                </span>
                <div className={styles.cardActions}>
                  <Link to={ROUTES.student.coursePlayer(c.id)}>
                    Open course <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No courses yet"
            description="Courses published by your school will appear here."
          />
        )}
      </div>
    </main>
  );
}
