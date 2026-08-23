import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./LeaveReview.module.css";

const MIN_RATING = 1;
// Star ratings use the standard 1–5 scale.
const MAX_RATING = 5;

export function LeaveReview() {
  const { courseId = "" } = useParams();
  const { user } = useAuth();
  const {
    activeCourse: course,
    isLoading,
    error,
    loadCourseById,
  } = useCourse();
  const school = useSchool();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    void loadCourseById(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (isLoading && !course) return <PageSkeleton variant="list" />;
  if (!course)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Course unavailable"
            description={error ?? "This course could not be found."}
          />
        </div>
      </main>
    );

  const reviewedSchool =
    school.activeSchool?.id === course.schoolId
      ? school.activeSchool
      : (school.schools?.data ?? []).find((s) => s.id === course.schoolId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!user) return;
    if (!course?.schoolId) {
      setFormError("This course is not linked to a school and cannot be reviewed.");
      return;
    }
    if (rating < MIN_RATING) {
      setFormError("Select a star rating before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      await school.addReview(course.schoolId, user.id, rating, comment.trim());
      setSubmitted(true);
    } catch {
      setFormError("Your review could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayedStars = hoverRating || rating;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.student.results} className={styles.back}>
          <ArrowLeft size={16} /> Back to results
        </Link>
        <header className={styles.header}>
          <p>Rate your experience</p>
          <h1>{reviewedSchool ? reviewedSchool.name : "Review"} </h1>
          <span>For the course “{course.title}”</span>
        </header>

        {submitted ? (
          <section className={styles.successCard}>
            <h2>Thank you for your feedback!</h2>
            <p>Your rating helps other learners choose great schools.</p>
            <Button variant="secondary" to={ROUTES.student.dashboard}>
              Back to dashboard
            </Button>
          </section>
        ) : (
          <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
            <fieldset className={styles.starsField}>
              <legend>Your rating</legend>
              <div className={styles.stars} role="radiogroup" aria-label="Rating">
                {Array.from(
                  { length: MAX_RATING - MIN_RATING + 1 },
                  (_, i) => i + MIN_RATING,
                ).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.starBtn} ${
                      value <= displayedStars ? styles.starOn : ""
                    }`}
                    aria-pressed={rating === value}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(value)}
                  >
                    <Star size={26} />
                  </button>
                ))}
              </div>
              <p className={styles.ratingHint}>
                {displayedStars === 0 && "Tap to rate"}
                {displayedStars === 1 && "Poor"}
                {displayedStars === 2 && "Fair"}
                {displayedStars === 3 && "Good"}
                {displayedStars === 4 && "Very good"}
                {displayedStars === 5 && "Excellent"}
              </p>
            </fieldset>

            <label className={styles.field}>
              <span>Comment (optional)</span>
              <textarea
                rows={4}
                value={comment}
                placeholder="What did you like? What could be better?"
                onChange={(e) => setComment(e.target.value)}
              />
            </label>

            {formError && (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            )}

            <footer className={styles.actions}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Submit review"}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </main>
  );
}
