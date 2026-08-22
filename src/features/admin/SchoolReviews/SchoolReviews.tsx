import { useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./SchoolReviews.module.css";

const MIN_RATING = 1;
const MAX_RATING = 5;

export function SchoolReviews() {
  const { user } = useAuth();
  const school = useSchool();
  const userCtx = useUser();
  const schoolId = user?.schoolId ?? "";

  useEffect(() => {
    if (!schoolId) return;
    void school.loadReviews({ schoolId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  useEffect(() => {
    if ((userCtx.users?.data.length ?? 0) === 0) void userCtx.loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studentName = useMemo(() => {
    const map = new Map(
      (userCtx.users?.data ?? []).map((u) => [u.id, `${u.firstName} ${u.lastName}`] as const),
    );
    return (studentId: string) => map.get(studentId) ?? "Student";
  }, [userCtx.users]);

  const average =
    school.reviews.length > 0
      ? school.reviews.reduce((sum, r) => sum + r.rating, 0) /
        school.reviews.length
      : 0;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Star size={14} /> Feedback
          </p>
          <h1>School reviews</h1>
        </header>

        {school.reviews.length > 0 && (
          <section className={styles.summary}>
            <span className={styles.score}>{average.toFixed(1)}</span>
            <div>
              <span className={styles.stars} aria-label={`${average.toFixed(1)} out of ${MAX_RATING}`}>
                {Array.from({ length: MAX_RATING - MIN_RATING + 1 }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className={
                        index < Math.round(average) ? styles.starFilled : styles.star
                      }
                    />
                  ),
                )}
              </span>
              <p>
                Based on {school.reviews.length} review
                {school.reviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </section>
        )}

        {school.isLoading && school.reviews.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : school.reviews.length ? (
          <ul className={styles.list}>
            {[...school.reviews]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((review) => (
                <li key={review.id} className={styles.item}>
                  <header>
                    <strong>{studentName(review.studentId)}</strong>
                    <span
                      className={styles.stars}
                      aria-label={`${review.rating} out of ${MAX_RATING}`}
                    >
                      {Array.from({ length: MAX_RATING - MIN_RATING + 1 }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            size={14}
                            className={
                              index < review.rating ? styles.starFilled : styles.star
                            }
                          />
                        ),
                      )}
                    </span>
                  </header>
                  {review.comment && <p>{review.comment}</p>}
                  <small>{formatDate(review.createdAt)}</small>
                </li>
              ))}
          </ul>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="Students who complete a course can review your school."
          />
        )}
      </div>
    </main>
  );
}
