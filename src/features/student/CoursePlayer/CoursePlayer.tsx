import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
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

interface VideoSource {
  kind: "iframe" | "video";
  url: string;
}

/** Resolves any video URL (YouTube, Vimeo, Google Drive, uploaded storage, direct mp4/webm) to an embeddable or playable source. */
function resolveVideoSource(rawUrl: string): VideoSource {
  const trimmed = rawUrl.trim();

  // If it's a relative backend upload (e.g. /uploads/video.mp4)
  if (trimmed.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase && apiBase.startsWith("http")) {
      try {
        const origin = new URL(apiBase).origin;
        return { kind: "video", url: `${origin}${trimmed}` };
      } catch {
        // fallback
      }
    }
    return { kind: "video", url: trimmed };
  }

  // YouTube embed
  if (trimmed.includes("youtube.com/embed/")) {
    return { kind: "iframe", url: trimmed };
  }
  // youtu.be/VIDEO_ID
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch?.[1]) {
    return { kind: "iframe", url: `https://www.youtube.com/embed/${youtuBeMatch[1]}` };
  }
  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch?.[1]) {
    return { kind: "iframe", url: `https://www.youtube.com/embed/${shortsMatch[1]}` };
  }
  // youtube.com/watch?v=VIDEO_ID or m.youtube.com
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) {
    return { kind: "iframe", url: `https://www.youtube.com/embed/${watchMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return { kind: "iframe", url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Google Drive preview
  const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch?.[1]) {
    return { kind: "iframe", url: `https://drive.google.com/file/d/${gDriveMatch[1]}/preview` };
  }

  // Direct video file extensions
  const cleanPath = trimmed.split("?")[0].toLowerCase();
  if (
    cleanPath.endsWith(".mp4") ||
    cleanPath.endsWith(".webm") ||
    cleanPath.endsWith(".mov") ||
    cleanPath.endsWith(".ogg")
  ) {
    return { kind: "video", url: trimmed };
  }

  // Generic links with embed / player
  if (trimmed.includes("embed") || trimmed.includes("player")) {
    return { kind: "iframe", url: trimmed };
  }

  return { kind: "video", url: trimmed };
}

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
              : `Final exam completed with score ${result?.finalExamScore}%. Examination is a one-time assessment.`}
          </div>
        )}

        {allDone && !passed && result?.finalExamScore == null && (
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
                {activeTopic.videoUrl && (() => {
                  const videoSource = resolveVideoSource(activeTopic.videoUrl);
                  return (
                    <div className={styles.videoWrapper}>
                      {videoSource.kind === "iframe" ? (
                        <iframe
                          className={styles.videoPlayer}
                          src={videoSource.url}
                          title={activeTopic.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={videoSource.url}
                          className={styles.videoPlayer}
                          controls
                          playsInline
                          src={videoSource.url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  );
                })()}
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
