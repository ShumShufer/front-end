import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useTask } from "../../../context/task/useTask.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDateTime } from "../../../utils/formatters.ts";
import styles from "./GradingConsole.module.css";

const MIN_GRADE = 0;
const MAX_GRADE = 100;

export function GradingConsole() {
  const { submissionId = "" } = useParams();
  const navigate = useNavigate();
  const task = useTask();
  const classroom = useClassroom();

  useEffect(() => {
    if (!submissionId) return;
    void task.loadSubmissionById(submissionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    const submission = task.submissions[0];
    if (!submission) return;
    void task.loadTaskById(submission.taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.submissions]);

  useEffect(() => {
    // The roster is only needed to display the student's name.
    if (!task.activeTask) return;
    void classroom.loadStudents(task.activeTask.classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.activeTask?.id]);

  const submission = task.submissions[0];
  if (task.isLoading && !submission) return <PageSkeleton variant="list" />;
  if (!submission)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Submission unavailable"
            description={task.error ?? "This submission could not be found."}
          />
        </div>
      </main>
    );

  function studentName(studentId: string): string {
    const student = classroom.students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Student";
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <header className={styles.header}>
          <p>
            <GraduationCap size={14} /> Grading
          </p>
          <h1>{task.activeTask?.title ?? "Submission"}</h1>
          <span>
            Submitted by {studentName(submission.studentId)} ·{" "}
            {formatDateTime(submission.submittedAt)}
          </span>
        </header>

        <section className={styles.card}>
          <h2>Student work</h2>
          {submission.attachments.length ? (
            submission.attachments.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            ))
          ) : (
            <p className={styles.muted}>No attachments were provided.</p>
          )}
        </section>

        <GradeForm
          key={submission.id}
          submissionId={submissionId}
          initialGrade={submission.grade !== null ? String(submission.grade) : ""}
          initialFeedback={submission.feedback ?? ""}
          classroomId={task.activeTask?.classroomId ?? null}
        />
      </div>
    </main>
  );
}

interface GradeFormProps {
  submissionId: string;
  initialGrade: string;
  initialFeedback: string;
  classroomId: string | null;
}

function GradeForm({
  submissionId,
  initialGrade,
  initialFeedback,
  classroomId,
}: GradeFormProps) {
  const task = useTask();
  const [grade, setGrade] = useState(initialGrade);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    const numericGrade = Number(grade);
    if (
      grade.trim() === "" ||
      Number.isNaN(numericGrade) ||
      numericGrade < MIN_GRADE ||
      numericGrade > MAX_GRADE
    ) {
      setFormError(`Enter a grade between ${MIN_GRADE} and ${MAX_GRADE}.`);
      return;
    }
    setIsSaving(true);
    try {
      await task.gradeSubmission(submissionId, numericGrade, feedback.trim());
      setSuccessMessage("Grade saved and visible to the student.");
    } catch {
      setFormError("The grade could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
          <h2>Grade</h2>
          <label className={styles.field}>
            <span>Score (0–100)</span>
            <input
              type="number"
              min={MIN_GRADE}
              max={MAX_GRADE}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Feedback</span>
            <textarea
              rows={4}
              value={feedback}
              placeholder="What did the student do well? What should they review?"
              onChange={(e) => setFeedback(e.target.value)}
            />
          </label>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <div className={styles.successRow}>
              <p className={styles.formSuccess} role="status">
                {successMessage}
              </p>
              {classroomId && (
                <Link
                  to={ROUTES.mentor.tasks(classroomId)}
                  className={styles.backLink}
                >
                  Back to task list
                </Link>
              )}
            </div>
          )}
          <footer className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save grade"}
            </Button>
          </footer>
        </form>
  );
}
