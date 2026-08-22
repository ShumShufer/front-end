import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check, X } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useEnrollment } from "../../../context/enrollment/useEnrollment.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { useUser } from "../../../context/user/useUser.ts";
import { formatCurrency, formatDate } from "../../../utils/formatters.ts";
import styles from "./PracticeRequestsInbox.module.css";

const STATUS_PENDING = "PENDING";

export function PracticeRequestsInbox() {
  const { user } = useAuth();
  const enrollment = useEnrollment();
  const school = useSchool();
  const userCtx = useUser();
  const schoolId = user?.schoolId ?? "";
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    void enrollment.loadPracticeRequests({ schoolId });
    void school.loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  useEffect(() => {
    if ((userCtx.users?.data.length ?? 0) === 0) void userCtx.loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studentName = useMemo(() => {
    const map = new Map(
      (userCtx.users?.data ?? []).map((u) => [u.id, `${u.firstName} ${u.lastName}`] as const),
    );
    return (studentId: string) => map.get(studentId) ?? "Student";
  }, [userCtx.users]);

  const schoolName = useMemo(() => {
    const map = new Map((school.schools?.data ?? []).map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? `School ${id.slice(-4)}`;
  }, [school.schools]);

  async function handleApprove(id: string) {
    setLocalError(null);
    try {
      await enrollment.approvePracticeRequest(id);
      await enrollment.loadPracticeRequests({ schoolId });
    } catch {
      setLocalError("The request could not be approved. Please try again.");
    }
  }

  async function handleReject(id: string) {
    setLocalError(null);
    try {
      await enrollment.rejectPracticeRequest(id);
      await enrollment.loadPracticeRequests({ schoolId });
    } catch {
      setLocalError("The request could not be rejected. Please try again.");
    }
  }

  const pendingCount = enrollment.practiceRequests.filter(
    (r) => r.status === STATUS_PENDING,
  ).length;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <ArrowRightLeft size={14} /> Cross-school practice
          </p>
          <h1>Practice requests inbox</h1>
          <span>
            {pendingCount} pending request{pendingCount === 1 ? "" : "s"}
          </span>
        </header>

        {(localError || enrollment.error) && (
          <p className={styles.formError} role="alert">
            {localError ?? enrollment.error}
          </p>
        )}

        {enrollment.isLoading && enrollment.practiceRequests.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : enrollment.practiceRequests.length ? (
          <ul className={styles.list}>
            {[...enrollment.practiceRequests]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((request) => (
                <li key={request.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <strong>{studentName(request.studentId)}</strong>
                    <span>
                      Home: {schoolName(request.homeSchoolId)} → Host:{" "}
                      {schoolName(request.hostSchoolId)} ·{" "}
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <span>{formatCurrency(request.fee)}</span>
                  <span
                    className={`${styles.badge} ${
                      request.status === STATUS_PENDING
                        ? styles.toneWarning
                        : request.status === "ACCEPTED"
                          ? styles.toneSuccess
                          : styles.toneNeutral
                    }`}
                  >
                    {request.status}
                  </span>
                  {request.status === STATUS_PENDING && (
                    <div className={styles.itemActions}>
                      <Button size="sm" onClick={() => void handleApprove(request.id)}>
                        <Check size={14} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleReject(request.id)}
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <EmptyState
            title="Inbox is empty"
            description="Student practice requests to or from your school appear here."
          />
        )}
      </div>
    </main>
  );
}
