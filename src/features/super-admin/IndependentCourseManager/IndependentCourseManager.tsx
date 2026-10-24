import { useEffect, useState } from "react";
import { Edit2, Globe2, Plus, Trash2, X } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import type { Course } from "../../../types/course.types.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./IndependentCourseManager.module.css";

const MIN_TITLE_LENGTH = 3;

export function IndependentCourseManager() {
  const course = useCourse();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit course state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editIsFree, setEditIsFree] = useState(false);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  useEffect(() => {
    void course.loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const independentCourses = course.courses.filter(
    (c) => c.schoolId === null || c.schoolId === undefined,
  );

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (title.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Give the course a descriptive title.");
      return;
    }
    const numericPrice = isFree ? 0 : Number(price);
    if (
      !isFree &&
      (price.trim() === "" || Number.isNaN(numericPrice) || numericPrice <= 0)
    ) {
      setFormError("Enter a price above zero, or mark the course as free.");
      return;
    }
    setIsSaving(true);
    try {
      await course.createCourse({
        schoolId: null,
        title: title.trim(),
        description: description.trim() || null,
        price: numericPrice,
        isFree,
      });
      await course.loadCourses();
      setSuccessMessage("Platform course published.");
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
    if (!window.confirm(`Delete "${courseTitle}" from the platform catalog?`))
      return;
    setFormError(null);
    try {
      await course.deleteCourse(courseId);
      await course.loadCourses();
      setSuccessMessage("Course removed.");
    } catch {
      setFormError("The course could not be deleted. Please try again.");
    }
  }

  function startEditCourse(c: Course) {
    setEditingCourseId(c.id);
    setEditTitle(c.title);
    setEditDescription(c.description || "");
    setEditPrice(String(c.price || ""));
    setEditIsFree(Boolean(c.isFree));
    setFormError(null);
    setSuccessMessage(null);
  }

  function cancelEditCourse() {
    setEditingCourseId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPrice("");
    setEditIsFree(false);
  }

  async function handleSaveCourse(id: string) {
    if (editTitle.trim().length < MIN_TITLE_LENGTH) {
      setFormError("Course title must be at least 3 characters.");
      return;
    }
    const numericPrice = editIsFree ? 0 : Number(editPrice);
    if (!editIsFree && (editPrice.trim() === "" || Number.isNaN(numericPrice) || numericPrice < 0)) {
      setFormError("Enter a valid price or mark the course as free.");
      return;
    }
    setIsUpdatingCourse(true);
    setFormError(null);
    try {
      await course.updateCourse(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        price: numericPrice,
        isFree: editIsFree,
      });
      setSuccessMessage("Course updated successfully.");
      setEditingCourseId(null);
      await course.loadCourses();
    } catch {
      setFormError("Failed to update course. Please try again.");
    } finally {
      setIsUpdatingCourse(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Globe2 size={14} /> Catalog
          </p>
          <h1>Independent platform courses</h1>
          <span>
            Courses owned by ShumShufer itself — not attached to any school.
          </span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleCreate(e)}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              value={title}
              placeholder="e.g. Defensive driving fundamentals"
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
                placeholder="900"
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
              {isSaving ? "Publishing…" : "Publish course"}
            </Button>
          </footer>
        </form>

        {course.isLoading && course.courses.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : independentCourses.length ? (
          <ul className={styles.list}>
            {independentCourses.map((item) => (
              <li key={item.id} className={styles.item}>
                {editingCourseId === item.id ? (
                  <div style={{ display: "grid", gap: "0.75rem", width: "100%", padding: "0.5rem 0" }}>
                    <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                      Course Title *
                      <input
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Course title"
                      />
                    </label>
                    <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                      Description
                      <input
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.9rem" }}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Course description"
                      />
                    </label>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600, flex: 1 }}>
                        Price (ETB)
                        <input
                          type="number"
                          disabled={editIsFree}
                          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.9rem" }}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Price"
                        />
                      </label>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>
                        <input
                          type="checkbox"
                          checked={editIsFree}
                          onChange={(e) => setEditIsFree(e.target.checked)}
                        />
                        Free course
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button size="sm" disabled={isUpdatingCourse} onClick={() => void handleSaveCourse(item.id)}>
                        {isUpdatingCourse ? "Saving…" : "Save changes"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditCourse}>
                        <X size={14} /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemMain}>
                      <strong>{item.title}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <span className={`${styles.badge} ${item.isFree ? styles.toneSuccess : ""}`}>
                      {item.isFree ? "Free" : formatCurrency(item.price)}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        aria-label={`Edit ${item.title}`}
                        title="Edit course"
                        onClick={() => startEditCourse(item)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", padding: "4px" }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.title}`}
                        title="Delete course"
                        onClick={() => void handleDelete(item.id, item.title)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !formError && (
            <EmptyState
              title="No platform courses yet"
              description="Publish the first ShumShufer-owned course."
            />
          )
        )}
      </div>
    </main>
  );
}
