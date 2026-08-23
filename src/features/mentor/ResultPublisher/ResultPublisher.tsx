import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./ResultPublisher.module.css";

const PUBLISHABLE_STATUSES = ["PASSED", "FAILED", "RETAKE_REQUIRED"] as const;
type PublishableStatus = (typeof PUBLISHABLE_STATUSES)[number];

const STATUS_LABELS: Record<PublishableStatus, string> = {
  PASSED: "Passed",
  FAILED: "Failed",
  RETAKE_REQUIRED: "Retake required",
};

interface DraftResult {
  status: PublishableStatus;
  finalExamScore: string;
}

export function ResultPublisher() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();
  const course = useCourse();
  // Draft results keyed by studentId.
  const [drafts, setDrafts] = useState<Record<string, DraftResult>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadStudents(classroomId);
    void course.loadClassroomCourses(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  useEffect(() => {
    let cancelled = false;
    async function loadAllCourses() {
      try {
        await course.loadCourses();
        if (!cancelled) {
          setCourses(course.courses.map((c) => ({ id: c.id, title: c.title })));
        }
      } finally {
        if (!cancelled) setIsLoadingCourses(false);
      }
    }
    void loadAllCourses();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Default the course picker to this classroom's first course.
  const defaultCourseId = useMemo(
    () => course.classroomCourses[0]?.course.id ?? "",
    [course.classroomCourses],
  );
  const effectiveCourseId = selectedCourseId || defaultCourseId;

  function updateDraft(studentId: string, patch: Partial<DraftResult>) {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...{ status: "PASSED" as PublishableStatus, finalExamScore: "" },
        ...prev[studentId],
        ...patch,
      },
    }));
  }

  async function handlePublish(studentId: string, studentName: string) {
    if (!effectiveCourseId) return;
    const draft = drafts[studentId];
    if (!draft || !draft.status) {
      setFormError("Choose a result status first.");
      return;
    }
    const numericScore =
      draft.finalExamScore.trim() === "" ? null : Number(draft.finalExamScore);
    if (
      numericScore !== null &&
      (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100)
    ) {
      setFormError(`Final exam score for ${studentName} must be 0–100.`);
      return;
    }
    setFormError(null);
    setSuccessMessage(null);
    setIsSavingId(studentId);
    try {
      await course.publishResult(effectiveCourseId, studentId, {
        classroomId,
        status: draft.status,
        finalExamScore: numericScore,
      });
      setSuccessMessage(`Result published for ${studentName}.`);
    } catch {
      setFormError(`The result for ${studentName} could not be published.`);
    } finally {
      setIsSavingId(null);
    }
  }

  if (isLoadingCourses) return <PageSkeleton variant="list" />;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.mentor.classroomHub(classroomId)} className={styles.back}>
          <ArrowLeft size={16} /> Classroom
        </Link>
        <header className={styles.header}>
          <p>
            <Megaphone size={14} /> Results
          </p>
          <h1>Publish course results</h1>
          <span>
            Students see a published result on their dashboard immediately.
          </span>
        </header>

        <label className={styles.coursePicker}>
          <span>Course</span>
          <select
            value={effectiveCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">Select a course…</option>
            {(defaultCourseId && !selectedCourseId
              ? [
                  ...course.classroomCourses.map((link) => ({
                    id: link.course.id,
                    title: link.course.title,
                  })),
                  ...courses.filter(
                    (c) =>
                      !course.classroomCourses.some((l) => l.course.id === c.id),
                  ),
                ]
              : courses
            ).map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        {!effectiveCourseId ? (
          <p className={styles.muted}>
            This classroom has no courses attached yet — pick one above to publish
            results for it anyway.
          </p>
        ) : null}

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

        {classroom.students.length === 0 ? (
          <p className={styles.muted}>No students are enrolled in this classroom yet.</p>
        ) : (
          <section className={styles.list}>
            {classroom.students.map((student) => {
              const name = `${student.firstName} ${student.lastName}`;
              const draft = drafts[student.id];
              return (
                <article key={student.id} className={styles.rowCard}>
                  <strong>{name}</strong>
                  <select
                    aria-label={`Status for ${name}`}
                    value={draft?.status ?? ""}
                    onChange={(e) =>
                      updateDraft(student.id, {
                        status: e.target.value as PublishableStatus,
                      })
                    }
                  >
                    <option value="">Choose status…</option>
                    {PUBLISHABLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    aria-label={`Final exam score for ${name}`}
                    placeholder="Exam score"
                    value={draft?.finalExamScore ?? ""}
                    onChange={(e) =>
                      updateDraft(student.id, { finalExamScore: e.target.value })
                    }
                  />
                  <Button
                    size="sm"
                    disabled={!draft?.status || isSavingId === student.id}
                    onClick={() => void handlePublish(student.id, name)}
                  >
                    {isSavingId === student.id ? "Publishing…" : "Publish"}
                  </Button>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
