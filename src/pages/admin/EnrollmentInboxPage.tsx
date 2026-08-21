import { type FormEvent, useEffect } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "../../components/Button/Button.tsx";
import { EmptyState } from "../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../components/Skeleton/PageSkeleton.tsx";
import { EnrollmentStatus } from "../../features/shared/Enrollment/EnrollmentStatus.tsx";
import styles from "../../features/shared/Enrollment/EnrollmentWorkspace.module.css";
import { useAuth } from "../../context/auth/useAuth.ts";
import { useEnrollment } from "../../context/enrollment/useEnrollment.ts";
import { ApplicationStatus } from "../../types/common.types.ts";

export default function EnrollmentInboxPage() {
  const { user } = useAuth(); const enrollment = useEnrollment(); const { loadEnrollments } = enrollment;
  useEffect(() => { if (user?.schoolId) void loadEnrollments({ schoolId: user.schoolId }); }, [user?.schoolId, loadEnrollments]);
  if (enrollment.isLoading && !enrollment.enrollments) return <PageSkeleton variant="admin" />;
  const applications = enrollment.enrollments?.data || []; const pending = applications.filter((item) => item.status === ApplicationStatus.PENDING);
  const approveSelected = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const ids = new FormData(event.currentTarget).getAll("applicationId").map(String); await enrollment.acceptApplications(ids); };
  return <main className={styles.page}><div className={styles.inner}><header className={styles.header}><div><p className={styles.eyebrow}>Admissions desk</p><h1>Enrollment applications</h1><p>Review students seeking to join your school.</p></div></header>{enrollment.error ? <p className={styles.error}>{enrollment.error}</p> : null}<form className={styles.bulkForm} onSubmit={(event) => void approveSelected(event)}><div className={styles.bulkToolbar}><span>{pending.length} pending application{pending.length === 1 ? "" : "s"}</span><Button type="submit" disabled={!pending.length || enrollment.isLoading}><CheckCheck size={16} /> Approve selected</Button></div><section className={styles.stack}>{applications.length ? applications.map((item) => <article key={item.id} className={styles.application}><label className={styles.check}><input type="checkbox" name="applicationId" value={item.id} disabled={item.status !== ApplicationStatus.PENDING} /><span><strong>{String(item.formResponses.fullName || "Student application")}</strong><span className={styles.applicationMeta}> {String(item.formResponses.phone || "No phone supplied")} · {item.mode.toLowerCase().replace("_", " ")}</span></span></label><div className={styles.actions}><EnrollmentStatus status={item.status} />{item.status === ApplicationStatus.PENDING ? <Button size="sm" type="button" onClick={() => void enrollment.acceptApplication(item.id)}><CheckCheck size={15} /> Approve</Button> : null}</div></article>) : <EmptyState title="No enrollment applications" description="New student applications will arrive here for review." />}</section></form></div></main>;
}
