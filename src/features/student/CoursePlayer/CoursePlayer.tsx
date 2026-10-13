import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileBadge,
} from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { CoursePassStatus } from "../../../types/common.types.ts";
import styles from "./CoursePlayer.module.css";

export function CoursePlayer() {
  const { courseId = "" } = useParams();
  const { user } = useAuth();
  const { activeCourse: course, topics, progress, isLoading, error } =
    useCourse();
  const { loadCourseById, loadTopics, loadStudentProgress } = useCourse();
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);

  useEffect(() => {
    if (!courseId) return;
    void loadCourseById(courseId);
    void loadTopics(courseId);
    if (user) void loadStudentProgress(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  const orderedTopics = [...topics].sort((a, b) => a.order - b.order);
  const activeTopic =
    orderedTopics.find((t) => t.id === activeTopicId) ?? orderedTopics[0];
  const result = progress.find((r) => r.courseId === courseId);

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

  const allDone =
    orderedTopics.length > 0 &&
    orderedTopics.every((t) => completedTopicIds.includes(t.id));
  const passed = result?.status === CoursePassStatus.PASSED;

  function toggleDone(topicId: string) {
    setCompletedTopicIds((ids) =>
      ids.includes(topicId)
        ? ids.filter((id) => id !== topicId)
        : [...ids, topicId],
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.student.classroom} className={styles.back}>
          <ArrowLeft size={16} /> Back
        </Link>
        <header className={styles.header}>
          <p>
            <BookOpen size={14} /> Course player
          </p>
          <h1>{course.title}</h1>
        </header>

        {(passed || result?.finalExamScore != null) && (
          <div
            className={`${styles.banner} ${
              passed ? styles.bannerSuccess : styles.bannerWarning
            }`}
          >
            <FileBadge size={18} />
            {passed
              ? `You passed this course with a final exam score of ${result?.finalExamScore}%.`
              : `Final exam scored ${result?.finalExamScore}% — a retake is required.`}
          </div>
        )}

        {allDone && !passed && (
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            All topics completed. You are ready for the final exam.
            <Button size="sm" to={ROUTES.student.courseExam(courseId)}>
              Take final exam
            </Button>
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.topicList}>
            <h2>Topics</h2>
            {orderedTopics.length ? (
              orderedTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`${styles.topicItem} ${
                    activeTopic?.id === topic.id ? styles.topicActive : ""
                  }`}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  {completedTopicIds.includes(topic.id) ? (
                    <CheckCircle2 size={16} className={styles.doneIcon} />
                  ) : (
                    <Circle size={16} />
                  )}
                  <span>{topic.title}</span>
                </button>
              ))
            ) : (
              <p className={styles.muted}>No topics published yet.</p>
            )}
          </aside>

          <section className={styles.viewer}>
            {activeTopic ? (
              <>
                <h2>{activeTopic.title}</h2>
                {activeTopic.videoUrl && (
                  <a
                    className={styles.videoLink}
                    href={activeTopic.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={14} /> Watch lesson video
                  </a>
                )}
                <p>{activeTopic.content ?? "No lesson notes yet."}</p>
                <div className={styles.viewerActions}>
                  <Button
                    variant={
                      completedTopicIds.includes(activeTopic.id)
                        ? "secondary"
                        : "primary"
                    }
                    onClick={() => toggleDone(activeTopic.id)}
                  >
                    {completedTopicIds.includes(activeTopic.id)
                      ? "Mark as not done"
                      : "Mark topic as done"}
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                title="No topics yet"
                description="Your mentor will publish lesson topics here."
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
