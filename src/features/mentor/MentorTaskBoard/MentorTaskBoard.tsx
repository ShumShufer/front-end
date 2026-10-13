import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useTask } from "../../../context/task/useTask.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate, formatDateTime, isOverdue } from "../../../utils/formatters.ts";
import { TaskType } from "../../../types/common.types.ts";
import styles from "./MentorTaskBoard.module.css";

const TASK_TYPE_LABELS = [
  { value: TaskType.ASSIGNMENT, label: "Assignment" },
  { value: TaskType.QUIZ, label: "Quiz" },
  { value: TaskType.EXAM, label: "Exam" },
];

export function MentorTaskBoard() {
  const { classroomId = "" } = useParams();
  const { user } = useAuth();
  const task = useTask();
  const classroom = useClassroom();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>(TaskType.ASSIGNMENT);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    void task.loadTasks(classroomId);
    void classroom.loadStudents(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  function studentName(studentId: string): string {
    const student = classroom.students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Student";
  }

  async function toggleSubmissions(taskItemId: string) {
    if (expandedTaskId === taskItemId) {
      setExpandedTaskId(null);
      return;
    }
    setExpandedTaskId(taskItemId);
    await task.loadSubmissions(taskItemId);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!title.trim() || !deadline) {
      setFormError("A title and deadline are required.");
      return;
    }
    setIsSaving(true);
    try {
      await task.createTask(classroomId, {
        createdById: user?.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        deadline: new Date(deadline).toISOString(),
        attachments: [],
      });
      await task.loadTasks(classroomId);
      setSuccessMessage(`“${title.trim()}” was posted to the classroom.`);
      setTitle("");
      setDescription("");
      setDeadline("");
      setType(TaskType.ASSIGNMENT);
      setShowForm(false);
    } catch {
      setFormError("The task could not be created. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(taskId: string, taskTitle: string) {
    if (!window.confirm(`Delete “${taskTitle}”? Students will lose access to it.`))
      return;
    try {
      await task.deleteTask(taskId);
      await task.loadTasks(classroomId);
    } catch {
      setFormError("The task could not be deleted. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.mentor.classroomHub(classroomId)} className={styles.back}>
          <ArrowLeft size={16} /> Classroom
        </Link>
        <header className={styles.header}>
          <p>
            <ClipboardList size={14} /> Classroom tasks
          </p>
          <h1>Tasks &amp; assignments</h1>
        </header>

        <div className={styles.toolbar}>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> New task
          </Button>
        </div>

        {(formError || task.error) && (
          <p className={styles.formError} role="alert">
            {formError ?? task.error}
          </p>
        )}
        {successMessage && (
          <p className={styles.formSuccess} role="status">
            {successMessage}
          </p>
        )}

        {showForm && (
          <form className={styles.form} onSubmit={(e) => void handleCreate(e)}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 3 theory quiz"
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                >
                  {TASK_TYPE_LABELS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Deadline</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span>Instructions</span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should students do?"
              />
            </label>
            <footer className={styles.actions}>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Posting…" : "Post task"}
              </Button>
            </footer>
          </form>
        )}

        {task.isLoading && task.tasks.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : task.tasks.length ? (
          <section className={styles.list}>
            {[...task.tasks]
              .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
              .map((item) => (
                <article key={item.id} className={styles.rowCard}>
                  <div className={styles.rowMain}>
                    <ClipboardList size={18} />
                    <div className={styles.rowBody}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.type} · due {formatDate(item.deadline)}
                        {isOverdue(item.deadline) ? " · past due" : ""}
                      </span>
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => void toggleSubmissions(item.id)}
                      >
                        Submissions
                        <ChevronDown
                          size={14}
                          className={
                            expandedTaskId === item.id ? styles.chevronUp : ""
                          }
                        />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        aria-label={`Delete ${item.title}`}
                        onClick={() => void handleDelete(item.id, item.title)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedTaskId === item.id && (
                    <div className={styles.submissionQueue}>
                      {task.submissions.filter((s) => s.taskId === item.id)
                        .length ? (
                        task.submissions
                          .filter((s) => s.taskId === item.id)
                          .map((submission) => (
                            <div
                              key={submission.id}
                              className={styles.submissionRow}
                            >
                              <span>{studentName(submission.studentId)}</span>
                              <small>
                                {formatDateTime(submission.submittedAt)}
                              </small>
                              {submission.grade !== null ? (
                                <span
                                  className={`${styles.badge} ${styles.toneSuccess}`}
                                >
                                  {submission.grade}/100
                                </span>
                              ) : (
                                <span
                                  className={`${styles.badge} ${styles.toneWarning}`}
                                >
                                  Ungraded
                                </span>
                              )}
                              <Link
                                to={ROUTES.mentor.grading(submission.id)}
                                className={styles.gradeLink}
                              >
                                {submission.grade !== null ? "Review" : "Grade"}
                              </Link>
                            </div>
                          ))
                      ) : (
                        <p className={styles.muted}>
                          No submissions for this task yet.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
          </section>
        ) : (
          !showForm && (
            <EmptyState
              title="No tasks yet"
              description="Post your first assignment, quiz or exam for this classroom."
            />
          )
        )}
      </div>
    </main>
  );
}
