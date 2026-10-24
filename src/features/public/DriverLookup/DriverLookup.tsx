import { useState } from "react";
import { BadgeCheck, IdCard, SearchCheck, XCircle } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useUser } from "../../../context/user/useUser.ts";
import styles from "./DriverLookup.module.css";

export function DriverLookup() {
  const userCtx = useUser();
  const [faydaId, setFaydaId] = useState("");
  const [result, setResult] = useState<{
    name: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (faydaId.trim().length < 4) {
      setError("Enter the full Fayda ID printed on the driver's card.");
      return;
    }
    setIsSearching(true);
    try {
      await userCtx.loadUsers();
      const match = (userCtx.users?.data ?? []).find(
        (u) => u.faydaId === faydaId.trim(),
      );
      if (!match) {
        setError("No driver is registered with that Fayda ID.");
      } else {
        setResult({
          name: `${match.firstName} ${match.lastName}`,
          status: match.verificationStatus,
        });
      }
    } catch {
      setError("The lookup failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <SearchCheck size={14} /> Verification
          </p>
          <h1>Driver license lookup</h1>
          <span>
            Confirm a learner's or instructor's identity using their national
            Fayda ID.
          </span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleSearch(e)}>
          <label className={styles.field}>
            <span>
              <IdCard size={14} /> Fayda ID
            </span>
            <input
              value={faydaId}
              placeholder="e.g. FAY-1234-5678"
              onChange={(e) => setFaydaId(e.target.value)}
            />
          </label>
          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}
          <footer className={styles.actions}>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Checking…" : "Verify"}
            </Button>
          </footer>
        </form>

        {isSearching && !result && <PageSkeleton variant="list" />}

        {result && (
          <section className={styles.result}>
            <strong>{result.name}</strong>
            {result.status === "VERIFIED" ? (
              <span className={`${styles.badge} ${styles.toneSuccess}`}>
                <BadgeCheck size={15} /> Verified driver
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.toneDanger}`}>
                <XCircle size={15} /> Not verified ({result.status})
              </span>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
