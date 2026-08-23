import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Building2 } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./SearchResults.module.css";

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const school = useSchool();
  const course = useCourse();

  if (!query) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Nothing to search"
            description="Type a query in the search bar to find schools and courses."
          />
        </div>
      </main>
    );
  }

  const schoolsLoading = school.isLoading && !school.schools;
  const coursesLoading = course.isLoading && course.courses.length === 0;
  if (schoolsLoading || coursesLoading) {
    return <PageSkeleton variant="list" />;
  }

  const matchedSchools = (school.schools?.data ?? []).filter((s) =>
    s.name.toLowerCase().includes(query),
  );
  const matchedCourses = course.courses.filter((c) =>
    `${c.title} ${c.description ?? ""}`.toLowerCase().includes(query),
  );
  const totalHits = matchedSchools.length + matchedCourses.length;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1>
            {totalHits} result{totalHits === 1 ? "" : "s"} for “{searchParams.get("q")}”
          </h1>
        </header>

        {totalHits === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a school name or a topic like “theory”."
          />
        ) : (
          <>
            {matchedSchools.length > 0 && (
              <section className={styles.section}>
                <h2>
                  <Building2 size={16} /> Schools
                </h2>
                <ul className={styles.list}>
                  {matchedSchools.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`${ROUTES.public.schoolProfile(s.id)}`}
                        className={styles.item}
                      >
                        <strong>{s.name}</strong>
                        {s.description && <span>{s.description}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {matchedCourses.length > 0 && (
              <section className={styles.section}>
                <h2>
                  <BookOpen size={16} /> Courses
                </h2>
                <ul className={styles.list}>
                  {matchedCourses.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={ROUTES.public.courseDetail(c.id)}
                        className={styles.item}
                      >
                        <strong>{c.title}</strong>
                        {c.description && <span>{c.description}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
