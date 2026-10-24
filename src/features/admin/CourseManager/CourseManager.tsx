import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./CourseManager.module.css";

const MIN_TITLE_LENGTH = 3;

export function CourseManager() {
  const { user } = useAuth();
  const course = useCourse();
  const schoolId = user?.schoolId ?? "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void course.loadCourses(schoolId ? { schoolId } : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (title.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Give the course a descriptive title.");
      return;
    }
    const numericPrice = isFree ? 0 : Number(price);
    if (!isFree && (price.trim() === "" || Number.isNaN(numericPrice) || numericPrice <= 0)) {
      setFormError("Enter a price above zero, or mark the course as free.");
      return;
    }
    if (!user?.schoolId) {
      setFormError("Your school could not be determined — please sign in again.");
      return;
    }
    setIsSaving(true);
    try {
      await course.createCourse({
        schoolId: user.schoolId,
        title: title.trim(),
        description: description.trim() || null,
        price: numericPrice,
        isFree,
      });
      await course.loadCourses({ schoolId });
      setSuccessMessage("Course created — add topics from the education head view.");
      setTitle("");
      setDescription("");
      setPrice("");
      setIsFree(false);
    } catch {
      setFormError("The course could not be created. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(courseId: string, courseTitle: string) {
    if (
      !window.confirm(
        `Delete "${courseTitle}"? Students will lose access to its topics and quizzes.`,
      )
    )
      return;
    setFormError(null);
    setSuccessMessage(null);
    try {
      await course.deleteCourse(courseId);
      await course.loadCourses(schoolId ? { schoolId } : undefined);
      setSuccessMessage("Course deleted.");
    } catch {
      setFormError("The course could not be deleted. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <BookOpen size={14} /> Catalog
          </p>
          <h1>School courses</h1>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleCreate(e)}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              placeholder="e.g. Beginner driving theory"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Description</span>
            <textarea
              rows={2}
              value={description}
              placeholder="What will students learn?"
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className={styles.priceRow}>
            <label className={styles.field}>
              <span>Price (ETB)</span>
              <input
                type="number"
                min={0}
                value={isFree ? "0" : price}
                disabled={isFree}
                placeholder="1200"
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label className={styles.freeToggle}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Free course
            </label>
          </div>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className={styles.formSuccess} role="status">
              {successMessage}
            </p>
          )}
          <footer className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              <Plus size={16} />
              {isSaving ? "Creating…" : "Create course"}
            </Button>
          </footer>
        </form>

        {course.isLoading && course.courses.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : course.courses.length ? (
          <ul className={styles.list}>
            {course.courses.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                <span className={`${styles.badge} ${item.isFree ? styles.toneSuccess : ""}`}>
                  {item.isFree ? "Free" : formatCurrency(item.price)}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => void handleDelete(item.id, item.title)}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !formError && (
            <EmptyState
              title="No courses yet"
              description="Create your first course to build the catalog."
            />
          )
        )}
      </div>
    </main>
  );
}
