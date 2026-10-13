import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./BrowseCourses.module.css";

export function BrowseCourses() {
  const course = useCourse();
  const school = useSchool();

  useEffect(() => {
    void course.loadCourses();
    void school.loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schoolName = useMemo(
    () => new Map((school.schools?.data ?? []).map((s) => [s.id, s.name])),
    [school.schools],
  );

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <BookOpen size={14} /> Catalog
          </p>
          <h1>Courses</h1>
          <span>Theory and practical programs from driving schools across Ethiopia.</span>
        </header>

        {course.isLoading && course.courses.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : course.courses.length ? (
          <section className={styles.grid}>
            {course.courses.map((item) => (
              <Link
                key={item.id}
                to={ROUTES.public.courseDetail(item.id)}
                className={styles.card}
              >
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                <footer>
                  <span className={styles.provider}>
                    {item.schoolId
                      ? schoolName.get(item.schoolId) ?? "Driving school"
                      : "ShumShufer"}
                  </span>
                  <span
                    className={`${styles.badge} ${item.isFree ? styles.toneSuccess : ""}`}
                  >
                    {item.isFree ? "Free" : formatCurrency(item.price)}
                  </span>
                </footer>
              </Link>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No courses published yet"
            description="Check back soon — schools are adding new programs."
          />
        )}
      </div>
    </main>
  );
}
