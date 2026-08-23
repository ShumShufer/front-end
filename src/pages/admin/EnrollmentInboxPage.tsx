import { type FormEvent, useEffect, useState } from "react";
import { CheckCheck, X } from "lucide-react";
import { Button } from "../../components/Button/Button.tsx";
import { EmptyState } from "../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../components/Skeleton/PageSkeleton.tsx";
import { EnrollmentStatus } from "../../features/shared/Enrollment/EnrollmentStatus.tsx";
import styles from "../../features/shared/Enrollment/EnrollmentWorkspace.module.css";
import { useAuth } from "../../context/auth/useAuth.ts";
import { useEnrollment } from "../../context/enrollment/useEnrollment.ts";
import { useSchool } from "../../context/school/useSchool.ts";
import { useUI } from "../../context/ui/useUI.ts";
import { ApplicationStatus } from "../../types/common.types.ts";

export default function EnrollmentInboxPage() {
  const { user } = useAuth();
  const enrollment = useEnrollment();
  const school = useSchool();
  const { showToast } = useUI();
  // Reviewers can place an accepted student into a specific cohort; the
  // service falls back to the school's first classroom when none is picked.
  const [classroomChoice, setClassroomChoice] = useState<Record<string, string>>(
    {},
  );
  const { loadEnrollments } = enrollment;
  const { loadClassrooms } = school;

  useEffect(() => {
    if (!user?.schoolId) return;
    void loadEnrollments({ schoolId: user.schoolId });
    void loadClassrooms(user.schoolId);
  }, [user?.schoolId, loadEnrollments, loadClassrooms]);

  if (enrollment.isLoading && !enrollment.enrollments)
    return <PageSkeleton variant="admin" />;

  const applications = enrollment.enrollments?.data || [];
  const pending = applications.filter(
    (item) => item.status === ApplicationStatus.PENDING,
  );
  const classrooms = school.classrooms.filter(
    (item) => item.schoolId === user?.schoolId,
  );

  const approveSelected = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ids = new FormData(event.currentTarget)
      .getAll("applicationId")
      .map(String);
    try {
      await enrollment.acceptApplications(ids);
      showToast(`Approved ${ids.length} application${ids.length === 1 ? "" : "s"}.`, "success");
    } catch {
      showToast(enrollment.error || "Could not approve the selected applications.", "error");
    }
  };

  const approveOne = async (id: string) => {
    try {
      await enrollment.acceptApplication(id, classroomChoice[id] ?? null);
      showToast("Application approved.", "success");
    } catch {
      showToast(enrollment.error || "Could not approve this application.", "error");
    }
  };

  const rejectOne = async (id: string) => {
    if (!window.confirm("Decline this application? The student will be notified.")) return;
    try {
      await enrollment.rejectApplication(id);
      showToast("Application declined.", "info");
    } catch {
      showToast(enrollment.error || "Could not decline this application.", "error");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admissions desk</p>
            <h1>Enrollment applications</h1>
            <p>Review students seeking to join your school.</p>
          </div>
        </header>
        {enrollment.error ? <p className={styles.error}>{enrollment.error}</p> : null}
        <form className={styles.bulkForm} onSubmit={(event) => void approveSelected(event)}>
          <div className={styles.bulkToolbar}>
            <span>
              {pending.length} pending application{pending.length === 1 ? "" : "s"}
            </span>
            <Button type="submit" disabled={!pending.length || enrollment.isLoading}>
              <CheckCheck size={16} /> Approve selected
            </Button>
          </div>
          <section className={styles.stack}>
            {applications.length ? (
              applications.map((item) => {
                const applicantName =
                  String(item.formResponses.fullName || "") || "Student application";
                return (
                  <article key={item.id} className={styles.application}>
                    <label className={styles.check}>
                      <input
                        type="checkbox"
                        name="applicationId"
                        value={item.id}
                        disabled={item.status !== ApplicationStatus.PENDING}
                      />
                      <span className={styles.applicationMain}>
                        <strong>{applicantName}</strong>
                        <span className={styles.applicationMeta}>
                          {String(item.formResponses.phone || "No phone supplied")} ·{" "}
                          {item.mode.toLowerCase().replace("_", " ")} · Submitted{" "}
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                        {item.formResponses.note ? (
                          <span className={styles.applicationNote}>
                            “{String(item.formResponses.note)}”
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <div className={styles.actions}>
                      <EnrollmentStatus status={item.status} />
                      {item.status === ApplicationStatus.PENDING ? (
                        <>
                          <label className={styles.classroomPick}>
                            Classroom
                            <select
                              value={classroomChoice[item.id] ?? ""}
                              onChange={(event) =>
                                setClassroomChoice((current) => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">Auto-assign</option>
                              {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                  {classroom.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Button size="sm" type="button" onClick={() => void approveOne(item.id)}>
                            <CheckCheck size={15} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="secondary"
                            onClick={() => void rejectOne(item.id)}
                          >
                            <X size={15} /> Decline
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title="No enrollment applications"
                description="New student applications will arrive here for review."
              />
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
