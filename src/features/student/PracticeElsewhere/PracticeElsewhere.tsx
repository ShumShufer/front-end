import { useEffect, useState } from "react";
import { Building2, Repeat } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useEnrollment } from "../../../context/enrollment/useEnrollment.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { formatDate, formatCurrency } from "../../../utils/formatters.ts";
import { ApplicationStatus } from "../../../types/common.types.ts";
import styles from "./PracticeElsewhere.module.css";

const STATUS_TONES: Record<string, string> = {
  PENDING: styles.toneWarning,
  ACCEPTED: styles.toneSuccess,
  REJECTED: styles.toneDanger,
};

// Standard practice-elsewhere session fee charged by host schools.
const PRACTICE_FEE = 500;

export function PracticeElsewhere() {
  const { user } = useAuth();
  const enrollment = useEnrollment();
  const school = useSchool();
  const {
    loadEnrollments,
    loadPracticeRequests,
    submitPracticeRequest,
  } = enrollment;
  const { loadSchools, loadAgreements } = school;

  const [hostSchoolId, setHostSchoolId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadEnrollments({ studentId: user.id });
    void loadPracticeRequests({ studentId: user.id });
    void loadSchools({ status: "ACTIVE" });
    void loadAgreements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;
  if (
    enrollment.isLoading &&
    enrollment.practiceRequests.length === 0
  )
    return <PageSkeleton variant="list" />;

  const accepted = enrollment.enrollments?.data.filter(
    (e) => e.status === ApplicationStatus.ACCEPTED,
  );
  const homeSchoolIds = new Set(accepted?.map((e) => e.schoolId) ?? []);
  const partnerPairs = school.agreements.filter(
    (a) =>
      a.status === "ACTIVE" &&
      (homeSchoolIds.has(a.schoolAId) || homeSchoolIds.has(a.schoolBId)),
  );
  const eligibleHostIds = new Set(
    partnerPairs.flatMap((a) =>
      homeSchoolIds.has(a.schoolAId)
        ? [a.schoolBId]
        : homeSchoolIds.has(a.schoolBId)
          ? [a.schoolAId]
          : [],
    ),
  );
  const partnerSchools = (school.schools?.data ?? []).filter(
    (s) => eligibleHostIds.has(s.id),
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!hostSchoolId) {
      setFormError("Choose a partner school to practice at.");
      return;
    }
    const homeSchoolId = [...homeSchoolIds][0];
    if (!homeSchoolId) {
      setFormError("You need an accepted enrollment before requesting practice elsewhere.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitPracticeRequest(homeSchoolId, hostSchoolId, PRACTICE_FEE);
      setSuccessMessage(
        "Request sent. The host school will review and confirm your sessions.",
      );
      setHostSchoolId("");
    } catch {
      setFormError("Your request could not be sent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Repeat size={14} /> Inter-school practice
          </p>
          <h1>Practice elsewhere</h1>
          <span>
            Book driving practice sessions at a partner school through an active
            agreement.
          </span>
        </header>

        <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
          <h2>New request</h2>
          {homeSchoolIds.size === 0 ? (
            <p className={styles.muted}>
              You need an accepted enrollment at a school before you can request
              practice at a partner school.
            </p>
          ) : partnerSchools.length === 0 ? (
            <p className={styles.muted}>
              Your school has no active agreements yet. Ask your school admin to
              establish one.
            </p>
          ) : (
            <label className={styles.field}>
              <span>Partner school</span>
              <select
                value={hostSchoolId}
                onChange={(e) => setHostSchoolId(e.target.value)}
              >
                <option value="">Select a school…</option>
                {partnerSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <small>Session fee: {formatCurrency(PRACTICE_FEE)}</small>
            </label>
          )}
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
          {homeSchoolIds.size > 0 && partnerSchools.length > 0 && (
            <footer className={styles.actions}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send request"}
              </Button>
            </footer>
          )}
        </form>

        <section className={styles.section}>
          <h2>My requests</h2>
          {enrollment.practiceRequests.length ? (
            <ul className={styles.list}>
              {enrollment.practiceRequests.map((request) => {
                const host = (school.schools?.data ?? []).find(
                  (s) => s.id === request.hostSchoolId,
                );
                return (
                  <li key={request.id} className={styles.rowCard}>
                    <Building2 size={18} />
                    <div className={styles.rowBody}>
                      <strong>{host?.name ?? "Partner school"}</strong>
                      <span>
                        Requested {formatDate(request.createdAt)} ·{" "}
                        {formatCurrency(request.fee)}
                      </span>
                    </div>
                    <span
                      className={`${styles.badge} ${
                        STATUS_TONES[request.status] ?? styles.toneMuted
                      }`}
                    >
                      {request.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No requests yet"
              description="Requests you send will be listed here with their status."
            />
          )}
        </section>
      </div>
    </main>
  );
}
