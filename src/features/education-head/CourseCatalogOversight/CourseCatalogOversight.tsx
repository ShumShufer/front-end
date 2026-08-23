import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Layers } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatCurrency } from "../../../utils/formatters.ts";
import styles from "./CourseCatalogOversight.module.css";

export function CourseCatalogOversight() {
  const course = useCourse();
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void course.loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courses = useMemo(
    () =>
      [...course.courses].sort((a, b) => a.title.localeCompare(b.title)),
    [course.courses],
  );

  async function toggleTopics(courseId: string) {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    await course.loadTopics(courseId);
  }

  async function handleAddTopic(courseId: string) {
    setActionError(null);
    if (newTopicTitle.trim().length < 3) {
      setActionError("Topic titles need at least 3 characters.");
      return;
    }
    try {
      await course.createTopic(courseId, {
        title: newTopicTitle.trim(),
        order: course.topics.length + 1,
        description: null,
        videoUrl: null,
        content: null,
      });
      await course.loadTopics(courseId);
      await course.loadCourses();
      setNewTopicTitle("");
    } catch {
      setActionError("The topic could not be added. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Layers size={14} /> Catalog oversight
          </p>
          <h1>Course catalog</h1>
          <span>Review the school's programs and shape their curricula.</span>
        </header>

        {(actionError || course.error) && (
          <p className={styles.formError} role="alert">
            {actionError ?? course.error}
          </p>
        )}

        {course.isLoading && course.courses.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : courses.length ? (
          <section className={styles.list}>
            {courses.map((item) => (
              <article key={item.id} className={styles.card}>
                <header className={styles.rowMain}>
                  <BookOpen size={18} />
                  <div className={styles.rowBody}>
                    <strong>{item.title}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <span
                    className={`${styles.badge} ${item.isFree ? styles.toneSuccess : ""}`}
                  >
                    {item.isFree ? "Free" : formatCurrency(item.price)}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void toggleTopics(item.id)}
                  >
                    {expandedCourseId === item.id ? "Hide topics" : "Topics"}
                  </Button>
                </header>

                {expandedCourseId === item.id && (
                  <div className={styles.topicPanel}>
                    <ol className={styles.topicList}>
                      {[...course.topics]
                        .sort((a, b) => a.order - b.order)
                        .map((topic) => (
                          <li key={topic.id}>
                            <Link to={ROUTES.mentor.topicEdit(item.id, topic.id)}>
                              {topic.title}
                            </Link>
                          </li>
                        ))}
                      {course.topics.length === 0 && (
                        <li className={styles.muted}>No topics yet.</li>
                      )}
                    </ol>
                    <div className={styles.addTopicRow}>
                      <input
                        value={newTopicTitle}
                        placeholder="Add a new topic…"
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleAddTopic(item.id);
                          }
                        }}
                      />
                      <Button size="sm" onClick={() => void handleAddTopic(item.id)}>
                        Add topic
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No courses yet"
            description="Ask the school admin to create the first program."
          />
        )}
      </div>
    </main>
  );
}
