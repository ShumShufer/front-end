import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Send } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./StudentReporter.module.css";

const MIN_NOTE_LENGTH = 10;

export function StudentReporter() {
  const { classroomId = "", studentId = "" } = useParams();
  const classroom = useClassroom();
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadStudents(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const student = classroom.students.find((s) => s.id === studentId);

  if (classroom.isLoading && !student) return <PageSkeleton variant="list" />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (note.trim().length < MIN_NOTE_LENGTH) {
      setFormError(
        `Describe the issue in at least ${MIN_NOTE_LENGTH} characters so the education head can act on it.`,
      );
      return;
    }
    setIsSaving(true);
    try {
      await classroom.reportIssue(classroomId, studentId, note.trim());
      setSuccessMessage("Report sent to the school's education head.");
      setNote("");
    } catch {
      setFormError("The report could not be sent. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link
          to={ROUTES.mentor.classroomHub(classroomId)}
          className={styles.back}
        >
          <ArrowLeft size={16} /> Classroom
        </Link>
        <header className={styles.header}>
          <p>
            <AlertTriangle size={14} /> Report a concern
          </p>
          <h1>{student ? `${student.firstName} ${student.lastName}` : "Student"}</h1>
          <span>Visible only to the school's education head.</span>
        </header>

        {classroom.error && (
          <p className={styles.formError} role="alert">
            {classroom.error}
          </p>
        )}

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <label className={styles.field}>
            <span>What happened?</span>
            <textarea
              rows={6}
              value={note}
              placeholder="Describe the behaviour or incident, including the date it occurred…"
              onChange={(e) => setNote(e.target.value)}
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
              <Send size={16} />
              {isSaving ? "Sending…" : "Send report"}
            </Button>
          </footer>
        </form>
      </div>
    </main>
  );
}
