import { useEffect, useState } from "react";
import { BadgeCheck, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useUser } from "../../../context/user/useUser.ts";
import type { VerificationStatus } from "../../../types/common.types.ts";
import styles from "./FaydaAudit.module.css";

const STATUS_VERIFIED = "VERIFIED";
const STATUS_REJECTED = "REJECTED";
const STATUS_PENDING = "PENDING";

export function FaydaAudit() {
  const userCtx = useUser();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(STATUS_PENDING);

  useEffect(() => {
    void userCtx.loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = (userCtx.users?.data ?? [])
    .filter((u) => (filter ? u.verificationStatus === filter : true))
    .sort((a, b) => {
      if (a.faydaId && !b.faydaId) return -1;
      if (!a.faydaId && b.faydaId) return 1;
      return a.lastName.localeCompare(b.lastName);
    });

  async function handleDecision(userId: string, status: VerificationStatus) {
    setActionError(null);
    setBusyId(userId);
    try {
      await userCtx.updateUser(userId, { verificationStatus: status });
      await userCtx.loadUsers();
    } catch {
      setActionError("The decision could not be recorded. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <ShieldCheck size={14} /> Identity
          </p>
          <h1>Fayda verification audit</h1>
          <span>
            Review national ID submissions and confirm each account's identity.
          </span>
        </header>

        <div className={styles.filters} role="tablist" aria-label="Filter by status">
          {[STATUS_PENDING, STATUS_VERIFIED, STATUS_REJECTED, ""].map((status) => (
            <button
              key={status || "all"}
              type="button"
              role="tab"
              aria-selected={filter === status}
              className={`${styles.filterChip} ${
                filter === status ? styles.filterChipActive : ""
              }`}
              onClick={() => setFilter(status)}
            >
              {status || "ALL"}
            </button>
          ))}
        </div>

        {actionError && (
          <p className={styles.formError} role="alert">
            {actionError}
          </p>
        )}

        {userCtx.isLoading && !userCtx.users ? (
          <PageSkeleton variant="list" />
        ) : rows.length ? (
          <ul className={styles.list}>
            {rows.map((u) => (
              <li key={u.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <strong>
                    {u.firstName} {u.lastName}
                  </strong>
                  <small>
                    {u.email}
                    {u.faydaId
                      ? ` · Fayda ID ${u.faydaId}`
                      : " · no Fayda ID submitted"}
                  </small>
                </div>
                <span
                  className={`${styles.badge} ${
                    u.verificationStatus === STATUS_VERIFIED
                      ? styles.toneSuccess
                      : u.verificationStatus === STATUS_REJECTED
                        ? styles.toneDanger
                        : styles.toneWarning
                  }`}
                >
                  {u.verificationStatus}
                </span>
                {u.verificationStatus !== STATUS_VERIFIED && (
                  <Button
                    size="sm"
                    disabled={busyId === u.id}
                    onClick={() => void handleDecision(u.id, STATUS_VERIFIED as VerificationStatus)}
                  >
                    <BadgeCheck size={14} /> Verify
                  </Button>
                )}
                {u.verificationStatus !== STATUS_REJECTED && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId === u.id}
                    onClick={() => void handleDecision(u.id, STATUS_REJECTED as VerificationStatus)}
                  >
                    <XCircle size={14} /> Reject
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing to review"
            description="No accounts match this verification status."
          />
        )}
      </div>
    </main>
  );
}
