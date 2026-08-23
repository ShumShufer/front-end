import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Users } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useClassroom } from "../../../context/classroom/useClassroom.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./AttendanceRegister.module.css";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type AttendanceStatus = (typeof STATUS_OPTIONS)[number];

const DEFAULT_STATUS: AttendanceStatus = "PRESENT";

export function AttendanceRegister() {
  const { classroomId = "" } = useParams();
  const classroom = useClassroom();
  const [newDate, setNewDate] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  // Draft marks keyed by studentId for the selected session.
  const [draftMarks, setDraftMarks] = useState<Record<string, AttendanceStatus>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    void classroom.loadStudents(classroomId);
    void classroom.loadAttendance(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  const sortedSessions = useMemo(
    () =>
      [...classroom.attendanceSessions].sort((a, b) => b.date.localeCompare(a.date)),
    [classroom.attendanceSessions],
  );
  const selectedSession =
    sortedSessions.find((s) => s.id === selectedSessionId) ?? null;

  function existingMark(studentId: string): string | null {
    if (!selectedSession) return null;
    return (
      classroom.attendanceRecords.find(
        (r) => r.sessionId === selectedSession.id && r.studentId === studentId,
      )?.status ?? null
    );
  }

  function currentMark(studentId: string): AttendanceStatus {
    return draftMarks[studentId] ?? (existingMark(studentId) as AttendanceStatus) ?? DEFAULT_STATUS;
  }

  async function handleOpenSession(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!newDate) {
      setFormError("Pick a date for the new session.");
      return;
    }
    try {
      await classroom.openAttendanceSession(classroomId, newDate);
      setSuccessMessage(`Session opened for ${formatDate(newDate)}.`);
      setNewDate("");
    } catch {
      setFormError("Could not open a session — one may already exist for that date.");
    }
  }

  async function handleSaveMarks() {
    if (!selectedSession) return;
    setFormError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      await classroom.submitAttendance(
        classroomId,
        selectedSession.id,
        classroom.students.map((student) => ({
          id: `att-${Date.now()}-${student.id}`,
          sessionId: selectedSession.id,
          studentId: student.id,
          status: currentMark(student.id),
        })),
      );
      await classroom.loadAttendance(classroomId);
      setDraftMarks({});
      setSuccessMessage("Attendance saved.");
    } catch {
      setFormError("Attendance could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
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
            <Users size={14} /> Attendance register
          </p>
          <h1>Mark attendance</h1>
        </header>

        <form className={styles.openForm} onSubmit={(e) => void handleOpenSession(e)}>
          <label className={styles.field}>
            <span>New session date</span>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>
          <Button type="submit">
            <CalendarPlus size={16} /> Open session
          </Button>
        </form>

        {(formError || classroom.error) && (
          <p className={styles.formError} role="alert">
            {formError ?? classroom.error}
          </p>
        )}
        {successMessage && (
          <p className={styles.formSuccess} role="status">
            {successMessage}
          </p>
        )}

        {classroom.isLoading && sortedSessions.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : sortedSessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Open a session on a class day to start marking attendance."
          />
        ) : (
          <>
            <div className={styles.sessionPicker}>
              {sortedSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={`${styles.sessionChip} ${
                    session.id === (selectedSession?.id ?? sortedSessions[0].id)
                      ? styles.sessionChipActive
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setDraftMarks({});
                    setSuccessMessage(null);
                  }}
                >
                  {formatDate(session.date)}
                </button>
              ))}
            </div>

            {classroom.students.length === 0 ? (
              <EmptyState
                title="No students enrolled"
                description="Accepted students appear in this classroom's roster."
              />
            ) : (
              <section className={styles.roster}>
                <h2>
                  {selectedSession?.date
                    ? `Roster · ${formatDate(selectedSession.date)}`
                    : "Roster"}
                </h2>
                <ul className={styles.studentList}>
                  {classroom.students.map((student) => (
                    <li key={student.id} className={styles.studentRow}>
                      <strong>
                        {student.firstName} {student.lastName}
                      </strong>
                      <div
                        className={styles.statusGroup}
                        role="radiogroup"
                        aria-label={`Attendance for ${student.firstName}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            role="radio"
                            aria-checked={currentMark(student.id) === status}
                            className={`${styles.statusBtn} ${
                              status === "PRESENT" ? styles.presentBtn : ""
                            } ${status === "ABSENT" ? styles.absentBtn : ""} ${
                              status === "LATE" ? styles.lateBtn : ""
                            } ${
                              currentMark(student.id) === status
                                ? styles.statusBtnActive
                                : ""
                            }`}
                            onClick={() =>
                              setDraftMarks((marks) => ({
                                ...marks,
                                [student.id]: status,
                              }))
                            }
                          >
                            {status[0]}
                            {status.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                <footer className={styles.saveRow}>
                  <Button
                    disabled={
                      isSaving || !selectedSession || Object.keys(draftMarks).length === 0
                    }
                    onClick={() => void handleSaveMarks()}
                  >
                    {isSaving ? "Saving…" : "Save attendance"}
                  </Button>
                </footer>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
