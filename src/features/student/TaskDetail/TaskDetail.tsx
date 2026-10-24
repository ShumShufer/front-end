import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Send } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useTask } from "../../../context/task/useTask.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate, formatDateTime, isOverdue } from "../../../utils/formatters.ts";
import styles from "./TaskDetail.module.css";

function parseUrlOrNull(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function TaskDetail() {
  const { taskId = "" } = useParams();
  const { user } = useAuth();
  const {
    activeTask: task,
    studentSubmissions,
    isLoading,
    error,
    loadTaskById,
    loadStudentSubmissions,
    submitTask,
  } = useTask();

  const [workUrl, setWorkUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    void loadTaskById(taskId);
    if (user) void loadStudentSubmissions(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, user?.id]);

  if (isLoading && !task) return <PageSkeleton variant="list" />;
  if (!task)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Task unavailable"
            description={error ?? "This task could not be found."}
          />
        </div>
      </main>
    );

  const mySubmission = studentSubmissions.find((s) => s.taskId === task.id);
  const overdue = isOverdue(task.deadline);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    const trimmed = workUrl.trim();
    const parsed = parseUrlOrNull(trimmed);
    if (!trimmed || !parsed || !parsed.protocol.startsWith("http")) {
      setFormError("Enter a valid link to your work starting with http(s).");
      return;
    }
    if (!user) return;
    setIsSubmitting(true);
    try {
      await submitTask(task!.id, user.id, [trimmed]);
      await loadStudentSubmissions(user.id);
      setSuccessMessage("Your work was submitted. Your mentor will grade it soon.");
      setWorkUrl("");
    } catch {
      setFormError("Your submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.student.classroom} className={styles.back}>
          <ArrowLeft size={16} /> Back
        </Link>
        <header className={styles.header}>
          <p>
            <ClipboardList size={14} /> {task.type}
          </p>
          <h1>{task.title}</h1>
          <span className={overdue && !mySubmission ? styles.overdue : ""}>
            Due {formatDate(task.deadline)}
            {overdue && !mySubmission ? " · past deadline" : ""}
          </span>
        </header>

        {task.description && (
          <section className={styles.card}>
            <h2>Instructions</h2>
            <p>{task.description}</p>
          </section>
        )}

        {mySubmission ? (
          <section className={`${styles.card} ${styles.submission}`}>
            <h2>Your submission</h2>
            <p>Submitted {formatDateTime(mySubmission.submittedAt)}</p>
            {mySubmission.attachments.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            ))}
            {mySubmission.grade !== null ? (
              <div className={styles.gradeBlock}>
                <strong>Grade: {mySubmission.grade}/100</strong>
                {mySubmission.feedback && <p>{mySubmission.feedback}</p>}
              </div>
            ) : (
              <span className={styles.pendingBadge}>
                Awaiting mentor grading
              </span>
            )}
          </section>
        ) : (
          <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
            <h2>Submit your work</h2>
            <label className={styles.field}>
              <span>Link to your work</span>
              <input
                type="url"
                placeholder="https://…"
                value={workUrl}
                onChange={(e) => setWorkUrl(e.target.value)}
              />
              <small>Paste a link to your document or file upload.</small>
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
              <Button type="submit" disabled={isSubmitting}>
                <Send size={16} />
                {isSubmitting ? "Submitting…" : "Submit work"}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </main>
  );
}
