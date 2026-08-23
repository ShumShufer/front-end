import { useState } from "react";
import { IdCard, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./FaydaVerification.module.css";

const MIN_FAYDA_LENGTH = 6;

export function FaydaVerification() {
  const auth = useAuth();
  const [faydaId, setFaydaId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (faydaId.trim().length < MIN_FAYDA_LENGTH) {
      setFormError("Enter the full ID number printed on your Fayda card.");
      return;
    }
    if (!auth.user) {
      setFormError("Your session expired — please sign in again.");
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.updateProfile({
        faydaId: faydaId.trim(),
        verificationStatus: "PENDING",
      });
      setSuccessMessage("Submitted — we'll notify you once it's reviewed.");
    } catch {
      setFormError("The submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p>
            <ShieldCheck size={14} /> Identity
          </p>
          <h1>Verify with Fayda</h1>
          <span>
            Enter your national Fayda ID so your driving school can confirm who
            you are.
          </span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <label className={styles.field}>
            <span>
              <IdCard size={14} /> Fayda ID number
            </span>
            <input
              value={faydaId}
              placeholder="e.g. FAY-1234-5678"
              onChange={(e) => setFaydaId(e.target.value)}
            />
          </label>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <div className={styles.successRow}>
              <p className={styles.formSuccess} role="status">
                {successMessage}
              </p>
              <Button to={ROUTES.student.dashboard}>Go to dashboard</Button>
            </div>
          )}
          {!successMessage && (
            <Button type="submit" block disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit for verification"}
            </Button>
          )}
        </form>
      </div>
    </main>
  );
}
