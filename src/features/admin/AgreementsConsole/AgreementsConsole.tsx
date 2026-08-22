import { useEffect, useState } from "react";
import { Check, Handshake, Plus, X } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useSchool } from "../../../context/school/useSchool.ts";
import { formatDate } from "../../../utils/formatters.ts";
import styles from "./AgreementsConsole.module.css";

const STATUS_ACTIVE = "ACTIVE";
const STATUS_PENDING = "PENDING";

export function AgreementsConsole() {
  const { user } = useAuth();
  const school = useSchool();
  const schoolId = user?.schoolId ?? "";
  const [partnerSchoolId, setPartnerSchoolId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    void school.loadAgreements({ schoolId });
    void school.loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const partnerOptions = (school.schools?.data ?? []).filter(
    (s) => s.id !== schoolId,
  );

  function partnerName(id: string): string {
    return (
      school.schools?.data?.find((s) => s.id === id)?.name ??
      `School ${id.slice(-4)}`
    );
  }

  async function handlePropose(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!partnerSchoolId) {
      setFormError("Choose a partner school.");
      return;
    }
    setIsSaving(true);
    try {
      await school.proposeAgreement(schoolId, partnerSchoolId);
      await school.loadAgreements({ schoolId });
      setSuccessMessage("Agreement proposal sent — it activates once accepted.");
      setPartnerSchoolId("");
    } catch {
      setFormError("The proposal could not be sent. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRespond(agreementId: string, accept: boolean) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await school.respondToAgreement(agreementId, accept);
      await school.loadAgreements({ schoolId });
      setSuccessMessage(accept ? "Agreement activated." : "Proposal declined.");
    } catch {
      setFormError("The response could not be saved. Please try again.");
    }
  }

  async function handleTerminate(agreementId: string) {
    if (
      !window.confirm(
        "Terminate this agreement? Students can no longer practice across both schools.",
      )
    )
      return;
    setFormError(null);
    setSuccessMessage(null);
    try {
      await school.terminateAgreement(agreementId);
      await school.loadAgreements({ schoolId });
      setSuccessMessage("Agreement terminated.");
    } catch {
      setFormError("The agreement could not be terminated. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <Handshake size={14} /> Partnerships
          </p>
          <h1>Inter-school agreements</h1>
          <span>Agreements let your students practice at partner schools.</span>
        </header>

        <form className={styles.proposeForm} onSubmit={(e) => void handlePropose(e)}>
          <label className={styles.field}>
            <span>Propose a new agreement</span>
            <select
              value={partnerSchoolId}
              onChange={(e) => setPartnerSchoolId(e.target.value)}
            >
              <option value="">Choose a school…</option>
              {partnerOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={isSaving}>
            <Plus size={16} />
            {isSaving ? "Sending…" : "Send proposal"}
          </Button>
        </form>

        {(formError || school.error) && (
          <p className={styles.formError} role="alert">
            {formError ?? school.error}
          </p>
        )}
        {successMessage && (
          <p className={styles.formSuccess} role="status">
            {successMessage}
          </p>
        )}

        {school.isLoading && school.agreements.length === 0 ? (
          <PageSkeleton variant="list" />
        ) : school.agreements.length ? (
          <ul className={styles.list}>
            {school.agreements.map((agreement) => {
              const isPartnerB = agreement.schoolBId === schoolId;
              const partnerId = isPartnerB
                ? agreement.schoolAId
                : agreement.schoolBId;
              return (
                <li key={agreement.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <strong>{partnerName(partnerId)}</strong>
                    <span>
                      Proposed {formatDate(agreement.createdAt)}
                      {isPartnerB ? " · awaiting your response" : ""}
                    </span>
                  </div>
                  <span
                    className={`${styles.badge} ${
                      agreement.status === STATUS_ACTIVE
                        ? styles.toneSuccess
                        : agreement.status === STATUS_PENDING
                          ? styles.toneWarning
                          : styles.toneNeutral
                    }`}
                  >
                    {agreement.status}
                  </span>
                  <div className={styles.itemActions}>
                    {isPartnerB && agreement.status === STATUS_PENDING && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => void handleRespond(agreement.id, true)}
                        >
                          <Check size={14} /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void handleRespond(agreement.id, false)}
                        >
                          <X size={14} /> Decline
                        </Button>
                      </>
                    )}
                    {agreement.status === STATUS_ACTIVE && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleTerminate(agreement.id)}
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No agreements yet"
            description="Propose a partnership to enable cross-school practice."
          />
        )}
      </div>
    </main>
  );
}
