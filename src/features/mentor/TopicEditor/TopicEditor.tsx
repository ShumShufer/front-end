import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./TopicEditor.module.css";

function parseUrlOrNull(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function TopicEditor() {
  const { courseId = "", topicId = "" } = useParams();
  const navigate = useNavigate();
  const course = useCourse();

  useEffect(() => {
    if (!courseId) return;
    void course.loadCourseById(courseId);
    void course.loadTopics(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const topic = course.topics.find((t) => t.id === topicId) ?? null;

  if (course.isLoading && !topic && courseId) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <header className={styles.header}>
          <p>Curriculum</p>
          <h1>{course.activeCourse?.title ?? "Course"}</h1>
          <span>Edit what students see for this topic.</span>
        </header>

        {!topicId ? (
          <p className={styles.formError} role="alert">
            No topic selected. Pick one from the{" "}
            <Link to={ROUTES.mentor.courses}>course list</Link>.
          </p>
        ) : !topic ? (
          <p className={styles.formError} role="alert">
            This topic could not be found in the course curriculum.
          </p>
        ) : (
          <TopicForm key={topic.id} initial={topic} />
        )}
      </div>
    </main>
  );
}

interface TopicFormProps {
  initial: NonNullable<
    ReturnType<typeof useCourse>["topics"]>[number]
}

function TopicForm({ initial }: TopicFormProps) {
  const course = useCourse();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl ?? "");
  const [content, setContent] = useState(initial.content ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (title.trim().length < 3) {
      setFormError("Give the topic a clear title.");
      return;
    }
    if (videoUrl.trim()) {
      const parsed = parseUrlOrNull(videoUrl.trim());
      if (!parsed || !parsed.protocol.startsWith("http")) {
        setFormError("The video link must start with http(s).");
        return;
      }
    }
    setIsSaving(true);
    try {
      await course.updateTopic(initial.id, {
        title: title.trim(),
        description: description.trim() || null,
        videoUrl: videoUrl.trim() || null,
        content: content.trim() || null,
      });
      setSuccessMessage("Topic updated.");
    } catch {
      setFormError("The topic could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSave(e)}>
      <label className={styles.field}>
        <span>Title</span>
        <input
          value={title}
          placeholder="e.g. Right of way rules"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>Description</span>
        <textarea
          rows={2}
          value={description}
          placeholder="A one-line summary of the lesson"
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>Video link</span>
        <input
          type="url"
          value={videoUrl}
          placeholder="https://…"
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>Reading material</span>
        <textarea
          rows={6}
          value={content}
          placeholder="Write the lesson notes students will read…"
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
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
          <Save size={16} />
          {isSaving ? "Saving…" : "Save topic"}
        </Button>
      </footer>
    </form>
  );
}
