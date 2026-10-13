import { useEffect } from "react";
import { FileText, Search, Undo2 } from "lucide-react";
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
import { ROUTES } from "../../router/routes.config.ts";

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const enrollment = useEnrollment();
  const school = useSchool();
  const { showToast } = useUI();
  const { loadEnrollments } = enrollment;
  const { loadSchools } = school;
  useEffect(() => {
    if (user) {
      void loadEnrollments({ studentId: user.id });
      void loadSchools({ status: "ACTIVE" });
    }
  }, [user?.id, loadEnrollments, loadSchools]);
  if (enrollment.isLoading || school.isLoading)
    return <PageSkeleton variant="list" />;
  const schools = school.schools?.data || [];
  const nameOf = (schoolId: string) =>
    schools.find((item) => item.id === schoolId)?.name || "School application";

  const withdraw = async (id: string) => {
    if (!window.confirm("Withdraw this application? You can always apply again later."))
      return;
    try {
      await enrollment.withdrawApplication(id);
      showToast("Application withdrawn.", "info");
    } catch {
      showToast(enrollment.error || "Could not withdraw this application.", "error");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admissions</p>
            <h1>My enrollment applications</h1>
            <p>Follow each request from submission to acceptance.</p>
          </div>
          <Button to={ROUTES.public.schools} variant="secondary">
            <Search size={16} /> Find a school
          </Button>
        </header>
        <section className={styles.stack}>
          {enrollment.enrollments?.data?.length ? (
            enrollment.enrollments.data.map((item) => (
              <article key={item.id} className={styles.application}>
                <div className={styles.applicationMain}>
                  <FileText size={20} />
                  <strong>{nameOf(item.schoolId)}</strong>
                  <span className={styles.applicationMeta}>
                    Submitted {new Date(item.submittedAt).toLocaleDateString()}
                    {item.classroomId ? " · Classroom placed" : ""}
                  </span>
                </div>
                <div className={styles.actions}>
                  <EnrollmentStatus status={item.status} />
                  {item.status === ApplicationStatus.PENDING ? (
                    <Button
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() => void withdraw(item.id)}
                    >
                      <Undo2 size={15} /> Withdraw
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="No applications yet"
              description="Find a driving school that fits your schedule, then send an enrollment request."
            />
          )}
        </section>
      </div>
    </main>
  );
}
