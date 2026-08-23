import { useEffect, useMemo } from "react";
import { Tag } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./Pricing.module.css";

const PERKS = [
  "Theory courses with quizzes and final exams",
  "Practical scheduling with your mentor",
  "Cross-school practice through agreements",
  "Fayda-verified accounts for safety",
];

export function Pricing() {
  const course = useCourse();

  useEffect(() => {
    void course.loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceRange = useMemo(() => {
    const paid = course.courses.filter((c) => !c.isFree).map((c) => c.price);
    if (paid.length === 0) return null;
    return { min: Math.min(...paid), max: Math.max(...paid) };
  }, [course.courses]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Tag size={14} /> Pricing
          </p>
          <h1>Simple, transparent pricing</h1>
          <span>
            ShumShufer adds a 10% platform fee on school transactions — the rest
            goes to your driving school.
          </span>
        </header>

        <section className={styles.cards}>
          <article className={`${styles.card} ${styles.highlight}`}>
            <h2>School programs</h2>
            <strong>
              {priceRange
                ? `${formatCurrency(priceRange.min)} – ${formatCurrency(priceRange.max)}`
                : formatCurrency(0)}
            </strong>
            <span>per full program, set by each school</span>
            <ul>
              {PERKS.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <Button to={ROUTES.public.courses}>Browse courses</Button>
          </article>

          <article className={styles.card}>
            <h2>Free courses</h2>
            <strong>{formatCurrency(0)}</strong>
            <span>platform-published basics</span>
            <ul>
              <li>Open to everyone</li>
              <li>Self-paced theory</li>
              <li>No payment details required</li>
            </ul>
            <Button variant="secondary" to={ROUTES.public.courses}>
              See what's free
            </Button>
          </article>
        </section>

        {course.isLoading && course.courses.length === 0 && (
          <PageSkeleton variant="list" />
        )}
      </div>
    </main>
  );
}
