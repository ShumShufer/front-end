import { useState } from "react";
import { IdCard, ShieldCheck, CheckCircle2, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button/Button.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import { getDashboardPathForRole } from "../../../utils/permissions.ts";
import { getErrorMessage } from "../../../utils/errors.ts";
import styles from "./FaydaVerification.module.css";

const MIN_FAYDA_LENGTH = 4;

export function FaydaVerification() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [faydaId, setFaydaId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = auth.user?.role
    ? getDashboardPathForRole(auth.user.role)
    : ROUTES.student.dashboard;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmed = faydaId.trim();
    if (trimmed.length < MIN_FAYDA_LENGTH) {
      setFormError("Enter the full ID number printed on your Fayda card or Ethiopian phone number.");
      return;
    }

    if (!auth.user) {
      setFormError("Your session expired — please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isPhone = /^(\+251|0)[1-9]\d{8}$/.test(trimmed);
      const result = await auth.verifyFayda(
        isPhone ? { phone: trimmed } : { faydaId: trimmed },
      );
      setSuccessMessage(result.message || "Fayda identity verified successfully!");
      // Automatically redirect after 1.2s or allow immediate click
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 1200);
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        "The Fayda verification failed. Please try again.",
      );
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleUseDemo = (demoVal: string) => {
    setFaydaId(demoVal);
    setFormError(null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p>
            <ShieldCheck size={14} /> National Identity Verification
          </p>
          <h1>Verify with Fayda</h1>
          <span>
            Enter your Ethiopian national Fayda ID number or registered phone number
            to verify your identity.
          </span>
        </header>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <label className={styles.field}>
            <span>
              <IdCard size={14} /> Fayda ID number or Phone
            </span>
            <input
              value={faydaId}
              placeholder="e.g. FAY-123456 or 0911223344"
              onChange={(e) => setFaydaId(e.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
            />
          </label>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Quick Test Values:</span>
            <button
              type="button"
              onClick={() => handleUseDemo("FAY-123456")}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "11px",
                cursor: "pointer",
                color: "var(--color-text)",
              }}
            >
              FAY-123456
            </button>
            <button
              type="button"
              onClick={() => handleUseDemo("0911223344")}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "11px",
                cursor: "pointer",
                color: "var(--color-text)",
              }}
            >
              <Phone size={10} style={{ display: "inline", marginRight: "3px" }} />
              0911223344
            </button>
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          {successMessage && (
            <div className={styles.successRow}>
              <p className={styles.formSuccess} role="status">
                <CheckCircle2 size={16} style={{ display: "inline", marginRight: "6px" }} />
                {successMessage}
              </p>
              <Button to={destination}>Proceed to dashboard</Button>
            </div>
          )}

          {!successMessage && (
            <Button type="submit" block disabled={isSubmitting}>
              {isSubmitting ? "Verifying with Fayda…" : "Submit for verification"}
            </Button>
          )}
        </form>
      </div>
    </main>
  );
}

