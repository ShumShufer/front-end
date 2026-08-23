import { type FormEvent, useEffect } from "react";
import { Building2, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button/Button.tsx";
import { EmptyState } from "../../components/EmptyState/EmptyState.tsx";
import { Input } from "../../components/Form/Input.tsx";
import { PageSkeleton } from "../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
import { useEnrollment } from "../../context/enrollment/useEnrollment.ts";
import { useSchool } from "../../context/school/useSchool.ts";
import { ApplicationMode } from "../../types/common.types.ts";
import { ROUTES } from "../../router/routes.config.ts";
import styles from "../../features/shared/Enrollment/EnrollmentWorkspace.module.css";

export default function SchoolApplicationPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const school = useSchool();
  const enrollment = useEnrollment();
  const { loadSchoolById } = school;
  useEffect(() => { if (schoolId) void loadSchoolById(schoolId); }, [schoolId, loadSchoolById]);
  if (!schoolId || !user) return null;
  if (school.isLoading && !school.activeSchool) return <PageSkeleton variant="dashboard" />;
  if (!school.activeSchool) return <EmptyState title="School unavailable" description="Choose another school and try again." />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await enrollment.submitApplication(user.id, schoolId, String(data.get("mode")) as ApplicationMode, { fullName: String(data.get("fullName") || ""), phone: String(data.get("phone") || ""), note: String(data.get("note") || "") });
      navigate(ROUTES.student.applications);
    } catch {
      // The context records the failure; the inline error below explains it.
    }
  };
  return <main className={styles.page}><div className={styles.inner}><header className={styles.header}><div><p className={styles.eyebrow}>School enrollment</p><h1>Apply to {school.activeSchool.name}</h1><p>Send your enrollment request directly to the school administrator.</p></div></header><div className={styles.grid}><form className={[styles.card, styles.form].join(" ")} onSubmit={(event) => void submit(event)}><Input name="fullName" label="Full name" defaultValue={`${user.firstName} ${user.lastName}`} required /><Input name="phone" label="Phone number" defaultValue={user.phone || ""} required /><label className={styles.field}>Learning format<select name="mode" defaultValue={ApplicationMode.IN_PERSON}><option value={ApplicationMode.IN_PERSON}>In person</option><option value={ApplicationMode.ONLINE}>Online</option></select></label><label className={styles.field}>A note for the admissions team<textarea name="note" rows={4} placeholder="Tell the school your preferred start time or anything they should know." /></label>{enrollment.error ? <p className={styles.error}>{enrollment.error}</p> : null}<Button type="submit" disabled={enrollment.isLoading}>{enrollment.isLoading ? "Sending application…" : "Send enrollment request"}</Button></form><aside className={[styles.card, styles.aside].join(" ")}><Building2 size={24} /><h2>What happens next</h2><p>The school administrator reviews your request. Once approved, the school and its classroom workspaces become part of your portal.</p><FileText size={24} /><h2>Track every step</h2><p>Your application status is always visible in your student portal.</p></aside></div></div></main>;
}
