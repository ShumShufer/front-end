import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useTask } from "../../../context/task/useTask.ts";
import { TaskType } from "../../../types/common.types.ts";
import type { Task } from "../../../types/task.types.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./TaskEditor.module.css";

const TASK_TYPE_OPTIONS = [
  { value: TaskType.ASSIGNMENT, label: "Assignment" },
  { value: TaskType.QUIZ, label: "Quiz" },
  { value: TaskType.EXAM, label: "Exam" },
];

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskEditor() {
  const { taskId = "" } = useParams();
  const navigate = useNavigate();
  const task = useTask();

  useEffect(() => {
    if (!taskId) return;
    void task.loadTaskById(taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  if (task.isLoading && !task.activeTask) return <PageSkeleton variant="list" />;
  if (!task.activeTask)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Task unavailable"
            description={task.error ?? "This task could not be found."}
          />
        </div>
      </main>
    );

  const backTo = ROUTES.mentor.tasks(task.activeTask.classroomId);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={backTo} className={styles.back}>
          <ArrowLeft size={16} /> Back to tasks
        </Link>
        <header className={styles.header}>
          <p>Edit task</p>
          <h1>{task.activeTask.title}</h1>
        </header>
        <TaskForm key={task.activeTask.id} initial={task.activeTask} taskId={taskId} onDelete={() => void handleDelete()} />
      </div>
    </main>
  );

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete “${task.activeTask?.title}”? This cannot be undone.`,
      )
    )
      return;
    try {
      await task.deleteTask(taskId);
      navigate(ROUTES.mentor.tasks(task.activeTask?.classroomId ?? ""));
    } catch {
      // Deletion failure is surfaced by the form's own error slot; nothing
      // further to do here.
    }
  }
}

interface TaskFormProps {
  initial: Task;
  taskId: string;
  onDelete: () => void;
}

function TaskForm({ initial, taskId, onDelete }: TaskFormProps) {
  const task = useTask();
  const [title, setTitle] = useState(initial.title);
  const [type, setType] = useState<TaskType>(initial.type);
  const [description, setDescription] = useState(initial.description ?? "");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initial.deadline));
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!title.trim() || !deadline) {
      setFormError("A title and deadline are required.");
      return;
    }
    setIsSaving(true);
    try {
      await task.updateTask(taskId, {
        title: title.trim(),
        type,
        description: description.trim() || null,
        deadline: new Date(deadline).toISOString(),
      });
      setSuccessMessage("Changes saved.");
    } catch {
      setFormError("The task could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSave(e)}>
      <label className={styles.field}>
        <span>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span>Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            {TASK_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
        <Button variant="ghost" onClick={onDelete}>
          <Trash2 size={16} /> Delete
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save size={16} />
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </footer>
    </form>
  );
}
